const ServicePhoto = require('../../models/serviceModels/ServicePhoto');
const Service = require('../../models/serviceModels/Service');
const path = require('path');
const fs = require('fs').promises;

// Ensure upload directory exists
const ensureUploadDir = async () => {
  const uploadDir = path.join(process.cwd(), 'uploads/service_photos');
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }
  return uploadDir;
};

// Generate unique filename
const generateFileName = (serviceId, originalName) => {
  const timestamp = Date.now();
  const ext = path.extname(originalName);
  return `${serviceId}_${timestamp}${ext}`;
};

// Validate file type
const validateImageFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error('Tipo de archivo no permitido. Solo se permiten imágenes JPEG, PNG, GIF y WebP.');
  }

  if (file.size > maxSize) {
    throw new Error('El archivo es demasiado grande. El tamaño máximo es 5MB.');
  }

  return true;
};

// Middleware para verificar ownership del servicio o admin
const checkServiceOwnershipOrAdmin = async (req, res, next) => {
  try {
    const serviceId = req.params.serviceId || req.body.service_id;
    if (!serviceId) {
      return res.status(400).json({ error: 'Service ID requerido' });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    if (req.userId !== service.owner_id && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'No tienes permisos para modificar fotos de este servicio' });
    }

    req.service = service;
    next();
  } catch (error) {
    console.error('Error en checkServiceOwnershipOrAdmin:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Middleware para verificar ownership de la foto (a través del servicio)
const checkPhotoOwnershipOrAdmin = async (req, res, next) => {
  try {
    const photoId = req.params.id;
    const photo = await ServicePhoto.findById(photoId);

    if (!photo) {
      return res.status(404).json({ error: 'Foto no encontrada' });
    }

    const service = await Service.findById(photo.service_id);
    if (!service) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    if (req.userId !== service.owner_id && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'No tienes permisos para modificar esta foto' });
    }

    req.photo = photo;
    req.service = service;
    next();
  } catch (error) {
    console.error('Error en checkPhotoOwnershipOrAdmin:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Crear foto con upload de archivo
const createPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha proporcionado ningún archivo.' });
    }

    // Validate file
    validateImageFile(req.file);

    const serviceId = req.params.serviceId;
    const uploadDir = await ensureUploadDir();

    // Check if service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ error: 'Servicio no encontrado.' });
    }

    // Check ownership or admin
    if (req.userId !== service.owner_id && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'No tienes permisos para agregar fotos a este servicio.' });
    }

    // Generate unique filename
    const filename = generateFileName(serviceId, req.file.originalname);
    const filepath = path.join(uploadDir, filename);

    // Move file to upload directory
    await fs.writeFile(filepath, req.file.buffer);

    // Create photo record in database
    const imageUrl = `/uploads/service_photos/${filename}`;
    const photoData = {
      service_id: serviceId,
      photo_url: imageUrl,
      position: req.body.position || 0
    };

    const photo = await ServicePhoto.create(photoData);

    res.status(201).json({
      message: 'Foto de galería subida exitosamente.',
      photo: photo
    });

  } catch (error) {
    console.error('Upload service photo error:', error);

    // Clean up uploaded file if it exists
    if (req.file && req.file.buffer) {
      try {
        const uploadDir = await ensureUploadDir();
        const filename = generateFileName(req.params.serviceId, req.file.originalname);
        const filepath = path.join(uploadDir, filename);
        await fs.unlink(filepath);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }

    if (error.message.includes('Tipo de archivo') || error.message.includes('tamaño')) {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: 'Error interno del servidor al subir la foto.' });
  }
};

// Obtener fotos de un servicio
const getPhotosByService = async (req, res) => {
  try {
    const serviceId = req.params.serviceId;
    const photos = await ServicePhoto.findByServiceId(serviceId);
    res.json({ photos });
  } catch (error) {
    console.error('Error obteniendo fotos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener foto por ID
const getPhotoById = async (req, res) => {
  try {
    const photoId = req.params.id;
    const photo = await ServicePhoto.findById(photoId);

    if (!photo) {
      return res.status(404).json({ error: 'Foto no encontrada' });
    }

    res.json({ photo });
  } catch (error) {
    console.error('Error obteniendo foto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar foto
const updatePhoto = async (req, res) => {
  try {
    const photoId = req.params.id;
    const { photo_url, position } = req.body;

    const updateData = {};
    if (photo_url !== undefined) updateData.photo_url = photo_url;
    if (position !== undefined) updateData.position = position;

    const photo = await ServicePhoto.update(photoId, updateData);

    if (!photo) {
      return res.status(404).json({ error: 'Foto no encontrada' });
    }

    res.json({ message: 'Foto actualizada exitosamente', photo });
  } catch (error) {
    console.error('Error actualizando foto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar foto
const deletePhoto = async (req, res) => {
  try {
    const photoId = req.params.id;
    const uploadDir = await ensureUploadDir();

    // Get photo info before deleting
    const photo = await ServicePhoto.findById(photoId);
    if (!photo) {
      return res.status(404).json({ error: 'Foto no encontrada' });
    }

    // Delete from database
    const deleted = await ServicePhoto.delete(photoId);

    if (!deleted) {
      return res.status(404).json({ error: 'Foto no encontrada' });
    }

    // Delete physical file
    if (photo.photo_url) {
      try {
        const filename = path.basename(photo.photo_url);
        const filepath = path.join(uploadDir, filename);
        await fs.unlink(filepath);
      } catch (error) {
        console.log('Service photo file not found or already deleted');
      }
    }

    res.json({ message: 'Foto eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando foto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  createPhoto,
  getPhotosByService,
  getPhotoById,
  updatePhoto,
  deletePhoto,
  checkServiceOwnershipOrAdmin,
  checkPhotoOwnershipOrAdmin
};
