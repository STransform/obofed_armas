import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../../axiosConfig';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const getInitialUser = () => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error('Failed to parse user data:', error);
      clearAuthData();
      return null;
    }
  };

  const [user, setUser] = useState(getInitialUser);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  // Clear all authentication data
  const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    setUser(null);
    setToken('');
    setIsAuthenticated(false);
  };

  // Validate token and fetch user data on initial load
  useEffect(() => {
    const validateToken = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          await axiosInstance.get('/validate-token', {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          // Fetch user data
          const userResponse = await axiosInstance.get('/users/me', {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          console.log('User data fetched on validate:', userResponse.data);
          localStorage.setItem('user', JSON.stringify(userResponse.data));
          setUser(userResponse.data);
          setIsAuthenticated(true);
          setToken(storedToken);
        } catch (err) {
          console.error('Token validation or user fetch failed:', err.response?.data || err.message);
          clearAuthData();
        }
      }
    };

    validateToken();
  }, []);

  const loginAction = async (data) => {
    try {
      clearAuthData();

      console.log('Login request payload:', data);
      const response = await axiosInstance.post('/login', data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Login API response:', response.data);

      if (response.status === 200 || response.status === 201) {
        const authToken = response.data.token;
        if (!authToken) {
          console.error('Token not found in:', response.data);
          throw new Error('No authentication token received.');
        }

        // Fetch complete user data
        const userResponse = await axiosInstance.get('/users/me', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const userData = userResponse.data;
        console.log('User data fetched:', userData);

        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(userData));

        setIsAuthenticated(true);
        setToken(authToken);
        setUser(userData);

        console.log('Login successful, user roles:', userData.roles);
        return userData.roles;
      }
      throw new Error(response.data?.error || 'Login failed');
    } catch (err) {
      clearAuthData();
      let errorMsg = 'Network Error. Please check your connection or server status.';
      if (err.response) {
        errorMsg = err.response.data?.error || err.response.data?.message || `Server responded with ${err.response.status}`;
      } else if (err.request) {
        errorMsg = 'No response from server. Please try again.';
      } else {
        errorMsg = err.message || 'Login failed. Please try again.';
      }
      console.error('Login error details:', {
        error: err,
        response: err.response,
        request: err.request,
        message: errorMsg,
      });
      throw new Error(errorMsg);
    }
  };

  const logOut = async () => {
    try {
      await axiosInstance.post('/logout', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
    clearAuthData();
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        token,
        user,
        roles: user?.roles || [],
        loginAction,
        logOut,
        clearAuthData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

export const useAuth = () => {
  return useContext(AuthContext);
};