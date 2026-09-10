const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const AutomationLog = require('../models/AutomationLog');
const auth = require('../middleware/auth');

const DEMO_LOGS = [
  {
    _id: 'log-1',
    automationName: 'Customer Onboarding & Welcome Sequence',
    action: 'Email Notification',
    status: 'Success',
    durationMs: 420,
    executedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    details: 'Dispatched welcome credentials and onboarding guide to 14 new users',
  },
  {
    _id: 'log-2',
    automationName: 'Stripe Payment Webhook & Order Fulfilment',
    action: 'Webhook Trigger',
    status: 'Success',
    durationMs: 650,
    executedAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    details: 'Payment webhook parsed, ERP invoice #INV-8921 recorded and paid',
  },
  {
    _id: 'log-3',
    automationName: 'Real-Time Inventory Database Sync',
    action: 'Database Sync',
    status: 'Failed',
    durationMs: 1200,
    executedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    details: 'Connection timeout: Warehouse replica cluster failed to acknowledge write lock',
    errorMessage: 'Connection timeout: Warehouse replica cluster failed to acknowledge write lock'
  },
  {
    _id: 'log-4',
    automationName: 'Daily Executive Performance Digest',
    action: 'Slack Alert',
    status: 'Success',
    durationMs: 310,
    executedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    details: 'Executive summary digest published to #leadership-kpi channel',
  },
  {
    _id: 'log-5',
    automationName: 'Customer Support Escalation Dispatcher',
    action: 'Webhook Trigger',
    status: 'Failed',
    durationMs: 890,
    executedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    details: 'API endpoint returned 401 Unauthorized: Expired secondary routing secret',
    errorMessage: 'API endpoint returned 401 Unauthorized'
  }
];

// GET /api/activity - Get activity logs
router.get('/', auth, async (req, res) => {
  try {
    const { status, limit = 50, page = 1 } = req.query;
    const query = { userId: req.userId };

    if (status && status !== 'All') {
      query.status = status;
    }

    if (mongoose.connection.readyState === 1) {
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const logs = await AutomationLog.find(query)
        .sort({ executedAt: -1 })
        .limit(parseInt(limit))
        .skip(skip);

      const total = await AutomationLog.countDocuments(query);
      if (total > 0) {
        return res.json({
          success: true,
          logs,
          total,
          page: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit))
        });
      }
    }

    let filtered = DEMO_LOGS;
    if (status && status !== 'All') {
      filtered = DEMO_LOGS.filter(l => l.status === status);
    }

    res.json({
      success: true,
      logs: filtered,
      total: filtered.length,
      page: 1,
      totalPages: 1
    });
  } catch (error) {
    console.error('Get activity error:', error);
    res.json({
      success: true,
      logs: DEMO_LOGS,
      total: DEMO_LOGS.length,
      page: 1,
      totalPages: 1
    });
  }
});

module.exports = router;
