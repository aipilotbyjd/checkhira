
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

const PENDING_ACTIONS_KEY = 'pending_actions';
const OFFLINE_DATA_KEY = 'offline_data';

interface PendingAction {
  id: string;
  type: 'work' | 'payment';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
}

export const offlineSync = {
  async savePendingAction(action: PendingAction) {
    const pending = await this.getPendingActions();
    pending.push(action);
    await AsyncStorage.setItem(PENDING_ACTIONS_KEY, JSON.stringify(pending));
  },

  async getPendingActions(): Promise<PendingAction[]> {
    const actions = await AsyncStorage.getItem(PENDING_ACTIONS_KEY);
    return actions ? JSON.parse(actions) : [];
  },

  async syncWithServer() {
    const pending = await this.getPendingActions();
    const failedActions = [];

    for (const action of pending) {
      try {
        const endpoint = `/${action.type}s${action.action === 'create' ? '' : `/${action.data.id}`}`;
        const method = action.action === 'create' ? 'post' : action.action === 'update' ? 'put' : 'delete';
        
        await api.request(endpoint, {
          method,
          data: action.data
        });
      } catch (error) {
        failedActions.push(action);
      }
    }

    await AsyncStorage.setItem(PENDING_ACTIONS_KEY, JSON.stringify(failedActions));
    return failedActions.length === 0;
  }
};
