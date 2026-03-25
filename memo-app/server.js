const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Database Setup
const dbPath = path.resolve(__dirname, 'memo.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    console.log('Connected to SQLite database.');
    
    // Create memos table
    db.run(`
      CREATE TABLE IF NOT EXISTS memos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
});

// APIs

// 1. GET /api/memo (불러오기 기능 API - 모든 목록 반환)
app.get('/api/memo', (req, res) => {
  db.all('SELECT id, content, created_at FROM memos ORDER BY id DESC', (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
      return;
    }
    res.json({ memos: rows });
  });
});

// 2. POST /api/memo (저장 기능 API)
app.post('/api/memo', (req, res) => {
  const { content } = req.body;
  
  if (content === undefined) {
    return res.status(400).json({ error: 'Content is required' });
  }

  // 기존 메모들을 모두 지우고 새 메모를 삽입하는 방식으로 
  // 심플하게 단일 메모장 기능을 구현할 수도 있지만,
  // 히스토리를 위해 계속 INSERT 후 GET할 때 가장 최신 것을 가져옵니다.
  db.run('INSERT INTO memos (content) VALUES (?)', [content], function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true, id: this.lastID });
  });
});

// 3. DELETE /api/memo/:id (삭제 기능 API - 특정 메모 삭제)
app.delete('/api/memo/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM memos WHERE id = ?', [id], function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Memo not found' });
    }
    res.json({ success: true, message: 'Memo deleted successfully' });
  });
});

// Start Server for local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

// Export the Express API for Vercel Serverless Functions
module.exports = app;
