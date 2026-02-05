// import { createContext, useState, useContext, useEffect } from 'react';
// import { getCurrentUser, logout as logoutService } from '../services/auth';

// const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
  
//   // Check if user is logged in on mount
//   useEffect(() => {
//     const loadUser = () => {
//       try {
//         const currentUser = getCurrentUser();
//         setUser(currentUser);
//       } catch (error) {
//         setUser(null);
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     loadUser();
//   }, []);
  
//   const login = (userData) => {
//     setUser(userData);
//   };
  
//   const logout = () => {
//     logoutService();
//     // setUser(null);
//   };
  
//   const value = {
//     user,
//     login,
//     logout,
//     isAuthenticated: !!user,
//     loading
//   };
  
//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// // Custom hook to use auth context
// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within AuthProvider');
//   }
//   return context;
// };

import { createContext, useState, useContext, useEffect } from "react";
import { logout as logoutService } from "../services/auth";
import { getAccessToken } from "../utils/tokenUtils";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("remit_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = getAccessToken();
        setIsAuthenticated(!!token);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData = null) => {
    setIsAuthenticated(true);
    if (userData) {
      setUser(userData);
      localStorage.setItem("remit_user", JSON.stringify(userData));
    }
  };

  const logout = () => {
    logoutService(); // This clears tokens from localStorage
    localStorage.removeItem("remit_user");
    setIsAuthenticated(false);
    setUser(null);
    window.location.href = "/"; // Force redirect to login
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem("remit_user", JSON.stringify(userData));
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    updateUser,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};