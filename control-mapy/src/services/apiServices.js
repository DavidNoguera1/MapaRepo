import api from './api';
import { getImageUrl } from '../utils/imageUtils';

export const serviceService = {
  // Get list of services with pagination
  getServices: async (page = 0, limit = 10, search = '') => {
    const offset = page * limit;
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString()
    });
    if (search) {
      params.append('search', search);
    }

    const response = await api.get(`/services?${params}`);
    // Map cover_image_url to full URL
    const services = response.data.services.map(service => ({
      ...service,
      cover_image_url: getImageUrl(service.cover_image_url)
    }));

    return {
      services,
      pagination: response.data.pagination
    };
  },

  // Get service by ID
  getServiceById: async (id) => {
    const response = await api.get(`/services/${id}`);
    const service = response.data.service;
    return {
      ...service,
      cover_image_url: getImageUrl(service.cover_image_url)
    };
  },

  // Upload service cover image
  uploadServiceCover: async (serviceId, file) => {
    const formData = new FormData();
    formData.append('service_cover', file);

    const response = await api.post(`/service-covers/${serviceId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // Delete service cover image
  deleteServiceCover: async (serviceId) => {
    const response = await api.delete(`/service-covers/${serviceId}`);
    return response.data;
  },

  // Update service details
  updateService: async (serviceId, updatedService) => {
    const response = await api.put(`/services/${serviceId}`, updatedService);
    return response.data;
  },

  // Delete service
  deleteService: async (serviceId) => {
    const response = await api.delete(`/services/${serviceId}`);
    return response.data;
  }
};

export default serviceService;
