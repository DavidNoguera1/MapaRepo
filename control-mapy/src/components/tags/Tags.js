import React, { useState, useEffect } from 'react';
import { tagService } from '../../services/apiTags';
import Navbar from '../navbar/Navbar';
import './Tags.css';

const Tags = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTags, setFilteredTags] = useState([]);

  useEffect(() => {
    loadTags();
  }, []);

  useEffect(() => {
    // Filter tags based on search term
    if (searchTerm.trim() === '') {
      setFilteredTags(tags);
    } else {
      const filtered = tags.filter(tag =>
        tag.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTags(filtered);
    }
  }, [tags, searchTerm]);

  const loadTags = async () => {
    try {
      setLoading(true);
      const response = await tagService.getTags('', 100); // Get up to 100 tags
      setTags(response);
    } catch (err) {
      setError('Error al cargar los tags');
      console.error('Error loading tags:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTag = async (tagId, tagName) => {
    if (window.confirm(`¿Está seguro de que desea eliminar el tag "${tagName}"? Esta acción no se puede deshacer.`)) {
      try {
        await tagService.deleteTag(tagId);
        // Reload tags after deletion
        await loadTags();
      } catch (err) {
        setError('Error al eliminar el tag');
        console.error('Error deleting tag:', err);
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // The filtering is already handled by useEffect
  };

  return (
    <div className="tags-container">
      <Navbar />

      <div className="tags-content">
        <div className="tags-header">
          <div className="search-container">
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder="Buscar tags por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-button">
                Buscar
              </button>
            </form>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner">Cargando tags...</div>
          </div>
        ) : (
          <div className="tags-grid">
            {filteredTags.length === 0 ? (
              <div className="no-tags">
                <p>{searchTerm ? 'No se encontraron tags con ese nombre' : 'No hay tags disponibles'}</p>
              </div>
            ) : (
              filteredTags.map(tag => (
                <div key={tag.id} className="tag-bubble">
                  <span className="tag-name">{tag.name}</span>
                  <button
                    onClick={() => handleDeleteTag(tag.id, tag.name)}
                    className="delete-tag-button"
                    title="Eliminar tag"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tags;
