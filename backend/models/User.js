const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  notificationPreferences: {
    email: { type: Boolean, default: true },
    browser: { type: Boolean, default: true },
    failureAlerts: { type: Boolean, default: true },
    successAlerts: { type: Boolean, default: false }
  },
  automationPreferences: {
    defaultFrequency: { type: String, default: 'Daily' },
    autoRetry: { type: Boolean, default: true },
    maxRetries: { type: Number, default: 3 }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
