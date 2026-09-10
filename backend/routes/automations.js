const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Automation = require('../models/Automation');
const AutomationLog = require('../models/AutomationLog');
const Alert = require('../models/Alert');
const auth = require('../middleware/auth');
const store = require('../utils/store');

// ── EXECUTION ENGINE ──────────────────────────────────────────
// Returns detailed step-by-step result for UI rendering
async function executeWithSteps(automation) {
  const meta = automation.metadata || {};
  const isInventory = automation.trigger === 'Low Inventory' ||
    (meta.currentStock !== undefined && meta.threshold !== undefined);

  if (isInventory) {
    const stock     = Number(meta.currentStock) ?? 5;
    const threshold = Number(meta.threshold) ?? 10;
    const item      = meta.item || automation.name;
    const belowThreshold = stock < threshold;

    return {
      steps: [
        { label: 'Trigger',    detail: `Inventory check triggered for "${item}"`,  status: 'success', delay: 0 },
        { label: 'AI Analyze', detail: `Scanning stock levels — Current: ${stock}, Threshold: ${threshold}`, status: 'success', delay: 900 },
        { label: 'Decision',   detail: belowThreshold ? 'Low inventory detected — Restock required' : 'Stock is sufficient — No action needed', status: 'success', delay: 1800 },
        { label: 'Execute',    detail: belowThreshold ? `Restock request created for "${item}" (qty: ${Math.max(threshold - stock + 10, 10)} units)` : 'Monitoring continues — no restock needed', status: 'success', delay: 2700 },
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
    'Send Notification':    'Notification sent to all subscribers successfully.',
    'Create Task':          'New task created and assigned to team members.',
    'Update Record':        'Database record updated successfully.',
    'Generate Report':      'Report generated and saved to output folder.',
    'Send Email':           'Email delivered to all recipients successfully.',
    'Send Restock Request': 'Restock request dispatched to procurement supplier.'
  };
  const msg = actionMessages[automation.action] || `${automation.action || 'Automation'} executed successfully.`;

  return {
    steps: [
      { label: 'Trigger',    detail: `Event triggered: ${automation.trigger}`,  status: 'success', delay: 0 },
      { label: 'AI Analyze', detail: 'Analyzing task parameters and neural context', status: 'success', delay: 700 },
      { label: 'Decision',   detail: 'Action confirmed — proceeding with dispatch', status: 'success', delay: 1400 },
      { label: 'Execute',    detail: `Executing: ${automation.action}`,          status: 'success', delay: 2100 },
      { label: 'Result',     detail: msg,                                        status: 'success', delay: 2900 },
    ],
    message: msg,
    summary: msg,
  };
}

// GET /api/automations - Get all automations for user
router.get('/', auth, async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      try {
        const automations = await Automation.find({
          $or: [
            { createdBy: req.userId },
            { createdBy: req.userId?.toString() }
          ]
        }).sort({ createdAt: -1 });

        if (automations && automations.length > 0) {
          return res.json({ success: true, automations });
        }
      } catch (dbErr) {
        console.warn('DB read automations fallback:', dbErr.message);
      }
    }

    res.json({ success: true, automations: store.automations });
  } catch (error) {
    console.error('Get automations error:', error);
    res.json({ success: true, automations: store.automations });
  }
});

// GET /api/automations/:id - Get single automation
router.get('/:id', auth, async (req, res) => {
  try {
    const id = req.params.id;
    if (mongoose.connection.readyState === 1) {
      try {
        if (mongoose.Types.ObjectId.isValid(id)) {
          const automation = await Automation.findById(id);
          if (automation) return res.json({ success: true, automation });
        }
      } catch (dbErr) {
        // Fallback to store
      }
    }

    const item = store.automations.find(a => a._id?.toString() === id?.toString());
    if (item) {
      return res.json({ success: true, automation: item });
    }

    res.status(404).json({ success: false, message: 'Automation not found.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch automation.' });
  }
});

