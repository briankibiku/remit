import axios from 'axios';
import { getAccessToken, getRefreshToken, setTokens, clearTokens, isTokenExpired, getUserFromToken } from '../utils/tokenUtils';

// Base API URL - change this to your backend URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://rem.propel.co.ke/v1/propel-remittance';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// REQUEST INTERCEPTOR
// Runs before every request is sent
api.interceptors.request.use(
  (config) => {
    // If request doesn't require authentication, skip adding token
    if (config?.skipAuth) return config;

    const token = getAccessToken();

    // Add token to Authorization header if it exists
    if (token) {
      config.headers.Authorization = `bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// api.interceptors.request.use(
//   (config) => {
//     const token = getAccessToken();

//     // Add token to Authorization header if it exists
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }

//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// RESPONSE INTERCEPTOR
// Runs after every response is received
api.interceptors.response.use(
  (response) => {
    // If response is successful, just return it
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 (Unauthorized) and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.skipAuthRefresh) {
      // Don't refresh on login or validate endpoints
      if (originalRequest.url.includes('/partner-login') || originalRequest.url.includes('/validate')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        // If no refresh token, and we are not on a public page, redirect to login
        // But for partner login page, we might just want to fail without redirecting
        if (!window.location.pathname.includes('/partner-login') && !window.location.pathname.includes('/partner-signup')) {
          clearTokens();
          window.location.href = '/partner-login';
        }
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const user = getUserFromToken(refreshToken);
      const isPartner = user?.role === 'api_partner';
      const refreshUrl = isPartner
        ? `${API_BASE_URL}/patner/refresh-token`
        : `${API_BASE_URL}/auth/refresh`;

      try {
        // Call refresh token endpoint
        // Using PUT for partner as per user convention, POST for others
        const response = await axios({
          method: isPartner ? 'put' : 'post',
          url: refreshUrl,
          data: { refreshToken }
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Store new tokens
        setTokens(accessToken, newRefreshToken || refreshToken);

        // Update the failed request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // Process queued requests
        processQueue(null, accessToken);

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearTokens();
        window.location.href = '/partner-login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;