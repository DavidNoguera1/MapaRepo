const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/auth');
const { isAdmin } = require('../../middleware/adminAuth');
const servicesController = require('../../controllers/serviceControllers/servicesController');

router.post('/', authenticateToken, servicesController.createService);
router.get('/', servicesController.getServices);
router.get('/me', authenticateToken, servicesController.getMyServices);
router.get('/near-me', servicesController.getServicesNearMe);
router.get('/:id', servicesController.getServiceById);
router.put('/:id', authenticateToken, servicesController.checkOwnershipOrAdmin, servicesController.updateService);
router.delete('/:id', authenticateToken, servicesController.checkOwnershipOrAdmin, servicesController.deleteService);

module.exports = router;
