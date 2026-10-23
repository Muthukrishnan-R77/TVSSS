const express = require('express');
const router = express.Router();
const careerController = require('../controllers/careerController');
const { authenticateToken, optionalAuthenticateToken } = require('../middleware/authMiddleware');

// Public route with optional auth inspection
router.get('/', optionalAuthenticateToken, careerController.getJobList);

router.get('/:id', careerController.getJobById);

// Admin routes
router.post('/', authenticateToken, careerController.createJob);
router.put('/:id', authenticateToken, careerController.updateJob);
router.delete('/:id', authenticateToken, careerController.deleteJob);

router.patch('/:id/activate', authenticateToken, careerController.activateJob);
router.patch('/:id/deactivate', authenticateToken, careerController.deactivateJob);
router.patch('/:id/status', authenticateToken, (req, res, next) => {
  const { status, isActive } = req.body;
  if (status === 'Active' || status === 'Published' || isActive === true || isActive === 'true') {
    return careerController.activateJob(req, res, next);
  } else {
    return careerController.deactivateJob(req, res, next);
  }
});

module.exports = router;
