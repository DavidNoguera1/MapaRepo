import React from 'react';
import './ServiceCard.css';

const ServiceCard = ({ service, onViewMore, onOwnerClick }) => {
  return (
    <div className="service-card">
      <div className="service-image">
        <img
          src={service.cover_image_url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjODZiN2I1Ii8+Cjx0ZXh0IHg9Ijc1IiB5PSI4MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+U2VydmljaWU8L3RleHQ+Cjwvc3ZnPg=='}
          alt={service.title}
          onError={(e) => {
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjODZiN2I1Ii8+Cjx0ZXh0IHg9Ijc1IiB5PSI4MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+U2VydmljaWU8L3RleHQ+Cjwvc3ZnPg==';
          }}
        />
      </div>
      <div className="service-info">
        <h3 className="service-title">{service.title}</h3>
        {service.owner_name && (
          <div className="service-owner">
            <span
              className="owner-name"
              onClick={(e) => {
                e.stopPropagation();
                onOwnerClick(service.owner_id);
              }}
              title="Click para ver perfil del usuario"
            >
              Por: {service.owner_name}
            </span>
          </div>
        )}
        {service.tags && service.tags.length > 0 && (
          <div className="service-tags">
            {service.tags.slice(0, 3).map(tag => (
              <span key={tag.id} className="service-tag">
                {tag.name}
              </span>
            ))}
            {service.tags.length > 3 && (
              <span className="service-tag more-tags">
                +{service.tags.length - 3} más
              </span>
            )}
          </div>
        )}
      </div>
      <div className="service-actions">
        <button className="view-more-button" onClick={() => onViewMore(service)}>
          Ver Más
        </button>
      </div>
    </div>
  );
};

export default ServiceCard;
