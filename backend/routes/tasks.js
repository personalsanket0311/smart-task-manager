const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');

// All task routes are protected
router.use(protect);

// @GET /api/tasks - Get all tasks with filter, search, pagination
router.get('/', async (req, res) => {
  try {
    const { status, priority, search, page = 1, limit = 20, dueDate, important } = req.query;

    const query = { user: req.user._id };

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (important === 'true') query.isImportant = true;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    if (dueDate) {
      const date = new Date(dueDate);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      query.dueDate = { $gte: date, $lt: nextDay };
    }

    const total = await Task.countDocuments(query);
    const tasks = await Task.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      tasks,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch tasks.' });
  }
});

// @POST /api/tasks - Create task
router.post('/', [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('status').optional().isIn(['todo', 'inprogress', 'completed'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { title, description, status, priority, dueDate, tags } = req.body;

    const task = await Task.create({
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate: dueDate || null,
      tags: tags || [],
      user: req.user._id
    });

    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create task.' });
  }
});

// @PUT /api/tasks/:id - Update task
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    const { title, description, status, priority, dueDate, tags, isImportant, order } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (tags !== undefined) task.tags = tags;
    if (isImportant !== undefined) task.isImportant = isImportant;
    if (order !== undefined) task.order = order;

    await task.save();
    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update task.' });
  }
});

// @DELETE /api/tasks/:id - Delete task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    res.json({ message: 'Task deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete task.' });
  }
});

// @PATCH /api/tasks/:id/important - Toggle important
router.patch('/:id/important', async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    task.isImportant = !task.isImportant;
    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Failed to toggle important.' });
  }
});

module.exports = router;
