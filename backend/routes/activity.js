const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const AutomationLog = require('../models/AutomationLog');
const auth = require('../middleware/auth');
const store = require('../utils/store');

// GET /api/activity - Get activity logs
router.get('/', auth, async (req, res) => {
  try {
    const { status, limit = 50, page = 1 } = req.query;

    if (mongoose.connection.readyState === 1) {
      try {
        const query = {
          $or: [
            { userId: req.userId },
            { userId: req.userId?.toString() }
          ]
        };

        if (status && status !== 'All') {
          query.status = status;
        }

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
      } catch (dbErr) {}
    }

    let filtered = store.logs;
    if (status && status !== 'All') {
      filtered = store.logs.filter(l => l.status?.toLowerCase() === status.toLowerCase());
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
      logs: store.logs,
      total: store.logs.length,
      page: 1,
      totalPages: 1
    });
  }
});

module.exports = router;
