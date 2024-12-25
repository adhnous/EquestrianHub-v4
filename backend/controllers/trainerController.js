const User = require('../models/UserModel');
const Trainer = require('../models/Trainer');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

// Create a new trainer
const createTrainer = async (req, res) => {
  try {
    const { name, email, phone, password, specialization, certifications, availability } = req.body;

    // First create a user account
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      username: email, // Use email as username
      email,
      password: hashedPassword,
      role: 'trainer'
    });

    const savedUser = await user.save();

    // Then create the trainer profile
    const trainer = new Trainer({
      userId: savedUser._id,
      name,
      email,
      phone,
      specialization,
      certifications,
      availability,
      status: 'active'
    });

    const savedTrainer = await trainer.save();

    res.status(201).json({
      success: true,
      message: 'Trainer created successfully',
      trainer: savedTrainer
    });
  } catch (error) {
    console.error('Error creating trainer:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating trainer',
      error: error.message
    });
  }
};

// Get all trainers
const getAllTrainers = async (req, res) => {
  try {
    const trainers = await Trainer.find()
      .populate('userId', '-password');

    res.status(200).json({
      success: true,
      trainers
    });
  } catch (error) {
    console.error('Error getting trainers:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving trainers',
      error: error.message
    });
  }
};

// Update a trainer
const updateTrainer = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log('Updating trainer:', { id, updateData });

    // Find trainer first
    const trainer = await Trainer.findById(id);
    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: 'Trainer not found'
      });
    }

    // Update user if email is being changed
    if (updateData.email && trainer.userId) {
      await User.findByIdAndUpdate(
        trainer.userId,
        { email: updateData.email, username: updateData.email }
      );
    }

    // Update password if provided
    if (updateData.password && trainer.userId) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(updateData.password, salt);
      await User.findByIdAndUpdate(
        trainer.userId,
        { password: hashedPassword }
      );
      delete updateData.password; // Don't store password in trainer model
    }

    // Update trainer
    const updatedTrainer = await Trainer.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    console.log('Updated trainer:', updatedTrainer);

    res.status(200).json({
      success: true,
      message: 'Trainer updated successfully',
      trainer: updatedTrainer
    });
  } catch (error) {
    console.error('Error updating trainer:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating trainer',
      error: error.message
    });
  }
};

// Delete a trainer
const deleteTrainer = async (req, res) => {
  try {
    const { id } = req.params;

    // Find trainer first to get userId
    const trainer = await Trainer.findById(id);
    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: 'Trainer not found'
      });
    }

    // Delete user first
    if (trainer.userId) {
      await User.findByIdAndDelete(trainer.userId);
    }

    // Delete trainer
    await Trainer.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Trainer and associated user account deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting trainer:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting trainer',
      error: error.message
    });
  }
};

module.exports = {
  createTrainer,
  getAllTrainers,
  updateTrainer,
  deleteTrainer
};
