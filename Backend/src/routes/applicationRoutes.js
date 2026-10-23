const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

// Public route: Submit application with resume upload
router.post('/', upload.single('resumeFile'), applicationController.submitApplication);

// Admin routes: View & manage applications
router.get('/', authenticateToken, applicationController.getApplicationsList);
router.get('/:id', authenticateToken, applicationController.getApplicationById);
router.put('/:id', authenticateToken, applicationController.updateApplication);
router.delete('/:id', authenticateToken, applicationController.deleteApplication);

// Resume file viewing/downloading for admin
router.get('/:id/resume', authenticateToken, applicationController.downloadResume);

module.exports = router;
