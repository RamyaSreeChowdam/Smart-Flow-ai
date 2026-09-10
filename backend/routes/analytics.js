const express = require('express');
const router = express.Router();
const AutomationLog = require('../models/AutomationLog');
const Automation = require('../models/Automation');
const auth = require('../middleware/auth');

// GET /api/analytics - Get analytics data
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.userId;

    // Total executions
    const totalExecutions = await AutomationLog.countDocuments({ userId });
    const successExecutions = await AutomationLog.countDocuments({ userId, status: 'Success' });
    const failedExecutions = await AutomationLog.countDocuments({ userId, status: 'Failed' });
    const runningExecutions = await AutomationLog.countDocuments({ userId, status: 'Running' });

    const successRate = totalExecutions > 0
      ? Math.round((successExecutions / totalExecutions) * 100)
      : 0;

    // Total automations
    const totalAutomations = await Automation.countDocuments({ createdBy: userId });
    const activeAutomations = await Automation.countDocuments({ createdBy: userId, status: 'Active' });

    // Last 7 days trend
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      const dayLogs = await AutomationLog.find({
        userId,
        executedAt: { $gte: startOfDay, $lte: endOfDay }
      });

      const daySuccess = dayLogs.filter(l => l.status === 'Success').length;
      const dayFailed = dayLogs.filter(l => l.status === 'Failed').length;

      dailyData.push({
        date: startOfDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        success: daySuccess,
        failed: dayFailed,
        total: dayLogs.length
      });
    }

    // Action breakdown
    const actionBreakdown = await AutomationLog.aggregate([
      { $match: { userId: require('mongoose').Types.ObjectId.createFromHexString(userId.toString()) } },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      stats: {
        totalExecutions,
        successExecutions,
        failedExecutions,
        runningExecutions,
        successRate,
        totalAutomations,
        activeAutomations
      },
      dailyData,
      actionBreakdown: actionBreakdown.map(a => ({ name: a._id, value: a.count }))
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics.' });
  }
});

module.exports = router;
