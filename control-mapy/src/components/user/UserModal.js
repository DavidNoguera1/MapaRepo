import React, { useState, useRef } from 'react';
import { userService } from '../../services/apiUsers';
import { getImageUrl } from '../../utils/imageUtils';
import './UserModal.css';

const UserModal = ({ user, onClose, onUpdate, onDelete }) => {
  const [formData, setFormData] = useState({
    user_name: user.user_name || '',
    email: user.email || '',
    phone: user.phone || '',
    cedula: user.cedula || '',
    role: user.role || 'user',
    is_active: user.is_active !== undefined ? user.is_active : true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(user.profile_picture_url || null);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'is_active' ? value === 'true' : value)
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let profilePictureUrl = user.profile_picture_url;

      // Upload image if a new one was selected
      if (imageFile) {
        // Check if current user is admin by looking at localStorage or context
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const isAdmin = currentUser.role === 'admin';

        let uploadResponse;
        if (isAdmin) {
          // Admin uploading image for another user
          uploadResponse = await userService.uploadProfilePictureAdmin(user.id, imageFile);
        } else {
          // Regular user uploading their own image
          uploadResponse = await userService.uploadProfilePicture(imageFile);
        }

        profilePictureUrl = uploadResponse.profile_picture_url;
      }

      const updatedUser = {
        id: user.id, // Include the user ID from props
        ...formData,
        profile_picture_url: profilePictureUrl
      };

      await onUpdate(updatedUser);
    } catch (err) {
      setError('Error al actualizar el usuario');
      console.error('Error updating user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`¿Está seguro de que desea eliminar al usuario ${user.user_name}? Esta acción no se puede deshacer.`)) {
      setLoading(true);
      try {
        await onDelete(user.id);
      } catch (err) {
        setError('Error al eliminar el usuario');
        console.error('Error deleting user:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const getProfilePicture = (profilePictureUrl) => {
    return getImageUrl(profilePictureUrl);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Editar Usuario</h2>
          <button onClick={onClose} className="close-button">
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="user-preview">
            <div className="profile-picture-container">
              <img
                src={getProfilePicture(imagePreview)}
                alt="Profile preview"
                className="profile-preview"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjODZiN2I1Ii8+Cjx0ZXh0IHg9Ijc1IiB5PSI4MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+U2luIEZvdG88L3RleHQ+Cjwvc3ZnPg==';
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="change-picture-button"
              >
                +
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </div>
            <div className="user-basic-info">
              <h3>{user.user_name}</h3>
              <p>{user.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="user-form">
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="user_name">Nombre de Usuario</label>
                <input
                  type="text"
                  id="user_name"
                  name="user_name"
                  value={formData.user_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Correo Electrónico</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Teléfono</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="cedula">Cédula</label>
                <input
                  type="text"
                  id="cedula"
                  name="cedula"
                  value={formData.cedula}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="role">Rol</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="user">Usuario</option>
                  <option value="contractor">Contratista</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="is_active">Estado</label>
                <select
                  id="is_active"
                  name="is_active"
                  value={formData.is_active}
                  onChange={handleChange}
                >
                  <option value={true}>Activo</option>
                  <option value={false}>Inactivo</option>
                </select>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                onClick={handleDelete}
                className="delete-button"
                disabled={loading}
              >
                {loading ? 'Eliminando...' : 'Eliminar Usuario'}
              </button>

              <div className="action-buttons">
                <button
                  type="submit"
                  className="save-button"
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
