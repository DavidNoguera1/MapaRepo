import React, { useState, useEffect } from 'react';
import contactService from '../../../services/apiContacts';
import { authService } from '../../../services/api';
import './css/ServiceContactsManager.css';

const ContactIcon = ({ contactType }) => {
  const icons = {
    phone: '📞',
    email: '✉️',
    whatsapp: '💬',
    website: '🌐',
    facebook: '📘',
    instagram: '📷',
    twitter: '🐦',
    linkedin: '💼',
    default: '📍'
  };

  return <span className="contact-icon">{icons[contactType] || icons.default}</span>;
};

const ContactItem = ({ contact, isAdmin, onDelete, onMarkForDeletion, onUnmarkForDeletion, isMarkedForDeletion }) => {
  // Safety check to prevent errors if contact is undefined or invalid
  if (!contact || !contact.id || !contact.contact_type || !contact.contact_value) {
    console.error('ContactItem received invalid contact:', contact);
    return null;
  }

  const handleDeleteClick = () => {
    if (isMarkedForDeletion) {
      // If already marked for deletion, unmark it
      onUnmarkForDeletion(contact.id);
    } else {
      // Mark for deletion
      onMarkForDeletion(contact.id);
    }
  };

  const handleContactClick = () => {
    if (!contact.contact_type || !contact.contact_value) {
      return;
    }

    if (contact.contact_type === 'phone') {
      window.open(`tel:${contact.contact_value}`);
    } else if (contact.contact_type === 'email') {
      window.open(`mailto:${contact.contact_value}`);
    } else if (contact.contact_type === 'whatsapp') {
      window.open(`https://wa.me/${contact.contact_value.replace(/\D/g, '')}`);
    } else if (contact.contact_type === 'website') {
      window.open(contact.contact_value.startsWith('http') ? contact.contact_value : `https://${contact.contact_value}`);
    }
  };

  return (
    <div className={`contact-item ${isMarkedForDeletion ? 'marked-for-deletion' : ''}`}>
      <div className="contact-header">
        <div className="contact-info">
          <ContactIcon contactType={contact.contact_type || 'default'} />
          <div className="contact-details">
            <div className="contact-type">
              {contact.contact_type ? contact.contact_type.charAt(0).toUpperCase() + contact.contact_type.slice(1) : 'Tipo desconocido'}
            </div>
            {contact.label && (
              <div className="contact-label">{contact.label}</div>
            )}
          </div>
        </div>
        {isAdmin && (
          <button
            className={`delete-contact-btn ${isMarkedForDeletion ? 'marked' : ''}`}
            onClick={handleDeleteClick}
            title={isMarkedForDeletion ? "Cancelar eliminación" : "Marcar para eliminar"}
          >
            {isMarkedForDeletion ? '↶' : '🗑️'}
          </button>
        )}
      </div>

      <div
        className="contact-value"
        onClick={handleContactClick}
        style={{ cursor: ['phone', 'email', 'whatsapp', 'website'].includes(contact.contact_type) ? 'pointer' : 'default' }}
      >
        {contact.contact_value || 'Valor no disponible'}
      </div>

      <div className="contact-date">
        {contact.created_at ? new Date(contact.created_at).toLocaleDateString('es-ES') : 'Fecha no disponible'}
      </div>
    </div>
  );
};

const ServiceContactsManager = ({
  serviceId,
  onContactsUpdate,
  contacts,
  setContacts,
  contactsLoading,
  setContactsLoading,
  pendingContactDeletions,
  markContactForDeletion,
  unmarkContactForDeletion
}) => {
  const [error, setError] = useState(null);
  const isAdmin = authService.isAdmin();

  useEffect(() => {
    loadContacts();
  }, [serviceId]);

  const loadContacts = async () => {
    // Safety check: don't load if serviceId is undefined
    if (!serviceId) {
      console.warn('ServiceContactsManager: serviceId is undefined, skipping load');
      setContactsLoading(false);
      return;
    }

    try {
      setContactsLoading(true);
      setError(null);
      const response = await contactService.getContactsForService(serviceId);

      // Validate response structure and filter out invalid contacts
      const contactsData = response.contacts || [];
      const validContacts = contactsData.filter(contact =>
        contact &&
        contact.id &&
        contact.contact_type &&
        contact.contact_value
      );

      console.log('ServiceContactsManager: Loaded contacts:', validContacts.length, 'valid contacts out of', contactsData.length, 'total');

      // Update contacts state in parent hook
      setContacts(validContacts);

    } catch (error) {
      console.error('Error loading contacts:', error);
      setError('Error al cargar los contactos');
    } finally {
      setContactsLoading(false);
    }
  };

  if (contactsLoading) {
    return (
      <div className="contacts-section">
        <h3>Líneas de Contacto</h3>
        <div className="loading">Cargando contactos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="contacts-section">
        <h3>Líneas de Contacto</h3>
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="contacts-section">
      <h3>Líneas de Contacto ({contacts.length})</h3>

      {contacts.length === 0 ? (
        <div className="no-contacts">
          <p>No hay líneas de contacto para este servicio aún.</p>
        </div>
      ) : (
        <div className="contacts-list">
          {contacts
            .filter(contact => !pendingContactDeletions.includes(contact.id))
            .map((contact) => (
              <ContactItem
                key={contact.id}
                contact={contact}
                isAdmin={isAdmin}
                onMarkForDeletion={markContactForDeletion}
                onUnmarkForDeletion={unmarkContactForDeletion}
                isMarkedForDeletion={pendingContactDeletions.includes(contact.id)}
              />
            ))}
        </div>
      )}

      {pendingContactDeletions.length > 0 && (
        <div className="pending-deletions-info">
          <p>{pendingContactDeletions.length} contacto{pendingContactDeletions.length > 1 ? 's' : ''} marcado{pendingContactDeletions.length > 1 ? 's' : ''} para eliminar</p>
        </div>
      )}
    </div>
  );
};

export default ServiceContactsManager;
