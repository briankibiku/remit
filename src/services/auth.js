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
export const partnerLogin = async (emailAddress, password) => {
  try {
    const response = await api.put('/patner/login', { emailAddress, password });
    return response.data; // Returns { phoneNumber, emailAddress, message }
  } catch (error) {
    throw error.response?.data?.message || 'Partner login failed';
  }
};

// Partner validate OTP
export const partnerValidate = async (phoneOrEmail, otp) => {
  try {
    const response = await api.put('/patner/validate', { phoneOrEmail, otp });
    const { message, token } = response.data;

    // Store token
    setTokens(token, token);

    return { message, token };
  } catch (error) {
    throw error.response?.data?.message || 'Validation failed';
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
export const signup = async (
  fullName,
  idNumber,
  businessIdNumber,
  gender,
  dateOfBirth,
  phoneNumber,
  email,
  password,
  confirmPassword,
  verified,
  status
) => {
  try {
    const response = await api.post('/auth/register', {
      fullName,
      idNumber,
      businessIdNumber,
      gender,
      dateOfBirth,
      phoneNumber,
      email,
      password,
      confirmPassword, verified, status,
    });

    const { message } = response.data;

    // Return user data
    return { message };
  } catch (error) {
    throw error.response?.data?.message || 'Signup failed';
  }
};

// Logout user
export const logout = () => {
  clearTokens();
  window.location.href = '/';
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = getAccessToken();
  return !!token; // Returns true if token exists
};

// Get current user from token
export const getCurrentUser = () => {
  const token = getAccessToken();
  console.log("token", token);
  return getUserFromToken(token);
};