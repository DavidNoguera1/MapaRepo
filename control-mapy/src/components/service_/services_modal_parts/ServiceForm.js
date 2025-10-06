import React from 'react';
import './css/ServiceForm.css';

const ServiceForm = ({
  title,
  setTitle,
  description,
  setDescription,
  isActive,
  setIsActive,
  avgRatingDisplay,
  reviewsCount
}) => {
  return (
    <div className="service-details">
      <label>
        Activo:
        <input
          type="checkbox"
          checked={isActive}
          onChange={e => setIsActive(e.target.checked)}
        />
      </label>
      <label>
        Descripción:
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </label>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        marginBottom: '8px'
      }}>
        <span style={{ marginLeft: '0' }}>
          Calificación del servicio promedio ({avgRatingDisplay})
        </span>
        <span style={{ marginLeft: '0' }}>
          Cantidad de reseñas: {reviewsCount}
        </span>
      </div>
    </div>
  );
};

export default ServiceForm;
