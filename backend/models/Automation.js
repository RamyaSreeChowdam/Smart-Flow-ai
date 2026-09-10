const mongoose = require('mongoose');

const automationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Automation name is required'],
    trim: true
  },
  trigger: {
    type: String,
    required: [true, 'Trigger is required'],
    default: 'Manual Trigger'
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    default: 'Send Notification'
  },
  frequency: {
    type: String,
    required: [true, 'Frequency is required'],
    default: 'Daily'
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Running', 'Failed'],
    default: 'Active'
  },
  lastRun: {
    type: Date,
    default: null
  },
  nextRun: {
    type: Date,
    default: null
  },
  description: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  runCount: {
    type: Number,
    default: 0
  },
  successCount: {
    type: Number,
    default: 0
  },
  failureCount: {
    type: Number,
    default: 0
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Calculate next run based on frequency
automationSchema.methods.calculateNextRun = function() {
  const now = new Date();
  if (this.frequency === 'Once') return null;
  if (this.frequency === 'Hourly') {
    return new Date(now.getTime() + 60 * 60 * 1000);
  }
  if (this.frequency === 'Daily') {
    const next = new Date(now);
    next.setDate(next.getDate() + 1);
    return next;
  }
  if (this.frequency === 'Weekly') {
    const next = new Date(now);
    next.setDate(next.getDate() + 7);
    return next;
  }
  return null;
};

module.exports = mongoose.model('Automation', automationSchema);
