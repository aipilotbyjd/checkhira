import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { COLORS } from '../constants/theme';
import { authService } from '../services/authService';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/google-login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (isAuthenticated) {
        const isValid = await authService.checkAuth();
        if (!isValid) {
          router.replace('/auth/google-login');
        }
      }
    }, 300000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return isAuthenticated ? children : null;
}
