import { API_BASE_URL } from './config';

export async function register({ user_name, email, password, phone, cedula }) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_name, email, password, phone, cedula }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error en el registro');
    }
    return data;
  } catch (error) {
    throw error;
  }
}

export async function login({ email, password }) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error en el inicio de sesión');
    }
    return data;
  } catch (error) {
    throw error;
  }
}

export async function resetPassword({ cedula1, cedula2, newPassword }) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cedula1, cedula2, newPassword }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al resetear la contraseña');
    }
    return data;
  } catch (error) {
    throw error;
  }
}
