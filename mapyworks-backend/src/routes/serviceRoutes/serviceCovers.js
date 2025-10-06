const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticateToken } = require('../../middleware/auth');
const {
  uploadServiceCover,
  deleteServiceCover
} = require('../../controllers/serviceControllers/serviceCoverController');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Upload service cover image (requires authentication)
router.post('/:serviceId/upload', authenticateToken, upload.single('service_cover'), uploadServiceCover);

// Delete service cover image (requires authentication)
router.delete('/:serviceId', authenticateToken, deleteServiceCover);

module.exports = router;
