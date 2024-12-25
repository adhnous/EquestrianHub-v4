require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/UserModel');

const adminUser = {
  username: 'admin',
  email: 'admin@equestrianhub.com',
  password: 'admin123',
  role: 'admin'
};

async function createAdminUser() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Delete existing admin user if exists
    console.log('Checking for existing admin user...');
    await User.deleteMany({ 
      $or: [
        { email: adminUser.email },
        { username: adminUser.username }
      ]
    });
    console.log('Existing admin users deleted');

    // Create new admin user
    console.log('Creating new admin user...');
    const newAdmin = new User(adminUser);
    await newAdmin.save();
    
    console.log('Admin user created successfully:', {
      email: newAdmin.email,
      username: newAdmin.username,
      role: newAdmin.role,
      id: newAdmin._id
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createAdminUser();