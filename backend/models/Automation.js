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
    enum: ['Schedule', 'New Task', 'File Added', 'Manual Trigger', 'Low Inventory']
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    enum: ['Send Notification', 'Create Task', 'Update Record', 'Generate Report', 'Send Email', 'Send Restock Request']
  },
  frequency: {
    type: String,
    required: [true, 'Frequency is required'],
    enum: ['Once', 'Daily', 'Weekly']
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
