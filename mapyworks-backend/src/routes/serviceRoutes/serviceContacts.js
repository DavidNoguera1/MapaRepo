const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/auth');
const serviceContactsController = require('../../controllers/serviceControllers/serviceContactsController');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Crear contacto para un servicio
router.post('/:serviceId/contacts', serviceContactsController.checkServiceOwnershipOrAdmin, serviceContactsController.createContact);

// Obtener contactos de un servicio
router.get('/:serviceId/contacts', serviceContactsController.getContactsForService);

// Actualizar contacto
router.put('/:serviceId/contacts/:contactId', serviceContactsController.checkServiceOwnershipOrAdmin, serviceContactsController.checkContactOwnership, serviceContactsController.updateContact);

// Eliminar contacto
router.delete('/:serviceId/contacts/:contactId', serviceContactsController.checkServiceOwnershipOrAdmin, serviceContactsController.checkContactOwnership, serviceContactsController.deleteContact);

module.exports = router;
