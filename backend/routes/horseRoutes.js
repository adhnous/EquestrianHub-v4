const express = require('express');
const router = express.Router();
const Horse = require('../models/horse'); // Import the horse model
const { 
  authenticateToken, 
  isAdmin 
} = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authenticateToken);

// Create a new horse (admin only)
router.post('/', isAdmin, async (req, res) => {
  try {
    const { name, breed, age, color, gender, registrationNumber, healthStatus, owner, discipline, trainingLevel, status, medicalHistory } = req.body;
    
    const newHorse = new Horse({
      name,
      breed,
      age,
      color,
      gender,
      registrationNumber,
      healthStatus,
      owner,
      discipline,
      trainingLevel,
      status,
      medicalHistory
    });

    await newHorse.save();
    res.status(201).json({
      success: true,
      data: newHorse
    });
  } catch (error) {
    console.error('Error creating horse:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create horse',
      error: error.message
    });
  }
});

// Get all horses (admin only)
router.get('/', isAdmin, async (req, res) => {
  try {
    const horses = await Horse.find();
    res.json({
      success: true,
      data: horses
    });
  } catch (error) {
    console.error('Error fetching horses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch horses',
      error: error.message
    });
  }
});

// Get a horse by ID
router.get('/:id', async (req, res) => {
  try {
    const horse = await Horse.findById(req.params.id);
    if (!horse) {
      return res.status(404).json({
        success: false,
        message: 'Horse not found'
      });
    }
    res.json({
      success: true,
      data: horse
    });
  } catch (error) {
    console.error('Error fetching horse:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch horse',
      error: error.message
    });
  }
});

// Update a horse (admin only)
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const horse = await Horse.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!horse) {
      return res.status(404).json({
        success: false,
        message: 'Horse not found'
      });
    }
    res.json({
      success: true,
      data: horse
    });
  } catch (error) {
    console.error('Error updating horse:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update horse',
      error: error.message
    });
  }
});

// Delete a horse (admin only)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const horse = await Horse.findByIdAndDelete(req.params.id);
    if (!horse) {
      return res.status(404).json({
        success: false,
        message: 'Horse not found'
      });
    }
    res.json({
      success: true,
      message: 'Horse deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting horse:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete horse',
      error: error.message
    });
  }
});

module.exports = router;
