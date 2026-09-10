const mongoose = require('mongoose');

const automationLogSchema = new mongoose.Schema({
  automationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Automation',
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
  executedAt: {
    type: Date,
    default: Date.now
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AutomationLog', automationLogSchema);
