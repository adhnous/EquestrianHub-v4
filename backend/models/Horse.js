const mongoose = require('mongoose')


const HorseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  breed: { type: String, required: true },
  age: { type: Number, required: true },
  trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true },
  color: { type: String },
  gender: { type: String, enum: ['mare', 'stallion', 'gelding'], default: 'mare' },
  registrationNumber: { type: String, unique: true },
  healthStatus: { type: String, enum: ['healthy', 'sick', 'injured', 'recovery', 'checkup'], default: 'healthy' },
  specialNeeds: { type: String },
});

module.exports = mongoose.model('Horse', HorseSchema);
