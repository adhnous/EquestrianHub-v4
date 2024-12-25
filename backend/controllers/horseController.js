const mongoose = require('mongoose');
const Horse = require('../models/Horse');

// Create a new horse
const createHorse = async (req, res) => {
  const { name, breed, age, trainer, owner } = req.body;

  try {
    const newHorse = new Horse({ name, breed, age, trainer, owner });
    await newHorse.save();

    res.status(201).json({ success: true, message: 'Horse created successfully', horse: newHorse });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating horse', error: error.message });
  }
};

// Get all horses
const getAllHorses = async (req, res) => {
  try {
    const horses = await Horse.find()
      .populate('trainer', 'name email')
      .populate('owner', 'name email');
    res.status(200).json({ success: true, horses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching horses', error: error.message });
  }
};

// Update a horse
const updateHorse = async (req, res) => {
  const { id } = req.params;
  const { name, breed, age, trainer, owner } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid horse ID format' });
  }

  try {
    const updatedHorse = await Horse.findByIdAndUpdate(
      id,
      { name, breed, age, trainer, owner },
      { new: true, runValidators: true }
    );

    if (!updatedHorse) {
      return res.status(404).json({ success: false, message: 'Horse not found' });
    }

    res.status(200).json({ success: true, message: 'Horse updated successfully', horse: updatedHorse });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating horse', error: error.message });
  }
};

// Delete a horse
const deleteHorse = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid horse ID format' });
  }

  try {
    const deletedHorse = await Horse.findByIdAndDelete(id);

    if (!deletedHorse) {
      return res.status(404).json({ success: false, message: 'Horse not found' });
    }

    res.status(200).json({ success: true, message: 'Horse deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting horse', error: error.message });
  }
};

// Export all functions
module.exports = {
  createHorse,
  getAllHorses,
  updateHorse,
  deleteHorse,
};
