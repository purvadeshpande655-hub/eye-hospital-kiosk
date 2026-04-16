const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  },
  phone: { 
    type: String, 
    required: true,
    trim: true,
    match: /^[0-9]{10}$/
  },
  email: { 
    type: String, 
    trim: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  age: { 
    type: Number, 
    required: true,
    min: 0,
    max: 150
  },
  gender: { 
    type: String, 
    required: true,
    enum: ['Male', 'Female', 'Other']
  },
  specialty: { 
    type: String, 
    required: true,
    enum: ['cataract', 'glaucoma', 'retina', 'lasik', 'general']
  },
  doctorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Doctor',
    required: true
  },
  doctorName: { 
    type: String, 
    required: true
  },
  isSurgeryPatient: { 
    type: Boolean, 
    default: false 
  },
  patientId: { 
    type: String, 
    unique: true,
    sparse: true
  },
  languagePreference: { 
    type: String, 
    default: 'English',
    enum: ['English', 'Marathi']
  },
  checkInTime: { 
    type: Date, 
    default: Date.now 
  },
  tokenNumber: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['waiting', 'in-consultation', 'completed', 'cancelled'],
    default: 'waiting'
  },
  notes: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Create indexes for better performance
PatientSchema.index({ phone: 1 });
PatientSchema.index({ checkInTime: -1 });
PatientSchema.index({ doctorId: 1, checkInTime: -1 });

module.exports = mongoose.model('Patient', PatientSchema);