import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { useLanguage } from '../contexts/LanguageContext';
import { useNetwork } from '../contexts/NetworkContext';

export const OfflineScreen = () => {
  const { t } = useLanguage();
  const { syncNow, syncStats, hasPendingChanges } = useNetwork();
  const [isRetrying, setIsRetrying] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Fade in animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await syncNow();
    } catch (error) {
      console.error('Failed to retry connection:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.content}>
        <MaterialCommunityIcons
          name="wifi-off"
          size={80}
          color={COLORS.primary}
        />
        <Text style={styles.title}>
          {t('noInternet')}
        </Text>
        <Text style={styles.message}>
          {t('checkConnection')}
        </Text>

        {hasPendingChanges && (
          <View style={styles.pendingContainer}>
            <Text style={styles.pendingText}>
              {t('pendingChanges', { count: syncStats.pendingCount })}
            </Text>
            <Text style={styles.pendingDescription}>
              {t('changesWillSync')}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.retryButton}
          onPress={handleRetry}
          disabled={isRetrying}
        >
          {isRetrying ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.retryText}>{t('retry')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    maxWidth: 320,
  },
  title: {
    marginTop: 24,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: COLORS.secondary,
  },
  message: {
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
    color: COLORS.gray[400],
    lineHeight: 22,
  },
  pendingContainer: {
    marginTop: 32,
    padding: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary + '15',
    width: '100%',
  },
  pendingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
  },
  pendingDescription: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.gray[600],
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 32,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 150,
    alignItems: 'center',
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
