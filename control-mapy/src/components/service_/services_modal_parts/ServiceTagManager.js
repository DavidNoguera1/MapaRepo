import React from 'react';
import './css/ServiceTagManager.css';

const ServiceTagManager = ({
  serviceTags,
  availableTags,
  showTagManager,
  setShowTagManager,
  tagSearchTerm,
  setTagSearchTerm,
  onAddTag,
  onRemoveTag,
  onTagSearch
}) => {
  return (
    <div className="service-tags-section">
      <div className="service-tags-header">
        <h4>Tags del servicio:</h4>
        <button
          onClick={() => setShowTagManager(!showTagManager)}
          className="manage-tags-button"
        >
          {showTagManager ? 'Cancelar' : 'Gestionar Tags'}
        </button>
      </div>

      <div className="current-tags">
        {serviceTags.map(tag => (
          <span key={tag.id} className="service-tag">
            {tag.name}
            {showTagManager && (
              <button
                onClick={() => onRemoveTag(tag.id)}
                className="remove-tag-button"
                title="Remover tag"
              >
                ×
              </button>
            )}
          </span>
        ))}
        {serviceTags.length === 0 && (
          <span className="no-tags">No hay tags asignados</span>
        )}
      </div>

      {showTagManager && (
        <div className="tag-manager">
          <input
            type="text"
            placeholder="Buscar o crear tag..."
            value={tagSearchTerm}
            onChange={(e) => {
              setTagSearchTerm(e.target.value);
              onTagSearch(e.target.value);
            }}
            className="tag-search-input"
          />

          <div className="available-tags-list">
            {availableTags
              .filter(tag => !serviceTags.find(st => st.id === tag.id))
              .slice(0, 10)
              .map(tag => (
                <button
                  key={tag.id}
                  onClick={() => onAddTag(tag.name)}
                  className="available-tag-item"
                >
                  {tag.name}
                </button>
              ))}
          </div>

          <div className="add-new-tag">
            <input
              type="text"
              placeholder="Nombre del nuevo tag"
              id="new-tag-input"
              className="new-tag-input"
            />
            <button
              onClick={() => {
                const input = document.getElementById('new-tag-input');
                if (input.value.trim()) {
                  onAddTag(input.value.trim());
                  input.value = '';
                }
              }}
              className="add-tag-button"
            >
              Agregar Tag
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceTagManager;
