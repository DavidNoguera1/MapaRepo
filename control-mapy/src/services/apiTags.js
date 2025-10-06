import api from './api';

export const tagService = {
  // Get all tags with optional search
  getTags: async (search = '', limit = 20) => {
    const params = new URLSearchParams();
    if (search) {
      params.append('q', search);
    }
    params.append('limit', limit.toString());

    const response = await api.get(`/tags?${params}`);
    return response.data.tags;
  },

  // Create a new tag
  createTag: async (name) => {
    const response = await api.post('/tags', { name });
    return response.data.tag;
  },

  // Delete a tag
  deleteTag: async (tagId) => {
    const response = await api.delete(`/tags/${tagId}`);
    return response.data;
  },

  // Get tags for a specific service
  getTagsForService: async (serviceId) => {
    const response = await api.get(`/tags/${serviceId}/tags`);
    return response.data.tags;
  },

  // Add tag to service
  addTagToService: async (serviceId, tagId) => {
    const response = await api.post(`/tags/${serviceId}/tags/${tagId}`);
    return response.data;
  },

  // Remove tag from service
  removeTagFromService: async (serviceId, tagId) => {
    const response = await api.delete(`/tags/${serviceId}/tags/${tagId}`);
    return response.data;
  },

  // Search tags by name
  searchTags: async (name, limit = 10) => {
    return await tagService.getTags(name, limit);
  }
};

export default tagService;
