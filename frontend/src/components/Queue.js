const mongoose = require('mongoose');

const QueueEntrySchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  tokenNumber: { type: Number, required: true },
  patientName: { type: String, required: true },
  phone: { type: String },
  status: { type: String, enum: ['waiting', 'in-consultation', 'completed', 'cancelled'], default: 'waiting' },
  checkInTime: { type: Date, default: Date.now },
  estimatedWaitTime: { type: Number, default: 0 }
});

const QueueSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  doctorName: { type: String, required: true },
  date: { type: Date, required: true },
  patients: [QueueEntrySchema],
  currentlyServing: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', default: null },
  averageConsultationTime: { type: Number, default: 15 }
}, { timestamps: true });

QueueSchema.index({ doctorId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Queue', QueueSchema);