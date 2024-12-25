const mongoose = require('mongoose');
const Schedule = require('../models/Schedule');

// Create a new schedule
const createSchedule = async (req, res) => {
  const { title, description, date, time, trainee, trainer } = req.body;

  try {
    const newSchedule = new Schedule({ title, description, date, time, trainee, trainer });
    await newSchedule.save();

    res.status(201).json({ success: true, message: 'Schedule created successfully', schedule: newSchedule });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating schedule', error: error.message });
  }
};

// Get all schedules
const getAllSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate('trainee', 'name email')
      .populate('trainer', 'name email');
    res.status(200).json({ success: true, schedules });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching schedules', error: error.message });
  }
};

// Update a schedule
const updateSchedule = async (req, res) => {
  const { id } = req.params;
  const { title, description, date, time, trainee, trainer } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid schedule ID format' });
  }

  try {
    const updatedSchedule = await Schedule.findByIdAndUpdate(
      id,
      { title, description, date, time, trainee, trainer },
      { new: true, runValidators: true }
    );

    if (!updatedSchedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }

    res.status(200).json({ success: true, message: 'Schedule updated successfully', schedule: updatedSchedule });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating schedule', error: error.message });
  }
};

// Delete a schedule
const deleteSchedule = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid schedule ID format' });
  }

  try {
    const deletedSchedule = await Schedule.findByIdAndDelete(id);

    if (!deletedSchedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }

    res.status(200).json({ success: true, message: 'Schedule deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting schedule', error: error.message });
  }
};

// Export all functions
module.exports = {
  createSchedule,
  getAllSchedules,
  updateSchedule,
  deleteSchedule,
};
