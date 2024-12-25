const mongoose = require('mongoose');
const User = require('../models/UserModel');
const Horse = require('../models/Horse');
require('dotenv').config();

const createTestData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Create test trainee
    const traineeData = {
      email: 'john.trainee@equestrianhub.com',
      username: 'johntrainee',
      password: 'trainee123',
      role: 'trainee',
      name: 'John Smith',
      phoneNumber: '123-456-7890',
      emergencyContact: {
        name: 'Jane Smith',
        relationship: 'Sister',
        phoneNumber: '123-456-7899'
      }
    };

    // Check if trainee exists
    let trainee = await User.findOne({ email: traineeData.email });
    if (!trainee) {
      trainee = await User.create(traineeData);
      console.log('Test trainee created:', trainee);
    } else {
      console.log('Test trainee already exists');
    }

    // Create test horse
    const horseData = {
      name: 'Thunder',
      breed: 'Arabian',
      age: 8,
      color: 'Bay',
      height: '15.2 hands',
      weight: '1000 lbs',
      trainer: '676887e85c067d6b6384c221',  
      healthRecords: {
        vaccinations: [
          {
            type: 'Flu',
            date: new Date('2024-01-01'),
            nextDue: new Date('2024-07-01')
          }
        ],
        medications: [],
        conditions: []
      },
      owner: trainee._id,
      trainers: [],
      specialNotes: 'Experienced in dressage competitions'
    };

    // Check if horse exists
    let horse = await Horse.findOne({ name: horseData.name, owner: trainee._id });
    if (!horse) {
      horse = await Horse.create(horseData);
      console.log('Test horse created:', horse);
    } else {
      console.log('Test horse already exists');
    }

    console.log('Test data creation completed');
    process.exit(0);
  } catch (error) {
    console.error('Error creating test data:', error);
    process.exit(1);
  }
};

createTestData();
