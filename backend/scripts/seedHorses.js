const mongoose = require('mongoose');
const Horse = require('../models/Horse');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const testHorses = [
  {
    name: 'Thunder',
    breed: 'Arabian',
    age: 7,
    color: 'Bay',
    gender: 'stallion',
    registrationNumber: 'AR123456',
    healthStatus: 'healthy',
    owner: 'John Smith',
    discipline: 'Dressage',
    trainingLevel: 'Advanced'
  },
  {
    name: 'Luna',
    breed: 'Hanoverian',
    age: 5,
    color: 'Black',
    gender: 'mare',
    registrationNumber: 'HN789012',
    healthStatus: 'healthy',
    owner: 'Sarah Johnson',
    discipline: 'Show Jumping',
    trainingLevel: 'Intermediate'
  },
  {
    name: 'Spirit',
    breed: 'Quarter Horse',
    age: 8,
    color: 'Palomino',
    gender: 'gelding',
    registrationNumber: 'QH345678',
    healthStatus: 'healthy',
    specialNeeds: 'Special diet for maintaining weight',
    owner: 'Mike Wilson',
    discipline: 'Western',
    trainingLevel: 'Professional'
  },
  {
    name: 'Bella',
    breed: 'Warmblood',
    age: 6,
    color: 'Grey',
    gender: 'mare',
    registrationNumber: 'WB901234',
    healthStatus: 'recovery',
    specialNeeds: 'Recovering from minor leg injury',
    owner: 'Emma Davis',
    discipline: 'Eventing',
    trainingLevel: 'Advanced'
  },
  {
    name: 'Duke',
    breed: 'Thoroughbred',
    age: 4,
    color: 'Chestnut',
    gender: 'gelding',
    registrationNumber: 'TB567890',
    healthStatus: 'healthy',
    owner: 'Tom Brown',
    discipline: 'Show Jumping',
    trainingLevel: 'Beginner'
  }
];

const seedHorses = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing horses
    await Horse.deleteMany({});
    console.log('Cleared existing horses');

    // Insert test horses
    const horses = await Horse.insertMany(testHorses);
    console.log(`Created ${horses.length} test horses`);

  } catch (error) {
    console.error('Error seeding horses:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the seed function
seedHorses();
