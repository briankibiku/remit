import { jwtDecode } from 'jwt-decode';

// Store tokens in localStorage
export const setTokens = (accessToken, refreshToken) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

// Retrieve tokens from localStorage
export const getAccessToken = () => localStorage.getItem('accessToken');
export const getRefreshToken = () => localStorage.getItem('refreshToken');

// Clear all tokens (for logout)
export const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('partner_profile');
};


// Check if token is expired
export const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const decoded = jwtDecode(token);
    // decoded.exp is in seconds, Date.now() is in milliseconds
    return decoded.exp * 1000 < Date.now();
  } catch (error) {
    return true;
  }
};

// Get user info from token
export const getUserFromToken = (token) => {
  if (!token) return null;

  try {
    return jwtDecode(token);
  } catch (error) {
    return null;
  }
};