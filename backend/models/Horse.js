const mongoose = require('mongoose');

const horseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  breed: { type: String, required: true },
  age: { type: Number, required: true },
  trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainee', required: true },
  createdAt: { type: Date, default: Date.now },
});

// Export the Horse model
module.exports = mongoose.model('Horse', horseSchema);
