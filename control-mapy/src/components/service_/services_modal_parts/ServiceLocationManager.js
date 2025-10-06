import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import './css/ServiceLocationManager.css';

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

const ServiceLocationManager = ({ position, setPosition, addressText, setAddressText }) => {
  return (
    <div className="service-location-section">
      <label>
        Dirección:
        <input
          type="text"
          value={addressText}
          onChange={e => setAddressText(e.target.value)}
        />
      </label>
      <label>
        Ubicación:
        <MapContainer
          center={position || { lat: 0, lng: 0 }}
          zoom={13}
          style={{ height: '200px', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <LocationMarker position={position} setPosition={setPosition} />
        </MapContainer>
      </label>
    </div>
  );
};

export default ServiceLocationManager;
