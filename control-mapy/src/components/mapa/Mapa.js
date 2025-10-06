import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import serviceService from '../../services/apiServices';
import ServiceCard from '../service_/ServiceCard';
import ServiceModal from '../service_/ServiceModal';
import Navbar from '../navbar/Navbar';
import './Mapa.css';

// Fix for default markers in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon for services
const serviceIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});



// Component to handle map events and location detection
const MapController = ({ onLocationFound, zoneCenter, zoneRadius, mapCenter }) => {
  const map = useMap();

  useEffect(() => {
    // Add click handler to update zone center
    const handleMapClick = (e) => {
      onLocationFound(e.latlng, 'click');
    };

    map.on('click', handleMapClick);

    return () => {
      map.off('click', handleMapClick);
    };
  }, [map, onLocationFound]);

  // Update zone circle when center or radius changes
  useEffect(() => {
    if (zoneCenter && zoneRadius > 0) {
      // Remove existing circle
      map.eachLayer((layer) => {
        if (layer instanceof L.Circle && layer.options.color === 'red') {
          map.removeLayer(layer);
        }
      });

      // Add new circle
      L.circle(zoneCenter, {
        radius: zoneRadius,
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.2,
        weight: 2
      }).addTo(map);
    }
  }, [zoneCenter, zoneRadius, map]);

  // Update map view when mapCenter changes
  useEffect(() => {
    if (mapCenter) {
      map.setView(mapCenter, map.getZoom());
    }
  }, [mapCenter, map]);

  return null;
};

