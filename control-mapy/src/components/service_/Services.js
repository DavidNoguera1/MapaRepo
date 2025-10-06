import React, { useState, useEffect, useCallback } from 'react';
import serviceService from '../../services/apiServices';
import tagService from '../../services/apiTags';
import { userService } from '../../services/apiUsers';
import ServiceCard from './ServiceCard';
import ServiceModal from './ServiceModal';
import UserModal from '../user/UserModal';
import Navbar from '../navbar/Navbar';
import './Services.css';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalServices, setTotalServices] = useState(0);
  const [selectedService, setSelectedService] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [showTagFilter, setShowTagFilter] = useState(false);
  const [tagSearchTerm, setTagSearchTerm] = useState('');

  const servicesPerPage = 10;

  // Debounce search input to reduce API calls
  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  const loadServices = async (page = 0, search = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await serviceService.getServices(page, servicesPerPage, search);
      if (page === 0) {
        setServices(response.services);
      } else {
        setServices(prev => [...prev, ...response.services]);
      }
      setTotalServices(response.pagination.total || 0);
    } catch (err) {
      setError('Error al cargar los servicios');
      console.error('Error loading services:', err);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((value) => {
      setCurrentPage(0);
      loadServices(0, value);
    }, 500),
    []
  );

  // Load available tags on component mount
  useEffect(() => {
    const loadTags = async () => {
      try {
        const tags = await tagService.getTags();
        setAvailableTags(tags);
      } catch (error) {
        console.error('Error loading tags:', error);
      }
    };
    loadTags();
  }, []);

  useEffect(() => {
    loadServices(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleViewMore = (service) => {
    // Safety check: ensure service has required properties
    if (!service || !service.id) {
      console.error('Services: Invalid service passed to handleViewMore:', service);
      alert('Error: Servicio no válido. Por favor, recarga la página e intenta nuevamente.');
      return;
    }

    setSelectedService(service);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedService(null);
  };

  // New handler to update a service in the list after editing
  const handleUpdateService = (updatedService) => {
    setServices(prevServices =>
      prevServices.map(service =>
        service.id === updatedService.id ? updatedService : service
      )
    );
    setSelectedService(updatedService);
  };

  // User modal handlers
  const handleOwnerClick = async (ownerId) => {
    try {
      const user = await userService.getUserById(ownerId);
      setSelectedUser(user);
      setShowUserModal(true);
    } catch (error) {
      console.error('Error loading user:', error);
      setError('Error al cargar el perfil del usuario');
    }
  };

  const handleCloseUserModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
  };

  const handleUpdateUser = (updatedUser) => {
    setSelectedUser(updatedUser);
  };

  const handleDeleteUser = () => {
    setShowUserModal(false);
    setSelectedUser(null);
  };

  const handleLoadMore = () => {
    if (services.length < totalServices) {
      setCurrentPage(prev => prev + 1);
    }
  };

  // Tag filter handlers
  const handleTagToggle = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleRemoveTag = (tagToRemove) => {
    setSelectedTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleTagSearch = async (searchTerm) => {
    if (searchTerm.trim()) {
      try {
        const tags = await tagService.searchTags(searchTerm);
        setAvailableTags(tags);
      } catch (error) {
        console.error('Error searching tags:', error);
      }
    } else {
      // Reload all tags if search is empty
      const tags = await tagService.getTags();
      setAvailableTags(tags);
    }
  };

  const filteredServices = services.filter(service => {
    // Filter out undefined/null services and those without required properties
    if (!service || !service.id) return false;

    if (selectedTags.length === 0) return true;

    // Ensure service.tags exists before trying to access it
    if (!service.tags || !Array.isArray(service.tags)) return false;

    return selectedTags.every(selectedTag =>
      service.tags.some(serviceTag => serviceTag && serviceTag.name === selectedTag)
    );
  });

  const canLoadMore = services.length < totalServices;

  return (
    <>
      <Navbar />
      <div className="services-container">

        <div className="search-and-filter-container">
          <input
            type="text"
            placeholder="Buscar servicios por nombre..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />

          <button
            onClick={() => setShowTagFilter(!showTagFilter)}
            className="tag-filter-button"
          >
            Filtrar por Tags {selectedTags.length > 0 && `(${selectedTags.length})`}
          </button>
        </div>

        {showTagFilter && (
          <div className="tag-filter-container">
            <input
              type="text"
              placeholder="Buscar tags..."
              value={tagSearchTerm}
              onChange={(e) => {
                setTagSearchTerm(e.target.value);
                handleTagSearch(e.target.value);
              }}
              className="tag-search-input"
            />

            <div className="available-tags">
              {availableTags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => handleTagToggle(tag.name)}
                  className={`tag-option ${selectedTags.includes(tag.name) ? 'selected' : ''}`}
                >
                  {tag.name}
                </button>
              ))}
            </div>

            {selectedTags.length > 0 && (
              <div className="selected-tags">
                <h4>Tags seleccionados:</h4>
                {selectedTags.map(tag => (
                  <span key={tag} className="selected-tag">
                    {tag}
                    <button onClick={() => handleRemoveTag(tag)} className="remove-tag">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <div className="services-grid">
          {filteredServices
            .filter(service => service && service.id) // Filter out undefined/null services and those without ID
            .map(service => (
              <ServiceCard
                key={service.id}
                service={service}
                onViewMore={handleViewMore}
                onOwnerClick={handleOwnerClick}
              />
            ))}
        </div>

        {loading && services.length === 0 && (
          <div className="loading-container">Cargando servicios...</div>
        )}

        {canLoadMore && !loading && (
          <div className="load-more-container">
            <button onClick={handleLoadMore} className="load-more-button">
              Cargar más servicios
            </button>
          </div>
        )}

        {showModal && selectedService && (
          <ServiceModal
            service={selectedService}
            onClose={handleCloseModal}
            onUpdate={handleUpdateService}
          />
        )}

        {showUserModal && selectedUser && (
          <UserModal
            user={selectedUser}
            onClose={handleCloseUserModal}
            onUpdate={handleUpdateUser}
            onDelete={handleDeleteUser}
          />
        )}
      </div>
    </>
  );
};

export default Services;
