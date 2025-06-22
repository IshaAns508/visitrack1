const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = 5000;
const DATA_PATH = path.join(__dirname, 'todos.json');

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'testsecret';

// === Auth Routes ===
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'demo@mail.com' && password === '123456') {
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '2h' });
    return res.json({ token });
  }
  res.status(401).json({ message: 'Invalid credentials' });
});

// === Middleware ===
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(403).json({ message: 'Token required' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

// === File Helpers ===
function readTodos() {
  if (!fs.existsSync(DATA_PATH)) return [];
  return JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
}

function writeTodos(todos) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(todos, null, 2));
}

// === Todo Routes ===
app.get('/api/todos', verifyToken, (req, res) => {
  const todos = readTodos();
  res.json(todos);
});

app.post('/api/todos', verifyToken, (req, res) => {
  const todos = readTodos();
  const newTodo = {
    id: Date.now().toString(),
    title: req.body.title,
    completed: req.body.completed || false
  };
  todos.push(newTodo);
  writeTodos(todos);
  res.json(newTodo);
});

app.put('/api/todos/:id', verifyToken, (req, res) => {
  let todos = readTodos();
  todos = todos.map(todo =>
    todo.id === req.params.id ? { ...todo, completed: req.body.completed } : todo
  );
  writeTodos(todos);
  res.json({ message: 'Updated' });
});

app.delete('/api/todos/:id', verifyToken, (req, res) => {
  let todos = readTodos();
  todos = todos.filter(todo => todo.id !== req.params.id);
  writeTodos(todos);
  res.json({ message: 'Deleted' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
