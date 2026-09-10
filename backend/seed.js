require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Automation = require('./models/Automation');
const AutomationLog = require('./models/AutomationLog');
const Alert = require('./models/Alert');

const DEMO_EMAIL = 'demo@smartflow.ai';
const DEMO_PASSWORD = 'demo1234';

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create or find demo user
    let demoUser = await User.findOne({ email: DEMO_EMAIL });
    if (!demoUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, salt);
      demoUser = await User.create({
        name: 'Demo User',
        email: DEMO_EMAIL,
        password: hashedPassword
      });
      console.log('✅ Demo user created');
    } else {
      console.log('ℹ️  Demo user already exists');
    }

    // Clear existing demo data
    await Automation.deleteMany({ createdBy: demoUser._id });
    await AutomationLog.deleteMany({ userId: demoUser._id });
    await Alert.deleteMany({ userId: demoUser._id });

    // Create demo automations
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const automations = await Automation.insertMany([
      {
        name: 'Low Inventory Alert',
        trigger: 'Low Inventory',
        action: 'Send Restock Request',
        frequency: 'Daily',
        description: 'Monitors stock levels and automatically creates restock requests when inventory falls below threshold.',
        status: 'Active',
        lastRun: new Date(now.getTime() - 10 * 60 * 1000),
        nextRun: tomorrow,
        createdBy: demoUser._id,
        runCount: 12,
        successCount: 11,
        failureCount: 1,
        metadata: {
          item: 'Laptop Components',
          currentStock: 5,
          threshold: 10,
          restockAction: 'Restock Request'
        }
      },
      {
        name: 'Daily Report Automation',
        trigger: 'Schedule',
        action: 'Generate Report',
        frequency: 'Daily',
        status: 'Active',
        lastRun: yesterday,
        nextRun: tomorrow,
        createdBy: demoUser._id,
        runCount: 45,
        successCount: 43,
        failureCount: 2
      },
      {
        name: 'File Processing Automation',
        trigger: 'File Added',
        action: 'Generate Report',
        frequency: 'Once',
        status: 'Active',
        lastRun: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        nextRun: null,
        createdBy: demoUser._id,
        runCount: 12,
        successCount: 12,
        failureCount: 0
      },
      {
        name: 'Daily Reminder Automation',
        trigger: 'Schedule',
        action: 'Send Notification',
        frequency: 'Daily',
        status: 'Active',
        lastRun: yesterday,
        nextRun: tomorrow,
        createdBy: demoUser._id,
        runCount: 30,
        successCount: 30,
        failureCount: 0
      },
      {
        name: 'Weekly Team Email',
        trigger: 'Schedule',
        action: 'Send Email',
        frequency: 'Weekly',
        status: 'Active',
        lastRun: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        nextRun: nextWeek,
        createdBy: demoUser._id,
        runCount: 8,
        successCount: 7,
        failureCount: 1
      },
      {
        name: 'Task Auto-Creator',
        trigger: 'New Task',
        action: 'Create Task',
        frequency: 'Daily',
        status: 'Inactive',
        lastRun: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        nextRun: null,
        createdBy: demoUser._id,
        runCount: 5,
        successCount: 4,
        failureCount: 1
      }
    ]);

    console.log(`✅ Created ${automations.length} demo automations`);

    // Create demo activity logs for the past 7 days
    const logs = [];
    const statuses = ['Success', 'Success', 'Success', 'Success', 'Failed'];
    const successMessages = {
      'Generate Report': 'Report generated and saved successfully.',
      'Send Notification': 'Notification sent to all subscribers.',
      'Send Email': 'Email delivered to all recipients.',
      'Create Task': 'Task created and assigned.',
      'Update Record': 'Record updated successfully.'
    };
    const failMessages = {
      'Generate Report': 'Failed to connect to report service.',
      'Send Notification': 'Notification service timeout.',
      'Send Email': 'SMTP connection refused.',
      'Create Task': 'Task service unavailable.',
      'Update Record': 'Database write timeout.'
    };

    for (let day = 6; day >= 0; day--) {
      const logDate = new Date(now);
      logDate.setDate(logDate.getDate() - day);

      const numLogs = Math.floor(Math.random() * 5) + 3;
      for (let i = 0; i < numLogs; i++) {
        const auto = automations[Math.floor(Math.random() * automations.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const logTime = new Date(logDate);
        logTime.setHours(Math.floor(Math.random() * 20) + 4);
        logTime.setMinutes(Math.floor(Math.random() * 60));

        logs.push({
          automationId: auto._id,
          automationName: auto.name,
          action: auto.action,
          status,
          message: status === 'Success'
            ? successMessages[auto.action]
            : failMessages[auto.action],
          executedAt: logTime,
          userId: demoUser._id
        });
      }
    }

    await AutomationLog.insertMany(logs);
    console.log(`✅ Created ${logs.length} demo activity logs`);

    // Create demo alerts
    await Alert.insertMany([
      {
        userId: demoUser._id,
        automationId: automations[0]._id,
        automationName: automations[0].name,
        type: 'error',
        title: 'Automation Failed',
        message: '"Daily Report Automation" failed to execute.',
        details: 'Failed to connect to report service. Connection timeout after 30s.',
        read: false
      },
      {
        userId: demoUser._id,
        automationId: automations[3]._id,
        automationName: automations[3].name,
        type: 'warning',
        title: 'Automation Warning',
        message: '"Weekly Team Email" failed last week. Retry scheduled.',
        read: false
      },
      {
        userId: demoUser._id,
        automationId: automations[1]._id,
        automationName: automations[1].name,
        type: 'success',
        title: 'Automation Succeeded',
        message: '"File Processing Automation" completed. Report generated.',
        read: true
      },
      {
        userId: demoUser._id,
        type: 'info',
        title: 'Demo Account Ready',
        message: 'Welcome to SmartFlow AI! All demo data has been loaded.',
        read: true
      }
    ]);

    console.log('✅ Created demo alerts');
    console.log('\n🎉 Seed completed successfully!');
    console.log(`📧 Demo Login: ${DEMO_EMAIL}`);
    console.log(`🔑 Demo Password: ${DEMO_PASSWORD}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
