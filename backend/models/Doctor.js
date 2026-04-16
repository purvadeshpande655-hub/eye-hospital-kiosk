const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  specialty: {
    type: String,
    required: true,
    enum: ['cataract', 'glaucoma', 'retina', 'lasik', 'general']
  },
  qualifications: {
    type: String,
    required: true
  },
  experience: {
    type: Number,
    required: true
  },
  available: {
    type: Boolean,
    default: true
  },
  consultationFee: {
    type: Number,
    required: true
  },
  timings: {
    morning: {
      start: String,
      end: String
    },
    evening: {
      start: String,
      end: String
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Doctor', doctorSchema);
