require('dotenv').config();
const mongoose = require('mongoose');
const Horse = require('../models/Horse');
const Trainer = require('../models/Trainer');
const Competition = require('../models/Competition');
const TrainingClass = require('../models/TrainingClass');
const User = require('../models/User');
const bcrypt = require('bcrypt');

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      Horse.deleteMany({}),
      Trainer.deleteMany({}),
      Competition.deleteMany({}),
      TrainingClass.deleteMany({}),
      User.deleteMany({ role: 'trainer' })
    ]);
    console.log('Cleared existing data');

    // Create trainer users
    const trainerUsers = await User.create([
      {
        email: 'sarah.j@equestrianhub.com',
        password: await bcrypt.hash('trainer123', 10),
        role: 'trainer',
        username: 'sarahj'
      },
      {
        email: 'michael.b@equestrianhub.com',
        password: await bcrypt.hash('trainer123', 10),
        role: 'trainer',
        username: 'michaelb'
      }
    ]);
    console.log('Created trainer users');

    // Create trainers
    const trainers = await Trainer.create([
      {
        name: 'Sarah Johnson',
        email: 'sarah.j@equestrianhub.com',
        phone: '555-0101',
        specialization: 'dressage',
        certifications: ['USDF Gold Medalist', 'FEI Level 3'],
        userId: trainerUsers[0]._id,
        availability: {
          monday: [{ start: '09:00', end: '17:00' }],
          wednesday: [{ start: '09:00', end: '17:00' }],
          friday: [{ start: '09:00', end: '17:00' }]
        }
      },
      {
        name: 'Michael Brown',
        email: 'michael.b@equestrianhub.com',
        phone: '555-0102',
        specialization: 'jumping',
        certifications: ['USEF Certified', 'BHS Level 4'],
        userId: trainerUsers[1]._id,
        availability: {
          tuesday: [{ start: '09:00', end: '17:00' }],
          thursday: [{ start: '09:00', end: '17:00' }],
          saturday: [{ start: '09:00', end: '14:00' }]
        }
      }
    ]);
    console.log('Created trainers');

    // Create horses
    const horses = await Horse.create([
      {
        name: 'Thunder',
        breed: 'Hanoverian',
        age: 8,
        discipline: 'Dressage',
        trainer: trainers[0]._id,
        medicalHistory: ['Annual vaccinations up to date', 'Regular dental checks'],
        trainingLevel: 'Advanced'
      },
      {
        name: 'Storm',
        breed: 'Dutch Warmblood',
        age: 10,
        discipline: 'Show Jumping',
        trainer: trainers[1]._id,
        medicalHistory: ['Routine check-ups', 'Joint supplements'],
        trainingLevel: 'Professional'
      },
      {
        name: 'Luna',
        breed: 'Andalusian',
        age: 6,
        discipline: 'Dressage',
        trainer: trainers[0]._id,
        medicalHistory: ['Regular farrier visits', 'Preventive care'],
        trainingLevel: 'Intermediate'
      }
    ]);
    console.log('Created horses');

    // Create competitions
    const competitions = await Competition.create([
      {
        name: 'Spring Dressage Championship',
        date: new Date('2024-04-15'),
        registrationDeadline: new Date('2024-04-01'),
        location: 'Main Arena',
        type: 'dressage',
        level: 'advanced',
        maxParticipants: 30,
        entryFee: 150,
        description: 'Annual spring dressage competition featuring multiple levels and divisions.',
        organizer: trainerUsers[0]._id,
        status: 'upcoming'
      },
      {
        name: 'Summer Show Jumping Classic',
        date: new Date('2024-07-20'),
        registrationDeadline: new Date('2024-07-05'),
        location: 'Outdoor Arena',
        type: 'jumping',
        level: 'intermediate',
        maxParticipants: 25,
        entryFee: 175,
        description: 'Premier show jumping event with various height divisions.',
        organizer: trainerUsers[1]._id,
        status: 'upcoming'
      }
    ]);
    console.log('Created competitions');

    // Create training classes
    await TrainingClass.create([
      {
        name: 'Advanced Dressage Techniques',
        trainer: trainers[0]._id,
        type: 'dressage',
        level: 'advanced',
        maxParticipants: 6,
        description: 'Focus on advanced dressage movements and test preparation.',
        location: 'Indoor Arena A',
        schedule: {
          startDate: new Date('2024-01-15'),
          endDate: new Date('2024-03-15'),
          recurringDays: ['monday', 'wednesday'],
          time: '09:00-11:00'
        },
        price: {
          amount: 75,
          currency: 'USD',
          interval: 'per_session'
        },
        prerequisites: ['Intermediate level dressage experience', 'Own horse required'],
        equipment: ['Dressage saddle', 'Proper riding attire']
      },
      {
        name: 'Show Jumping Fundamentals',
        trainer: trainers[1]._id,
        type: 'jumping',
        level: 'intermediate',
        maxParticipants: 8,
        description: 'Course work and jumping techniques for intermediate riders.',
        location: 'Outdoor Arena B',
        schedule: {
          startDate: new Date('2024-01-15'),
          endDate: new Date('2024-03-15'),
          recurringDays: ['tuesday', 'thursday'],
          time: '14:00-16:00'
        },
        price: {
          amount: 65,
          currency: 'USD',
          interval: 'per_session'
        },
        prerequisites: ['Basic jumping experience', 'Own horse preferred'],
        equipment: ['Jumping saddle', 'Safety vest']
      }
    ]);
    console.log('Created training classes');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
