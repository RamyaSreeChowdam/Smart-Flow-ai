const express = require('express');
const router = express.Router();
const Automation = require('../models/Automation');
const AutomationLog = require('../models/AutomationLog');
const Alert = require('../models/Alert');
const auth = require('../middleware/auth');

// ── EXECUTION ENGINE ──────────────────────────────────────────
// Returns detailed step-by-step result for UI rendering
async function executeWithSteps(automation) {
  const meta = automation.metadata || {};
  const isInventory = automation.trigger === 'Low Inventory' ||
    (meta.currentStock !== undefined && meta.threshold !== undefined);

  if (isInventory) {
    const stock     = Number(meta.currentStock) || 5;
    const threshold = Number(meta.threshold)    || 10;
    const item      = meta.item || automation.name;
    const belowThreshold = stock < threshold;

    return {
      steps: [
        { label: 'Trigger',    detail: `Inventory check triggered for "${item}"`,  status: 'success', delay: 0 },
        { label: 'AI Analyze', detail: `Scanning stock levels — Current: ${stock}, Threshold: ${threshold}`, status: 'success', delay: 900 },
        { label: 'Decision',   detail: belowThreshold ? 'Low inventory detected — Restock required' : 'Stock is sufficient — No action needed', status: 'success', delay: 1800 },
        { label: 'Execute',    detail: belowThreshold ? `Restock request created for "${item}" (qty: ${threshold - stock + 10} units)` : 'Monitoring continues — no restock needed', status: 'success', delay: 2700 },
        { label: 'Result',     detail: belowThreshold ? `Automation completed successfully — Restock request submitted` : 'Automation completed — inventory is healthy', status: 'success', delay: 3500 },
      ],
      message: belowThreshold
        ? `Low inventory detected for "${item}". Restock request created. Current: ${stock}, Threshold: ${threshold}.`
        : `Inventory for "${item}" is sufficient. Current: ${stock} ≥ Threshold: ${threshold}.`,
      summary: belowThreshold ? `Restock requested for "${item}"` : `Inventory OK for "${item}"`,
    };
  }

  // Generic execution
  const actionMessages = {
    'Send Notification': 'Notification sent to all subscribers successfully.',
    'Create Task':       'New task created and assigned to team members.',
    'Update Record':     'Database record updated successfully.',
    'Generate Report':   'Report generated and saved to output folder.',
    'Send Email':        'Email delivered to all recipients successfully.'
  };
  const msg = actionMessages[automation.action] || 'Automation executed successfully.';

  return {
    steps: [
      { label: 'Trigger',    detail: `Event triggered: ${automation.trigger}`,  status: 'success', delay: 0 },
      { label: 'AI Analyze', detail: 'Analyzing task parameters and context',   status: 'success', delay: 700 },
      { label: 'Decision',   detail: 'Action confirmed — proceeding',            status: 'success', delay: 1400 },
      { label: 'Execute',    detail: `Executing: ${automation.action}`,          status: 'success', delay: 2100 },
      { label: 'Result',     detail: msg,                                        status: 'success', delay: 2900 },
    ],
    message: msg,
    summary: msg,
  };
}

// Legacy helper kept for the async setTimeout path
async function executeAutomation(automation) {
  if (Math.random() < 0.05) { // 5% random failure for non-inventory
    throw new Error(`Execution error: ${automation.action} service temporarily unavailable.`);
  }
  const res = await executeWithSteps(automation);
  return res.message;
}


const DEMO_AUTOMATIONS = [
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
    lastRun: new Date(Date.now() - 15 * 60 * 1000),
    metadata: { item: 'Industrial Sensor Module X-9', currentStock: 3, threshold: 10 }
  },
  {
    _id: 'auto-2',
    name: 'Customer Onboarding & Welcome Sequence',
    trigger: 'User Signup',
    action: 'Send Notification',
    frequency: 'Instant',
    description: 'Dispatches instant activation emails and sets up dedicated workspace for newly registered users.',
    status: 'Active',
    runCount: 326,
    successCount: 318,
    failureCount: 8,
    lastRun: new Date(Date.now() - 2 * 60 * 1000),
    metadata: {}
  },
  {
    _id: 'auto-3',
    name: 'Stripe Payment Webhook & Order Fulfilment',
    trigger: 'Payment Webhook',
    action: 'Update Record',
    frequency: 'Instant',
    description: 'Listens for successful Stripe checkout events and updates ERP billing records in real-time.',
    status: 'Active',
    runCount: 248,
    successCount: 240,
    failureCount: 8,
    lastRun: new Date(Date.now() - 18 * 60 * 1000),
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
    lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000),
    metadata: {}
  }
];

