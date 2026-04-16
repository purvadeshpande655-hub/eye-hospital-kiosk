require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const Patient     = require('./models/Patient');
const Doctor      = require('./models/Doctor');
const Appointment = require('./models/Appointment');

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eyeHospital';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => { console.error('❌ MongoDB Error:', err.message); process.exit(1); });

// ─── Helpers ──────────────────────────────────────────────────────────────────
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const getTodayStart = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const generateTokenNumber = async (doctorId, date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  const count = await Appointment.countDocuments({
    doctorId,
    appointmentDate: { $gte: start, $lt: end }
  });
  return count + 1;
};

// ─── Queue Schema defined INLINE (no separate Queue.js file needed) ───────────
const QueueEntrySchema = new mongoose.Schema({
  patientId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  tokenNumber:       { type: Number, required: true },
  patientName:       { type: String, required: true },
  phone:             { type: String },
  status:            { type: String, enum: ['waiting', 'in-consultation', 'completed', 'cancelled'], default: 'waiting' },
  checkInTime:       { type: Date, default: Date.now },
  estimatedWaitTime: { type: Number, default: 0 }
});

const QueueSchema = new mongoose.Schema({
  doctorId:                 { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  doctorName:               { type: String, required: true },
  date:                     { type: Date, required: true },
  patients:                 [QueueEntrySchema],
  currentlyServing:         { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', default: null },
  averageConsultationTime:  { type: Number, default: 15 }
}, { timestamps: true });

QueueSchema.index({ doctorId: 1, date: 1 }, { unique: true });

// Use existing model if already compiled (avoids OverwriteModelError on hot reload)
const Queue = mongoose.models.Queue || mongoose.model('Queue', QueueSchema);

// ─── Add patient to queue ─────────────────────────────────────────────────────
const addToQueue = async (patient, doctorId, doctorName, tokenNumber) => {
  const today = getTodayStart();
  let queue = await Queue.findOne({ doctorId, date: today });

  if (!queue) {
    queue = new Queue({ doctorId, doctorName, date: today, patients: [], averageConsultationTime: 15 });
  }

  const waitingCount = queue.patients.filter(p => p.status === 'waiting').length;
  const estimatedWaitTime = waitingCount * (queue.averageConsultationTime || 15);

  queue.patients.push({
    patientId: patient._id,
    tokenNumber,
    patientName: patient.name,
    phone: patient.phone,
    status: 'waiting',
    checkInTime: new Date(),
    estimatedWaitTime
  });

  await queue.save();
  return { position: waitingCount + 1, estimatedWaitTime };
};

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({
  status: 'ok',
  db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
}));

// ─── 1. Patient Check-In ──────────────────────────────────────────────────────
app.post('/api/patients', async (req, res) => {
  try {
    const { name, phone, age, gender, specialty, doctorId, doctorName } = req.body;

    if (!name || !phone || !age || !gender || !specialty || !doctorId || !doctorName) {
      return res.status(400).json({
        success: false,
        message: `Missing fields: ${JSON.stringify({ name:!!name, phone:!!phone, age:!!age, gender:!!gender, specialty:!!specialty, doctorId:!!doctorId, doctorName:!!doctorName })}`
      });
    }

    if (!isValidObjectId(doctorId)) {
      return res.status(400).json({ success: false, message: 'Invalid doctorId format.' });
    }

    const normalizedGender = gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();

    let tokenNumber;
    try { tokenNumber = await generateTokenNumber(doctorId, new Date()); }
    catch { tokenNumber = Math.floor(Math.random() * 900) + 100; }

    const newPatient = new Patient({
      name, phone, age: Number(age),
      gender: normalizedGender,
      specialty, doctorId, doctorName,
      tokenNumber, status: 'waiting', checkInTime: new Date()
    });
    await newPatient.save();

    const appointmentDate = new Date();
    const appointment = new Appointment({
      patientId: newPatient._id, doctorId,
      appointmentDate,
      appointmentTime: appointmentDate.toTimeString().slice(0, 5),
      tokenNumber, status: 'confirmed', type: 'consultation'
    });
    await appointment.save();

    // Add to queue — errors here won't block registration
    let position = 1, waitTime = 0;
    try {
      const queueInfo = await addToQueue(newPatient, doctorId, doctorName, tokenNumber);
      position = queueInfo.position;
      waitTime = queueInfo.estimatedWaitTime;
    } catch (qErr) {
      console.warn('⚠️ Queue update failed (non-fatal):', qErr.message);
    }

    console.log(`✅ Registered: ${name} | Token: ${tokenNumber} | Position: ${position}`);

    return res.status(201).json({
      success: true,
      tokenNumber,
      position,
      waitTime,
      appointmentId: appointment._id,
      patient: newPatient.toObject()
    });

  } catch (error) {
    console.error('❌ Patient check-in error:', error.message);
    return res.status(400).json({ success: false, message: error.message });
  }
});

// ─── 2. Get All Doctors ───────────────────────────────────────────────────────
app.get('/api/doctors', async (req, res) => {
  try {
    const { specialty } = req.query;
    const filter = { available: true };
    if (specialty) filter.specialty = specialty;
    const doctors = await Doctor.find(filter).sort({ name: 1 });
    return res.json({ success: true, count: doctors.length, doctors });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ─── 3. Get Doctor by ID ──────────────────────────────────────────────────────
app.get('/api/doctors/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid doctor ID.' });
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found.' });
    return res.json({ success: true, doctor });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ─── 4. Get Queue for a Doctor (today) ───────────────────────────────────────
app.get('/api/queue/:doctorId', async (req, res) => {
  try {
    const { doctorId } = req.params;
    if (!isValidObjectId(doctorId)) return res.status(400).json({ success: false, message: 'Invalid doctorId.' });
    const today = getTodayStart();
    const queue = await Queue.findOne({ doctorId, date: today });
    if (!queue) return res.json({ success: true, position: 0, waitTime: 0, totalPatients: 0, currentlyServing: null, patients: [] });

    const avgTime = queue.averageConsultationTime || 15;
    const waitingPatients = queue.patients.filter(p => p.status === 'waiting');
    return res.json({
      success: true,
      doctorName: queue.doctorName,
      totalPatients: queue.patients.length,
      waitingCount: waitingPatients.length,
      currentlyServing: queue.currentlyServing,
      patients: waitingPatients.map((p, i) => ({
        position: i + 1,
        tokenNumber: p.tokenNumber,
        patientName: p.patientName,
        phone: p.phone,
        status: p.status,
        checkInTime: p.checkInTime,
        estimatedWaitTime: (i + 1) * avgTime
      }))
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ─── 5. Get All Queues Today ──────────────────────────────────────────────────
app.get('/api/queues/today', async (req, res) => {
  try {
    const today = getTodayStart();
    const queues = await Queue.find({ date: today });
    return res.json({
      success: true, date: today,
      queues: queues.map(q => ({
        doctorId: q.doctorId, doctorName: q.doctorName,
        totalPatients: q.patients.length,
        waiting: q.patients.filter(p => p.status === 'waiting').length,
        inConsultation: q.patients.filter(p => p.status === 'in-consultation').length,
        completed: q.patients.filter(p => p.status === 'completed').length,
        patients: q.patients
      }))
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ─── 6. Call Next Patient ─────────────────────────────────────────────────────
app.put('/api/queue/:doctorId/next', async (req, res) => {
  try {
    const { doctorId } = req.params;
    if (!isValidObjectId(doctorId)) return res.status(400).json({ success: false, message: 'Invalid doctorId.' });
    const today = getTodayStart();
    const queue = await Queue.findOne({ doctorId, date: today });
    if (!queue) return res.status(404).json({ success: false, message: 'No queue found for today.' });

    const current = queue.patients.find(p => p.status === 'in-consultation');
    if (current) current.status = 'completed';

    const next = queue.patients.find(p => p.status === 'waiting');
    if (!next) {
      queue.currentlyServing = null;
      await queue.save();
      return res.json({ success: true, message: 'Queue complete! No more patients.' });
    }
    next.status = 'in-consultation';
    queue.currentlyServing = next.patientId;
    await queue.save();
    return res.json({
      success: true, message: 'Next patient called.',
      tokenNumber: next.tokenNumber, patientName: next.patientName,
      remaining: queue.patients.filter(p => p.status === 'waiting').length
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ─── 7. Get Patient by Phone ──────────────────────────────────────────────────
app.get('/api/patient/:phone', async (req, res) => {
  try {
    const patient = await Patient.findOne({ phone: req.params.phone });
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found.' });
    return res.json({ success: true, patient });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ─── 8. Init Sample Doctors ───────────────────────────────────────────────────
app.get('/api/init-sample-data', async (req, res) => {
  try {
    await Doctor.deleteMany({});
    const doctors = [
      { name: 'Dr. Mahatme', specialty: 'cataract', qualifications: 'MS, FRCS', experience: 15, consultationFee: 500, available: true, timings: { morning: { start: '09:00', end: '12:00' }, evening: { start: '16:00', end: '19:00' } } },
      { name: 'Dr. Sharma',  specialty: 'glaucoma', qualifications: 'MD, DNB',  experience: 12, consultationFee: 600, available: true, timings: { morning: { start: '10:00', end: '13:00' }, evening: { start: '17:00', end: '20:00' } } },
      { name: 'Dr. Patil',   specialty: 'retina',   qualifications: 'DNB, FRVS',experience: 10, consultationFee: 800, available: true, timings: { morning: { start: '09:30', end: '12:30' }, evening: { start: '16:30', end: '19:30' } } },
      { name: 'Dr. Kulkarni',specialty: 'lasik',    qualifications: 'MBBS, MS', experience: 8,  consultationFee: 1000,available: true, timings: { morning: { start: '11:00', end: '14:00' }, evening: { start: '18:00', end: '21:00' } } },
    ];
    await Doctor.insertMany(doctors);
    return res.json({ success: true, message: 'Sample doctors initialized.', count: doctors.length });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

app.use((err, req, res, next) => res.status(500).json({ success: false, message: 'Internal server error.' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));