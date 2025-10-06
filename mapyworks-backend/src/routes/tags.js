const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { isAdmin } = require('../middleware/adminAuth');
const tagsController = require('../controllers/tagsController');
const servicesController = require('../controllers/serviceControllers/servicesController');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Crear tag
router.post('/', tagsController.createTag);

// Obtener tags (con búsqueda opcional)
router.get('/', tagsController.getTags);

// Eliminar tag (solo admin)
router.delete('/:id', isAdmin, tagsController.deleteTag);

// Añadir tag a servicio (verificar ownership del servicio)
router.post('/:serviceId/tags/:tagId', servicesController.checkServiceOwnershipOrAdmin, tagsController.addTagToService);

// Remover tag de servicio (verificar ownership del servicio)
router.delete('/:serviceId/tags/:tagId', servicesController.checkServiceOwnershipOrAdmin, tagsController.removeTagFromService);

// Obtener tags de un servicio
router.get('/:serviceId/tags', tagsController.getTagsForService);

module.exports = router;
