import { API_BASE_URL } from './config';

export async function uploadProfileImage(imageUri, token) {
  try {
    // Extract file extension from URI
    const uriParts = imageUri.split('.');
    const fileExtension = uriParts[uriParts.length - 1].toLowerCase();
    const mimeType = fileExtension === 'jpg' ? 'image/jpeg' : `image/${fileExtension}`;

    // Create FormData with file object for React Native compatibility
    const formData = new FormData();
    formData.append('profile_image', {
      uri: imageUri,
      name: `profile_image.${fileExtension}`,
      type: mimeType,
    });

    const uploadResponse = await fetch(`${API_BASE_URL}/profile-images/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type, let fetch set it with boundary
      },
      body: formData,
    });

    const data = await uploadResponse.json();
    if (!uploadResponse.ok) {
      throw new Error(data.error || 'Error al subir la imagen de perfil');
    }
    return data;
  } catch (error) {
    throw error;
  }
}
