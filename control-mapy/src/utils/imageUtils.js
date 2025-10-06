/**
 * Utility function to construct full image URLs for profile pictures
 * @param {string} imagePath - The image path from the database (e.g., "/uploads/user_images/filename.jpg")
 * @returns {string} - Full URL to the image or placeholder if no image
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    // Return placeholder SVG if no image path
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjODZiN2I1Ii8+Cjx0ZXh0IHg9Ijc1IiB5PSI4MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+U2luIEZvdG88L3RleHQ+Cjwvc3ZnPg==';
  }

  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // If it's a data URL (base64), return as is
  if (imagePath.startsWith('data:')) {
    return imagePath;
  }

  // Construct full URL by prepending the backend server URL
  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
  const backendUrl = baseUrl.replace('/api', ''); // Remove /api to get the base server URL

  return `${backendUrl}${imagePath}`;
};

/**
 * Legacy function for backward compatibility - use getImageUrl instead
 * @deprecated Use getImageUrl instead
 */
export const getProfilePicture = (profilePictureUrl) => {
  return getImageUrl(profilePictureUrl);
};
