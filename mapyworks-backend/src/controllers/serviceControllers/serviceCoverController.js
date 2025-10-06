const Service = require('../../models/serviceModels/Service');
const path = require('path');
const fs = require('fs').promises;

// Ensure upload directory exists
const ensureUploadDir = async () => {
  const uploadDir = path.join(process.cwd(), 'uploads/service_covers');
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

// Upload service cover image for current service owner
const uploadServiceCover = async (req, res) => {
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
      return res.status(403).json({ error: 'No tienes permisos para modificar la imagen de este servicio.' });
    }

    // Generate unique filename
    const filename = generateFileName(serviceId, req.file.originalname);
    const filepath = path.join(uploadDir, filename);

    // Move file to upload directory
    await fs.writeFile(filepath, req.file.buffer);

    // Delete old cover image if exists
    if (service.cover_image_url) {
      try {
        const oldFilename = path.basename(service.cover_image_url);
        const oldFilepath = path.join(uploadDir, oldFilename);
        await fs.unlink(oldFilepath);
      } catch (error) {
        // Ignore error if old file doesn't exist
        console.log('Old service cover image not found or already deleted');
      }
    }

    // Update service cover image URL
    const imageUrl = `/uploads/service_covers/${filename}`;
    const updatedService = await Service.update(serviceId, { cover_image_url: imageUrl });

    res.json({
      message: 'Imagen de portada del servicio subida exitosamente.',
      cover_image_url: imageUrl,
      service: updatedService
    });

  } catch (error) {
    console.error('Upload service cover image error:', error);

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

    res.status(500).json({ error: 'Error interno del servidor al subir la imagen.' });
  }
};

// Delete service cover image (admin or owner)
const deleteServiceCover = async (req, res) => {
  try {
    const serviceId = req.params.serviceId;
    const uploadDir = await ensureUploadDir();

    // Check if service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ error: 'Servicio no encontrado.' });
    }

    // Check ownership or admin
    if (req.userId !== service.owner_id && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'No tienes permisos para eliminar la imagen de este servicio.' });
    }

    // Check if service has a cover image
    if (!service.cover_image_url) {
      return res.status(400).json({ error: 'El servicio no tiene imagen de portada.' });
    }

    // Delete the file
    const filename = path.basename(service.cover_image_url);
    const filepath = path.join(uploadDir, filename);

    try {
      await fs.unlink(filepath);
    } catch (error) {
      console.log('Service cover image file not found or already deleted');
    }

    // Update service to remove cover image URL
    const updatedService = await Service.update(serviceId, { cover_image_url: null });

    res.json({
      message: 'Imagen de portada del servicio eliminada exitosamente.',
      service: updatedService
    });

  } catch (error) {
    console.error('Delete service cover image error:', error);
    res.status(500).json({ error: 'Error interno del servidor al eliminar la imagen.' });
  }
};

module.exports = {
  uploadServiceCover,
  deleteServiceCover
};
