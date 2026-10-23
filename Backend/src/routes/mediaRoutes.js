const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const { authenticateToken, optionalAuthenticateToken } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

// Public route (optional auth check attached if present)
router.get('/', optionalAuthenticateToken, mediaController.getMediaList);

router.get('/:id', mediaController.getMediaById);

// Admin-only management routes
router.post('/', authenticateToken, upload.single('mediaFile'), mediaController.createMedia);
router.put('/:id', authenticateToken, upload.single('mediaFile'), mediaController.updateMedia);
router.delete('/:id', authenticateToken, mediaController.deleteMedia);

router.patch('/:id/publish', authenticateToken, mediaController.publishMedia);
router.patch('/:id/unpublish', authenticateToken, mediaController.unpublishMedia);
router.patch('/:id/status', authenticateToken, (req, res, next) => {
  const { status, isPublished } = req.body;
  if (status === 'Published' || isPublished === true || isPublished === 'true') {
    return mediaController.publishMedia(req, res, next);
  } else {
    return mediaController.unpublishMedia(req, res, next);
  }
});

module.exports = router;