const Mapa = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoneCenter, setZoneCenter] = useState(null);
  const [zoneRadius, setZoneRadius] = useState(1000); // 1km default
  const [showAllServices, setShowAllServices] = useState(false); // New state for showing all services
  const [selectedService, setSelectedService] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [mapCenter, setMapCenter] = useState([-34.6037, -58.3816]); // Default to Buenos Aires

  // Load cached location on mount
  useEffect(() => {
    const cachedLat = localStorage.getItem('cachedLat');
    const cachedLng = localStorage.getItem('cachedLng');
    if (cachedLat && cachedLng) {
      const cachedCoords = { lat: parseFloat(cachedLat), lng: parseFloat(cachedLng) };
      setZoneCenter(cachedCoords);
      setMapCenter([cachedCoords.lat, cachedCoords.lng]);
    }
  }, []);

  // Load services on component mount
  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await serviceService.getServices(0, 1000, ''); // Load all services
      setServices(response.services);
    } catch (err) {
      setError('Error al cargar los servicios');
      console.error('Error loading services:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get user current location
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocalización no es soportada por este navegador.');
      return;
    }

    // Check if running on HTTPS or localhost
    const isSecureContext = window.location.protocol === 'https:' ||
                           window.location.hostname === 'localhost' ||
                           window.location.hostname === '127.0.0.1';

    if (!isSecureContext) {
      alert('Para usar la geolocalización, el sitio debe ejecutarse en HTTPS o localhost. Actualmente estás en: ' + window.location.protocol + '//' + window.location.hostname);
      return;
    }

    console.log('Requesting geolocation...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Geolocation success:', position.coords);
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setZoneCenter(coords);
        setMapCenter([coords.lat, coords.lng]);
        // Save to localStorage cache
        localStorage.setItem('cachedLat', coords.lat.toString());
        localStorage.setItem('cachedLng', coords.lng.toString());
        alert('¡Ubicación detectada correctamente!');
      },
      (error) => {
        console.error('Geolocation error details:', {
          code: error.code,
          message: error.message,
          PERMISSION_DENIED: error.PERMISSION_DENIED,
          POSITION_UNAVAILABLE: error.POSITION_UNAVAILABLE,
          TIMEOUT: error.TIMEOUT
        });

        let errorMessage = 'Error al obtener la ubicación: ';

        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Permisos denegados. Por favor, permite el acceso a la ubicación en tu navegador.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Ubicación no disponible. Verifica que tu dispositivo tenga GPS activado.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Tiempo agotado. Intenta nuevamente.';
            break;
          default:
            errorMessage += 'Error desconocido. Verifica tu conexión a internet y permisos de ubicación.';
            break;
        }

        alert(errorMessage + '\n\nPara desarrollo local, asegúrate de que el sitio se ejecute en localhost con HTTP o HTTPS.');
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, // Increased timeout
        maximumAge: 300000
      }
    );
  };



  // Handle location found (either from click or current location)
  const handleLocationFound = useCallback((coords, source) => {
    if (source === 'click') {
      setZoneCenter(coords);
    }
  }, []);

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (point1, point2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLon = (point2.lng - point1.lng) * Math.PI / 180;
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Filter services based on zone of interest
  const servicesInZone = services.filter(service => {
    if (!zoneCenter || !service.lat || !service.lng) return false;
    const serviceLocation = { lat: service.lat, lng: service.lng };
    const distance = calculateDistance(zoneCenter, serviceLocation);
    return distance <= (zoneRadius / 1000); // Convert meters to kilometers
  });

  const handleViewMore = (service) => {
    setSelectedService(service);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedService(null);
  };

  return (
    <>
      <Navbar />
      <div className="mapa-container">
        <div className="mapa-controls">
          <div className="control-group">
            <label htmlFor="zone-radius">Radio de zona de interés (metros):</label>
            <input
              id="zone-radius"
              type="range"
              min="100"
              max="20000"
              step="500"
              value={zoneRadius}
              onChange={(e) => setZoneRadius(parseInt(e.target.value))}
              className="zone-radius-slider"
              disabled={showAllServices}
            />
            <span className="radius-value">{zoneRadius}m</span>
          </div>

          <button
            onClick={handleGetCurrentLocation}
            className="location-button"
          >
            📍 Detectar Ubicación Actual
          </button>



          <div className="control-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={showAllServices}
                onChange={(e) => setShowAllServices(e.target.checked)}
                className="show-all-checkbox"
              />
              Ver todos los servicios (sin zona de interés)
            </label>
          </div>

          <div className="services-info">
            <p>Total de servicios: {services.length}</p>
            <p>Servicios mostrados: {showAllServices ? services.length : servicesInZone.length}</p>
          </div>
        </div>

        <div className="mapa-content">
          <div className="map-container">
            <MapContainer
              center={mapCenter}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />

              <MapController
                onLocationFound={handleLocationFound}
                zoneCenter={zoneCenter}
                zoneRadius={zoneRadius}
                mapCenter={mapCenter}
              />

              {/* Service markers */}
              {services.map(service => {
                if (!service.lat || !service.lng) return null;
                const isInZone = zoneCenter ?
                  calculateDistance(zoneCenter, { lat: service.lat, lng: service.lng }) <= (zoneRadius / 1000) :
                  false;

                return (
                  <Marker
                    key={service.id}
                    position={[service.lat, service.lng]}
                    icon={serviceIcon}
                    opacity={isInZone ? 1 : 0.5}
                  >
                    <Popup>
                      <div className="service-popup">
                        <h4>{service.title}</h4>
                        <p>{service.description}</p>
                        {service.owner_name && <p><strong>Por:</strong> {service.owner_name}</p>}
                        <button
                          onClick={() => handleViewMore(service)}
                          className="popup-view-more"
                        >
                          Ver Más
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>

          <div className="services-list">
            <h3>Servicios {showAllServices ? 'Registrados' : (zoneCenter ? 'en Zona de Interés' : 'Registrados')}</h3>

            {loading && <div className="loading">Cargando servicios...</div>}

            {error && <div className="error">{error}</div>}

            {!loading && !error && !showAllServices && servicesInZone.length === 0 && zoneCenter && (
              <div className="no-services">
                <p>No hay servicios en la zona de interés seleccionada.</p>
                <p>Ajusta el radio o mueve el centro de la zona.</p>
              </div>
            )}

            {!loading && !error && !showAllServices && servicesInZone.length === 0 && !zoneCenter && (
              <div className="no-services">
                <p>Haz clic en el mapa para definir una zona de interés o usa el botón de ubicación actual.</p>
              </div>
            )}

            {!loading && !error && showAllServices && services.length === 0 && (
              <div className="no-services">
                <p>No hay servicios registrados en el sistema.</p>
              </div>
            )}

            <div className="services-grid">
              {(showAllServices ? services : servicesInZone).map(service => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onViewMore={handleViewMore}
                  onOwnerClick={() => {}} // TODO: Implement owner click if needed
                />
              ))}
            </div>
          </div>
        </div>

        {showModal && selectedService && (
          <ServiceModal
            service={selectedService}
            onClose={handleCloseModal}
            onUpdate={() => loadServices()}
          />
        )}
      </div>
    </>
  );
};

export default Mapa;
