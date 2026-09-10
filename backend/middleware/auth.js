const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'smartflow_secret_key_2024_hackathon';

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);

    if (mongoose.connection.readyState === 1) {
      try {
        const user = await User.findById(decoded.userId).select('-password');
        if (user) {
          req.user = user;
          req.userId = decoded.userId;
          return next();
        }
      } catch (dbErr) {
        // Fallback to session
      }
    }

    req.user = {
      _id: decoded.userId,
      id: decoded.userId,
      name: 'Demo User',
      email: 'demo@smartflow.ai'
    };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired. Please login again.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token. Please login again.' });
  }
};

module.exports = auth;
