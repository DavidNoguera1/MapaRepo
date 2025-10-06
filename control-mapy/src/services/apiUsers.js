import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const userService = {
  // Get users with pagination and filters
  getUsers: async (page = 0, limit = 5, filters = {}) => {
    const offset = page * limit;
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      ...filters
    });

    const response = await api.get(`/admin/users?${params}`);
    return response.data;
  },

  // Get user by ID
  getUserById: async (id) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  // Update user
  updateUser: async (id, userData) => {
    // Remove id from userData since it should be in the URL
    const { id: userId, ...updateData } = userData;
    const response = await api.put(`/admin/users/${id}`, updateData);
    return response.data;
  },

  // Delete user
  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  // Upload profile picture
  uploadProfilePicture: async (file) => {
    const formData = new FormData();
    formData.append('profile_image', file);

    const response = await api.post('/profile-images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Upload profile picture for admin (admin can specify user ID)
  uploadProfilePictureAdmin: async (userId, file) => {
    const formData = new FormData();
    formData.append('profile_image', file);

    const response = await api.post(`/profile-images/${userId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get profile image information
  getProfileImage: async (userId = null) => {
    const endpoint = userId ? `/profile-images/${userId}` : '/profile-images';
    const response = await api.get(endpoint);
    return response.data;
  },

  // Delete profile image
  deleteProfileImage: async (userId = null) => {
    const endpoint = userId ? `/profile-images/${userId}` : '/profile-images';
    const response = await api.delete(endpoint);
    return response.data;
  }
};

export default api;