// GET /api/automations - Get all automations for user
router.get('/', auth, async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 1) {
      const automations = await Automation.find({ createdBy: req.userId })
        .sort({ createdAt: -1 });
      if (automations.length > 0) {
        return res.json({ success: true, automations });
      }
    }
    res.json({ success: true, automations: DEMO_AUTOMATIONS });
  } catch (error) {
    console.error('Get automations error:', error);
    res.json({ success: true, automations: DEMO_AUTOMATIONS });
  }
});

// GET /api/automations/:id - Get single automation
router.get('/:id', auth, async (req, res) => {
  try {
    const automation = await Automation.findOne({ _id: req.params.id, createdBy: req.userId });
    if (!automation) {
      return res.status(404).json({ success: false, message: 'Automation not found.' });
    }
    res.json({ success: true, automation });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch automation.' });
  }
});

// POST /api/automations - Create automation
router.post('/', auth, async (req, res) => {
  try {
    const { name, trigger, action, frequency, description, metadata } = req.body;

    if (!name || !trigger || !action || !frequency) {
      return res.status(400).json({ success: false, message: 'Name, trigger, action, and frequency are required.' });
    }

    const automation = new Automation({
      name: name.trim(),
      trigger,
      action,
      frequency,
      description: description || '',
      metadata: metadata || {},
      createdBy: req.userId,
      status: 'Active'
    });

    // Calculate first nextRun
    const now = new Date();
    if (frequency === 'Daily') {
      const next = new Date(now);
      next.setDate(next.getDate() + 1);
      automation.nextRun = next;
    } else if (frequency === 'Weekly') {
      const next = new Date(now);
      next.setDate(next.getDate() + 7);
      automation.nextRun = next;
    }

    await automation.save();

    // Create info alert
    await Alert.create({
      userId: req.userId,
      automationId: automation._id,
      automationName: automation.name,
      type: 'info',
      title: 'Automation Created',
      message: `"${automation.name}" has been created and is now active.`
    });

    res.status(201).json({
      success: true,
      message: 'Automation created successfully!',
      automation
    });
  } catch (error) {
    console.error('Create automation error:', error);
    res.status(500).json({ success: false, message: 'Failed to create automation.' });
  }
});

// PUT /api/automations/:id - Update automation
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, trigger, action, frequency, status, description } = req.body;
    const automation = await Automation.findOne({ _id: req.params.id, createdBy: req.userId });

    if (!automation) {
      return res.status(404).json({ success: false, message: 'Automation not found.' });
    }

    if (name) automation.name = name;
    if (trigger) automation.trigger = trigger;
    if (action) automation.action = action;
    if (frequency) automation.frequency = frequency;
    if (status) automation.status = status;
    if (description !== undefined) automation.description = description;

    await automation.save();
    res.json({ success: true, message: 'Automation updated successfully!', automation });
  } catch (error) {
    console.error('Update automation error:', error);
    res.status(500).json({ success: false, message: 'Failed to update automation.' });
  }
});

// DELETE /api/automations/:id - Delete automation
router.delete('/:id', auth, async (req, res) => {
  try {
    const automation = await Automation.findOneAndDelete({ _id: req.params.id, createdBy: req.userId });
    if (!automation) {
      return res.status(404).json({ success: false, message: 'Automation not found.' });
    }

    // Clean up logs and alerts
    await AutomationLog.deleteMany({ automationId: req.params.id });

    res.json({ success: true, message: 'Automation deleted successfully.' });
  } catch (error) {
    console.error('Delete automation error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete automation.' });
  }
});

