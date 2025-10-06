const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticateToken } = require('../../middleware/auth');
const { isAdmin } = require('../../middleware/adminAuth');
const {
  uploadProfileImage,
  uploadProfileImageAdmin,
  deleteProfileImage
} = require('../../controllers/userControllers/profileImageController');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Upload profile image for current user (requires authentication)
router.post('/upload', authenticateToken, upload.single('profile_image'), uploadProfileImage);

// Upload profile image for admin (admin can specify user ID)
router.post('/:userId/upload', authenticateToken, isAdmin, upload.single('profile_image'), uploadProfileImageAdmin);

// Delete profile image
router.delete('/:userId', authenticateToken, isAdmin, deleteProfileImage);

module.exports = router;
