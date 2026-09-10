require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const app = express();

const DEFAULT_MONGODB_URI = 'mongodb://ramyasreechowdam_db_user:APuSLelZnP8VchEi@ac-zpsmyyn-shard-00-00.zzsl26p.mongodb.net:27017,ac-zpsmyyn-shard-00-01.zzsl26p.mongodb.net:27017,ac-zpsmyyn-shard-00-02.zzsl26p.mongodb.net:27017/smartflow?ssl=true&authSource=admin&retryWrites=true&w=majority';
const MONGODB_URI = process.env.MONGODB_URI || DEFAULT_MONGODB_URI;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? true : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ MongoDB connected successfully');

    // Auto-seed demo user if not exists
    try {
      const User = require('./models/User');
      const bcrypt = require('bcryptjs');
      const demoExists = await User.findOne({ email: 'demo@smartflow.ai' });
      if (!demoExists) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('demo1234', salt);
        await User.create({
          name: 'Demo User',
          email: 'demo@smartflow.ai',
          password: hashedPassword
        });
        console.log('✅ Demo account initialized');
      }
    } catch (seedErr) {
      console.log('ℹ️ Demo account check completed');
    }
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('⚠️ Server running without database. Please start MongoDB.');
  }
};

connectDB();

// Handle MongoDB disconnection
mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});
mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/automations', require('./routes/automations'));
app.use('/api/activity', require('./routes/activity'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/ai', require('./routes/ai'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'SmartFlow AI API is running',
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Serve static frontend in production if dist folder exists
const distPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// 404 handler for API routes
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found.' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'An unexpected error occurred.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 SmartFlow AI server running on port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api/health`);
});

module.exports = app;
