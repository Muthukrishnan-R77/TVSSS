const express = require('express');
const router = express.Router();
const enquiryController = require('../controllers/enquiryController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Public route: Submit enquiry
router.post('/', enquiryController.submitEnquiry);

// Admin routes: View & manage enquiries
router.get('/', authenticateToken, enquiryController.getEnquiriesList);
router.get('/:id', authenticateToken, enquiryController.getEnquiryById);
router.put('/:id', authenticateToken, enquiryController.updateEnquiry);
router.delete('/:id', authenticateToken, enquiryController.deleteEnquiry);

module.exports = router;
