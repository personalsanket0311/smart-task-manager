const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');

router.use(protect);

// @GET /api/analytics - Get analytics for current user
router.get('/', async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    const [total, completed, inprogress, todo, overdue, byPriority, importantCount] = await Promise.all([
      Task.countDocuments({ user: userId }),
      Task.countDocuments({ user: userId, status: 'completed' }),
      Task.countDocuments({ user: userId, status: 'inprogress' }),
      Task.countDocuments({ user: userId, status: 'todo' }),
      Task.countDocuments({ user: userId, status: { $ne: 'completed' }, dueDate: { $lt: now } }),
      Task.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]),
      Task.countDocuments({ user: userId, isImportant: true })
    ]);

    const priorityMap = { low: 0, medium: 0, high: 0 };
    byPriority.forEach(p => { priorityMap[p._id] = p.count; });

    // Task completion trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentCompleted = await Task.aggregate([
      {
        $match: {
          user: userId,
          status: 'completed',
          updatedAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      total,
      completed,
      inprogress,
      todo,
      overdue,
      importantCount,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      byPriority: priorityMap,
      recentCompleted
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch analytics.' });
  }
});

module.exports = router;
