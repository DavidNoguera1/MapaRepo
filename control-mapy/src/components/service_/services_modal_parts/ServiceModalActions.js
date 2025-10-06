import React from 'react';
import './css/ServiceModalActions.css';

const ServiceModalActions = ({ onSave, onDelete }) => {
  return (
    <div className="modal-actions">
      <button className="save-button" onClick={onSave}>
        Guardar Cambios
      </button>
      <button className="delete-button" onClick={onDelete}>
        Eliminar Servicio
      </button>
    </div>
  );
};

export default ServiceModalActions;
