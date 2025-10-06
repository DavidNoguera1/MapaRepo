import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './services_modal_parts/css/ServiceModal.css';
import serviceService from '../../services/apiServices';
import tagService from '../../services/apiTags';
import {
  useServiceModal,
  ServiceImageManager,
  ServiceLocationManager,
  ServiceTagManager,
  ServiceForm,
  ServiceModalActions,
  ServiceModalHeader,
} from './services_modal_parts';
import ServiceReviewsManager from './services_modal_parts/ServiceReviewsManager';
import ServiceContactsManager from './services_modal_parts/ServiceContactsManager';
import ServiceGalleryManager from './services_modal_parts/ServiceGalleryManager';

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    }
  });

  // Use a nicer orange marker icon from leaflet-color-markers repo
  const customIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  return position === null ? null : (
    <Marker
      position={position}
      icon={customIcon}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          setPosition(e.target.getLatLng());
        },
      }}
    >
      <Popup>Ubicación del servicio</Popup>
    </Marker>
  );
};

const ServiceModal = ({ service, onClose, onUpdate }) => {
  // Always call the hook first, before any conditional logic
  const {
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
  } = useServiceModal(service, onClose, onUpdate);

  // Safety check: don't render if service or service.id is undefined
  if (!service || !service.id) {
    console.error('ServiceModal: service or service.id is undefined:', service);
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Error</h2>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          <div className="modal-body">
            <p>Error: Servicio no válido. Por favor, recarga la página e intenta nuevamente.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <ServiceModalHeader
          title={title}
          setTitle={setTitle}
          onClose={onClose}
        />

        <div className="modal-body">
          <ServiceImageManager
            coverImageUrl={coverImageUrl}
            onImageChange={handleImageChange}
          />

          <ServiceTagManager
            serviceTags={serviceTags}
            availableTags={availableTags}
            showTagManager={showTagManager}
            setShowTagManager={setShowTagManager}
            tagSearchTerm={tagSearchTerm}
            setTagSearchTerm={setTagSearchTerm}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
            onTagSearch={handleTagSearch}
          />

          <ServiceForm
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            isActive={isActive}
            setIsActive={setIsActive}
            avgRatingDisplay={avgRatingDisplay}
            reviewsCount={reviewsCount}
          />

          <ServiceGalleryManager
            serviceId={service.id}
            onGalleryUpdate={onUpdate}
            photos={photos}
            setPhotos={setPhotos}
            pendingPhotoDeletions={pendingPhotoDeletions}
            markPhotoForDeletion={markPhotoForDeletion}
            unmarkPhotoForDeletion={unmarkPhotoForDeletion}
            pendingPhotos={pendingPhotos}
            setPendingPhotos={setPendingPhotos}
          />

          <ServiceReviewsManager
            serviceId={service.id}
            onReviewsUpdate={onUpdate}
            reviews={reviews}
            pendingReviewDeletions={pendingReviewDeletions}
            markReviewForDeletion={markReviewForDeletion}
            unmarkReviewForDeletion={unmarkReviewForDeletion}
          />

          <ServiceContactsManager
            serviceId={service.id}
            onContactsUpdate={onUpdate}
            contacts={contacts}
            setContacts={setContacts}
            contactsLoading={contactsLoading}
            setContactsLoading={setContactsLoading}
            pendingContactDeletions={pendingContactDeletions}
            markContactForDeletion={markContactForDeletion}
            unmarkContactForDeletion={unmarkContactForDeletion}
          />

          <ServiceLocationManager
            position={position}
            setPosition={setPosition}
            addressText={addressText}
            setAddressText={setAddressText}
          />

          <ServiceModalActions
            onSave={handleSave}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default ServiceModal;
