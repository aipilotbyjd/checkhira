
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

const PENDING_OPERATIONS_KEY = 'pending_operations';

interface PendingOperation {
  id: string;
  type: 'work' | 'payment';
  operation: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
}

export const syncService = {
  async addPendingOperation(
    type: 'work' | 'payment',
    operation: 'create' | 'update' | 'delete',
    data: any
  ) {
    try {
      const pendingOp: PendingOperation = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        operation,
        data,
        timestamp: Date.now(),
      };

      const existingOps = await this.getPendingOperations();
      existingOps.push(pendingOp);
      await AsyncStorage.setItem(PENDING_OPERATIONS_KEY, JSON.stringify(existingOps));
      
      // Attempt immediate sync
      this.syncPendingOperations();
      
      return pendingOp.id;
    } catch (error) {
      console.error('Error adding pending operation:', error);
      throw error;
    }
  },

  async getPendingOperations(): Promise<PendingOperation[]> {
    try {
      const ops = await AsyncStorage.getItem(PENDING_OPERATIONS_KEY);
      return ops ? JSON.parse(ops) : [];
    } catch (error) {
      console.error('Error getting pending operations:', error);
      return [];
    }
  },

  async syncPendingOperations() {
    try {
      const operations = await this.getPendingOperations();
      const completedOps: string[] = [];

      for (const op of operations) {
        try {
          const endpoint = `/${op.type}s${op.operation === 'create' ? '' : `/${op.data.id}`}`;
          const method = {
            create: 'post',
            update: 'put',
            delete: 'delete'
          }[op.operation];

          await api.request(endpoint, {
            method,
            data: op.operation !== 'delete' ? op.data : undefined
          });

          completedOps.push(op.id);
        } catch (error) {
          console.error(`Failed to sync operation ${op.id}:`, error);
        }
      }

      // Remove completed operations
      if (completedOps.length > 0) {
        const remainingOps = operations.filter(op => !completedOps.includes(op.id));
        await AsyncStorage.setItem(PENDING_OPERATIONS_KEY, JSON.stringify(remainingOps));
      }
    } catch (error) {
      console.error('Error during sync:', error);
      throw error;
    }
  }
};
