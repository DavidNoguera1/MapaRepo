import { API_BASE_URL } from './config';

// Obtener chats del usuario autenticado
export async function getUserChats(token, limit = 20, offset = 0) {
  try {
    const response = await fetch(`${API_BASE_URL}/chats?limit=${limit}&offset=${offset}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener chats');
    }
    return data;
  } catch (error) {
    throw error;
  }
}

// Iniciar chat con un usuario específico
export async function startChatWithUser(token, userId, serviceId = null) {
  try {
    const body = serviceId ? { service_id: serviceId } : {};
    const response = await fetch(`${API_BASE_URL}/chats/start-with/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al iniciar chat');
    }
    return data;
  } catch (error) {
    throw error;
  }
}

// Obtener detalles de un chat específico
export async function getChatDetails(token, chatId) {
  try {
    const response = await fetch(`${API_BASE_URL}/chats/${chatId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener detalles del chat');
    }
    return data;
  } catch (error) {
    throw error;
  }
}

// Obtener mensajes de un chat
export async function getChatMessages(token, chatId, limit = 50, offset = 0) {
  try {
    const response = await fetch(`${API_BASE_URL}/messages/${chatId}/messages?limit=${limit}&offset=${offset}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener mensajes');
    }
    return data;
  } catch (error) {
    throw error;
  }
}

// Enviar mensaje a un chat
export async function sendMessage(token, chatId, content) {
  try {
    const response = await fetch(`${API_BASE_URL}/messages/${chatId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al enviar mensaje');
    }
    return data;
  } catch (error) {
    throw error;
  }
}

// Marcar mensaje como leído
export async function markMessageAsRead(token, messageId) {
  try {
    const response = await fetch(`${API_BASE_URL}/messages/messages/${messageId}/read`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al marcar mensaje como leído');
    }
    return data;
  } catch (error) {
    throw error;
  }
}

// Eliminar mensaje
export async function deleteMessage(token, messageId) {
  try {
    const response = await fetch(`${API_BASE_URL}/messages/messages/${messageId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al eliminar mensaje');
    }
    return data;
  } catch (error) {
    throw error;
  }
}
