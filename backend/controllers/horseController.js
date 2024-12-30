// Importing dependencies and the Horse model
const mongoose = require('mongoose');
const Horse = require('../models/Horse');

// Create a new horse
const createHorse = async (req, res) => {
  const { name, breed, age, trainer, owner, color, gender, registrationNumber, healthStatus, specialNeeds } = req.body;

  // Validate required fields
  if (!name || !breed || !age || !trainer || !owner) {
    return res.status(400).json({ success: false, message: 'All required fields must be provided.' });
  }

  try {
    const newHorse = new Horse({
      name,
      breed,
      age,
      trainer,
      owner,
      color,
      gender,
      registrationNumber,
      healthStatus,
      specialNeeds,
    });

    await newHorse.save();

    res.status(201).json({ success: true, message: 'Horse created successfully.', horse: newHorse });
  } catch (error) {
    const errorMessage = error.code === 11000 ? 'Registration number must be unique.' : error.message;
    res.status(500).json({ success: false, message: 'Error creating horse.', error: errorMessage });
  }
};

const getAllHorses = async (req, res) => {
  try {
    const horses = await Horse.find();
    res.status(200).json({ success: true, horses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching horses.', error: error.message });
  }
};


// Update a horse
const updateHorse = async (req, res) => {
  const { id } = req.params;
  const { name, breed, age, trainer, owner, color, gender, registrationNumber, healthStatus, specialNeeds } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid horse ID format.' });
  }

  if (!name || !breed || !age || !trainer || !owner) {
    return res.status(400).json({ success: false, message: 'All required fields must be provided.' });
  }

  try {
    const updatedHorse = await Horse.findByIdAndUpdate(
      id,
      { name, breed, age, trainer, owner, color, gender, registrationNumber, healthStatus, specialNeeds },
      { new: true, runValidators: true }
    );

    if (!updatedHorse) {
      return res.status(404).json({ success: false, message: 'Horse not found.' });
    }

    res.status(200).json({ success: true, message: 'Horse updated successfully.', horse: updatedHorse });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating horse.', error: error.message });
  }
};

// Delete a horse
const deleteHorse = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid horse ID format.' });
  }

  try {
    const deletedHorse = await Horse.findByIdAndDelete(id);

    if (!deletedHorse) {
      return res.status(404).json({ success: false, message: 'Horse not found.' });
    }

    res.status(200).json({ success: true, message: 'Horse deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting horse.', error: error.message });
  }
};

// Exporting all controller functions
module.exports = {
  createHorse,
  getAllHorses,
  updateHorse,
  deleteHorse,
};
