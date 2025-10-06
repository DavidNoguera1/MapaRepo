import api from './api';
import { getImageUrl } from '../utils/imageUtils';

export const galleryService = {
  // Get photos for a specific service
  getPhotosForService: async (serviceId) => {
    try {
      const response = await api.get(`/services/${serviceId}/photos`);
      // Map photo_url to full URL
      const photos = response.data.photos.map(photo => ({
        ...photo,
        photo_url: getImageUrl(photo.photo_url)
      }));
      return { photos };
    } catch (error) {
      console.error('Error fetching photos for service:', error);
      throw error;
    }
  },

  // Upload a new photo for a service
  uploadPhoto: async (serviceId, file, position = 0) => {
    try {
      const formData = new FormData();
      formData.append('service_photo', file);
      formData.append('position', position.toString());

      const response = await api.post(`/services/${serviceId}/photos`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    }
  },

  // Update photo position or URL
  updatePhoto: async (photoId, updateData) => {
    try {
      const response = await api.put(`/services/photos/${photoId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating photo:', error);
      throw error;
    }
  },

  // Delete a photo
  deletePhoto: async (photoId) => {
    try {
      const response = await api.delete(`/services/photos/${photoId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting photo:', error);
      throw error;
    }
  },

  // Get a specific photo by ID
  getPhotoById: async (photoId) => {
    try {
      const response = await api.get(`/services/photos/${photoId}`);
      const photo = response.data.photo;
      return {
        ...photo,
        photo_url: getImageUrl(photo.photo_url)
      };
    } catch (error) {
      console.error('Error fetching photo:', error);
      throw error;
    }
  }
};

export default galleryService;
