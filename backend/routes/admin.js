const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Task = require('../models/Task');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

// @GET /api/admin/users - Get all users
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Get task counts per user
    const usersWithCounts = await Promise.all(users.map(async (user) => {
      const taskCount = await Task.countDocuments({ user: user._id });
      return { ...user.toObject(), taskCount };
    }));

    res.json({ users: usersWithCounts, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users.' });
  }
});

// @GET /api/admin/tasks - Get all tasks
router.get('/tasks', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, priority } = req.query;
    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Task.countDocuments(query);
    const tasks = await Task.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ tasks, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tasks.' });
  }
});

// @DELETE /api/admin/tasks/:id - Delete any task
router.delete('/tasks/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete task.' });
  }
});

// @PATCH /api/admin/users/:id/role - Change user role
router.patch('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role.' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update role.' });
  }
});

// @GET /api/admin/stats - Overall system stats
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalTasks, completedTasks, adminCount] = await Promise.all([
      User.countDocuments(),
      Task.countDocuments(),
      Task.countDocuments({ status: 'completed' }),
      User.countDocuments({ role: 'admin' })
    ]);
    res.json({ totalUsers, totalTasks, completedTasks, adminCount });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats.' });
  }
});

module.exports = router;
