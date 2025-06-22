const router = require('express').Router();
const Todo = require('../models/Todo');
const verifyToken = require('../middleware/verifyToken');

router.use(verifyToken);

router.get('/', async (req, res) => {
  const todos = await Todo.find({ userId: req.user.id });
  res.json(todos);
});

router.post('/', async (req, res) => {
  const { title, completed } = req.body;
  const todo = new Todo({ title, completed, userId: req.user.id });
  await todo.save();
  res.json(todo);
});

router.put('/:id', async (req, res) => {
  const { completed } = req.body;
  const updated = await Todo.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { completed },
    { new: true }
  );
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  await Todo.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  res.json({ message: 'Deleted' });
});

module.exports = router;
