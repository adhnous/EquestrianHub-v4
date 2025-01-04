require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/UserModel');

async function checkAdminUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const adminUser = await User.findOne({ email: 'admin@equestrianhub.com' });
    if (adminUser) {
      console.log('Admin user found:', {
        email: adminUser.email,
        username: adminUser.username,
        role: adminUser.role,
        passwordHash: adminUser.password
      });

      // Test password validation
      const testPassword = 'admin123';
      const isValid = await adminUser.comparePassword(testPassword);
      console.log('Password validation test:', {
        testPassword,
        isValid
      });
    } else {
      console.log('Admin user not found');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkAdminUser();
