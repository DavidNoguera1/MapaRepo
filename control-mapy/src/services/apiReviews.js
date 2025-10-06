import api from './api';

export const reviewService = {
  // Get reviews for a specific service
  getReviewsForService: async (serviceId, limit = 10, offset = 0) => {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString()
    });

    const response = await api.get(`/reviews/${serviceId}?${params}`);
    return response.data;
  },

  // Delete a review (admin only)
  deleteReview: async (reviewId) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },

  // Create a new review
  createReview: async (reviewData) => {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  },

  // Update a review
  updateReview: async (reviewId, updateData) => {
    const response = await api.put(`/reviews/${reviewId}`, updateData);
    return response.data;
  }
};

export default reviewService;
