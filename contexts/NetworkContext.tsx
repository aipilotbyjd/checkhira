
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { offlineSync, syncEvents, SyncEventType } from '../services/offlineSync';

interface SyncStats {
  pendingCount: number;
  failedCount: number;
  lastSyncTime: number;
  lastSyncStatus: string;
  progress: number;
}

interface NetworkContextType {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  syncStats: SyncStats;
  syncNow: () => Promise<boolean>;
  hasPendingChanges: boolean;
}

const NetworkContext = createContext<NetworkContextType>({
  isOnline: true,
  isSyncing: false,
  lastSyncTime: null,
  syncStats: {
    pendingCount: 0,
    failedCount: 0,
    lastSyncTime: 0,
    lastSyncStatus: 'success',
    progress: 0
  },
  syncNow: async () => false,
  hasPendingChanges: false
});

export const NetworkProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStats, setSyncStats] = useState<SyncStats>({
    pendingCount: 0,
    failedCount: 0,
    lastSyncTime: 0,
    lastSyncStatus: 'success',
    progress: 0
  });
  const [hasPendingChanges, setHasPendingChanges] = useState(false);

  // Initialize the offline sync service
  useEffect(() => {
    const initializeSync = async () => {
      await offlineSync.initialize();
      await refreshSyncStats();
    };

    initializeSync();
  }, []);

  // Set up network change listener
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const online = state.isConnected && state.isInternetReachable !== false; // treat null as online
      setIsOnline(!!online);

      if (online && syncStats.pendingCount > 0 && !isSyncing) {
        syncNow();
      }
    });

    return () => unsubscribe();
  }, [syncStats.pendingCount, isSyncing]);

  // Set up sync event listeners
  useEffect(() => {
    const onSyncStarted = () => {
      setIsSyncing(true);
      setSyncProgress(0);
    };

    const onSyncProgress = (data: { percentComplete: number }) => {
      setSyncProgress(data.percentComplete);
    };

    const onSyncCompleted = () => {
      setIsSyncing(false);
      setLastSyncTime(new Date());
      refreshSyncStats();
    };

    const onSyncFailed = () => {
      setIsSyncing(false);
      refreshSyncStats();
    };

    const onActionQueued = () => {
      setHasPendingChanges(true);
      refreshSyncStats();
    };

    // Register event listeners
    syncEvents.on(SyncEventType.SYNC_STARTED, onSyncStarted);
    syncEvents.on(SyncEventType.SYNC_PROGRESS, onSyncProgress);
    syncEvents.on(SyncEventType.SYNC_COMPLETED, onSyncCompleted);
    syncEvents.on(SyncEventType.SYNC_FAILED, onSyncFailed);
    syncEvents.on(SyncEventType.ACTION_QUEUED, onActionQueued);

    // Clean up event listeners
    return () => {
      syncEvents.off(SyncEventType.SYNC_STARTED, onSyncStarted);
      syncEvents.off(SyncEventType.SYNC_PROGRESS, onSyncProgress);
      syncEvents.off(SyncEventType.SYNC_COMPLETED, onSyncCompleted);
      syncEvents.off(SyncEventType.SYNC_FAILED, onSyncFailed);
      syncEvents.off(SyncEventType.ACTION_QUEUED, onActionQueued);
    };
  }, []);

  // Refresh sync stats from the service
  const refreshSyncStats = useCallback(async () => {
    try {
      const status = await offlineSync.getSyncStatus();
      setSyncStats({
        pendingCount: status.pendingCount,
        failedCount: status.failedCount,
        lastSyncTime: status.lastSyncTime,
        lastSyncStatus: status.lastSyncStatus,
        progress: syncProgress
      });
      setHasPendingChanges(status.pendingCount > 0);
    } catch (error) {
      console.error('Failed to refresh sync stats:', error);
    }
  }, [syncProgress]);

  // Manually trigger sync
  const syncNow = useCallback(async (): Promise<boolean> => {
    if (isSyncing || !isOnline) return false;

    try {
      const result = await offlineSync.syncWithServer();
      if (result) {
        await offlineSync.clearSyncedData();
      }
      return result;
    } catch (error) {
      console.error('Sync failed:', error);
      return false;
    }
  }, [isSyncing, isOnline]);

  // Periodically refresh sync stats
  useEffect(() => {
    const intervalId = setInterval(() => {
      refreshSyncStats();
    }, 30000); // Every 30 seconds

    return () => clearInterval(intervalId);
  }, [refreshSyncStats]);

  return (
    <NetworkContext.Provider
      value={{
        isOnline,
        isSyncing,
        lastSyncTime,
        syncStats: {
          ...syncStats,
          progress: syncProgress
        },
        syncNow,
        hasPendingChanges
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => useContext(NetworkContext);
