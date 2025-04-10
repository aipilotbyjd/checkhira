
import React, { createContext, useContext, useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { offlineSync } from '../services/offlineSync';

interface NetworkContextType {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
}

const NetworkContext = createContext<NetworkContextType>({
  isOnline: true,
  isSyncing: false,
  lastSyncTime: null
});

export const NetworkProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const online = state.isConnected && state.isInternetReachable;
      setIsOnline(!!online);
      
      if (online) {
        syncData();
      }
    });

    return () => unsubscribe();
  }, []);

  const syncData = async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    try {
      const syncSuccess = await offlineSync.syncWithServer();
      if (syncSuccess) {
        await offlineSync.clearSyncedData();
      }
      setLastSyncTime(new Date());
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <NetworkContext.Provider value={{ isOnline, isSyncing, lastSyncTime }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => useContext(NetworkContext);
