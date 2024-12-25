const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  trainee: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainee', required: true },
  trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer', required: true },
  createdAt: { type: Date, default: Date.now },
});

// Export the Schedule model
module.exports = mongoose.model('Schedule', scheduleSchema);
