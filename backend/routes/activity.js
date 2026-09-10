const express = require('express');
const router = express.Router();
const AutomationLog = require('../models/AutomationLog');
const auth = require('../middleware/auth');

// GET /api/activity - Get activity logs
router.get('/', auth, async (req, res) => {
  try {
    const { status, limit = 50, page = 1 } = req.query;
    const query = { userId: req.userId };

    if (status && status !== 'All') {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const logs = await AutomationLog.find(query)
      .sort({ executedAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await AutomationLog.countDocuments(query);

    res.json({
      success: true,
      logs,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch activity logs.' });
  }
});

module.exports = router;
