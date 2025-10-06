import api from './api';

export const contactService = {
  // Get contacts for a specific service
  getContactsForService: async (serviceId) => {
    try {
      const response = await api.get(`/services/${serviceId}/contacts`);
      return response.data;
    } catch (error) {
      console.error('Error fetching contacts for service:', error);
      throw error;
    }
  },

  // Delete a contact (admin/owner only)
  deleteContact: async (serviceId, contactId) => {
    try {
      const response = await api.delete(`/services/${serviceId}/contacts/${contactId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting contact:', error);
      throw error;
    }
  },

  // Create a new contact
  createContact: async (serviceId, contactData) => {
    try {
      const response = await api.post(`/services/${serviceId}/contacts`, contactData);
      return response.data;
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    }
  },

  // Update a contact
  updateContact: async (serviceId, contactId, updateData) => {
    try {
      const response = await api.put(`/services/${serviceId}/contacts/${contactId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating contact:', error);
      throw error;
    }
  }
};

export default contactService;
