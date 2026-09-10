const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  automationId: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  automationName: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['error', 'warning', 'success', 'info'],
    default: 'info'
  },
  severity: {
    type: String,
    default: 'info'
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  details: {
    type: String,
    default: null
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Alert', alertSchema);
