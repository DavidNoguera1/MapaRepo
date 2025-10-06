import React from 'react';
import { getImageUrl } from '../../utils/imageUtils';
import './UserCard.css';

const UserCard = ({ user, onViewMore }) => {
  const getProfilePicture = (profilePictureUrl) => {
    return getImageUrl(profilePictureUrl);
  };

  return (
    <div className="user-card">
      <div className="user-avatar">
        <img
          src={getProfilePicture(user.profile_picture_url)}
          alt={`${user.user_name}'s profile`}
          onError={(e) => {
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjODZiN2I1Ii8+Cjx0ZXh0IHg9Ijc1IiB5PSI4MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+U2luIEZvdG88L3RleHQ+Cjwvc3ZnPg==';
          }}
        />
      </div>

      <div className="user-info">
        <h3 className="user-name">{user.user_name}</h3>
      </div>

      <div className="user-actions">
        <button
          onClick={() => onViewMore(user)}
          className="view-more-button"
        >
          Ver Más
        </button>
      </div>
    </div>
  );
};

export default UserCard;
