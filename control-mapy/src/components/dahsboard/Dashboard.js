import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../navbar/Navbar';
import './Dashboard.css';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="dashboard-container">
      <Navbar />

      <main className="dashboard-main">
        <div className="welcome-section">
          <h2>Resumen del Panel</h2>

          <div className="user-card">
            <h3>Información del Usuario</h3>
            <div className="user-details">
              <div className="detail-item">
                <label>Nombre:</label>
                <span>{user?.user_name}</span>
              </div>
              <div className="detail-item">
                <label>Correo:</label>
                <span>{user?.email}</span>
              </div>
              <div className="detail-item">
                <label>Rol:</label>
                <span className={`role-badge ${user?.role}`}>
                  {user?.role?.toUpperCase()}
                </span>
              </div>
              <div className="detail-item">
                <label>Teléfono:</label>
                <span>{user?.phone || 'No proporcionado'}</span>
              </div>
              <div className="detail-item">
                <label>Miembro Desde:</label>
                <span>{formatDate(user?.created_at)}</span>
              </div>
            </div>
          </div>


        </div>

        <div className="quick-stats">
          <h3>Estadísticas Rápidas</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">-</div>
              <div className="stat-label">Total de Usuarios</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">-</div>
              <div className="stat-label">Servicios Activos</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">-</div>
              <div className="stat-label">Total de Reseñas</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">-</div>
              <div className="stat-label">Mensajes de Hoy</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
