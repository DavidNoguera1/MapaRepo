import { API_BASE_URL } from './config';

// Obtener servicios del usuario autenticado
export async function getMyServices(token, limit = 10, offset = 0) {
  try {
    const response = await fetch(`${API_BASE_URL}/services/me?limit=${limit}&offset=${offset}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener servicios');
    }
    return data;
  } catch (error) {
    throw error;
  }
}

// Crear un nuevo servicio
export async function createService(token, serviceData) {
  try {
    const response = await fetch(`${API_BASE_URL}/services`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(serviceData),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al crear servicio');
    }
    return data;
  } catch (error) {
    throw error;
  }
}

// Actualizar servicio
export async function updateService(token, serviceId, serviceData) {
  try {
    const response = await fetch(`${API_BASE_URL}/services/${serviceId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(serviceData),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al actualizar servicio');
    }
    return data;
  } catch (error) {
    throw error;
  }
}

// Eliminar servicio
export async function deleteService(token, serviceId) {
  try {
    const response = await fetch(`${API_BASE_URL}/services/${serviceId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Error al eliminar servicio');
    }
    return { message: 'Servicio eliminado exitosamente' };
  } catch (error) {
    throw error;
  }
}

// Subir imagen de portada
export async function uploadCoverImage(token, serviceId, imageUri) {
  try {
    // Create FormData with the file URI directly (React Native way)
    const formData = new FormData();

    // Get file extension from URI
    const uriParts = imageUri.split('.');
    const fileExtension = uriParts[uriParts.length - 1].toLowerCase();
    const mimeType = fileExtension === 'jpg' ? 'image/jpeg' : `image/${fileExtension}`;

    // Create file object for React Native
    const file = {
      uri: imageUri,
      name: `service_cover.${fileExtension}`,
      type: mimeType,
    };

    formData.append('service_cover', file);

    const uploadResponse = await fetch(`${API_BASE_URL}/service-covers/${serviceId}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type, let fetch set it with boundary
      },
      body: formData,
    });

    const data = await uploadResponse.json();
    if (!uploadResponse.ok) {
      throw new Error(data.error || 'Error al subir imagen de portada');
    }
    return data;
  } catch (error) {
    throw error;
  }
}

// Subir fotos de galería
export async function uploadGalleryPhoto(token, serviceId, imageUri, position = 0) {
  try {
    // Procesar la imagen antes de subirla
    const uriParts = imageUri.split('.');
    const fileExtension = uriParts[uriParts.length - 1].toLowerCase();
    const mimeType = fileExtension === 'jpg' ? 'image/jpeg' : `image/${fileExtension}`;

    const formData = new FormData();
    const file = {
      uri: imageUri,
      name: `service_photo.${fileExtension}`,
      type: mimeType,
    };
    formData.append('service_photo', file);
    formData.append('position', position.toString());

    const response = await fetch(`${API_BASE_URL}/service-photos/${serviceId}/photos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al subir foto de galería');
    }
    return data;
  } catch (error) {
    throw error;
  }
}

// Obtener fotos de galería de un servicio
export async function getServicePhotos(token, serviceId) {
  try {
    const response = await fetch(`${API_BASE_URL}/service-photos/${serviceId}/photos`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener fotos');
    }
    return data;
  } catch (error) {
    throw error;
  }
}

// Eliminar foto de galería
export async function deleteServicePhoto(token, photoId) {
  try {
    const response = await fetch(`${API_BASE_URL}/service-photos/photos/${photoId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Error al eliminar foto');
    }
    return { message: 'Foto eliminada exitosamente' };
  } catch (error) {
    throw error;
  }
}

// Gestionar contactos del servicio
export async function getServiceContacts(token, serviceId) {
  try {
    const response = await fetch(`${API_BASE_URL}/service-contacts/${serviceId}/contacts`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener contactos');
    }
    return data;
  } catch (error) {
    throw error;
  }
}

export async function createServiceContact(token, serviceId, contactData) {
  try {
    const response = await fetch(`${API_BASE_URL}/service-contacts/${serviceId}/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(contactData),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al crear contacto');
    }
    return data;
  } catch (error) {
    throw error;
  }
}

export async function updateServiceContact(token, serviceId, contactId, contactData) {
  try {
    const response = await fetch(`${API_BASE_URL}/service-contacts/${serviceId}/contacts/${contactId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(contactData),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al actualizar contacto');
    }
    return data;
  } catch (error) {
    throw error;
  }
}

export async function deleteServiceContact(token, serviceId, contactId) {
  try {
    const response = await fetch(`${API_BASE_URL}/service-contacts/${serviceId}/contacts/${contactId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Error al eliminar contacto');
    }
    return { message: 'Contacto eliminado exitosamente' };
  } catch (error) {
    throw error;
  }
}

// Obtener tags con búsqueda
export async function getTags(token, query = '', limit = 20) {
  try {
    const url = query
      ? `${API_BASE_URL}/tags?q=${encodeURIComponent(query)}&limit=${limit}`
      : `${API_BASE_URL}/tags?limit=${limit}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener tags');
    }
    return data;
  } catch (error) {
    throw error;
  }
}

// Crear o encontrar tag
export async function createOrFindTag(token, name) {
  try {
    const response = await fetch(`${API_BASE_URL}/tags/create-or-find`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al crear/encontrar tag');
    }
    return data;
  } catch (error) {
    throw error;
  }
}

// Añadir tag a servicio
export async function addTagToService(token, serviceId, tagId) {
  try {
    const response = await fetch(`${API_BASE_URL}/tags/${serviceId}/tags/${tagId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al añadir tag');
    }
    return data;
  } catch (error) {
    throw error;
  }
}

// Remover tag de servicio
export async function removeTagFromService(token, serviceId, tagId) {
  try {
    const response = await fetch(`${API_BASE_URL}/tags/${serviceId}/tags/${tagId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Error al remover tag');
    }
    return { message: 'Tag removido exitosamente' };
  } catch (error) {
    throw error;
  }
}

// Obtener tags de un servicio
export async function getServiceTags(token, serviceId) {
  try {
    const response = await fetch(`${API_BASE_URL}/tags/${serviceId}/tags`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener tags del servicio');
    }
    return data;
  } catch (error) {
    throw error;
  }
}

// Obtener reviews de un servicio
export async function getServiceReviews(token, serviceId, limit = 10, offset = 0) {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews/${serviceId}?limit=${limit}&offset=${offset}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener reviews');
    }
    return data;
  } catch (error) {
    throw error;
  }
}

// Crear review
export async function createReview(token, reviewData) {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(reviewData),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al crear review');
    }
    return data;
  } catch (error) {
    throw error;
  }
}

// Actualizar review
export async function updateReview(token, reviewId, reviewData) {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(reviewData),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al actualizar review');
    }
    return data;
  } catch (error) {
    throw error;
  }
}

// Eliminar review
export async function deleteReview(token, reviewId) {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Error al eliminar review');
    }
    return { message: 'Review eliminada exitosamente' };
  } catch (error) {
    throw error;
  }
}
