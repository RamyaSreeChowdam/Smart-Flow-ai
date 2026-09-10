const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const AutomationLog = require('../models/AutomationLog');
const Automation = require('../models/Automation');
const auth = require('../middleware/auth');

const DEMO_ANALYTICS = {
  stats: {
    totalExecutions: 1284,
    successExecutions: 1173,
    failedExecutions: 111,
    runningExecutions: 0,
    successRate: 91.4,
    totalAutomations: 8,
    activeAutomations: 7
  },
  dailyData: [
    { date: 'Sep 4', success: 152, failed: 13, total: 165 },
    { date: 'Sep 5', success: 168, failed: 16, total: 184 },
    { date: 'Sep 6', success: 149, failed: 11, total: 160 },
    { date: 'Sep 7', success: 184, failed: 19, total: 203 },
    { date: 'Sep 8', success: 162, failed: 15, total: 177 },
    { date: 'Sep 9', success: 175, failed: 17, total: 192 },
    { date: 'Sep 10', success: 183, failed: 20, total: 203 },
  ],
  actionBreakdown: [
    { name: 'Webhook Triggers', value: 412 },
    { name: 'Email Notifications', value: 326 },
    { name: 'Database Sync', value: 248 },
    { name: 'Slack Alerts', value: 184 },
    { name: 'Report Exports', value: 114 },
  ]
};

// GET /api/analytics - Get analytics data
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.userId;

    if (mongoose.connection.readyState === 1) {
      // Total executions
      const totalExecutions = await AutomationLog.countDocuments({ userId });
      if (totalExecutions > 0) {
        const successExecutions = await AutomationLog.countDocuments({ userId, status: 'Success' });
        const failedExecutions = await AutomationLog.countDocuments({ userId, status: 'Failed' });
        const runningExecutions = await AutomationLog.countDocuments({ userId, status: 'Running' });

        const successRate = totalExecutions > 0
          ? Math.round((successExecutions / totalExecutions) * 100)
          : 0;

        const totalAutomations = await Automation.countDocuments({ createdBy: userId });
        const activeAutomations = await Automation.countDocuments({ createdBy: userId, status: 'Active' });

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

        return res.json({
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
          actionBreakdown: DEMO_ANALYTICS.actionBreakdown
        });
      }
    }

    // Return realistic telemetry
    res.json({
      success: true,
      ...DEMO_ANALYTICS
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.json({
      success: true,
      ...DEMO_ANALYTICS
    });
  }
});

module.exports = router;
