require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Automation = require('./models/Automation');
const AutomationLog = require('./models/AutomationLog');
const Alert = require('./models/Alert');

async function seedAll() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const users = await User.find({});
    console.log(`Found ${users.length} users to populate with rich demo analytics`);

    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);

    for (const user of users) {
      console.log(`Seeding data for user: ${user.name} (${user.email})`);

      // Clear existing user automations and logs so we have clean, consistent data
      await Automation.deleteMany({ createdBy: user._id });
      await AutomationLog.deleteMany({ userId: user._id });
      await Alert.deleteMany({ userId: user._id });

      // 1. Create Smart Automation Workflows
      const automations = await Automation.insertMany([
        {
          name: 'AI Lead Scoring & Prioritization',
          trigger: 'Manual Trigger',
          action: 'Generate Report',
          frequency: 'Daily',
          description: 'Evaluates prospect buying signals and scores deals 0-100 with automated executive notifications.',
          status: 'Active',
          lastRun: new Date(now.getTime() - 15 * 60 * 1000),
          nextRun: tomorrow,
          createdBy: user._id,
          runCount: 48,
          successCount: 47,
          failureCount: 1
        },
        {
          name: 'High-Value Deal Closer Escalation',
          trigger: 'Schedule',
          action: 'Send Notification',
          frequency: 'Daily',
          description: 'Monitors deals above $50k in proposal stage and triggers high-priority closing alerts.',
          status: 'Active',
          lastRun: new Date(now.getTime() - 45 * 60 * 1000),
          nextRun: tomorrow,
          createdBy: user._id,
          runCount: 36,
          successCount: 35,
          failureCount: 1
        },
        {
          name: 'Customer Churn Prevention & Retention',
          trigger: 'Schedule',
          action: 'Send Email',
          frequency: 'Weekly',
          description: 'Detects 14-day inactivity drops and automatically sends personalized VIP re-engagement offers.',
          status: 'Active',
          lastRun: yesterday,
          nextRun: nextWeek,
          createdBy: user._id,
          runCount: 24,
          successCount: 23,
          failureCount: 1
        },
        {
          name: 'Daily Revenue & Pipeline Briefing',
          trigger: 'Schedule',
          action: 'Generate Report',
          frequency: 'Daily',
          description: 'Aggregates 24-hour pipeline conversion metrics and delivers an automated morning performance summary.',
          status: 'Active',
          lastRun: yesterday,
          nextRun: tomorrow,
          createdBy: user._id,
          runCount: 42,
          successCount: 41,
          failureCount: 1
        },
        {
          name: 'Smart Deal Margin Approval Routing',
          trigger: 'New Task',
          action: 'Create Task',
          frequency: 'Daily',
          description: 'Routes non-standard discount requests directly to the commercial vice president.',
          status: 'Active',
          lastRun: new Date(now.getTime() - 3 * 3600 * 1000),
          nextRun: tomorrow,
          createdBy: user._id,
          runCount: 19,
          successCount: 18,
          failureCount: 1
        }
      ]);

      // 2. Create rich execution logs for the last 7 days so charts, heatmaps, and stats look full & active
      const logs = [];
      const actionsList = ['Generate Report', 'Send Notification', 'Send Email', 'Create Task', 'Update Record'];
      const successMsgs = {
        'Generate Report': 'AI revenue and lead scoring report compiled successfully.',
        'Send Notification': 'Deal escalation notification dispatched to Slack #sales-execs.',
        'Send Email': 'Retention outreach email sequence delivered to target contacts.',
        'Create Task': 'Follow-up closing task assigned to account executive.',
        'Update Record': 'CRM deal stage updated to Qualified in Salesforce.'
      };
      const failMsgs = {
        'Generate Report': 'Report service temporary load spike; retry succeeded.',
        'Send Notification': 'Webhook endpoint delayed response.',
        'Send Email': 'Rate limit hit on bulk outreach endpoint.',
        'Create Task': 'Task queue busy.',
        'Update Record': 'Database concurrency lock retry.'
      };

      // Daily pattern over last 7 days with realistic counts
      const dailyCounts = [14, 18, 16, 22, 19, 25, 21];

      for (let day = 6; day >= 0; day--) {
        const logDate = new Date(now);
        logDate.setDate(logDate.getDate() - day);

        const count = dailyCounts[6 - day];
        for (let i = 0; i < count; i++) {
          const auto = automations[Math.floor(Math.random() * automations.length)];
          const action = actionsList[Math.floor(Math.random() * actionsList.length)];
          // 96% success rate
          const isSuccess = Math.random() < 0.94;
          const status = isSuccess ? 'Success' : 'Failed';

          const logTime = new Date(logDate);
          logTime.setHours(Math.floor(Math.random() * 18) + 6);
          logTime.setMinutes(Math.floor(Math.random() * 60));

          logs.push({
            automationId: auto._id,
            automationName: auto.name,
            action: auto.action || action,
            status,
            message: isSuccess ? successMsgs[auto.action] || 'Execution completed successfully.' : failMsgs[auto.action] || 'Temporary timeout occurred.',
            executedAt: logTime,
            userId: user._id
          });
        }
      }

      await AutomationLog.insertMany(logs);
      console.log(`✅ Created ${logs.length} activity logs for ${user.email}`);

      // 3. Create realistic notification alerts
      await Alert.insertMany([
        {
          title: '🔥 Hot Lead Qualification Spike',
          message: 'AI Lead Scorer flagged 14 enterprise opportunities ready to close this week.',
          type: 'success',
          read: false,
          userId: user._id,
          createdAt: new Date(now.getTime() - 20 * 60 * 1000)
        },
        {
          title: '⚠️ Churn Alert: Global Logistics',
          message: 'Inactivity detected for 14 days. Re-engagement email sequence triggered.',
          type: 'warning',
          read: false,
          userId: user._id,
          createdAt: new Date(now.getTime() - 90 * 60 * 1000)
        },
        {
          title: '📈 Revenue Milestone Reached',
          message: 'Monthly sales passed $148,250 target (109% of projection).',
          type: 'info',
          read: true,
          userId: user._id,
          createdAt: new Date(now.getTime() - 4 * 3600 * 1000)
        }
      ]);
    }

    console.log('🎉 All users successfully seeded with rich enterprise analytics!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

seedAll();
