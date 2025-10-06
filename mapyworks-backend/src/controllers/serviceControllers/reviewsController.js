const Review = require('../../models/serviceModels/Review');
const Service = require('../../models/serviceModels/Service');

// Middleware para verificar si el usuario puede editar/eliminar la review
const checkReviewOwnershipOrAdmin = async (req, res, next) => {
  try {
    const reviewId = req.params.id;
    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ error: 'Review no encontrada' });
    }

    if (req.userId !== review.user_id && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'No tienes permisos para modificar esta review' });
    }

    req.review = review;
    next();
  } catch (error) {
    console.error('Error en checkReviewOwnershipOrAdmin:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Crear review
const createReview = async (req, res) => {
  try {
    const { service_id, rating, title, comment } = req.body;

    if (!service_id || !rating) {
      return res.status(400).json({ error: 'El service_id y rating son requeridos' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'El rating debe estar entre 1 y 5' });
    }

    // Verificar que el servicio existe
    const service = await Service.findById(service_id);
    if (!service) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    // Verificar que no haya ya una review del usuario para este servicio
    const existingReview = await Review.findByUserAndService(req.userId, service_id);
    if (existingReview) {
      return res.status(409).json({ error: 'Ya has dejado una review para este servicio' });
    }

    const review = await Review.create({
      user_id: req.userId,
      service_id,
      rating,
      title,
      comment
    });

    // Actualizar avg_rating y reviews_count en el servicio
    const reviewsCount = await Review.countByService(service_id);
    const avgRating = await Review.averageRating(service_id);
    await Service.updateRating(service_id, avgRating, reviewsCount);

    res.status(201).json({ message: 'Review creada exitosamente', review });
  } catch (error) {
    console.error('Error creando review:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener reviews de un servicio
const getReviewsForService = async (req, res) => {
  try {
    const serviceId = req.params.serviceId;
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const reviews = await Review.findByServiceId(serviceId, limit, offset);
    const total = await Review.countByService(serviceId);

    // Filter out any invalid reviews (shouldn't happen with LEFT JOIN but safety check)
    const validReviews = reviews.filter(review =>
      review &&
      review.id &&
      typeof review.rating === 'number' &&
      review.user_name
    );

    res.json({
      reviews: validReviews,
      pagination: {
        limit,
        offset,
        total
      }
    });
  } catch (error) {
    console.error('Error obteniendo reviews:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar review
const updateReview = async (req, res) => {
  try {
    const { rating, title, comment } = req.body;
    const reviewId = req.params.id;

    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'El rating debe estar entre 1 y 5' });
    }

    const updateData = {};
    if (rating !== undefined) updateData.rating = rating;
    if (title !== undefined) updateData.title = title;
    if (comment !== undefined) updateData.comment = comment;

    const review = await Review.update(reviewId, updateData);

    if (!review) {
      return res.status(404).json({ error: 'Review no encontrada' });
    }

    // Actualizar avg_rating en el servicio
    const serviceId = review.service_id;
    const avgRating = await Review.averageRating(serviceId);
    const reviewsCount = await Review.countByService(serviceId);
    await Service.updateRating(serviceId, avgRating, reviewsCount);

    res.json({ message: 'Review actualizada exitosamente', review });
  } catch (error) {
    console.error('Error actualizando review:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar review
const deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ error: 'Review no encontrada' });
    }

    await Review.delete(reviewId);

    // Actualizar avg_rating y reviews_count en el servicio
    const serviceId = review.service_id;
    const reviewsCount = await Review.countByService(serviceId);
    const avgRating = reviewsCount > 0 ? await Review.averageRating(serviceId) : 0;
    await Service.updateRating(serviceId, avgRating, reviewsCount);

    res.json({ message: 'Review eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando review:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  createReview,
  getReviewsForService,
  updateReview,
  deleteReview,
  checkReviewOwnershipOrAdmin
};
