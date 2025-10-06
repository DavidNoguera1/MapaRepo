import React from 'react';
import './css/ServiceImageManager.css';

const ServiceImageManager = ({ coverImageUrl, onImageChange }) => {

  return (
    <div className="service-preview" style={{ position: 'relative' }}>
      <img
        src={coverImageUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjODZiN2I1Ii8+Cjx0ZXh0IHg9Ijc1IiB5PSI4MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+U2VydmljaWU8L3RleHQ+Cjwvc3ZnPg=='}
        alt="Service cover"
        className="service-cover-image"
        onError={e => {
          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjODZiN2I1Ii8+Cjx0ZXh0IHg9Ijc1IiB5PSI4MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+U2VydmljaWU8L3RleHQ+Cjwvc3ZnPg==';
        }}
      />
      <label
        htmlFor="image-upload"
        className="image-upload-label"
        title="Cambiar imagen"
        style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          backgroundColor: '#007bff',
          color: 'white',
          borderRadius: '50%',
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          cursor: 'pointer',
          userSelect: 'none',
          border: '2px solid white',
          boxShadow: '0 0 5px rgba(0,0,0,0.3)'
        }}
      >
        +
      </label>
      <input
        id="image-upload"
        type="file"
        accept="image/*"
        onChange={onImageChange}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default ServiceImageManager;
