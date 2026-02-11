const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Get all todos
app.get('/api/todos', (req, res) => {
  const todos = db.prepare('SELECT * FROM todos ORDER BY created_at DESC').all();
  res.json(todos.map(t => ({ ...t, completed: !!t.completed })));
});

// Create a todo
app.post('/api/todos', (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Text is required' });
  }
  const result = db.prepare('INSERT INTO todos (text) VALUES (?)').run(text.trim());
  const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ ...todo, completed: !!todo.completed });
});

// Update a todo
app.put('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const { text, completed } = req.body;
  const existing = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  const newText = text !== undefined ? text.trim() : existing.text;
  const newCompleted = completed !== undefined ? (completed ? 1 : 0) : existing.completed;
  db.prepare('UPDATE todos SET text = ?, completed = ? WHERE id = ?').run(newText, newCompleted, id);
  const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
  res.json({ ...todo, completed: !!todo.completed });
});

// Delete a todo
app.delete('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  db.prepare('DELETE FROM todos WHERE id = ?').run(id);
  res.json({ message: 'Todo deleted' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
