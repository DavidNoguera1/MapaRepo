// const API_BASE_URL = 'http://192.168.80.46:3001/api/auth'; // Adjust if backend runs on different host/port

export async function register({ user_name, email, password, phone, cedula }) {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
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
    const response = await fetch(`${API_BASE_URL}/login`, {
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