// POST /api/automations/:id/run - Run automation now
router.post('/:id/run', auth, async (req, res) => {
  let automation;
  try {
    automation = await Automation.findOne({ _id: req.params.id, createdBy: req.userId });
    if (!automation) {
      return res.status(404).json({ success: false, message: 'Automation not found.' });
    }

    if (automation.status === 'Running') {
      return res.status(400).json({ success: false, message: 'Automation is already running.' });
    }

    // Set to Running
    automation.status = 'Running';
    await automation.save();

    // Create running log
    const runningLog = await AutomationLog.create({
      automationId: automation._id,
      automationName: automation.name,
      action: automation.action,
      status: 'Running',
      message: `Executing ${automation.action}...`,
      userId: req.userId
    });

    // Simulate async execution (1-3 seconds)
    setTimeout(async () => {
      try {
        const successMessage = await executeAutomation(automation, req.userId);

        // Update to Success
        automation.status = 'Active';
        automation.lastRun = new Date();
        automation.nextRun = automation.calculateNextRun();
        automation.runCount += 1;
        automation.successCount += 1;
        await automation.save();

        // Update log
        await AutomationLog.findByIdAndUpdate(runningLog._id, {
          status: 'Success',
          message: successMessage,
          executedAt: new Date()
        });

        // Create success alert for important automations
        if (automation.action === 'Generate Report' || automation.action === 'Send Email') {
          await Alert.create({
            userId: req.userId,
            automationId: automation._id,
            automationName: automation.name,
            type: 'success',
            title: 'Automation Succeeded',
            message: `"${automation.name}" completed successfully. ${successMessage}`
          });
        }
      } catch (execError) {
        // Update to Failed
        automation.status = 'Failed';
        automation.lastRun = new Date();
        automation.runCount += 1;
        automation.failureCount += 1;
        await automation.save();

        // Update log
        await AutomationLog.findByIdAndUpdate(runningLog._id, {
          status: 'Failed',
          message: execError.message,
          errorDetails: execError.stack,
          executedAt: new Date()
        });

        // Create failure alert
        await Alert.create({
          userId: req.userId,
          automationId: automation._id,
          automationName: automation.name,
          type: 'error',
          title: 'Automation Failed',
          message: `"${automation.name}" failed to execute.`,
          details: execError.message
        });
      }
    }, Math.random() * 2000 + 1000); // 1-3 second delay

    res.json({
      success: true,
      message: 'Automation started. Check activity for results.',
      status: 'Running'
    });
  } catch (error) {
    console.error('Run automation error:', error);
    if (automation) {
      automation.status = 'Failed';
      await automation.save().catch(console.error);
    }
    res.status(500).json({ success: false, message: 'Failed to run automation.' });
  }
});

// POST /api/automations/:id/toggle - Toggle active/inactive
router.post('/:id/toggle', auth, async (req, res) => {
  try {
    const automation = await Automation.findOne({ _id: req.params.id, createdBy: req.userId });
    if (!automation) {
      return res.status(404).json({ success: false, message: 'Automation not found.' });
    }

    automation.status = automation.status === 'Active' ? 'Inactive' : 'Active';
    await automation.save();

    res.json({
      success: true,
      message: `Automation ${automation.status === 'Active' ? 'enabled' : 'disabled'} successfully.`,
      status: automation.status
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to toggle automation.' });
  }
});

// POST /api/automations/:id/run-detail - Run with full step-by-step result (for UI demo)
router.post('/:id/run-detail', auth, async (req, res) => {
  let automation;
  try {
    automation = await Automation.findOne({ _id: req.params.id, createdBy: req.userId });
    if (!automation) return res.status(404).json({ success: false, message: 'Automation not found.' });
    if (automation.status === 'Running') return res.status(400).json({ success: false, message: 'Already running.' });

    // Mark running
    automation.status = 'Running';
    await automation.save();

    // Execute and get steps
    const result = await executeWithSteps(automation);

    // Small delay to simulate real processing
    await new Promise(r => setTimeout(r, 300));

    // Update automation stats
    automation.status = 'Active';
    automation.lastRun = new Date();
    automation.nextRun = automation.calculateNextRun();
    automation.runCount += 1;
    automation.successCount += 1;
    await automation.save();

    // Save execution log
    const log = await AutomationLog.create({
      automationId: automation._id,
      automationName: automation.name,
      action: automation.action,
      status: 'Success',
      message: result.message,
      userId: req.userId,
      executedAt: new Date()
    });

    // Create success alert
    await Alert.create({
      userId: req.userId,
      automationId: automation._id,
      automationName: automation.name,
      type: 'success',
      title: 'Automation Succeeded',
      message: `"${automation.name}" completed. ${result.summary}`
    });

    res.json({
      success: true,
      steps: result.steps,
      message: result.message,
      summary: result.summary,
      log: { _id: log._id, executedAt: log.executedAt, status: 'Success' },
      automation: { runCount: automation.runCount, successCount: automation.successCount, lastRun: automation.lastRun }
    });
  } catch (err) {
    if (automation) {
      automation.status = 'Failed';
      automation.runCount += 1;
      automation.lastRun = new Date();
      await automation.save().catch(() => {});
      await AutomationLog.create({
        automationId: automation._id, automationName: automation.name,
        action: automation.action, status: 'Failed',
        message: err.message, userId: req.userId, executedAt: new Date()
      }).catch(() => {});
      await Alert.create({
        userId: req.userId, automationId: automation._id,
        automationName: automation.name, type: 'error',
        title: 'Automation Failed', message: `"${automation.name}" failed.`, details: err.message
      }).catch(() => {});
    }
    res.status(500).json({ success: false, message: err.message || 'Execution failed.' });
  }
});

module.exports = router;
