const mongoose = require('mongoose');

const automationLogSchema = new mongoose.Schema({
  automationId: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  automationName: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Success', 'Failed', 'Running'],
    required: true
  },
  message: {
    type: String,
    default: ''
  },
  errorDetails: {
    type: String,
    default: null
  },
  durationMs: {
    type: Number,
    default: 0
  },
  executedAt: {
    type: Date,
    default: Date.now
  },
  userId: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AutomationLog', automationLogSchema);
