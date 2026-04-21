const mongoose = require('mongoose');
const Patient = require('../models/Patient');

// MongoDB connection string - use environment variable in production
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eyeHospital';

// Connect to MongoDB
mongoose.connect(MONGODB_URI);

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phone } = req.query;
    
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const patient = await Patient.findOne({ phone });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.status(200).json({
      success: true,
      patient
    });

  } catch (error) {
    console.error('Patient fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
