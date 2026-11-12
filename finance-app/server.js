const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Inisialisasi Database SQLite
const dbPath = path.resolve(__dirname, 'finance.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Gagal terhubung ke database:', err.message);
  } else {
    console.log('Terhubung ke database SQLite.');
  }
});

// Buat Tabel Transaksi jika belum ada
db.run(`CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,       -- 'income' (pemasukan) atau 'expense' (pengeluaran)
  category TEXT NOT NULL,   -- Contoh: Makanan, Transport, Gaji, Bisnis
  amount REAL NOT NULL,     -- Jumlah uang
  description TEXT,         -- Catatan tambahan
  date TEXT DEFAULT CURRENT_TIMESTAMP
)`);

// Endpoint: Cek status server
app.get('/api/status', (req, res) => {
  res.json({ status: 'API Finance Tracker Berjalan Normal 🚀' });
});

// Endpoint: Ambil semua transaksi
app.get('/api/transactions', (req, res) => {
  db.all(`SELECT * FROM transactions ORDER BY date DESC`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ transactions: rows });
  });
});

// Endpoint: Tambah transaksi baru
app.post('/api/transactions', (req, res) => {
  const { type, category, amount, description } = req.body;
  if (!type || !category || !amount) {
    return res.status(400).json({ error: 'Type, category, dan amount wajib diisi!' });
  }

  const query = `INSERT INTO transactions (type, category, amount, description) VALUES (?, ?, ?, ?)`;
  db.run(query, [type, category, amount, description], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID, message: 'Transaksi berhasil ditambahkan!' });
  });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
