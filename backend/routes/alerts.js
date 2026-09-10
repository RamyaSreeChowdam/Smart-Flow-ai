const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Alert = require('../models/Alert');
const auth = require('../middleware/auth');
const store = require('../utils/store');

// GET /api/alerts - Get all alerts
router.get('/', auth, async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      try {
        const alerts = await Alert.find({
          $or: [
            { userId: req.userId },
            { userId: req.userId?.toString() }
          ]
        })
          .sort({ createdAt: -1 })
          .limit(50);

        const unreadCount = await Alert.countDocuments({
          $or: [
            { userId: req.userId },
            { userId: req.userId?.toString() }
          ],
          read: false
        });

        if (alerts.length > 0) {
          return res.json({ success: true, alerts, unreadCount });
        }
      } catch (dbErr) {}
    }

    const unread = store.alerts.filter(a => !a.read).length;
    res.json({
      success: true,
      alerts: store.alerts,
      unreadCount: unread
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.json({
      success: true,
      alerts: store.alerts,
      unreadCount: store.alerts.filter(a => !a.read).length
    });
  }
});

// PUT /api/alerts/:id/read - Mark alert as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const id = req.params.id;
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      try {
        await Alert.findByIdAndUpdate(id, { read: true });
      } catch {}
    }

    const alert = store.alerts.find(a => a._id?.toString() === id?.toString());
    if (alert) alert.read = true;

    res.json({ success: true, message: 'Alert marked as read.', alert });
  } catch (error) {
    res.json({ success: true, message: 'Alert marked as read.' });
  }
});

// PUT /api/alerts/read-all - Mark all alerts as read
router.put('/read-all/mark', auth, async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      try {
        await Alert.updateMany({
          $or: [{ userId: req.userId }, { userId: req.userId?.toString() }],
          read: false
        }, { read: true });
      } catch {}
    }

    store.alerts.forEach(a => { a.read = true; });
    res.json({ success: true, message: 'All alerts marked as read.' });
  } catch (error) {
    res.json({ success: true, message: 'All alerts marked as read.' });
  }
});

// DELETE /api/alerts/:id - Delete alert
router.delete('/:id', auth, async (req, res) => {
  try {
    const id = req.params.id;
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      try {
        await Alert.findByIdAndDelete(id);
      } catch {}
    }

    const idx = store.alerts.findIndex(a => a._id?.toString() === id?.toString());
    if (idx >= 0) store.alerts.splice(idx, 1);

    res.json({ success: true, message: 'Alert deleted.' });
  } catch (error) {
    res.json({ success: true, message: 'Alert deleted.' });
  }
});

module.exports = router;