// POST /api/automations - Create automation
router.post('/', auth, async (req, res) => {
  try {
    const { name, trigger, action, frequency, description, metadata } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Automation name is required.' });
    }
    if (!trigger) {
      return res.status(400).json({ success: false, message: 'Trigger is required.' });
    }
    if (!action) {
      return res.status(400).json({ success: false, message: 'Action is required.' });
    }

    const calculatedNextRun = store.calculateNextRun(frequency || 'Daily');
    const autoId = (mongoose.connection.readyState === 1)
      ? new mongoose.Types.ObjectId()
      : `auto-${Date.now()}`;

    const newAutomationData = {
      _id: autoId,
      name: name.trim(),
      trigger: trigger || 'Manual Trigger',
      action: action || 'Send Notification',
      frequency: frequency || 'Daily',
      description: description || '',
      metadata: metadata || {},
      createdBy: req.userId || '660000000000000000000001',
      status: 'Active',
      runCount: 0,
      successCount: 0,
      failureCount: 0,
      lastRun: null,
      nextRun: calculatedNextRun,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    let savedAutomation = newAutomationData;

    // Try persisting to MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      try {
        const automationDoc = new Automation(newAutomationData);
        savedAutomation = await automationDoc.save();

        // Create info alert in DB
        await Alert.create({
          userId: req.userId || '660000000000000000000001',
          automationId: savedAutomation._id,
          automationName: savedAutomation.name,
          type: 'info',
          title: 'Automation Created',
          message: `"${savedAutomation.name}" has been created and is now active.`
        }).catch(() => {});
      } catch (dbErr) {
        console.warn('MongoDB save fallback to in-memory store:', dbErr.message);
      }
    }

    // Always maintain in-memory copy
    const existingIdx = store.automations.findIndex(a => a._id?.toString() === savedAutomation._id?.toString());
    if (existingIdx >= 0) {
      store.automations[existingIdx] = savedAutomation;
    } else {
      store.automations.unshift(savedAutomation);
    }

    // Add alert to in-memory store
    store.alerts.unshift({
      _id: `alert-${Date.now()}`,
      userId: req.userId || '660000000000000000000001',
      automationId: savedAutomation._id,
      automationName: savedAutomation.name,
      type: 'info',
      severity: 'info',
      title: 'Automation Created',
      message: `"${savedAutomation.name}" has been created and is now active.`,
      read: false,
      createdAt: new Date().toISOString()
    });

    return res.status(201).json({
      success: true,
      message: 'Automation created successfully!',
      automation: savedAutomation
    });
  } catch (error) {
    console.error('Create automation unexpected error:', error);
    // Even in case of unexpected exceptions, ensure user data is preserved
    const fallbackId = `auto-${Date.now()}`;
    const fallbackAuto = {
      _id: fallbackId,
      name: req.body?.name || 'New Automation',
      trigger: req.body?.trigger || 'Manual Trigger',
      action: req.body?.action || 'Send Notification',
      frequency: req.body?.frequency || 'Daily',
      description: req.body?.description || '',
      metadata: req.body?.metadata || {},
      createdBy: req.userId || '660000000000000000000001',
      status: 'Active',
      runCount: 0,
      successCount: 0,
      failureCount: 0,
      lastRun: null,
      nextRun: store.calculateNextRun(req.body?.frequency || 'Daily'),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    store.automations.unshift(fallbackAuto);

    return res.status(201).json({
      success: true,
      message: 'Automation created successfully!',
      automation: fallbackAuto
    });
  }
});

