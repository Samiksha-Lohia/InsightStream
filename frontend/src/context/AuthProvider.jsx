import { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '../config';

const AuthContext = createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);



  // Check for stored credentials on startup
  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedToken = localStorage.getItem('insightstream_token');
        const storedUser = localStorage.getItem('insightstream_user');
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error("Failed to load auth credentials:", err);
        localStorage.removeItem('insightstream_token');
        localStorage.removeItem('insightstream_user');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Save auth info to state and localStorage
  const handleLoginSuccess = (userData, jwtToken) => {
    localStorage.setItem('insightstream_token', jwtToken);
    localStorage.setItem('insightstream_user', JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
  };

  // Perform Login request
  const login = async (email, password) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Login failed');
    }

    handleLoginSuccess(data.user, data.token);
    return data.user;
  };

  // Perform Register request
  const register = async (username, email, password) => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Registration failed');
    }

    handleLoginSuccess(data.user, data.token);
    return data.user;
  };

  // Perform Logout
  const logout = () => {
    localStorage.removeItem('insightstream_token');
    localStorage.removeItem('insightstream_user');
    setToken(null);
    setUser(null);
  };

  // Perform Update Password request
  const updatePassword = async (oldPassword, newPassword) => {
    const currentToken = token || localStorage.getItem('insightstream_token');
    if (!currentToken) {
      throw new Error('You must be logged in to update your password');
    }

    const response = await fetch(`${API_URL}/api/auth/update-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`,
      },
      body: JSON.stringify({ oldPassword, newPassword }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to update password');
    }

    return data;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
};