import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';
import { api } from '../services/api';
import { User } from '../types/user';
import * as SecureStore from 'expo-secure-store';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<any>;
  register: (data: User) => Promise<any>;
  logout: () => Promise<void>;
  googleLogin: (idToken: string, userData: any) => Promise<any>;
}

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

  const validateRegistration = (data: User) => {
    if (!data.password) {
      throw new Error('Password is required');
    }

    if (!data.email && !data.phone) {
      throw new Error('Either email or phone number is required');
    }

    return true;
  };

  const register = async (data: User) => {
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

  const googleLogin = async (idToken: string, userData: any) => {
    try {
      // Call the backend with Google ID token
      const response = await authService.googleLogin(idToken);
      const { user, token } = response.data;

      await AsyncStorage.setItem('user', JSON.stringify(user));
      await AsyncStorage.setItem('token', token);
      setUser(user);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      // If the backend call fails, we can create a user from Google data
      // or handle the error appropriately
      console.error('Google login error:', error);
      await handleLogout();
      throw error;
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
        googleLogin,
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

async function saveToken(key: string, value: string) {
  await SecureStore.setItemAsync(key, value);
}

async function getToken(key: string) {
  return await SecureStore.getItemAsync(key);
}

async function removeToken(key: string) {
  await SecureStore.deleteItemAsync(key);
}
