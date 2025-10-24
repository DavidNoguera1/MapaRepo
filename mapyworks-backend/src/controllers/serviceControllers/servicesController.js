const Service = require('../../models/serviceModels/Service');

// Middleware para verificar ownership o admin
const checkOwnershipOrAdmin = async (req, res, next) => {
  try {
    const serviceId = req.params.id;
    const service = await Service.findById(serviceId);

    if (!service) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    if (req.userId !== service.owner_id && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'No tienes permisos para modificar este servicio' });
    }

    req.service = service; // Guardar service en req para uso posterior
    next();
  } catch (error) {
    console.error('Error en checkOwnershipOrAdmin:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Middleware para verificar ownership o admin (para rutas de tags)
const checkServiceOwnershipOrAdmin = async (req, res, next) => {
  try {
    const serviceId = req.params.serviceId;
    const service = await Service.findById(serviceId);

    if (!service) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    if (req.userId !== service.owner_id && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'No tienes permisos para modificar tags de este servicio' });
    }

    req.service = service; // Guardar service en req para uso posterior
    next();
  } catch (error) {
    console.error('Error en checkServiceOwnershipOrAdmin:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Crear servicio
const createService = async (req, res) => {
  try {
    const { title, description, cover_image_url, lat, lng, address_text } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'El título es requerido' });
    }

    const serviceData = {
      owner_id: req.userId,
      title,
      description,
      cover_image_url,
      lat,
      lng,
      address_text
    };

    const service = await Service.create(serviceData);
    res.status(201).json({ message: 'Servicio creado exitosamente', service });
  } catch (error) {
    console.error('Error creando servicio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener todos los servicios activos
const getServices = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    const search = req.query.search || '';

    const services = await Service.findAll(limit, offset, search);
    const total = await Service.count({ is_active: true });

    res.json({
      services,
      pagination: {
        limit,
        offset,
        total
      }
    });
  } catch (error) {
    console.error('Error obteniendo servicios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener servicio por ID
const getServiceById = async (req, res) => {
  try {
    const serviceId = req.params.id;
    const service = await Service.findById(serviceId);

    if (!service) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    res.json({ service });
  } catch (error) {
    console.error('Error obteniendo servicio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener servicios del usuario autenticado
const getMyServices = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const services = await Service.findByOwner(req.userId, limit, offset);
    const total = await Service.count({ owner_id: req.userId });

    res.json({
      services,
      pagination: {
        limit,
        offset,
        total
      }
    });
  } catch (error) {
    console.error('Error obteniendo mis servicios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener servicios cerca de una ubicación
const getServicesNearMe = async (req, res) => {
  try {
    const { lat, lng, radiusKm = 10, limit = 10, offset = 0 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitud y longitud son requeridas' });
    }

    const services = await Service.findNearLocation(
      parseFloat(lat),
      parseFloat(lng),
      parseFloat(radiusKm),
      parseInt(limit),
      parseInt(offset)
    );

    res.json({ services });
  } catch (error) {
    console.error('Error obteniendo servicios cerca:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar servicio
const updateService = async (req, res) => {
  try {
    const serviceId = req.params.id;
    const { title, description, cover_image_url, lat, lng, address_text, is_active } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (cover_image_url !== undefined) updateData.cover_image_url = cover_image_url;
    if (lat !== undefined && lng !== undefined) {
      updateData.lat = lat;
      updateData.lng = lng;
    }
    if (address_text !== undefined) updateData.address_text = address_text;
    if (is_active !== undefined) updateData.is_active = is_active;

    const service = await Service.update(serviceId, updateData);

    if (!service) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    res.json({ message: 'Servicio actualizado exitosamente', service });
  } catch (error) {
    console.error('Error actualizando servicio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar servicio
const deleteService = async (req, res) => {
  try {
    const serviceId = req.params.id;
    const deleted = await Service.delete(serviceId);

    if (!deleted) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    res.json({ message: 'Servicio eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando servicio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  createService,
  getServices,
  getServiceById,
  getMyServices,
  getServicesNearMe,
  updateService,
  deleteService,
  checkOwnershipOrAdmin,
  checkServiceOwnershipOrAdmin
};
