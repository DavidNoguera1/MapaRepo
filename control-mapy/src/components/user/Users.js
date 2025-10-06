import React, { useState, useEffect } from 'react';
import { userService } from '../../services/apiUsers';
import UserCard from './UserCard';
import UserModal from './UserModal';
import Navbar from '../navbar/Navbar';
import './Users.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState(''); // '' means no filter
  const [statusFilter, setStatusFilter] = useState(''); // '' means no filter
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' or 'asc'

  const usersPerPage = 5;
  const maxUsersPerLoad = 30;

  useEffect(() => {
    // Load users on initial mount and whenever filters or currentPage change
    loadUsers();
  }, [searchTerm, roleFilter, statusFilter, sortOrder, currentPage]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (searchTerm) filters.user_name = searchTerm;
      if (roleFilter) filters.role = roleFilter;
      if (statusFilter) {
        if (statusFilter === 'active') filters.is_active = true;
        else if (statusFilter === 'inactive') filters.is_active = false;
      }
      filters.sort = sortOrder;

      const response = await userService.getUsers(currentPage, usersPerPage, filters);

      if (currentPage === 0) {
        setUsers(response.users);
      } else {
        setUsers(prev => [...prev, ...response.users]);
      }

      setTotalUsers(response.total);
    } catch (err) {
      setError('Error al cargar los usuarios');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(0);
    setUsers([]);
  };

  const handleViewMore = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const handleUserUpdate = async (updatedUser) => {
    try {
      await userService.updateUser(updatedUser.id, updatedUser);
      // Reload the entire users list to ensure consistency
      await loadUsers();
      handleCloseModal();
    } catch (err) {
      setError('Error al actualizar el usuario');
      console.error('Error updating user:', err);
    }
  };

  const handleUserDelete = async (userId) => {
    try {
      await userService.deleteUser(userId);
      // Reload the entire users list to ensure consistency
      await loadUsers();
      handleCloseModal();
    } catch (err) {
      setError('Error al eliminar el usuario');
      console.error('Error deleting user:', err);
    }
  };

  const handleLoadMore = () => {
    if (users.length < maxUsersPerLoad) {
      setCurrentPage(prev => prev + 1);
      loadUsers();
    }
  };

  const canLoadMore = users.length < totalUsers && users.length < maxUsersPerLoad;

  return (
    <div className="users-container">
      <Navbar />

      <div className="users-content">
        <div className="users-header">
          <div className="search-container">
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder="Buscar por nombre de usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-button">
                Buscar
              </button>
            </form>
            <div className="filter-controls">
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setCurrentPage(0);
                  setUsers([]);
                }}
                className="filter-select"
              >
                <option value="">Todos los roles</option>
                <option value="user">Usuario</option>
                <option value="contractor">Contratista</option>
                <option value="admin">Administrador</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(0);
                  setUsers([]);
                }}
                className="filter-select"
              >
                <option value="">Todos los estados</option>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>

              <select
                value={sortOrder}
                onChange={(e) => {
                  setSortOrder(e.target.value);
                  setCurrentPage(0);
                  setUsers([]);
                }}
                className="filter-select"
              >
                <option value="desc">Más reciente</option>
                <option value="asc">Más antiguo</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {loading && users.length === 0 ? (
          <div className="loading-container">
            <div className="loading-spinner">Cargando usuarios...</div>
          </div>
        ) : (
          <>
            <div className="users-grid">
              {users.map(user => (
                <UserCard
                  key={user.id}
                  user={user}
                  onViewMore={handleViewMore}
                />
              ))}
            </div>

            {canLoadMore && (
              <div className="load-more-container">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="load-more-button"
                >
                  {loading ? 'Cargando...' : `Cargar más usuarios (${users.length}/${Math.min(totalUsers, maxUsersPerLoad)})`}
                </button>
              </div>
            )}

            {users.length === 0 && !loading && (
              <div className="no-users">
                <p>No se encontraron usuarios</p>
              </div>
            )}
          </>
        )}

        {showModal && selectedUser && (
          <UserModal
            user={selectedUser}
            onClose={handleCloseModal}
            onUpdate={handleUserUpdate}
            onDelete={handleUserDelete}
          />
        )}
      </div>
    </div>
  );
};

export default Users;
