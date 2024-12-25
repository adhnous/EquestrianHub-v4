const mongoose = require('mongoose');
const Competition = require('../models/Competition');

// Create a new competition
const createCompetition = async (req, res) => {
  try {
    // Make sure we have user information from the auth middleware
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User authentication required' 
      });
    }

    const competitionData = {
      ...req.body,
      organizer: req.user.userId  // Using userId instead of _id
    };

    const competition = new Competition(competitionData);
    await competition.save();

    // Populate the organizer information in the response
    const populatedCompetition = await Competition.findById(competition._id)
      .populate('organizer', 'username email')
      .populate('judges', 'name email');

    res.status(201).json({ 
      success: true, 
      competition: populatedCompetition 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: 'Error creating competition', 
      error: error.message 
    });
  }
};

// Get all competitions with filtering options
const getCompetitions = async (req, res) => {
  try {
    const { type, level, status, upcoming } = req.query;
    const query = {};

    if (type) query.type = type;
    if (level) query.level = level;
    if (status) query.status = status;
    if (upcoming === 'true') {
      query.date = { $gte: new Date() };
      query.status = 'upcoming';
    }

    const competitions = await Competition.find(query)
      .populate('organizer', 'username email')
      .populate('judges', 'name email')
      .populate({
        path: 'participants.trainee',
        select: 'name email'
      })
      .populate({
        path: 'participants.horse',
        select: 'name breed'
      })
      .sort({ date: 1 });

    res.status(200).json({ success: true, competitions });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error fetching competitions', error: error.message });
  }
};

// Get a single competition by ID
const getCompetition = async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id)
      .populate('organizer', 'username email')
      .populate('judges', 'name email')
      .populate({
        path: 'participants.trainee',
        select: 'name email'
      })
      .populate({
        path: 'participants.horse',
        select: 'name breed'
      });

    if (!competition) {
      return res.status(404).json({ success: false, message: 'Competition not found' });
    }

    res.status(200).json({ success: true, competition });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error fetching competition', error: error.message });
  }
};

// Update a competition
const updateCompetition = async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id);
    if (!competition) {
      return res.status(404).json({ success: false, message: 'Competition not found' });
    }

    // Only allow organizer or admin to update
    if (competition.organizer.toString() !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this competition' });
    }

    const updatedCompetition = await Competition.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, competition: updatedCompetition });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error updating competition', error: error.message });
  }
};

// Delete a competition
const deleteCompetition = async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id);
    if (!competition) {
      return res.status(404).json({ success: false, message: 'Competition not found' });
    }

    // Only allow organizer or admin to delete
    if (competition.organizer.toString() !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this competition' });
    }

    await competition.remove();
    res.status(200).json({ success: true, message: 'Competition deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error deleting competition', error: error.message });
  }
};

// Register for a competition
const registerForCompetition = async (req, res) => {
  try {
    const { traineeId, horseId } = req.body;
    const competition = await Competition.findById(req.params.id);

    if (!competition) {
      return res.status(404).json({ success: false, message: 'Competition not found' });
    }

    // Check if registration is still open
    if (new Date() > competition.registrationDeadline) {
      return res.status(400).json({ success: false, message: 'Registration deadline has passed' });
    }

    // Check if competition is full
    if (competition.participants.length >= competition.maxParticipants) {
      return res.status(400).json({ success: false, message: 'Competition is full' });
    }

    // Check if trainee is already registered
    const isRegistered = competition.participants.some(p => p.trainee.toString() === traineeId);
    if (isRegistered) {
      return res.status(400).json({ success: false, message: 'Trainee is already registered' });
    }

    competition.participants.push({ trainee: traineeId, horse: horseId });
    await competition.save();

    res.status(200).json({ success: true, message: 'Successfully registered for competition' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error registering for competition', error: error.message });
  }
};

// Update competition results
const updateResults = async (req, res) => {
  try {
    const { participantResults } = req.body;
    const competition = await Competition.findById(req.params.id)
      .populate('judges', '_id');

    if (!competition) {
      return res.status(404).json({ success: false, message: 'Competition not found' });
    }

    // Only judges or admin can update results
    const isJudge = competition.judges.some(judge => judge._id.toString() === req.user.userId);
    if (!isJudge && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update results' });
    }

    // Update participant scores and ranks
    participantResults.forEach(result => {
      const participant = competition.participants.find(
        p => p.trainee.toString() === result.participantId
      );
      
      if (participant) {
        participant.score = result.score;
        participant.rank = result.rank;
        participant.notes = result.notes;
      }
    });

    await competition.save();

    // Return updated competition with populated fields
    const updatedCompetition = await Competition.findById(req.params.id)
      .populate('organizer', 'username email')
      .populate('judges', 'name email')
      .populate('participants.trainee', 'name email')
      .populate('participants.horse', 'name');

    res.status(200).json({ 
      success: true, 
      message: 'Results updated successfully',
      competition: updatedCompetition
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: 'Error updating results', 
      error: error.message 
    });
  }
};

module.exports = {
  createCompetition,
  getCompetitions,
  getCompetition,
  updateCompetition,
  deleteCompetition,
  registerForCompetition,
  updateResults
};