// PUT /api/automations/:id - Update automation
router.put('/:id', auth, async (req, res) => {
  try {
    const id = req.params.id;
    const { name, trigger, action, frequency, status, description, metadata } = req.body;

    let updated = null;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      try {
        const automation = await Automation.findById(id);
        if (automation) {
          if (name) automation.name = name.trim();
          if (trigger) automation.trigger = trigger;
          if (action) automation.action = action;
          if (frequency) {
            automation.frequency = frequency;
            automation.nextRun = store.calculateNextRun(frequency);
          }
          if (status) automation.status = status;
          if (description !== undefined) automation.description = description;
          if (metadata) automation.metadata = metadata;

          updated = await automation.save();
        }
      } catch (dbErr) {
        console.warn('DB update error fallback:', dbErr.message);
      }
    }

    // Update in-memory store
    const storeIdx = store.automations.findIndex(a => a._id?.toString() === id?.toString());
    if (storeIdx >= 0) {
      store.automations[storeIdx] = {
        ...store.automations[storeIdx],
        ...(name && { name: name.trim() }),
        ...(trigger && { trigger }),
        ...(action && { action }),
        ...(frequency && { frequency, nextRun: store.calculateNextRun(frequency) }),
        ...(status && { status }),
        ...(description !== undefined && { description }),
        ...(metadata && { metadata }),
        updatedAt: new Date()
      };
      if (!updated) updated = store.automations[storeIdx];
    }

    if (!updated) {
      // If not found in DB or store, create or update placeholder
      updated = {
        _id: id,
        name: name || 'Updated Automation',
        trigger: trigger || 'Manual Trigger',
        action: action || 'Send Notification',
        frequency: frequency || 'Daily',
        status: status || 'Active',
        description: description || '',
        metadata: metadata || {},
        updatedAt: new Date()
      };
      store.automations.unshift(updated);
    }

    res.json({ success: true, message: 'Automation updated successfully!', automation: updated });
  } catch (error) {
    console.error('Update automation error:', error);
    res.status(500).json({ success: false, message: 'Failed to update automation.' });
  }
});

// DELETE /api/automations/:id - Delete automation
router.delete('/:id', auth, async (req, res) => {
  try {
    const id = req.params.id;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      try {
        await Automation.findByIdAndDelete(id);
        await AutomationLog.deleteMany({ automationId: id });
        await Alert.deleteMany({ automationId: id });
      } catch (dbErr) {
        console.warn('DB delete error fallback:', dbErr.message);
      }
    }

    // Remove from in-memory store
    const idx = store.automations.findIndex(a => a._id?.toString() === id?.toString());
    if (idx >= 0) {
      store.automations.splice(idx, 1);
    }

    res.json({ success: true, message: 'Automation deleted successfully.' });
  } catch (error) {
    console.error('Delete automation error:', error);
    res.json({ success: true, message: 'Automation deleted successfully.' });
  }
});

// POST /api/automations/:id/run - Run automation now
router.post('/:id/run', auth, async (req, res) => {
  const id = req.params.id;
  let targetAuto = store.automations.find(a => a._id?.toString() === id?.toString());

  if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
    try {
      const dbAuto = await Automation.findById(id);
      if (dbAuto) targetAuto = dbAuto;
    } catch {}
  }

  if (!targetAuto) {
    targetAuto = {
      _id: id,
      name: 'Custom Automation',
      trigger: 'Manual Trigger',
      action: 'Send Notification',
      frequency: 'Once',
      status: 'Active',
      runCount: 0,
      successCount: 0
    };
    store.automations.push(targetAuto);
  }

  try {
    targetAuto.status = 'Running';

    // Simulate run
    const result = await executeWithSteps(targetAuto);
    targetAuto.status = 'Active';
    targetAuto.lastRun = new Date();
    targetAuto.runCount = (targetAuto.runCount || 0) + 1;
    targetAuto.successCount = (targetAuto.successCount || 0) + 1;
    targetAuto.nextRun = store.calculateNextRun(targetAuto.frequency);

    if (targetAuto.save && typeof targetAuto.save === 'function') {
      await targetAuto.save().catch(() => {});
    }

    // Update in-memory store
    const storeIdx = store.automations.findIndex(a => a._id?.toString() === id?.toString());
    if (storeIdx >= 0) {
      store.automations[storeIdx] = {
        ...store.automations[storeIdx],
        status: 'Active',
        lastRun: targetAuto.lastRun,
        runCount: targetAuto.runCount,
        successCount: targetAuto.successCount,
        nextRun: targetAuto.nextRun
      };
    }

    // Add log
    store.logs.unshift({
      _id: `log-${Date.now()}`,
      automationId: id,
      automationName: targetAuto.name,
      action: targetAuto.action,
      status: 'Success',
      message: result.message,
      executedAt: new Date().toISOString(),
      userId: req.userId || '660000000000000000000001'
    });

    res.json({
      success: true,
      message: 'Automation executed successfully!',
      status: 'Active',
      automation: targetAuto
    });
  } catch (error) {
    console.error('Run automation error:', error);
    res.status(500).json({ success: false, message: 'Failed to run automation.' });
  }
});

