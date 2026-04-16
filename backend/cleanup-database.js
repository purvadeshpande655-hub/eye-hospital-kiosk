const mongoose = require('mongoose');
const Patient = require('./models/Patient');

async function cleanupDatabase() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/eyeHospital');
    console.log('🔗 Connected to MongoDB');

    // Remove test patients with incomplete data
    const result = await Patient.deleteMany({
      $or: [
        { name: 'purva' },
        { age: undefined },
        { gender: undefined },
        { specialty: undefined }
      ]
    });

    console.log(`🗑️  Deleted ${result.deletedCount} test patients`);

    await mongoose.connection.close();
    console.log('✅ Cleanup complete. Database is now clean for testing.');

  } catch (error) {
    console.error('❌ Error cleaning database:', error);
    process.exit(1);
  }
}

cleanupDatabase();
