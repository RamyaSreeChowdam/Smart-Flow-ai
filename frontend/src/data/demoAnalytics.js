// Centralized demo dataset and calculation engine for System Analytics

export const DEMO_ANALYTICS_DATA = {
  stats: {
    totalExecutions: 1284,
    successExecutions: 1173,
    failedExecutions: 111,
    timeSaved: '42h',
    healthIndex: 91,
  },
  // Realistic 7-day trend data
  dailyData: [
    { date: 'Sep 4', success: 152, failed: 13, total: 165 },
    { date: 'Sep 5', success: 168, failed: 16, total: 184 },
    { date: 'Sep 6', success: 149, failed: 11, total: 160 },
    { date: 'Sep 7', success: 184, failed: 19, total: 203 },
    { date: 'Sep 8', success: 162, failed: 15, total: 177 },
    { date: 'Sep 9', success: 175, failed: 17, total: 192 },
    { date: 'Sep 10', success: 183, failed: 20, total: 203 },
  ],
  // Distribution of action types
  actionBreakdown: [
    { name: 'Webhook Triggers', value: 412 },
    { name: 'Email Notifications', value: 326 },
    { name: 'Database Sync', value: 248 },
    { name: 'Slack Alerts', value: 184 },
    { name: 'Report Exports', value: 114 },
  ],
  // 4-5 recent execution activity examples (successful and failed)
  recentExecutions: [
    {
      id: 'exec-demo-1',
      automationName: 'Customer Onboarding & Welcome Sequence',
      action: 'Email Notification',
      status: 'Success',
      duration: '420ms',
      executedAt: '2 mins ago',
      details: 'Dispatched welcome credentials and onboarding guide to 14 new users',
    },
    {
      id: 'exec-demo-2',
      automationName: 'Stripe Payment Webhook & Order Fulfilment',
      action: 'Webhook Trigger',
      status: 'Success',
      duration: '650ms',
      executedAt: '18 mins ago',
      details: 'Payment webhook parsed, ERP invoice #INV-8921 recorded and paid',
    },
    {
      id: 'exec-demo-3',
      automationName: 'Real-Time Inventory Database Sync',
      action: 'Database Sync',
      status: 'Failed',
      duration: '1.2s',
      executedAt: '45 mins ago',
      details: 'Connection timeout: Warehouse replica cluster failed to acknowledge write lock',
    },
    {
      id: 'exec-demo-4',
      automationName: 'Daily Executive Performance Digest',
      action: 'Slack Alert',
      status: 'Success',
      duration: '310ms',
      executedAt: '2 hours ago',
      details: 'Executive summary digest published to #leadership-kpi channel',
    },
    {
      id: 'exec-demo-5',
      automationName: 'Customer Support Escalation Dispatcher',
      action: 'Webhook Trigger',
      status: 'Failed',
      duration: '890ms',
      executedAt: '3 hours ago',
      details: 'API endpoint returned 401 Unauthorized: Expired secondary routing secret',
    }
  ]
};

/**
 * Calculates analytics automatically.
 * If real backend data exists and has executions, calculates from real data.
 * Otherwise, falls back to the centralized demo data.
 */
