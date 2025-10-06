import React from 'react';
import './css/ServiceModalHeader.css';

const ServiceModalHeader = ({ title, setTitle, onClose }) => {
  return (
    <div className="modal-header">
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="service-title-input"
      />
      <button onClick={onClose} className="close-button">
        ×
      </button>
    </div>
  );
};

export default ServiceModalHeader;
