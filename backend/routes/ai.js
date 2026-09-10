const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Rule-based AI automation suggestion engine
function parseAutomationRequest(text) {
  const lower = text.toLowerCase();

  let trigger = 'Manual Trigger';
  let action = 'Send Notification';
  let frequency = 'Once';

  // Trigger detection
  if (lower.includes('every day') || lower.includes('daily') || lower.includes('each day') || lower.includes('every evening') || lower.includes('every morning') || lower.includes('every night')) {
    trigger = 'Schedule';
    frequency = 'Daily';
  } else if (lower.includes('every week') || lower.includes('weekly') || lower.includes('every monday') || lower.includes('each week') || lower.includes('every friday') || lower.includes('every sunday')) {
    trigger = 'Schedule';
    frequency = 'Weekly';
  } else if (lower.includes('file') || lower.includes('upload') || lower.includes('document') || lower.includes('attachment')) {
    trigger = 'File Added';
  } else if (lower.includes('task') || lower.includes('ticket') || lower.includes('issue') || lower.includes('created') || lower.includes('new request')) {
    trigger = 'New Task';
  } else if (lower.includes('schedule') || lower.includes('remind') || lower.includes('reminder')) {
    trigger = 'Schedule';
    frequency = 'Daily';
  }

  // Action detection
  if (lower.includes('report') || lower.includes('summary') || lower.includes('generate') || lower.includes('analytics')) {
    action = 'Generate Report';
  } else if (lower.includes('email') || lower.includes('send mail') || lower.includes('mail')) {
    action = 'Send Email';
  } else if (lower.includes('remind') || lower.includes('notification') || lower.includes('notify') || lower.includes('alert') || lower.includes('ping')) {
    action = 'Send Notification';
  } else if (lower.includes('create task') || lower.includes('add task') || lower.includes('new task') || lower.includes('ticket')) {
    action = 'Create Task';
  } else if (lower.includes('update') || lower.includes('record') || lower.includes('sync') || lower.includes('database')) {
    action = 'Update Record';
  }

  // Frequency override
  if (lower.includes('once') || lower.includes('one time') || lower.includes('single')) {
    frequency = 'Once';
  }

  // Generate a meaningful name
  const actionWords = {
    'Send Notification': 'Notification',
    'Generate Report': 'Report',
    'Send Email': 'Email',
    'Create Task': 'Task Creation',
    'Update Record': 'Record Update'
  };

  const triggerWords = {
    'Schedule': frequency === 'Daily' ? 'Daily' : frequency === 'Weekly' ? 'Weekly' : 'Scheduled',
    'File Added': 'File-Triggered',
    'New Task': 'Task-Triggered',
    'Manual Trigger': 'Manual'
  };

  const name = `${triggerWords[trigger]} ${actionWords[action]} Automation`;

  return {
    name,
    trigger,
    action,
    frequency,
    confidence: 0.85,
    explanation: generateExplanation(text, trigger, action, frequency)
  };
}

function generateExplanation(input, trigger, action, frequency) {
  const explanations = {
    'Schedule': {
      'Daily': `I'll schedule this to run every day automatically.`,
      'Weekly': `I'll schedule this to run every week automatically.`,
      'Once': `I'll schedule this to run one time.`
    },
    'File Added': `I detected a file-based trigger. This will activate when a new file is added.`,
    'New Task': `I detected a task-based trigger. This will activate when a new task is created.`,
    'Manual Trigger': `This automation can be triggered manually whenever needed.`
  };

  const triggerExplanation = typeof explanations[trigger] === 'object'
    ? explanations[trigger][frequency]
    : explanations[trigger];

  return triggerExplanation;
}

// POST /api/ai/suggest - Get automation suggestion
router.post('/suggest', auth, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length < 5) {
      return res.status(400).json({ success: false, message: 'Please provide a description of at least 5 characters.' });
    }

    const suggestion = parseAutomationRequest(text.trim());

    res.json({
      success: true,
      suggestion,
      source: 'rule-based' // Indicate this is rule-based AI
    });
  } catch (error) {
    console.error('AI suggest error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate suggestion.' });
  }
});

module.exports = router;