export function calculateAnalytics({ backendData, backendLogs = [] } = {}) {
  const backendStats = backendData?.stats;
  const hasRealData = Boolean(
    backendStats &&
    typeof backendStats.totalExecutions === 'number' &&
    backendStats.totalExecutions > 0
  );

  if (hasRealData) {
    const total = backendStats.totalExecutions;
    const success = backendStats.successExecutions || 0;
    const failed = backendStats.failedExecutions || 0;

    // Automatic calculation of percentages
    const successPctNum = total > 0 ? (success / total) * 100 : 0;
    const failurePctNum = total > 0 ? (failed / total) * 100 : 0;
    const successRateFormatted = (Math.round(successPctNum * 10) / 10).toFixed(1);
    const failureRateFormatted = (Math.round(failurePctNum * 10) / 10).toFixed(1);

    const timeSaved = backendStats.timeSaved || `${Math.max(1, Math.round(success * 0.04 * 10) / 10)}h`;
    const healthIndex = Math.min(100, Math.round(successPctNum));

    // Daily 7-day data
    const hasDailyLogs = Array.isArray(backendData?.dailyData) &&
      backendData.dailyData.length > 0 &&
      backendData.dailyData.some(d => d.total > 0);

    const dailyData = hasDailyLogs ? backendData.dailyData : DEMO_ANALYTICS_DATA.dailyData;

    // Action breakdown
    const hasActions = Array.isArray(backendData?.actionBreakdown) && backendData.actionBreakdown.length > 0;
    const actionBreakdown = hasActions ? backendData.actionBreakdown : DEMO_ANALYTICS_DATA.actionBreakdown;

    // Recent activity: format backend logs if available, otherwise use demo activity
    const recentActivity = (Array.isArray(backendLogs) && backendLogs.length > 0)
      ? backendLogs.slice(0, 5).map(log => ({
          id: log._id || log.id || Math.random().toString(),
          automationName: log.automationName || log.automationId?.name || 'Automated Workflow',
          action: log.action || 'Webhook Trigger',
          status: log.status || 'Success',
          duration: log.durationMs ? `${log.durationMs}ms` : '340ms',
          executedAt: log.executedAt ? formatTimeAgo(log.executedAt) : 'recently',
          details: log.details || log.errorMessage || (log.status === 'Success' ? 'Executed without issues' : 'Execution encountered an error'),
        }))
      : DEMO_ANALYTICS_DATA.recentExecutions;

    return {
      isDemo: false,
      stats: {
        totalExecutions: total.toLocaleString(),
        rawTotal: total,
        successExecutions: success.toLocaleString(),
        rawSuccess: success,
        failedExecutions: failed.toLocaleString(),
        rawFailed: failed,
        successRate: `${successRateFormatted}%`,
        successRateNumber: parseFloat(successRateFormatted),
        failureRate: `${failureRateFormatted}%`,
        failureRateNumber: parseFloat(failureRateFormatted),
        timeSaved,
        healthIndex,
      },
      dailyData,
      actionBreakdown,
      recentActivity,
      donutData: [
        { name: 'Successful Runs', value: success, percentage: `${successRateFormatted}%`, color: '#10b981' },
        { name: 'Failed Runs', value: failed, percentage: `${failureRateFormatted}%`, color: '#ef4444' },
      ]
    };
  }

  // Fallback to Centralized Demo Data
  const demoStats = DEMO_ANALYTICS_DATA.stats;
  const demoTotal = demoStats.totalExecutions; // 1284
  const demoSuccess = demoStats.successExecutions; // 1173
  const demoFailed = demoStats.failedExecutions; // 111

  // Automatic calculation of percentages
  const successPct = ((demoSuccess / demoTotal) * 100).toFixed(1); // 91.4%
  const failurePct = ((demoFailed / demoTotal) * 100).toFixed(1); // 8.6%

  const recentActivity = (Array.isArray(backendLogs) && backendLogs.length > 0)
    ? backendLogs.slice(0, 5).map(log => ({
        id: log._id || log.id || Math.random().toString(),
        automationName: log.automationName || log.automationId?.name || 'Automated Workflow',
        action: log.action || 'Webhook Trigger',
        status: log.status || 'Success',
        duration: log.durationMs ? `${log.durationMs}ms` : '340ms',
        executedAt: log.executedAt ? formatTimeAgo(log.executedAt) : 'recently',
        details: log.details || log.errorMessage || (log.status === 'Success' ? 'Executed without issues' : 'Execution encountered an error'),
      }))
    : DEMO_ANALYTICS_DATA.recentExecutions;

  return {
    isDemo: true,
    stats: {
      totalExecutions: demoTotal.toLocaleString(), // "1,284"
      rawTotal: demoTotal,
      successExecutions: demoSuccess.toLocaleString(), // "1,173"
      rawSuccess: demoSuccess,
      failedExecutions: demoFailed.toLocaleString(), // "111"
      rawFailed: demoFailed,
      successRate: `${successPct}%`, // "91.4%"
      successRateNumber: parseFloat(successPct),
      failureRate: `${failurePct}%`, // "8.6%"
      failureRateNumber: parseFloat(failurePct),
      timeSaved: demoStats.timeSaved, // "42h"
      healthIndex: demoStats.healthIndex, // 91
    },
    dailyData: DEMO_ANALYTICS_DATA.dailyData,
    actionBreakdown: DEMO_ANALYTICS_DATA.actionBreakdown,
    recentActivity,
    donutData: [
      { name: 'Successful Runs', value: demoSuccess, percentage: `${successPct}%`, color: '#10b981' },
      { name: 'Failed Runs', value: demoFailed, percentage: `${failurePct}%`, color: '#ef4444' },
    ]
  };
}

function formatTimeAgo(dateInput) {
  if (!dateInput) return 'recently';
  const diff = Date.now() - new Date(dateInput).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} mins ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr${h > 1 ? 's' : ''} ago`;
  return `${Math.floor(h / 24)} days ago`;
}
