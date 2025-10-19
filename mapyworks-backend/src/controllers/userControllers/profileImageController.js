const User = require('../../models/User');
const path = require('path');
const fs = require('fs').promises;

// Ensure upload directory exists
const ensureUploadDir = async () => {
  // Use absolute path from project root - this should fix the file path issue
  const uploadDir = path.join(process.cwd(), 'uploads/user_images');
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }
  return uploadDir;
};

// Generate unique filename
const generateFileName = (userId, originalName) => {
  const timestamp = Date.now();
  const ext = path.extname(originalName);
  return `${userId}_${timestamp}${ext}`;
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

// Upload profile image for current user
const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha proporcionado ningún archivo.' });
    }

    // Validate file
    validateImageFile(req.file);

    const userId = req.userId;
    const uploadDir = await ensureUploadDir();

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    // Generate unique filename
    const filename = generateFileName(userId, req.file.originalname);
    const filepath = path.join(uploadDir, filename);

    // Move file to upload directory
    await fs.writeFile(filepath, req.file.buffer);

    // Delete old profile image if exists
    if (user.profile_picture_url) {
      try {
        const oldFilename = path.basename(user.profile_picture_url);
        const oldFilepath = path.join(uploadDir, oldFilename);
        await fs.unlink(oldFilepath);
      } catch (error) {
        // Ignore error if old file doesn't exist
        console.log('Old profile image not found or already deleted');
      }
    }

    // Update user profile picture URL
    const imageUrl = `/uploads/user_images/${filename}`;
    const updatedUser = await User.updateProfilePicture(userId, imageUrl);

    res.json({
      message: 'Imagen de perfil subida exitosamente.',
      profile_picture_url: imageUrl,
      user: {
        id: updatedUser.id,
        user_name: updatedUser.user_name,
        profile_picture_url: updatedUser.profile_picture_url
      }
    });

  } catch (error) {
    console.error('Upload profile image error:', error);

    // Clean up uploaded file if it exists
    if (req.file && req.file.buffer) {
      try {
        const uploadDir = await ensureUploadDir();
        const filename = generateFileName(req.userId, req.file.originalname);
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

// Upload profile image for admin (can specify user ID)
const uploadProfileImageAdmin = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha proporcionado ningún archivo.' });
    }

    // Validate file
    validateImageFile(req.file);

    const userId = req.params.userId;
    const uploadDir = await ensureUploadDir();

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    // Generate unique filename
    const filename = generateFileName(userId, req.file.originalname);
    const filepath = path.join(uploadDir, filename);

    // Move file to upload directory
    await fs.writeFile(filepath, req.file.buffer);

    // Delete old profile image if exists
    if (user.profile_picture_url) {
      try {
        const oldFilename = path.basename(user.profile_picture_url);
        const oldFilepath = path.join(uploadDir, oldFilename);
        await fs.unlink(oldFilepath);
      } catch (error) {
        // Ignore error if old file doesn't exist
        console.log('Old profile image not found or already deleted');
      }
    }

    // Update user profile picture URL
    const imageUrl = `/uploads/user_images/${filename}`;
    const updatedUser = await User.updateProfilePicture(userId, imageUrl);

    res.json({
      message: 'Imagen de perfil subida exitosamente por administrador.',
      profile_picture_url: imageUrl,
      user: {
        id: updatedUser.id,
        user_name: updatedUser.user_name,
        profile_picture_url: updatedUser.profile_picture_url
      }
    });

  } catch (error) {
    console.error('Upload profile image admin error:', error);

    // Clean up uploaded file if it exists
    if (req.file && req.file.buffer) {
      try {
        const uploadDir = await ensureUploadDir();
        const filename = generateFileName(req.params.userId, req.file.originalname);
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

// Delete profile image
const deleteProfileImage = async (req, res) => {
  try {
    const userId = req.params.userId || req.userId;
    const uploadDir = await ensureUploadDir();

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    // Check if user has a profile image
    if (!user.profile_picture_url) {
      return res.status(400).json({ error: 'El usuario no tiene imagen de perfil.' });
    }

    // Delete the file
    const filename = path.basename(user.profile_picture_url);
    const filepath = path.join(uploadDir, filename);

    try {
      await fs.unlink(filepath);
    } catch (error) {
      console.log('Profile image file not found or already deleted');
    }

    // Update user to remove profile picture URL
    const updatedUser = await User.updateProfilePicture(userId, null);

    res.json({
      message: 'Imagen de perfil eliminada exitosamente.',
      user: {
        id: updatedUser.id,
        user_name: updatedUser.user_name,
        profile_picture_url: updatedUser.profile_picture_url
      }
    });

  } catch (error) {
    console.error('Delete profile image error:', error);
    res.status(500).json({ error: 'Error interno del servidor al eliminar la imagen.' });
  }
};

module.exports = {
  uploadProfileImage,
  uploadProfileImageAdmin,
  deleteProfileImage
};
