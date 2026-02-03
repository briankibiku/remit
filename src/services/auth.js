import api from './api';
import { setTokens, clearTokens, getAccessToken, getUserFromToken } from '../utils/tokenUtils';

// Login user
export const login = async (emailAddress, password) => {
  try {
    const response = await api.put('/auth/login', { emailAddress, password }); 
    const { message } = response.data; 
    
    // Return user data
    return { message };
  } catch (error) {
    throw error.response?.data?.message || 'Login failed';
  }
};
// Partner login
export const partnerLogin = async (clientId, apiKey) => {
  try {
    const response = await api.post('/patner/login', { clientId, apiKey });
    const { accessToken, refreshToken } = response.data;
    
    // Return user data
    return  { accessToken, refreshToken };
  } catch (error) {
    throw error.response?.data?.message || 'Partner login failed';
  }
};
// Partner signup
export const partnerSignup = async (
  companyName,
  businessIdNumber,
  email,
  certificateOfIncorporationNumber,
  licenseNumber,
  country,
  address,
  role
) => {
  try {
    const response = await api.post('/patner/create', {
      companyName,
      businessIdNumber,
      email,
      certificateOfIncorporationNumber,
      licenseNumber,
      country,
      address,
      role
    });
    const { partnerId, clientId, apiKey } = response.data;
    
    // Return user data
    return { partnerId, clientId, apiKey };
  } catch (error) {
    throw error.response?.data?.message || 'Partner signup failed';
  }
};


// Verify code 
export const verify = async (phoneOrEmail, otp) => {
  try {
    const response = await api.put('/auth/validate', { phoneOrEmail, otp });
    const { message, token } = response.data;
    
    // Store tokens
    setTokens(token);
    
    // Return user data
    return { message, token };
  } catch (error) {
    throw error.response?.data?.message || 'Login failed';
  }
};

// Register new user
export const signup = async (payload) => {
  try {
    const response = await api.post('/auth/register', payload);
    
    const { message } = response.data; 
    
    // Return user data
    return { message };
  } catch (error) {
    throw error.response?.data?.message || 'Signup failed';
  }
};

export const getUsersService = async () => {
  try {
    const response = await api.get('/auth/findAll');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch users';
  }
};

export const forgotPasswordService = async (phoneOrEmail) => {
  try {
    const response = await api.patch(`/auth/forgot-password?phoneOrEmail=${encodeURIComponent(phoneOrEmail)}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to send reset request';
  }
};

// Logout user
export const logout = () => {
  clearTokens();
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = getAccessToken();
  return !!token; // Returns true if token exists
};

// Get current user from token
export const getCurrentUser = () => {
  const token = getAccessToken();
  return getUserFromToken(token);
};