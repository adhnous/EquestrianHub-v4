const User = require('../models/UserModel');
const Trainee = require('../models/Trainee');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

// Create a new trainee
const createTrainee = async (req, res) => {
  try {
    const { name, email, phone, password, emergencyContact, experienceLevel, assignedTrainer } = req.body;

    // First create a user account
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      username: email, // Use email as username
      email,
      password: hashedPassword,
      role: 'trainee'
    });

    const savedUser = await user.save();

    // Then create the trainee profile
    const trainee = new Trainee({
      userId: savedUser._id,
      name,
      email,
      phone,
      emergencyContact,
      experienceLevel,
      assignedTrainer,
      status: 'active'
    });

    const savedTrainee = await trainee.save();

    res.status(201).json({
      success: true,
      message: 'Trainee created successfully',
      trainee: savedTrainee
    });
  } catch (error) {
    console.error('Error creating trainee:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating trainee',
      error: error.message
    });
  }
};

// Get all trainees
const getAllTrainees = async (req, res) => {
  try {
    const trainees = await Trainee.find()
      .populate('userId', '-password')
      .populate('assignedTrainer');

    res.status(200).json({
      success: true,
      trainees
    });
  } catch (error) {
    console.error('Error getting trainees:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving trainees',
      error: error.message
    });
  }
};

// Update a trainee
const updateTrainee = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log('Updating trainee:', { id, updateData });

    // Find trainee first
    const trainee = await Trainee.findById(id);
    if (!trainee) {
      return res.status(404).json({
        success: false,
        message: 'Trainee not found'
      });
    }

    // Update user if email is being changed
    if (updateData.email && trainee.userId) {
      await User.findByIdAndUpdate(
        trainee.userId,
        { email: updateData.email, username: updateData.email }
      );
    }

    // Update trainee
    const updatedTrainee = await Trainee.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    console.log('Updated trainee:', updatedTrainee);

    res.status(200).json({
      success: true,
      message: 'Trainee updated successfully',
      trainee: updatedTrainee
    });
  } catch (error) {
    console.error('Error updating trainee:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating trainee',
      error: error.message
    });
  }
};

// Delete a trainee
const deleteTrainee = async (req, res) => {
  try {
    const { id } = req.params;

    // Find trainee first to get userId
    const trainee = await Trainee.findById(id);
    if (!trainee) {
      return res.status(404).json({
        success: false,
        message: 'Trainee not found'
      });
    }

    // Delete user first
    if (trainee.userId) {
      await User.findByIdAndDelete(trainee.userId);
    }

    // Delete trainee
    await Trainee.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Trainee and associated user account deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting trainee:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting trainee',
      error: error.message
    });
  }
};

module.exports = {
  createTrainee,
  getAllTrainees,
  updateTrainee,
  deleteTrainee
};
