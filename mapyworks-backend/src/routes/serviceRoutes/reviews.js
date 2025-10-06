const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/auth');
const reviewsController = require('../../controllers/serviceControllers/reviewsController');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Crear review
router.post('/', reviewsController.createReview);

// Obtener reviews de un servicio
router.get('/:serviceId', reviewsController.getReviewsForService);

// Actualizar review (solo el creador o admin)
router.put('/:id', reviewsController.checkReviewOwnershipOrAdmin, reviewsController.updateReview);

// Eliminar review (solo el creador o admin)
router.delete('/:id', reviewsController.checkReviewOwnershipOrAdmin, reviewsController.deleteReview);

module.exports = router;
