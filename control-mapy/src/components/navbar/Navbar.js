import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="universal-navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <h2>Panel de Control MapyWorks</h2>
        </div>

        <div className="navbar-menu">
          <button
            className={`navbar-item ${isActive('/dashboard') ? 'active' : ''}`}
            onClick={() => handleNavigation('/dashboard')}
          >
            Principal
          </button>
          <button
            className={`navbar-item ${isActive('/users') ? 'active' : ''}`}
            onClick={() => handleNavigation('/users')}
          >
            Usuarios
          </button>
          <button
            className={`navbar-item ${isActive('/services') ? 'active' : ''}`}
            onClick={() => handleNavigation('/services')}
          >
            Servicios
          </button>
          <button
            className={`navbar-item ${isActive('/tags') ? 'active' : ''}`}
            onClick={() => handleNavigation('/tags')}
          >
            Tags
          </button>
          <button
            className={`navbar-item ${isActive('/mapa') ? 'active' : ''}`}
            onClick={() => handleNavigation('/mapa')}
          >
            Mapa
          </button>
        </div>

        <div className="navbar-user">
          <span className="user-greeting">Bienvenido, {user?.user_name}</span>
          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
