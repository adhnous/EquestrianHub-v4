const express = require('express');
const {
  createHorse,
  getAllHorses,
  updateHorse,
  deleteHorse,
} = require('../controllers/horseController');
const { authenticateToken } = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/', authenticateToken, authorizeRoles('admin', 'trainer'), createHorse); // Admins and trainers can create horses
router.get('/', authenticateToken, getAllHorses); // All authenticated users can view horses
router.put('/:id', authenticateToken, authorizeRoles('admin', 'trainer'), updateHorse); // Admins and trainers can update horses
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteHorse); // Admins can delete horses

module.exports = router;
