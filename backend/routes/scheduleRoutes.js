const express = require('express');
const {
  createSchedule,
  getAllSchedules,
  updateSchedule,
  deleteSchedule,
} = require('../controllers/scheduleController');
const { authenticateToken } = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/', authenticateToken, authorizeRoles('admin', 'trainer'), createSchedule); // Admins and trainers can create schedules
router.get('/', authenticateToken, getAllSchedules); // All authenticated users can view schedules
router.put('/:id', authenticateToken, authorizeRoles('admin', 'trainer'), updateSchedule); // Admins and trainers can update schedules
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteSchedule); // Admins can delete schedules

module.exports = router;
