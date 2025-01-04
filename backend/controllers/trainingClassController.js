const mongoose = require('mongoose');
const TrainingClass = require('../models/TrainingClass');
const User = require('../models/UserModel');
const Horse = require('../models/Horse');

// Create a new training class
const createTrainingClass = async (req, res) => {
  try {
    // Only trainers and admins can create classes
    if (req.user.role !== 'trainer' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only trainers and admins can create training classes'
      });
    }

    const classData = {
      ...req.body,
      trainer: req.user.userId
    };

    const trainingClass = new TrainingClass(classData);
    await trainingClass.save();

    const populatedClass = await TrainingClass.findById(trainingClass._id)
      .populate('trainer', 'username email')
      .populate('enrolledTrainees.trainee', 'username email')
      .populate('enrolledTrainees.horse', 'name');

    res.status(201).json({
      success: true,
      trainingClass: populatedClass
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating training class',
      error: error.message
    });
  }
};

// Get all training classes with filtering
const getTrainingClasses = async (req, res) => {
  try {
    const { type, level, status, trainer } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (level) filter.level = level;
    if (status) filter.status = status;
    if (trainer) filter.trainer = trainer;

    const trainingClasses = await TrainingClass.find(filter)
      .populate('trainer', 'username email')
      .populate('enrolledTrainees.trainee', 'username email')
      .populate('enrolledTrainees.horse', 'name')
      .sort({ 'schedule.startDate': 1 });

    res.status(200).json({
      success: true,
      trainingClasses
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error fetching training classes',
      error: error.message
    });
  }
};

// Get a single training class
const getTrainingClass = async (req, res) => {
  try {
    const trainingClass = await TrainingClass.findById(req.params.id)
      .populate('trainer', 'username email')
      .populate('enrolledTrainees.trainee', 'username email')
      .populate('enrolledTrainees.horse', 'name')
      .populate('sessions.attendance.trainee', 'username email')
      .populate('sessions.attendance.horse', 'name');

    if (!trainingClass) {
      return res.status(404).json({
        success: false,
        message: 'Training class not found'
      });
    }

    res.status(200).json({
      success: true,
      trainingClass
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error fetching training class',
      error: error.message
    });
  }
};

// Update a training class
const updateTrainingClass = async (req, res) => {
  try {
    const trainingClass = await TrainingClass.findById(req.params.id);
    if (!trainingClass) {
      return res.status(404).json({
        success: false,
        message: 'Training class not found'
      });
    }

    // Only the trainer of the class or admin can update
    if (trainingClass.trainer.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this training class'
      });
    }

    const updatedClass = await TrainingClass.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    )
      .populate('trainer', 'username email')
      .populate('enrolledTrainees.trainee', 'username email')
      .populate('enrolledTrainees.horse', 'name');

    res.status(200).json({
      success: true,
      trainingClass: updatedClass
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating training class',
      error: error.message
    });
  }
};

// Enroll in a training class
const enrollInClass = async (req, res) => {
  try {
    const { traineeId, horseId } = req.body;
    const trainingClass = await TrainingClass.findById(req.params.id);

    if (!trainingClass) {
      return res.status(404).json({
        success: false,
        message: 'Training class not found'
      });
    }

    // Check if class is full
    if (trainingClass.enrolledTrainees.length >= trainingClass.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Class is full'
      });
    }

    // Check if trainee is already enrolled
    const isEnrolled = trainingClass.enrolledTrainees.some(
      enrollment => enrollment.trainee.toString() === traineeId
    );
    if (isEnrolled) {
      return res.status(400).json({
        success: false,
        message: 'Trainee is already enrolled'
      });
    }

    // Add trainee to enrolled list
    trainingClass.enrolledTrainees.push({
      trainee: traineeId,
      horse: horseId,
      enrollmentDate: new Date(),
      status: 'active'
    });

    // Add trainee to all future sessions' attendance
    const now = new Date();
    trainingClass.sessions.forEach(session => {
      if (new Date(session.date) >= now) {
        if (!session.attendance) {
          session.attendance = [];
        }
        session.attendance.push({
          trainee: traineeId,
          horse: horseId,
          attended: false
        });
      }
    });

    await trainingClass.save();

    const updatedClass = await TrainingClass.findById(req.params.id)
      .populate('trainer', 'username email')
      .populate('enrolledTrainees.trainee', 'username email')
      .populate('enrolledTrainees.horse', 'name');

    res.status(200).json({
      success: true,
      message: 'Successfully enrolled in class',
      trainingClass: updatedClass
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error enrolling in class',
      error: error.message
    });
  }
};

