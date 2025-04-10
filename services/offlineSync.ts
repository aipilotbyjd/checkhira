
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';
import NetInfo from '@react-native-community/netinfo';

const PENDING_ACTIONS_KEY = 'pending_actions';
const OFFLINE_DATA_KEY = 'offline_data';

interface PendingAction {
  id: string;
  type: 'work' | 'payment';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  retryCount?: number;
}

export const offlineSync = {
  async savePendingAction(action: PendingAction) {
    try {
      // Save to local storage first
      await this.saveToLocalStorage(action);
      
      // Try to sync immediately if online
      const networkState = await NetInfo.fetch();
      if (networkState.isConnected) {
        await this.syncWithServer();
      }
    } catch (error) {
      console.error('Error in savePendingAction:', error);
    }
  },

  async saveToLocalStorage(action: PendingAction) {
    const pending = await this.getPendingActions();
    pending.push(action);
    await AsyncStorage.setItem(PENDING_ACTIONS_KEY, JSON.stringify(pending));
    
    // Also save the data separately for quick access
    const offlineData = await this.getOfflineData();
    if (action.action !== 'delete') {
      offlineData[action.type] = offlineData[action.type] || {};
      offlineData[action.type][action.data.id] = action.data;
    } else {
      if (offlineData[action.type]?.[action.data.id]) {
        delete offlineData[action.type][action.data.id];
      }
    }
    await AsyncStorage.setItem(OFFLINE_DATA_KEY, JSON.stringify(offlineData));
  },

  async getPendingActions(): Promise<PendingAction[]> {
    const actions = await AsyncStorage.getItem(PENDING_ACTIONS_KEY);
    return actions ? JSON.parse(actions) : [];
  },

  async getOfflineData(): Promise<Record<string, Record<string, any>>> {
    const data = await AsyncStorage.getItem(OFFLINE_DATA_KEY);
    return data ? JSON.parse(data) : {};
  },

  async syncWithServer() {
    const pending = await this.getPendingActions();
    const failedActions = [];
    let syncSuccess = true;

    for (const action of pending) {
      try {
        const endpoint = `/${action.type}s${action.action === 'create' ? '' : `/${action.data.id}`}`;
        const method = action.action === 'create' ? 'post' : action.action === 'update' ? 'put' : 'delete';
        
        await api.request(endpoint, {
          method,
          data: action.action !== 'delete' ? action.data : undefined
        });
      } catch (error) {
        syncSuccess = false;
        action.retryCount = (action.retryCount || 0) + 1;
        if (action.retryCount < 3) { // Only keep actions that haven't exceeded retry limit
          failedActions.push(action);
        }
      }
    }

    await AsyncStorage.setItem(PENDING_ACTIONS_KEY, JSON.stringify(failedActions));
    return syncSuccess;
  },

  async clearSyncedData() {
    const pending = await this.getPendingActions();
    if (pending.length === 0) {
      await AsyncStorage.removeItem(OFFLINE_DATA_KEY);
    }
  }
};
