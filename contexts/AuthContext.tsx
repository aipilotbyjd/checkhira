import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  profile_image?: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (userData: User) => {
    setUser(userData);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      // Check if user was signed in with Google
      await GoogleSignin.hasPlayServices();
      const isSignedIn = await GoogleSignin.getCurrentUser();
      if (isSignedIn) {
        await GoogleSignin.signOut();
      }
      
      // Regular logout
      setUser(null);
      await AsyncStorage.removeItem('user');
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const refreshUser = async () => {
    // Implement if your backend supports refreshing user data
    // For example, fetch the latest user profile
    if (user?.token) {
      try {
        const response = await profileService.getProfile();
        if (response.status) {
          setUser(response.data);
          await AsyncStorage.setItem('user', JSON.stringify(response.data));
        }
      } catch (error) {
        console.error('Failed to refresh user:', error);
      }
    }
  };

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
