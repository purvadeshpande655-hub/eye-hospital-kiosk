const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');

// MongoDB connection string - use environment variable in production
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eyeHospital';

// Connect to MongoDB with error handling
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

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
    const { specialty } = req.query;
    
    let doctors;
    if (specialty) {
      doctors = await Doctor.find({ specialty });
    } else {
      doctors = await Doctor.find({});
    }

    res.status(200).json({
      success: true,
      doctors
    });

  } catch (error) {
    console.error('Doctors fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
