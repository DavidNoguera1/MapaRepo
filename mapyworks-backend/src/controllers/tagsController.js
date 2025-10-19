const Tag = require('../models/Tag');

// Crear tag (solo admin o usuario autenticado para crear)
const createTag = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'El nombre del tag es requerido' });
    }

    const existingTag = await Tag.findByName(name);
    if (existingTag) {
      return res.json({ message: 'Tag ya existe', tag: existingTag });
    }

    const tag = await Tag.create({ name });
    res.status(201).json({ message: 'Tag creado exitosamente', tag });
  } catch (error) {
    console.error('Error creando tag:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Crear o encontrar tag por nombre
const createOrFindTag = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'El nombre del tag es requerido' });
    }

    let tag = await Tag.findByName(name);
    if (!tag) {
      tag = await Tag.create({ name });
    }
    res.json({ tag });
  } catch (error) {
    console.error('Error creando o encontrando tag:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener tags (con búsqueda parcial)
const getTags = async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;
    let tags;
    if (q) {
      tags = await Tag.searchByName(q, parseInt(limit));
    } else {
      tags = await Tag.findAll(parseInt(limit));
    }
    res.json({ tags });
  } catch (error) {
    console.error('Error obteniendo tags:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar tag (solo admin)
const deleteTag = async (req, res) => {
  try {
    const tagId = req.params.id;
    const deleted = await Tag.delete(tagId);
    if (!deleted) {
      return res.status(404).json({ error: 'Tag no encontrado o en uso' });
    }
    res.json({ message: 'Tag eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando tag:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Añadir tag a servicio
const addTagToService = async (req, res) => {
  try {
    const { serviceId, tagId } = req.params;
    await Tag.addToService(serviceId, tagId);
    res.json({ message: 'Tag añadido al servicio exitosamente' });
  } catch (error) {
    console.error('Error añadiendo tag al servicio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Remover tag de servicio
const removeTagFromService = async (req, res) => {
  try {
    const { serviceId, tagId } = req.params;
    await Tag.removeFromService(serviceId, tagId);
    res.json({ message: 'Tag removido del servicio exitosamente' });
  } catch (error) {
    console.error('Error removiendo tag del servicio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener tags de un servicio
const getTagsForService = async (req, res) => {
  try {
    const serviceId = req.params.serviceId;
    const tags = await Tag.getTagsForService(serviceId);
    res.json({ tags });
  } catch (error) {
    console.error('Error obteniendo tags del servicio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  createTag,
  createOrFindTag,
  getTags,
  deleteTag,
  addTagToService,
  removeTagFromService,
  getTagsForService
};
