const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/UserModel');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const createTrainer = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if trainer already exists
    const existingTrainer = await User.findOne({ email: 'trainer@example.com' });
    if (existingTrainer) {
      console.log('Trainer already exists');
      return existingTrainer;
    }

    // Create trainer user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const trainer = new User({
      username: 'trainer',
      email: 'trainer@example.com',
      password: hashedPassword,
      role: 'trainer',
      firstName: 'John',
      lastName: 'Smith',
      phoneNumber: '123-456-7890',
      specialties: ['dressage', 'jumping'],
      certifications: ['USDF Certified'],
      bio: 'Experienced trainer specializing in dressage and jumping'
    });

    await trainer.save();
    console.log('Trainer created successfully');
    return trainer;

  } catch (error) {
    console.error('Error creating trainer:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

createTrainer();
