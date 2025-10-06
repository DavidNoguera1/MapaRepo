import React, { useState, useEffect } from 'react';
import galleryService from '../../../services/apiGallery';
import { authService } from '../../../services/api';
import './css/ServiceGalleryManager.css';

const ServiceGalleryManager = ({
  serviceId,
  onGalleryUpdate,
  photos,
  setPhotos,
  pendingPhotoDeletions,
  markPhotoForDeletion,
  unmarkPhotoForDeletion,
  pendingPhotos,
  setPendingPhotos
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showAddPhoto, setShowAddPhoto] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const isAdmin = authService.isAdmin();

  useEffect(() => {
    loadPhotos();
  }, [serviceId]);

  const loadPhotos = async () => {
    if (!serviceId) {
      console.warn('ServiceGalleryManager: serviceId is undefined, skipping load');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await galleryService.getPhotosForService(serviceId);
      setPhotos(response.photos || []);
      setCurrentPhotoIndex(0);
    } catch (error) {
      console.error('Error loading photos:', error);
      setError('Error al cargar las fotos de la galería');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPhoto = () => {
    if (!selectedFile) {
      alert('Por favor selecciona una imagen');
      return;
    }

    // Calculate next position automatically
    const nextPosition = photos.length + pendingPhotos.length;

    // Add to pending photos instead of uploading immediately
    const newPendingPhoto = {
      id: `pending-${Date.now()}`, // Temporary ID for pending photos
      file: selectedFile,
      position: nextPosition,
      previewUrl: previewUrl
    };

    setPendingPhotos(prev => [...prev, newPendingPhoto]);

    // Reset form
    setSelectedFile(null);
    setPreviewUrl(null);
    setShowAddPhoto(false);
  };

  const handleDeletePhoto = (photoId) => {
    // Mark for deletion instead of immediate delete
    markPhotoForDeletion(photoId);
  };

  const handleDeletePendingPhoto = (pendingPhotoId) => {
    setPendingPhotos(prev => prev.filter(photo => photo.id !== pendingPhotoId));
  };

  const nextPhoto = () => {
    const totalPhotos = allPhotos.length;
    setCurrentPhotoIndex((prev) => (prev + 1) % totalPhotos);
  };

  const prevPhoto = () => {
    const totalPhotos = allPhotos.length;
    setCurrentPhotoIndex((prev) => (prev - 1 + totalPhotos) % totalPhotos);
  };

  // Combine existing photos with pending photos for display
  const allPhotos = [
    ...photos,
    ...pendingPhotos.map(pending => ({
      id: pending.id,
      photo_url: pending.previewUrl,
      position: pending.position,
      isPending: true
    }))
  ];

  if (loading) {
    return (
      <div className="gallery-section">
        <h3>Galería de Fotos</h3>
        <div className="loading">Cargando fotos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gallery-section">
        <h3>Galería de Fotos</h3>
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="gallery-section">
      <div className="gallery-header">
        <h3>Galería de Fotos ({allPhotos.length})</h3>
        {isAdmin && (
          <button
            onClick={() => setShowAddPhoto(!showAddPhoto)}
            className="add-photo-button"
          >
            {showAddPhoto ? 'Cancelar' : 'Agregar Foto'}
          </button>
        )}
      </div>

      {allPhotos.length === 0 ? (
        <div className="no-photos">
          <p>Este servicio todavía no tiene fotos.</p>
          {isAdmin && (
            <p>Haz clic en "Agregar Foto" para subir la primera imagen.</p>
          )}
        </div>
      ) : (
        <div className="gallery-carousel">
          <div className="carousel-container">
            <div
              className="carousel-track"
              style={{ transform: `translateX(-${currentPhotoIndex * 100}%)` }}
            >
              {allPhotos.map((photo, index) => {
                const isMarkedForDeletion = pendingPhotoDeletions.includes(photo.id);
                return (
                  <div key={photo.id} className={`carousel-slide ${isMarkedForDeletion ? 'marked-for-deletion' : ''}`}>
                    <img
                      src={photo.photo_url}
                      alt={`Foto ${index + 1}`}
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjZjBmNGY1Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2YzU3NmQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkVyciBvciBkZSBJbWFnZW48L3RleHQ+Cjwvc3ZnPg==';
                      }}
                    />
                    {isAdmin && (
                      <button
                        className={`delete-photo-btn ${isMarkedForDeletion ? 'marked' : ''}`}
                        onClick={() => {
                          if (photo.isPending) {
                            handleDeletePendingPhoto(photo.id);
                          } else {
                            if (isMarkedForDeletion) {
                              unmarkPhotoForDeletion(photo.id);
                            } else {
                              handleDeletePhoto(photo.id);
                            }
                          }
                        }}
                        title={isMarkedForDeletion ? "Cancelar eliminación" : "Marcar para eliminar"}
                      >
                        {isMarkedForDeletion ? '↶' : '🗑️'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {allPhotos.length > 1 && (
              <>
                <button
                  className="carousel-btn prev-btn"
                  onClick={prevPhoto}
                  disabled={allPhotos.length <= 1}
                >
                  ‹
                </button>
                <button
                  className="carousel-btn next-btn"
                  onClick={nextPhoto}
                  disabled={allPhotos.length <= 1}
                >
                  ›
                </button>

                <div className="carousel-indicators">
                  {allPhotos.map((_, index) => (
                    <button
                      key={index}
                      className={`indicator ${index === currentPhotoIndex ? 'active' : ''}`}
                      onClick={() => setCurrentPhotoIndex(index)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showAddPhoto && isAdmin && (
        <div className="add-photo-form">
          <div className="form-group">
            <label htmlFor="photo-file">Seleccionar imagen:</label>
            <input
              id="photo-file"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
            />
          </div>

          {previewUrl && (
            <div className="form-group">
              <label>Vista previa:</label>
              <div style={{ marginTop: '10px' }}>
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{
                    maxWidth: '200px',
                    maxHeight: '150px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>
            </div>
          )}

          <div className="form-actions">
            <button
              onClick={handleAddPhoto}
              disabled={!selectedFile}
              className="submit-photo-btn"
            >
              Agregar a Galería
            </button>
            <button
              onClick={() => {
                setShowAddPhoto(false);
                setSelectedFile(null);
                setPreviewUrl(null);
              }}
              className="cancel-photo-btn"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {pendingPhotos.length > 0 && (
        <div className="pending-deletions-info">
          <p>{pendingPhotos.length} foto{pendingPhotos.length > 1 ? 's' : ''} pendiente{pendingPhotos.length > 1 ? 's' : ''} de subir</p>
        </div>
      )}

      {pendingPhotoDeletions.length > 0 && (
        <div className="pending-deletions-info">
          <p>{pendingPhotoDeletions.length} foto{pendingPhotoDeletions.length > 1 ? 's' : ''} marcada{pendingPhotoDeletions.length > 1 ? 's' : ''} para eliminar</p>
        </div>
      )}
    </div>
  );
};

export default ServiceGalleryManager;
