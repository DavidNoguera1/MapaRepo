import { useState, useEffect } from 'react';
import serviceService from '../../../services/apiServices';
import tagService from '../../../services/apiTags';
import reviewService from '../../../services/apiReviews';
import contactService from '../../../services/apiContacts';
import galleryService from '../../../services/apiGallery';

export const useServiceModal = (service, onClose, onUpdate) => {
  // Basic service state
  const [title, setTitle] = useState(service.title || '');
  const [description, setDescription] = useState(service.description || '');
  const [addressText, setAddressText] = useState(service.address_text || '');
  const [position, setPosition] = useState(service.lat && service.lng ? { lat: service.lat, lng: service.lng } : null);
  const [isActive, setIsActive] = useState(service.is_active || false);
  const [avgRating, setAvgRating] = useState(service.avg_rating || null);
  const [reviewsCount, setReviewsCount] = useState(service.reviews_count || 0);

  // Image state
  const [coverImageUrl, setCoverImageUrl] = useState(service.cover_image_url || '');
  const [imageFile, setImageFile] = useState(null);

  // Tags state
  const [serviceTags, setServiceTags] = useState(service.tags || []);
  const [availableTags, setAvailableTags] = useState([]);
  const [showTagManager, setShowTagManager] = useState(false);
  const [tagSearchTerm, setTagSearchTerm] = useState('');

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [pendingReviewDeletions, setPendingReviewDeletions] = useState([]);

  // Contacts state
  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [pendingContactDeletions, setPendingContactDeletions] = useState([]);

  // Gallery state
  const [photos, setPhotos] = useState([]);
  const [pendingPhotoDeletions, setPendingPhotoDeletions] = useState([]);
  const [pendingPhotos, setPendingPhotos] = useState([]);

  // Load contacts when service changes
  useEffect(() => {
    if (service && service.id) {
      // Reset contacts when service changes
      setContacts([]);
      setContactsLoading(true);
    }
  }, [service.id]);

  // Computed values
  const avgRatingDisplay = avgRating !== null && !isNaN(parseFloat(avgRating)) ? parseFloat(avgRating).toFixed(2) : 'No disponible';

  // Load available tags on component mount
  useEffect(() => {
    const loadTags = async () => {
      try {
        const tags = await tagService.getTags();
        setAvailableTags(tags);
      } catch (error) {
        console.error('Error loading tags:', error);
      }
    };
    loadTags();
  }, []);

  // Image handling
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverImageUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Service operations
  const handleDelete = async () => {
    if (!service || !service.id) {
      alert('Error: Servicio no válido');
      return;
    }

    if (window.confirm('¿Está seguro que desea eliminar este servicio? Esta acción no se puede deshacer.')) {
      try {
        await serviceService.deleteService(service.id);
        alert('Servicio eliminado correctamente');
        onClose();
        if (onUpdate) onUpdate();
      } catch (error) {
        console.error('Error al eliminar el servicio:', error);
        alert('Error al eliminar el servicio');
      }
    }
  };

  const handleSave = async () => {
    if (!service || !service.id) {
      alert('Error: Servicio no válido');
      return;
    }

    try {
      // Execute pending deletions
      for (const reviewId of pendingReviewDeletions) {
        await reviewService.deleteReview(reviewId);
      }

      for (const contactId of pendingContactDeletions) {
        await contactService.deleteContact(service.id, contactId);
      }

      for (const photoId of pendingPhotoDeletions) {
        await galleryService.deletePhoto(photoId);
      }

      // Prepare updated service data
      const updatedService = {
        ...service,
        title,
        description,
        address_text: addressText,
        lat: position ? position.lat : null,
        lng: position ? position.lng : null,
        is_active: isActive,
      };

      // Update service details via API
      await serviceService.updateService(service.id, updatedService);

      // If image file selected, upload it
      if (imageFile) {
        await serviceService.uploadServiceCover(service.id, imageFile);
      }

      // Upload pending photos
      for (const pendingPhoto of pendingPhotos) {
        await galleryService.uploadPhoto(service.id, pendingPhoto.file, pendingPhoto.position);
      }

      // Clear pending deletions and photos
      setPendingReviewDeletions([]);
      setPendingContactDeletions([]);
      setPendingPhotoDeletions([]);
      setPendingPhotos([]);

      alert('Servicio actualizado correctamente');
      onClose();
      if (onUpdate) onUpdate(updatedService);
    } catch (error) {
      console.error('Error al guardar el servicio:', error);
      alert('Error al guardar el servicio');
    }
  };

  // Tag management functions
  const handleAddTag = async (tagName) => {
    if (!service || !service.id) {
      alert('Error: Servicio no válido');
      return;
    }

    try {
      // First, check if tag exists or create it
      let tag = availableTags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
      if (!tag) {
        const newTag = await tagService.createTag(tagName);
        tag = newTag;
        setAvailableTags(prev => [...prev, newTag]);
      }

      // Add tag to service if not already added
      if (!serviceTags.find(t => t.id === tag.id)) {
        await tagService.addTagToService(service.id, tag.id);
        setServiceTags(prev => [...prev, tag]);
      }
    } catch (error) {
      console.error('Error adding tag:', error);
      alert('Error al agregar tag');
    }
  };

  const handleRemoveTag = async (tagId) => {
    if (!service || !service.id) {
      alert('Error: Servicio no válido');
      return;
    }

    try {
      await tagService.removeTagFromService(service.id, tagId);
      setServiceTags(prev => prev.filter(tag => tag.id !== tagId));
    } catch (error) {
      console.error('Error removing tag:', error);
      alert('Error al remover tag');
    }
  };

  const handleTagSearch = async (searchTerm) => {
    if (searchTerm.trim()) {
      try {
        const tags = await tagService.searchTags(searchTerm);
        setAvailableTags(tags);
      } catch (error) {
        console.error('Error searching tags:', error);
      }
    } else {
      const tags = await tagService.getTags();
      setAvailableTags(tags);
    }
  };

  // Reviews management functions
  const loadReviews = async () => {
    if (!service.id) return;

    try {
      setReviewsLoading(true);
      const response = await reviewService.getReviewsForService(service.id);
      setReviews(response.reviews || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await reviewService.deleteReview(reviewId);
      // Reload reviews after deletion
      await loadReviews();
      // Update service rating and count
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  };

  // Pending deletion functions
  const markReviewForDeletion = (reviewId) => {
    setPendingReviewDeletions(prev => [...prev, reviewId]);
  };

  const unmarkReviewForDeletion = (reviewId) => {
    setPendingReviewDeletions(prev => prev.filter(id => id !== reviewId));
  };

  const markContactForDeletion = (contactId) => {
    setPendingContactDeletions(prev => [...prev, contactId]);
  };

  const unmarkContactForDeletion = (contactId) => {
    setPendingContactDeletions(prev => prev.filter(id => id !== contactId));
  };

  const markPhotoForDeletion = (photoId) => {
    setPendingPhotoDeletions(prev => [...prev, photoId]);
  };

  const unmarkPhotoForDeletion = (photoId) => {
    setPendingPhotoDeletions(prev => prev.filter(id => id !== photoId));
  };

  // Load reviews when service changes
  useEffect(() => {
    if (service && service.id) {
      loadReviews();
    }
  }, [service.id]);

  return {
    // Basic service state
    title,
    setTitle,
    description,
    setDescription,
    addressText,
    setAddressText,
    position,
    setPosition,
    isActive,
    setIsActive,
    avgRating,
    reviewsCount,
    avgRatingDisplay,

    // Image state
    coverImageUrl,
    imageFile,
    handleImageChange,

    // Tags state
    serviceTags,
    availableTags,
    showTagManager,
    setShowTagManager,
    tagSearchTerm,
    setTagSearchTerm,

    // Reviews state
    reviews,
    reviewsLoading,
    loadReviews,
    handleDeleteReview,
    pendingReviewDeletions,
    markReviewForDeletion,
    unmarkReviewForDeletion,

    // Contacts state
    contacts,
    contactsLoading,
    setContacts,
    setContactsLoading,
    pendingContactDeletions,
    markContactForDeletion,
    unmarkContactForDeletion,

    // Gallery state
    photos,
    setPhotos,
    pendingPhotoDeletions,
    markPhotoForDeletion,
    unmarkPhotoForDeletion,
    pendingPhotos,
    setPendingPhotos,

    // Handlers
    handleDelete,
    handleSave,
    handleAddTag,
    handleRemoveTag,
    handleTagSearch,
  };
};
