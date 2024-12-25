const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  trainee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  horse: { type: mongoose.Schema.Types.ObjectId, ref: 'Horse', required: true },
  attended: { type: Boolean, default: false },
  notes: { type: String },
  performance: {
    type: String,
    enum: ['excellent', 'good', 'satisfactory', 'needs_improvement'],
  }
}, { _id: false });

const sessionSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  attendance: [attendanceSchema],
  notes: { type: String },
  objectives: [{ type: String }],
  completed: { type: Boolean, default: false }
});

const trainingClassSchema = new mongoose.Schema({
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
  trainer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  maxParticipants: { 
    type: Number, 
    required: true,
    default: 8
  },
  enrolledTrainees: [{
    trainee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    horse: { type: mongoose.Schema.Types.ObjectId, ref: 'Horse' },
    enrollmentDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['active', 'withdrawn', 'completed'],
      default: 'active'
    }
  }],
  schedule: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    recurringDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    time: { type: String, required: true }
  },
  sessions: [sessionSchema],
  price: {
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    interval: {
      type: String,
      enum: ['per_session', 'weekly', 'monthly', 'full_course'],
      default: 'monthly'
    }
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  prerequisites: [{
    type: String
  }],
  equipment: [{
    type: String
  }],
  location: {
    type: String,
    required: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Middleware to automatically generate sessions based on schedule
trainingClassSchema.pre('save', async function(next) {
  if (this.isModified('schedule') || this.isNew) {
    const sessions = [];
    let currentDate = new Date(this.schedule.startDate);
    const endDate = new Date(this.schedule.endDate);
    
    while (currentDate <= endDate) {
      // Get day of week in lowercase
      const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][currentDate.getDay()];
      
      if (this.schedule.recurringDays.includes(dayOfWeek)) {
        const [hours, minutes] = this.schedule.time.split(':');
        const sessionDate = new Date(currentDate);
        sessionDate.setHours(parseInt(hours), parseInt(minutes), 0);
        
        // Calculate end time (default 1 hour)
        const endTime = new Date(sessionDate);
        endTime.setHours(endTime.getHours() + 1);
        
        sessions.push({
          date: sessionDate,
          startTime: this.schedule.time,
          endTime: `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`,
          attendance: [],
          objectives: [],
          completed: false
        });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    this.sessions = sessions;
  }
  next();
});

module.exports = mongoose.model('TrainingClass', trainingClassSchema);