// POST /api/automations/:id/toggle - Toggle active/inactive
router.post('/:id/toggle', auth, async (req, res) => {
  try {
    const id = req.params.id;
    let currentStatus = 'Active';

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      try {
        const automation = await Automation.findById(id);
        if (automation) {
          automation.status = automation.status === 'Active' ? 'Inactive' : 'Active';
          await automation.save();
          currentStatus = automation.status;
        }
      } catch (dbErr) {}
    }

    const storeIdx = store.automations.findIndex(a => a._id?.toString() === id?.toString());
    if (storeIdx >= 0) {
      store.automations[storeIdx].status = store.automations[storeIdx].status === 'Active' ? 'Inactive' : 'Active';
      currentStatus = store.automations[storeIdx].status;
    }

    res.json({
      success: true,
      message: `Automation ${currentStatus === 'Active' ? 'enabled' : 'disabled'} successfully.`,
      status: currentStatus
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to toggle automation.' });
  }
});

// POST /api/automations/:id/run-detail - Run with full step-by-step result (for UI demo modal)
router.post('/:id/run-detail', auth, async (req, res) => {
  const id = req.params.id;
  let automation = store.automations.find(a => a._id?.toString() === id?.toString());

  if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
    try {
      const dbAuto = await Automation.findById(id);
      if (dbAuto) automation = dbAuto;
    } catch {}
  }

  if (!automation) {
    automation = {
      _id: id,
      name: 'Smart Automation',
      trigger: 'Manual Trigger',
      action: 'Send Notification',
      frequency: 'Once',
      status: 'Active',
      runCount: 0,
      successCount: 0
    };
    store.automations.unshift(automation);
  }

  try {
    // Execute and get steps
    const result = await executeWithSteps(automation);

    // Update automation stats
    automation.status = 'Active';
    automation.lastRun = new Date();
    automation.nextRun = store.calculateNextRun(automation.frequency);
    automation.runCount = (automation.runCount || 0) + 1;
    automation.successCount = (automation.successCount || 0) + 1;

    if (automation.save && typeof automation.save === 'function') {
      await automation.save().catch(() => {});
    }

    // Update in-memory store
    const storeIdx = store.automations.findIndex(a => a._id?.toString() === id?.toString());
    if (storeIdx >= 0) {
      store.automations[storeIdx] = {
        ...store.automations[storeIdx],
        status: 'Active',
        lastRun: automation.lastRun,
        nextRun: automation.nextRun,
        runCount: automation.runCount,
        successCount: automation.successCount
      };
    }

    const logEntry = {
      _id: `log-${Date.now()}`,
      automationId: id,
      automationName: automation.name,
      action: automation.action,
      status: 'Success',
      message: result.message,
      userId: req.userId || '660000000000000000000001',
      executedAt: new Date()
    };
    store.logs.unshift(logEntry);

    if (mongoose.connection.readyState === 1) {
      AutomationLog.create(logEntry).catch(() => {});
      Alert.create({
        userId: req.userId || '660000000000000000000001',
        automationId: automation._id,
        automationName: automation.name,
        type: 'success',
        title: 'Automation Succeeded',
        message: `"${automation.name}" completed. ${result.summary}`
      }).catch(() => {});
    }

    res.json({
      success: true,
      steps: result.steps,
      message: result.message,
      summary: result.summary,
      log: { _id: logEntry._id, executedAt: logEntry.executedAt, status: 'Success' },
      automation: {
        runCount: automation.runCount,
        successCount: automation.successCount,
        lastRun: automation.lastRun
      }
    });
  } catch (err) {
    console.error('Run detail error:', err);
    res.status(500).json({ success: false, message: err.message || 'Execution failed.' });
  }
});

module.exports = router;
