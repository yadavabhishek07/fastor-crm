const express = require('express');
const router = express.Router();
const {
  submitPublicEnquiry,
  getPublicEnquiries,
  claimEnquiry,
  getMyClaimedEnquiries,
  getEnquiryById
} = require('../controllers/enquiryController');
const { protect } = require('../middleware/auth');
const { validateEnquiry } = require('../middleware/validate');

// Public route: Prospective clients submit enquiries
router.post('/', validateEnquiry, submitPublicEnquiry);

// Private CRM routes (Require Counselor JWT Token)
router.get('/public', protect, getPublicEnquiries);
router.post('/:id/claim', protect, claimEnquiry);
router.get('/mine', protect, getMyClaimedEnquiries);
router.get('/:id', protect, getEnquiryById);

module.exports = router;
