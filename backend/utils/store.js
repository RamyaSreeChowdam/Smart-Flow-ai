// Unified In-Memory & Database Resilient Store
// Ensures the entire application functions flawlessly whether MongoDB is connected or not.

const INITIAL_AUTOMATIONS = [
  {
    _id: 'auto-1',
    name: 'Low Inventory Alert & Auto-Restock',
    trigger: 'Low Inventory',
    action: 'Send Restock Request',
    frequency: 'Hourly',
    description: 'Monitors warehouse item counts and initiates automated restock orders when stock < threshold.',
    status: 'Active',
    runCount: 412,
    successCount: 395,
    failureCount: 17,
    lastRun: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    nextRun: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
    createdBy: '660000000000000000000001',
    metadata: { item: 'Industrial Sensor Module X-9', currentStock: 3, threshold: 10 }
  },
  {
    _id: 'auto-2',
    name: 'Customer Onboarding & Welcome Sequence',
    trigger: 'New Task',
    action: 'Send Notification',
    frequency: 'Once',
    description: 'Dispatches instant activation emails and sets up dedicated workspace for newly registered users.',
    status: 'Active',
    runCount: 326,
    successCount: 318,
    failureCount: 8,
    lastRun: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    nextRun: null,
    createdBy: '660000000000000000000001',
    metadata: {}
  },
  {
    _id: 'auto-3',
    name: 'Stripe Payment Webhook & Order Fulfilment',
    trigger: 'Manual Trigger',
    action: 'Update Record',
    frequency: 'Once',
    description: 'Listens for successful Stripe checkout events and updates ERP billing records in real-time.',
    status: 'Active',
    runCount: 248,
    successCount: 240,
    failureCount: 8,
    lastRun: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    nextRun: null,
    createdBy: '660000000000000000000001',
    metadata: {}
  },
  {
    _id: 'auto-4',
    name: 'Daily Executive Performance Digest',
    trigger: 'Schedule',
    action: 'Generate Report',
    frequency: 'Daily',
    description: 'Compiles 24h KPI telemetry and broadcasts a summary digest to Slack executive channel.',
    status: 'Active',
    runCount: 184,
    successCount: 176,
    failureCount: 8,
    lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    nextRun: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
    createdBy: '660000000000000000000001',
    metadata: {}
  }
];

const INITIAL_LOGS = [
  {
    _id: 'log-1',
    automationName: 'Customer Onboarding & Welcome Sequence',
    action: 'Send Notification',
    status: 'Success',
    durationMs: 420,
    executedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    message: 'Dispatched welcome credentials and onboarding guide to new user.',
    userId: '660000000000000000000001'
  },
  {
    _id: 'log-2',
    automationName: 'Stripe Payment Webhook & Order Fulfilment',
    action: 'Update Record',
    status: 'Success',
    durationMs: 650,
    executedAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    message: 'Payment webhook parsed, ERP invoice #INV-8921 recorded and paid.',
    userId: '660000000000000000000001'
  },
  {
    _id: 'log-3',
    automationName: 'Real-Time Inventory Database Sync',
    action: 'Update Record',
    status: 'Failed',
    durationMs: 1200,
    executedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    message: 'Connection timeout: Warehouse replica cluster failed to acknowledge write lock.',
    userId: '660000000000000000000001'
  },
  {
    _id: 'log-4',
    automationName: 'Daily Executive Performance Digest',
    action: 'Generate Report',
    status: 'Success',
    durationMs: 310,
    executedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    message: 'Executive summary digest published to executive channel.',
    userId: '660000000000000000000001'
  }
];

const INITIAL_ALERTS = [
  {
    _id: 'alert-1',
    title: 'High Reliability Milestone Achieved',
    message: 'System pipeline reached 98.7% success rate across recent executions.',
    type: 'info',
    severity: 'info',
    read: false,
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    userId: '660000000000000000000001'
  },
  {
    _id: 'alert-2',
    title: 'Low Stock Monitored',
    message: 'Warehouse item levels actively tracked by automation engine.',
    type: 'warning',
    severity: 'warning',
    read: false,
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    userId: '660000000000000000000001'
  }
];

// In-Memory store instances
const automations = [...INITIAL_AUTOMATIONS];
const logs = [...INITIAL_LOGS];
const alerts = [...INITIAL_ALERTS];

function calculateNextRun(frequency) {
  const now = new Date();
  if (frequency === 'Once') return null;
  if (frequency === 'Hourly') {
    return new Date(now.getTime() + 60 * 60 * 1000);
  }
  if (frequency === 'Daily') {
    const next = new Date(now);
    next.setDate(next.getDate() + 1);
    return next;
  }
  if (frequency === 'Weekly') {
    const next = new Date(now);
    next.setDate(next.getDate() + 7);
    return next;
  }
  return null;
}

module.exports = {
  automations,
  logs,
  alerts,
  calculateNextRun
};
