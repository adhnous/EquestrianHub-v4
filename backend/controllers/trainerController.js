const User = require('../models/UserModel'); // User model for managing user accounts
const Trainer = require('../models/Trainer'); // Trainer model for managing trainer profiles
const bcrypt = require('bcrypt'); // Library for hashing and validating passwords
const mongoose = require('mongoose'); // MongoDB library for database management

// Create a new trainer
const createTrainer = async (req, res) => {
  try {
    const {
      name, email, phone, password,
      gender, specialization, certifications,
      availability
    } = req.body; // Extract required fields from the request body

    // Step 1: Create a user account
    const salt = await bcrypt.genSalt(10); // Generate a salt for password hashing
    const hashedPassword = await bcrypt.hash(password, salt); // Hash the password

    const user = new User({
      username: email, // Use email as the username for simplicity
      email,
      password: hashedPassword, // Store the hashed password
      role: 'trainer' // Assign the "trainer" role
    });

    const savedUser = await user.save(); // Save the user account to the database

    // Step 2: Create a trainer profile
    const trainer = new Trainer({
      userId: savedUser._id, // Link the trainer to the user account
      name,
      email,
      phone,
      specialization,
      gender,
      certifications,
      availability,
      status: 'active' // Default status is active
    });

    const savedTrainer = await trainer.save(); // Save the trainer profile to the database

    // Send success response
    res.status(201).json({
      success: true,
      message: 'Trainer created successfully',
      trainer: savedTrainer // Return the saved trainer details
    });
  } catch (error) {
    console.error('Error creating trainer:', error); // Log the error for debugging
    res.status(500).json({
      success: false,
      message: 'Error creating trainer',
      error: error.message // Return the error message
    });
  }
};

// Get all trainers (with dynamic filtering and pagination)
const getAllTrainers = async (req, res) => {
  const { page = 1, limit = 10, ...filters } = req.query; // Extract page, limit, and filters from query parameters

  try {
    // Step 1: Build dynamic query
    const query = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value) {
        query[key] = value; // Add filters dynamically
      }
    }

    // Step 2: Fetch trainers with pagination
    const trainers = await Trainer.find(query)
      .populate('userId', '-password') // Populate user details, excluding the password
      .skip((page - 1) * limit) // Skip documents for pagination
      .limit(parseInt(limit)); // Limit the number of documents returned

    const totalTrainers = await Trainer.countDocuments(query); // Count total trainers matching the query

    // Step 3: Send success response with pagination info
    res.status(200).json({
      success: true,
      trainers, // List of trainers
      pagination: {
        currentPage: parseInt(page), // Current page
        totalPages: Math.ceil(totalTrainers / limit), // Total number of pages
        totalTrainers // Total number of trainers
      }
    });
  } catch (error) {
    console.error('Error getting trainers:', error); // Log the error for debugging
    res.status(500).json({
      success: false,
      message: 'Error retrieving trainers',
      error: error.message // Return the error message
    });
  }
};

// Update a trainer
const updateTrainer = async (req, res) => {
  try {
    const { id } = req.params; // Extract trainer ID from route parameters
    const updateData = req.body; // Extract update data from the request body

    console.log('Updating trainer:', { id, updateData }); // Log the update request

    // Step 1: Find the trainer by ID
    const trainer = await Trainer.findById(id);
    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: 'Trainer not found' // Return 404 if trainer is not found
      });
    }

    // Step 2: Update user account if email or password is provided
    if (updateData.email && trainer.userId) {
      await User.findByIdAndUpdate(
        trainer.userId,
        { email: updateData.email, username: updateData.email } // Update email in user account
      );
    }

    if (updateData.password && trainer.userId) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(updateData.password, salt); // Hash the new password
      await User.findByIdAndUpdate(
        trainer.userId,
        { password: hashedPassword } // Update password in user account
      );
      delete updateData.password; // Prevent password from being stored in the trainer profile
    }

    // Step 3: Update the trainer profile
    const updatedTrainer = await Trainer.findByIdAndUpdate(
      id,
      { $set: updateData }, // Apply updates
      { new: true, runValidators: true } // Return the updated document and validate data
    );

    console.log('Updated trainer:', updatedTrainer); // Log the updated trainer

    // Step 4: Send success response
    res.status(200).json({
      success: true,
      message: 'Trainer updated successfully',
      trainer: updatedTrainer // Return the updated trainer details
    });
  } catch (error) {
    console.error('Error updating trainer:', error); // Log the error for debugging
    res.status(500).json({
      success: false,
      message: 'Error updating trainer',
      error: error.message // Return the error message
    });
  }
};

// Delete a trainer
const deleteTrainer = async (req, res) => {
  try {
    const { id } = req.params; // Extract trainer ID from route parameters

    // Step 1: Find trainer by ID to get associated user ID
    const trainer = await Trainer.findById(id);
    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: 'Trainer not found' // Return 404 if trainer is not found
      });
    }

    // Step 2: Delete associated user account
    if (trainer.userId) {
      await User.findByIdAndDelete(trainer.userId); // Delete the user account
    }

    // Step 3: Delete the trainer profile
    await Trainer.findByIdAndDelete(id);

    // Step 4: Send success response
    res.status(200).json({
      success: true,
      message: 'Trainer and associated user account deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting trainer:', error); // Log the error for debugging
    res.status(500).json({
      success: false,
      message: 'Error deleting trainer',
      error: error.message // Return the error message
    });
  }
};

module.exports = {
  createTrainer,
  getAllTrainers,
  updateTrainer,
  deleteTrainer
};
