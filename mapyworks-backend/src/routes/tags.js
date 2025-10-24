const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { isAdmin } = require('../middleware/adminAuth');
const tagsController = require('../controllers/tagsController');
const servicesController = require('../controllers/serviceControllers/servicesController');

// Obtener tags (con búsqueda opcional) - público
router.get('/', tagsController.getTags);

// Todas las demás rutas requieren autenticación
router.use(authenticateToken);

// Crear tag
router.post('/', tagsController.createTag);

// Crear o encontrar tag por nombre
router.post('/create-or-find', tagsController.createOrFindTag);

// Eliminar tag (solo admin)
router.delete('/:id', isAdmin, tagsController.deleteTag);

// Añadir tag a servicio (verificar ownership del servicio)
router.post('/:serviceId/tags/:tagId', servicesController.checkServiceOwnershipOrAdmin, tagsController.addTagToService);

// Remover tag de servicio (verificar ownership del servicio)
router.delete('/:serviceId/tags/:tagId', servicesController.checkServiceOwnershipOrAdmin, tagsController.removeTagFromService);

// Obtener tags de un servicio
router.get('/:serviceId/tags', tagsController.getTagsForService);

module.exports = router;
