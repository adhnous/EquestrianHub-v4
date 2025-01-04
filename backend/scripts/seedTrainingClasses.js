const mongoose = require('mongoose');
const TrainingClass = require('../models/TrainingClass');
const User = require('../models/UserModel');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const seedTrainingClasses = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get a trainer user ID
    const trainer = await User.findOne({ role: 'trainer' });
    if (!trainer) {
      console.error('No trainer found. Please run seedTestUser.js first');
      return;
    }

    const testClasses = [
      {
        name: 'Beginner Dressage',
        description: 'Introduction to basic dressage movements and principles',
        type: 'dressage',
        level: 'beginner',
        trainer: trainer._id,
        maxParticipants: 6,
        price: {
          amount: 50,
          currency: 'USD',
          interval: 'monthly'
        },
        location: 'Main Arena',
        schedule: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-03-31'),
          recurringDays: ['monday', 'wednesday'],
          time: '09:00-10:00'
        },
        status: 'upcoming',
        prerequisites: ['Basic horse handling skills'],
        equipment: ['Riding helmet', 'Riding boots'],
        sessions: [
          {
            date: new Date('2024-01-01'),
            startTime: '09:00',
            endTime: '10:00',
            objectives: ['Introduction to basic dressage positions', 'Walk and trot exercises'],
            attendance: []
          }
        ]
      },
      {
        name: 'Advanced Jumping',
        description: 'Advanced jumping techniques and course navigation',
        type: 'jumping',
        level: 'advanced',
        trainer: trainer._id,
        maxParticipants: 4,
        price: {
          amount: 75,
          currency: 'USD',
          interval: 'monthly'
        },
        location: 'Jumping Arena',
        schedule: {
          startDate: new Date('2024-01-02'),
          endDate: new Date('2024-03-30'),
          recurringDays: ['tuesday', 'thursday'],
          time: '14:00-15:30'
        },
        status: 'upcoming',
        prerequisites: ['Experience with basic jumps', 'Confident at canter'],
        equipment: ['Jumping saddle', 'Safety vest'],
        sessions: [
          {
            date: new Date('2024-01-02'),
            startTime: '14:00',
            endTime: '15:30',
            objectives: ['Course analysis', 'Advanced jumping techniques'],
            attendance: []
          }
        ]
      },
      {
        name: 'Western Riding Basics',
        description: 'Introduction to western riding style and techniques',
        type: 'western',
        level: 'beginner',
        trainer: trainer._id,
        maxParticipants: 8,
        price: {
          amount: 45,
          currency: 'USD',
          interval: 'monthly'
        },
        location: 'Western Arena',
        schedule: {
          startDate: new Date('2024-01-03'),
          endDate: new Date('2024-03-29'),
          recurringDays: ['friday', 'saturday'],
          time: '10:00-11:30'
        },
        status: 'upcoming',
        prerequisites: ['None'],
        equipment: ['Western saddle', 'Western boots'],
        sessions: [
          {
            date: new Date('2024-01-03'),
            startTime: '10:00',
            endTime: '11:30',
            objectives: ['Basic western riding position', 'Walk and jog'],
            attendance: []
          }
        ]
      }
    ];

    // Clear existing classes
    await TrainingClass.deleteMany({});
    console.log('Cleared existing training classes');

    // Insert new classes
    await TrainingClass.insertMany(testClasses);
    console.log('Inserted test training classes');

  } catch (error) {
    console.error('Error seeding training classes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the seed function
seedTrainingClasses();
