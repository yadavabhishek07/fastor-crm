import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('fastor_crm_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          const res = await api.auth.me();
          if (res.success && res.employee) {
            setUser(res.employee);
          } else {
            logout();
          }
        } catch (err) {
          console.error('Session restoration failed:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.auth.login({ email, password });
    if (res.token) {
      localStorage.setItem('fastor_crm_token', res.token);
      setToken(res.token);
      setUser(res.employee);
    }
    return res;
  };

  const register = async (name, email, password) => {
    const res = await api.auth.register({ name, email, password });
    if (res.token) {
      localStorage.setItem('fastor_crm_token', res.token);
      setToken(res.token);
      setUser(res.employee);
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('fastor_crm_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