// Update session attendance
const updateSessionAttendance = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { attendanceUpdates } = req.body;
    const trainingClass = await TrainingClass.findOne({ 'sessions._id': sessionId });

    if (!trainingClass) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Only the trainer of the class or admin can update attendance
    if (trainingClass.trainer.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update attendance'
      });
    }

    const session = trainingClass.sessions.id(sessionId);
    
    // Initialize attendance array if it doesn't exist
    if (!session.attendance) {
      session.attendance = trainingClass.enrolledTrainees.map(enrollment => ({
        trainee: enrollment.trainee._id,
        horse: enrollment.horse._id,
        attended: false
      }));
    }

    // Update attendance records
    for (const update of attendanceUpdates) {
      let attendanceRecord = session.attendance.find(
        a => a.trainee._id.toString() === update.traineeId || 
            a.trainee.toString() === update.traineeId
      );
      
      if (!attendanceRecord) {
        // Add new attendance record if it doesn't exist
        const enrollment = trainingClass.enrolledTrainees.find(
          e => e.trainee._id.toString() === update.traineeId
        );
        if (enrollment) {
          attendanceRecord = {
            trainee: enrollment.trainee._id,
            horse: enrollment.horse._id,
            attended: false
          };
          session.attendance.push(attendanceRecord);
        }
      }

      if (attendanceRecord) {
        // Update all fields
        Object.assign(attendanceRecord, {
          attended: update.attended,
          performance: update.performance,
          notes: update.notes
        });
      }
    }

    // Mark session as completed if it's in the past
    if (new Date(session.date) < new Date()) {
      session.completed = true;
    }

    await trainingClass.save();

    const updatedClass = await TrainingClass.findById(trainingClass._id)
      .populate('trainer', 'username email')
      .populate('enrolledTrainees.trainee', 'username email')
      .populate('enrolledTrainees.horse', 'name')
      .populate('sessions.attendance.trainee', 'username email')
      .populate('sessions.attendance.horse', 'name');

    res.status(200).json({
      success: true,
      message: 'Attendance updated successfully',
      trainingClass: updatedClass
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating attendance',
      error: error.message
    });
  }
};

// Update session details
const updateSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const trainingClass = await TrainingClass.findOne({ 'sessions._id': sessionId });

    if (!trainingClass) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Only the trainer of the class or admin can update session
    if (trainingClass.trainer.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update session'
      });
    }

    const session = trainingClass.sessions.id(sessionId);
    Object.assign(session, req.body);
    await trainingClass.save();

    const updatedClass = await TrainingClass.findById(trainingClass._id)
      .populate('trainer', 'username email')
      .populate('enrolledTrainees.trainee', 'username email')
      .populate('enrolledTrainees.horse', 'name')
      .populate('sessions.attendance.trainee', 'username email')
      .populate('sessions.attendance.horse', 'name');

    res.status(200).json({
      success: true,
      message: 'Session updated successfully',
      trainingClass: updatedClass
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating session',
      error: error.message
    });
  }
};

// Delete a training class
const deleteTrainingClass = async (req, res) => {
  try {
    const trainingClass = await TrainingClass.findById(req.params.id);
    if (!trainingClass) {
      return res.status(404).json({
        success: false,
        message: 'Training class not found'
      });
    }

    // Only the trainer of the class or admin can delete
    if (trainingClass.trainer.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this training class'
      });
    }

    await trainingClass.remove();
    res.status(200).json({
      success: true,
      message: 'Training class deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error deleting training class',
      error: error.message
    });
  }
};

module.exports = {
  createTrainingClass,
  getTrainingClasses,
  getTrainingClass,
  updateTrainingClass,
  enrollInClass,
  updateSessionAttendance,
  updateSession,
  deleteTrainingClass
};
