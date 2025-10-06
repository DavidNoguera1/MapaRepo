const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticateToken } = require('../../middleware/auth');
const servicePhotosController = require('../../controllers/serviceControllers/servicePhotosController');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Crear foto para un servicio (con upload de archivo)
router.post('/:serviceId/photos', servicePhotosController.checkServiceOwnershipOrAdmin, upload.single('service_photo'), servicePhotosController.createPhoto);

// Obtener fotos de un servicio (público, pero requiere auth por ahora)
router.get('/:serviceId/photos', servicePhotosController.getPhotosByService);

// Obtener foto específica
router.get('/photos/:id', servicePhotosController.getPhotoById);

// Actualizar foto
router.put('/photos/:id', servicePhotosController.checkPhotoOwnershipOrAdmin, servicePhotosController.updatePhoto);

// Eliminar foto
router.delete('/photos/:id', servicePhotosController.checkPhotoOwnershipOrAdmin, servicePhotosController.deletePhoto);

module.exports = router;
