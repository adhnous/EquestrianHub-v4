const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  trainee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  horse: { type: mongoose.Schema.Types.ObjectId, ref: 'Horse', required: true },
  rank: { type: Number },
  score: { type: Number },
  notes: { type: String }
}, { _id: false });

const competitionSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  type: { 
    type: String, 
    required: true,
    enum: ['dressage', 'jumping', 'eventing', 'western']
  },
  level: {
    type: String,
    required: true,
    enum: ['beginner', 'intermediate', 'advanced', 'professional']
  },
  date: { 
    type: Date, 
    required: true 
  },
  location: { 
    type: String, 
    required: true 
  },
  registrationDeadline: { 
    type: Date, 
    required: true 
  },
  maxParticipants: { 
    type: Number, 
    required: true 
  },
  participants: [participantSchema],
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  judges: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trainer'
  }],
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Add index for faster queries
competitionSchema.index({ date: 1, status: 1 });
competitionSchema.index({ type: 1, level: 1 });

module.exports = mongoose.model('Competition', competitionSchema);