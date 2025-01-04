const express = require('express');
const { getAdmins, createAdmin, deleteAdmin } = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', authenticateToken, authorizeRoles('admin'), getAdmins);
router.post('/', authenticateToken, authorizeRoles('admin'), createAdmin);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteAdmin);

module.exports = router;
