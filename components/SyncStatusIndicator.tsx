import React from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNetwork } from '../contexts/NetworkContext';
import { COLORS, SPACING } from '../constants/theme';
// Import formatDistanceToNow function
let formatDistanceToNow: (date: Date | number, options?: { addSuffix?: boolean }) => string;
try {
  // Try to import from date-fns
  formatDistanceToNow = require('date-fns').formatDistanceToNow;
} catch (error) {
  // Fallback implementation if date-fns is not available
  formatDistanceToNow = (date: Date | number, options?: { addSuffix?: boolean }): string => {
    const now = new Date();
    const dateObj = date instanceof Date ? date : new Date(date);
    const diffMs = now.getTime() - dateObj.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    let result = '';
    if (diffDay > 0) {
      result = `${diffDay} day${diffDay > 1 ? 's' : ''}`;
    } else if (diffHour > 0) {
      result = `${diffHour} hour${diffHour > 1 ? 's' : ''}`;
    } else if (diffMin > 0) {
      result = `${diffMin} minute${diffMin > 1 ? 's' : ''}`;
    } else {
      result = 'a few seconds';
    }

    return options?.addSuffix ? `${result} ago` : result;
  };
}
import { useLanguage } from '../contexts/LanguageContext';

interface SyncStatusIndicatorProps {
  showDetails?: boolean;
  onPress?: () => void;
}

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  showDetails = false,
  onPress
}) => {
  const { isOnline, isSyncing, lastSyncTime, syncStats, syncNow, hasPendingChanges } = useNetwork();
  const { t } = useLanguage();

  // Determine icon and color based on sync status
  const getStatusIcon = () => {
    if (!isOnline) {
      return {
        name: 'wifi-off',
        color: COLORS.error
      };
    }

    if (isSyncing) {
      return {
        name: 'sync',
        color: COLORS.primary
      };
    }

    if (hasPendingChanges) {
      return {
        name: 'sync-alert',
        color: COLORS.warning
      };
    }

    return {
      name: 'check-circle',
      color: COLORS.success
    };
  };

  const getStatusText = () => {
    if (!isOnline) return t('offline');
    if (isSyncing) return t('syncing');
    if (hasPendingChanges) return t('pendingChanges');
    return t('allChangesSynced');
  };

  const getLastSyncText = () => {
    if (!lastSyncTime) return t('neverSynced');

    try {
      return t('lastSynced', {
        time: formatDistanceToNow(lastSyncTime, { addSuffix: true })
      });
    } catch (error) {
      return t('lastSyncUnknown');
    }
  };

  const statusIcon = getStatusIcon();

  // Compact version (just an icon)
  if (!showDetails) {
    return (
      <Pressable
        style={styles.iconContainer}
        onPress={onPress || (hasPendingChanges && isOnline ? syncNow : undefined)}
      >
        {isSyncing ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <MaterialCommunityIcons
            name={statusIcon.name as any}
            size={24}
            color={statusIcon.color}
          />
        )}
        {hasPendingChanges && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{syncStats.pendingCount}</Text>
          </View>
        )}
      </Pressable>
    );
  }

  // Detailed version
  return (
    <Pressable
      style={styles.container}
      onPress={onPress || (hasPendingChanges && isOnline ? syncNow : undefined)}
    >
      <View style={styles.iconSection}>
        {isSyncing ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <MaterialCommunityIcons
            name={statusIcon.name as any}
            size={24}
            color={statusIcon.color}
          />
        )}
      </View>

      <View style={styles.textSection}>
        <Text style={styles.statusText}>{getStatusText()}</Text>
        <Text style={styles.lastSyncText}>{getLastSyncText()}</Text>
      </View>

      {hasPendingChanges && isOnline && !isSyncing && (
        <Pressable style={styles.syncButton} onPress={syncNow}>
          <MaterialCommunityIcons name="sync" size={16} color={COLORS.white} />
          <Text style={styles.syncButtonText}>{t('syncNow')}</Text>
        </Pressable>
      )}

      {isSyncing && syncStats.progress > 0 && (
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              { width: `${syncStats.progress}%` }
            ]}
          />
          <Text style={styles.progressText}>{syncStats.progress}%</Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary,
    borderRadius: 8,
    padding: SPACING.sm,
    marginVertical: SPACING.xs,
  },
  iconContainer: {
    position: 'relative',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconSection: {
    marginRight: SPACING.sm,
  },
  textSection: {
    flex: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  lastSyncText: {
    fontSize: 12,
    color: COLORS.gray[500],
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 4,
  },
  syncButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: COLORS.gray[200],
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  progressText: {
    position: 'absolute',
    right: 4,
    top: -16,
    fontSize: 10,
    color: COLORS.gray[500],
  },
});
