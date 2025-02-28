import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';
import { api } from '../services/api';

type User = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  profile_image?: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const [storedUser, token] = await Promise.all([
        AsyncStorage.getItem('user'),
        AsyncStorage.getItem('token'),
      ]);

      if (token) {
        // Verify token validity with API
        const isValid = await authService.verifyToken(token);
        if (isValid && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
          return;
        }
      }
      await handleLogout();
    } catch (error) {
      console.error('Auth loading error:', error);
      await handleLogout();
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setUser(null);
    setIsAuthenticated(false);
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('token');
    await api.removeToken();
  };

  const login = async (identifier: string, password: string) => {
    try {
      const response = await authService.login(identifier, password);
      const { user, token } = response.data;

      await AsyncStorage.setItem('user', JSON.stringify(user));
      await AsyncStorage.setItem('token', token);
      setUser(user);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      await handleLogout();
      throw error;
    }
  };

  type RegisterData = {
    name?: string;
    email?: string;
    phone?: string;
    password: string;
  };

  const validateRegistration = (data: RegisterData) => {
    if (!data.password) {
      throw new Error('Password is required');
    }

    if (!data.email && !data.phone) {
      throw new Error('Either email or phone number is required');
    }

    return true;
  };

  const register = async (data: RegisterData) => {
    try {
      validateRegistration(data);
      const response = await authService.register(data);
      const { user, token } = response.data;

      await AsyncStorage.setItem('user', JSON.stringify(user));
      await AsyncStorage.setItem('token', token);
      setUser(user);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      await handleLogout();
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      await handleLogout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
      }}>
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
