const mongoose = require('mongoose');
const Patient = require('../models/Patient');

// MongoDB connection string - use environment variable in production
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eyeHospital';

// Connect to MongoDB
mongoose.connect(MONGODB_URI);

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const patientData = req.body;
    
    // Generate token number
    const token = Math.floor(1000 + Math.random() * 9000);
    
    // Create new patient record
    const patient = new Patient({
      ...patientData,
      tokenNumber: token,
      checkInTime: new Date(),
      status: 'checked-in'
    });

    await patient.save();

    // Calculate position and wait time (simplified for demo)
    const position = Math.floor(Math.random() * 10) + 1;
    const waitTime = Math.floor(Math.random() * 30) + 5;

    res.status(200).json({
      success: true,
      tokenNumber: token,
      position,
      waitTime,
      doctorName: patientData.doctorName || 'Dr. Mahatme',
      patientId: patient._id
    });

  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
