const mongoose = require('mongoose');
const Patient = require('./models/Patient');
const Doctor = require('./models/Doctor');
const Appointment = require('./models/Appointment');
const Queue = require('./models/Queue');

async function viewDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://127.0.0.1:27017/eyeHospital');
    console.log('🔗 Connected to MongoDB\n');

    // View Doctors
    console.log('👨‍⚕️  DOCTORS:');
    console.log('═'.repeat(50));
    const doctors = await Doctor.find({});
    if (doctors.length === 0) {
      console.log('No doctors found in database');
    } else {
      doctors.forEach((doctor, index) => {
        console.log(`${index + 1}. ${doctor.name}`);
        console.log(`   Specialty: ${doctor.specialty}`);
        console.log(`   Qualifications: ${doctor.qualifications}`);
        console.log(`   Experience: ${doctor.experience} years`);
        console.log(`   Fee: ₹${doctor.consultationFee}`);
        console.log(`   Available: ${doctor.available ? 'Yes' : 'No'}`);
        console.log(`   Timings: ${doctor.timings?.morning?.start || 'N/A'} - ${doctor.timings?.morning?.end || 'N/A'}`);
        console.log('');
      });
    }

    // View Patients
    console.log('\n👥 PATIENTS:');
    console.log('═'.repeat(50));
    const patients = await Patient.find({});
    if (patients.length === 0) {
      console.log('No patients found in database');
    } else {
      patients.forEach((patient, index) => {
        console.log(`${index + 1}. ${patient.name}`);
        console.log(`   Phone: ${patient.phone}`);
        console.log(`   Email: ${patient.email || 'Not provided'}`);
        console.log(`   Age: ${patient.age}`);
        console.log(`   Gender: ${patient.gender}`);
        console.log(`   Specialty: ${patient.specialty}`);
        console.log(`   Doctor: ${patient.doctorName}`);
        console.log(`   Token: ${patient.tokenNumber}`);
        console.log(`   Surgery Patient: ${patient.isSurgeryPatient ? 'Yes' : 'No'}`);
        console.log(`   Language: ${patient.languagePreference}`);
        console.log(`   Check-in Time: ${patient.checkInTime}`);
        console.log(`   Status: ${patient.status}`);
        console.log('');
      });
    }

    // View Appointments
    console.log('\n📅 APPOINTMENTS:');
    console.log('═'.repeat(50));
    const appointments = await Appointment.find({}).populate('patientId doctorId');
    if (appointments.length === 0) {
      console.log('No appointments found in database');
    } else {
      appointments.forEach((appointment, index) => {
        console.log(`${index + 1}. Appointment ID: ${appointment._id}`);
        console.log(`   Patient: ${appointment.patientId?.name || 'Unknown'}`);
        console.log(`   Doctor: ${appointment.doctorId?.name || 'Unknown'}`);
        console.log(`   Date: ${appointment.appointmentDate}`);
        console.log(`   Time: ${appointment.appointmentTime}`);
        console.log(`   Token: ${appointment.tokenNumber}`);
        console.log(`   Status: ${appointment.status}`);
        console.log(`   Type: ${appointment.type}`);
        console.log('');
      });
    }

    // View Queues
    console.log('\n📋 QUEUES:');
    console.log('═'.repeat(50));
    const queues = await Queue.find({}).populate('patients.patientId patients.appointmentId');
    if (queues.length === 0) {
      console.log('No queues found in database');
    } else {
      queues.forEach((queue, index) => {
        console.log(`${index + 1}. Queue for Doctor: ${queue.doctorId}`);
        console.log(`   Date: ${queue.date}`);
        console.log(`   Average Consultation Time: ${queue.averageConsultationTime} minutes`);
        console.log(`   Total Patients: ${queue.patients.length}`);
        
        if (queue.patients.length > 0) {
          console.log('   Patients in Queue:');
          queue.patients.forEach((patient, pIndex) => {
            console.log(`     ${pIndex + 1}. Token: ${patient.tokenNumber} | ${patient.patientId?.name || 'Unknown'} | Status: ${patient.status}`);
          });
        }
        console.log('');
      });
    }

    // Summary Statistics
    console.log('\n📊 SUMMARY STATISTICS:');
    console.log('═'.repeat(50));
    console.log(`Total Doctors: ${doctors.length}`);
    console.log(`Total Patients: ${patients.length}`);
    console.log(`Total Appointments: ${appointments.length}`);
    console.log(`Active Queues: ${queues.length}`);
    
    const patientsToday = patients.filter(p => {
      const today = new Date();
      const patientDate = new Date(p.checkInTime);
      return patientDate.toDateString() === today.toDateString();
    });
    console.log(`Patients Checked-in Today: ${patientsToday.length}`);

    // Close connection
    await mongoose.connection.close();
    console.log('\n✅ Database view complete. Connection closed.');

  } catch (error) {
    console.error('❌ Error viewing database:', error);
    process.exit(1);
  }
}

// Run the function
viewDatabase();
