const express = require('express');
const router = express.Router();

// Mock database
let horses = [
  {
    id: '67698fd5d48032d0bc838580',
    name: 'Spirit',
    breed: 'quarterHorse',
    age: 5,
    owner: 'John Doe',
  },
];

// GET all horses
router.get('/', (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: horses,
    });
  } catch (error) {
    console.error('Error fetching horses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching horses',
      error: error.message,
    });
  }
});

// GET single horse by ID
router.get('/:id', (req, res) => {
  try {
    const horse = horses.find((h) => h.id === req.params.id);
    if (!horse) {
      return res.status(404).json({
        success: false,
        message: 'Horse not found',
      });
    }
    res.status(200).json({
      success: true,
      data: horse,
    });
  } catch (error) {
    console.error('Error fetching horse:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching horse',
      error: error.message,
    });
  }
});

// POST create a new horse
router.post('/', (req, res) => {
  try {
    const { name, breed, age, owner } = req.body;

    // Validate required fields
    if (!name || !breed || !age || !owner) {
      return res.status(400).json({
        success: false,
        message: 'Name, breed, age, and owner are required fields.',
      });
    }

    const newHorse = {
      id: Math.random().toString(36).substr(2, 9), // Generate a unique ID
      ...req.body,
    };

    horses.push(newHorse);
    res.status(201).json({
      success: true,
      data: newHorse,
      message: 'Horse created successfully.',
    });
  } catch (error) {
    console.error('Error creating horse:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating horse',
      error: error.message,
    });
  }
});

// PUT update a horse by ID
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const index = horses.findIndex((h) => h.id === id);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Horse not found',
      });
    }

    // Update the horse
    horses[index] = {
      ...horses[index],
      ...updates,
      id, // Ensure ID is preserved
    };

    res.status(200).json({
      success: true,
      data: horses[index],
      message: 'Horse updated successfully.',
    });
  } catch (error) {
    console.error('Error updating horse:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating horse',
      error: error.message,
    });
  }
});

// DELETE a horse by ID
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const index = horses.findIndex((h) => h.id === id);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Horse not found',
      });
    }

    // Remove the horse from the array
    const deletedHorse = horses.splice(index, 1);

    res.status(200).json({
      success: true,
      data: deletedHorse[0],
      message: 'Horse deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting horse:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting horse',
      error: error.message,
    });
  }
});

module.exports = router;
