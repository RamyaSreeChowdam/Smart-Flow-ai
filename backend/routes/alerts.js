const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const auth = require('../middleware/auth');

// GET /api/alerts - Get all alerts
router.get('/', auth, async (req, res) => {
  try {
    const alerts = await Alert.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Alert.countDocuments({ userId: req.userId, read: false });

    res.json({ success: true, alerts, unreadCount });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch alerts.' });
  }
});

// PUT /api/alerts/:id/read - Mark alert as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const alert = await Alert.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { read: true },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found.' });
    }

    res.json({ success: true, alert });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update alert.' });
  }
});

// PUT /api/alerts/read-all - Mark all alerts as read
router.put('/read-all/mark', auth, async (req, res) => {
  try {
    await Alert.updateMany({ userId: req.userId, read: false }, { read: true });
    res.json({ success: true, message: 'All alerts marked as read.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update alerts.' });
  }
});

// DELETE /api/alerts/:id - Delete alert
router.delete('/:id', auth, async (req, res) => {
  try {
    await Alert.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ success: true, message: 'Alert deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete alert.' });
  }
});

module.exports = router;
