const ServiceContact = require('../../models/serviceModels/ServiceContact');
const Service = require('../../models/serviceModels/Service');

// Middleware para verificar ownership del servicio
const checkServiceOwnershipOrAdmin = async (req, res, next) => {
  try {
    const serviceId = req.params.serviceId;
    const service = await Service.findById(serviceId);

    if (!service) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    if (req.userId !== service.owner_id && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'No tienes permisos para modificar los contactos de este servicio' });
    }

    req.service = service;
    next();
  } catch (error) {
    console.error('Error en checkServiceOwnershipOrAdmin:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Middleware para verificar que el contacto pertenece al servicio
const checkContactOwnership = async (req, res, next) => {
  try {
    const { serviceId, contactId } = req.params;
    const belongs = await ServiceContact.belongsToService(contactId, serviceId);

    if (!belongs) {
      return res.status(404).json({ error: 'Contacto no encontrado o no pertenece al servicio' });
    }

    next();
  } catch (error) {
    console.error('Error en checkContactOwnership:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Crear contacto
const createContact = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { contact_type, contact_value, label } = req.body;

    if (!contact_type || !contact_value) {
      return res.status(400).json({ error: 'contact_type y contact_value son requeridos' });
    }

    const contact = await ServiceContact.create({
      service_id: serviceId,
      contact_type,
      contact_value,
      label
    });

    res.status(201).json({ message: 'Contacto creado exitosamente', contact });
  } catch (error) {
    console.error('Error creando contacto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener contactos de un servicio
const getContactsForService = async (req, res) => {
  try {
    const serviceId = req.params.serviceId;
    const contacts = await ServiceContact.findByServiceId(serviceId);

    // Filter out any invalid contacts
    const validContacts = contacts.filter(contact =>
      contact &&
      contact.id &&
      contact.contact_type &&
      contact.contact_value
    );

    res.json({ contacts: validContacts });
  } catch (error) {
    console.error('Error obteniendo contactos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar contacto
const updateContact = async (req, res) => {
  try {
    const { contactId } = req.params;
    const { contact_type, contact_value, label } = req.body;

    if (!contact_type || !contact_value) {
      return res.status(400).json({ error: 'contact_type y contact_value son requeridos' });
    }

    const contact = await ServiceContact.update(contactId, {
      contact_type,
      contact_value,
      label
    });

    if (!contact) {
      return res.status(404).json({ error: 'Contacto no encontrado' });
    }

    res.json({ message: 'Contacto actualizado exitosamente', contact });
  } catch (error) {
    console.error('Error actualizando contacto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar contacto
const deleteContact = async (req, res) => {
  try {
    const { contactId } = req.params;
    const deleted = await ServiceContact.delete(contactId);

    if (!deleted) {
      return res.status(404).json({ error: 'Contacto no encontrado' });
    }

    res.json({ message: 'Contacto eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando contacto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  createContact,
  getContactsForService,
  updateContact,
  deleteContact,
  checkServiceOwnershipOrAdmin,
  checkContactOwnership
};
