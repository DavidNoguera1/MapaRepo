import { API_BASE_URL } from './config';

export async function getProfile(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener perfil');
    }
    return data;
  } catch (error) {
    throw error;
  }
}

export async function updateProfile(token, profileData) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al actualizar perfil');
    }
    return data;
  } catch (error) {
    throw error;
  }
}

export async function updatePassword(token, passwordData) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/me/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(passwordData),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al actualizar contraseña');
    }
    return data;
  } catch (error) {
    throw error;
  }
}

export async function deleteAccount(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Error al eliminar cuenta');
    }
    return { message: 'Cuenta eliminada exitosamente' };
  } catch (error) {
    throw error;
  }
}
