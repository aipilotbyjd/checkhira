
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './axiosClient';
import NetInfo from '@react-native-community/netinfo';

// Simple EventEmitter implementation for React Native
class EventEmitter {
  private listeners: Record<string, Array<(data?: any) => void>> = {};

  on(event: string, listener: (data?: any) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }

  off(event: string, listener: (data?: any) => void): void {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(l => l !== listener);
  }

  emit(event: string, data?: any): void {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  removeAllListeners(event?: string): void {
    if (event) {
      delete this.listeners[event];
    } else {
      this.listeners = {};
    }
  }
}

// Storage keys
const PENDING_ACTIONS_KEY = 'pending_actions';
const OFFLINE_DATA_KEY = 'offline_data';
const SYNC_METADATA_KEY = 'sync_metadata';

// Event types
export enum SyncEventType {
  SYNC_STARTED = 'sync_started',
  SYNC_COMPLETED = 'sync_completed',
  SYNC_FAILED = 'sync_failed',
  SYNC_PROGRESS = 'sync_progress',
  ACTION_QUEUED = 'action_queued',
  ACTION_PROCESSED = 'action_processed',
  ACTION_FAILED = 'action_failed',
  CONFLICT_DETECTED = 'conflict_detected'
}

// Sync metadata
interface SyncMetadata {
  lastSyncTime: number;
  lastSyncStatus: 'success' | 'partial' | 'failed';
  deviceId: string;
  pendingCount: number;
  failedCount: number;
  version: number;
}

// Conflict resolution strategies
export enum ConflictStrategy {
  CLIENT_WINS = 'client_wins',
  SERVER_WINS = 'server_wins',
  MANUAL_RESOLUTION = 'manual_resolution'
}

// Pending action interface with improved typing
export interface PendingAction<T = any> {
  id: string;
  syncId: string; // Unique ID for this sync action
  type: 'work' | 'payment' | 'profile' | 'settings';
  action: 'create' | 'update' | 'delete';
  data: T;
  timestamp: number;
  retryCount: number;
  lastAttempt?: number;
  error?: string;
  conflictData?: any;
  conflictResolved?: boolean;
  priority: number; // Higher priority actions sync first
  version: number; // For conflict detection
  deviceId: string; // To identify which device made the change
}

// Create a singleton event emitter for sync events
class SyncEventEmitter extends EventEmitter {
  private static instance: SyncEventEmitter;

  private constructor() {
    super();
  }

  public static getInstance(): SyncEventEmitter {
    if (!SyncEventEmitter.instance) {
      SyncEventEmitter.instance = new SyncEventEmitter();
    }
    return SyncEventEmitter.instance;
  }
}

export const syncEvents = SyncEventEmitter.getInstance();

// Generate a unique device ID if not already stored
async function getDeviceId(): Promise<string> {
  let deviceId = await AsyncStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    await AsyncStorage.setItem('device_id', deviceId);
  }
  return deviceId;
}

// Enhanced offline sync service
class OfflineSyncService {
  private isSyncing: boolean = false;
  private syncTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private maxRetries: number = 5;
  private defaultConflictStrategy: ConflictStrategy = ConflictStrategy.SERVER_WINS;
  private batchSize: number = 10; // Process actions in batches

  // Initialize sync metadata
  private async initSyncMetadata(): Promise<void> {
    const metadata = await this.getSyncMetadata();
    if (!metadata) {
      const deviceId = await getDeviceId();
      const initialMetadata: SyncMetadata = {
        lastSyncTime: 0,
        lastSyncStatus: 'success',
        deviceId,
        pendingCount: 0,
        failedCount: 0,
        version: 1
      };
      await AsyncStorage.setItem(SYNC_METADATA_KEY, JSON.stringify(initialMetadata));
    }
  }

  // Get sync metadata
  private async getSyncMetadata(): Promise<SyncMetadata | null> {
    const data = await AsyncStorage.getItem(SYNC_METADATA_KEY);
    return data ? JSON.parse(data) : null;
  }

  // Update sync metadata
  private async updateSyncMetadata(updates: Partial<SyncMetadata>): Promise<SyncMetadata> {
    const current = await this.getSyncMetadata() || {
      lastSyncTime: 0,
      lastSyncStatus: 'success' as const,
      deviceId: await getDeviceId(),
      pendingCount: 0,
      failedCount: 0,
      version: 1
    };

    const updated = { ...current, ...updates };
    await AsyncStorage.setItem(SYNC_METADATA_KEY, JSON.stringify(updated));
    return updated;
  }

  // Queue a new action for sync
  public async queueAction<T>(action: Omit<PendingAction<T>, 'syncId' | 'retryCount' | 'timestamp' | 'deviceId' | 'version' | 'priority'>): Promise<string> {
    try {
      const deviceId = await getDeviceId();
      const syncId = `${action.type}_${action.id}_${Date.now()}`;

      // Create full action object with metadata
      const fullAction: PendingAction<T> = {
        ...action as any,
        syncId,
        retryCount: 0,
        timestamp: Date.now(),
        deviceId,
        version: 1,
        priority: this.getPriorityForAction(action.type, action.action)
      };

      // Save to local storage
      await this.saveActionToStorage(fullAction);

      // Update metadata
      await this.updateSyncMetadata({
        pendingCount: (await this.getPendingActions()).length
      });

      // Emit event
      syncEvents.emit(SyncEventType.ACTION_QUEUED, {
        action: fullAction,
        pendingCount: (await this.getPendingActions()).length
      });

      // Try to sync if online
      const networkState = await NetInfo.fetch();
      if (networkState.isConnected && !this.isSyncing) {
        this.scheduleSyncWithServer();
      }

      return syncId;
    } catch (error) {
      console.error('Error in queueAction:', error);
      throw error;
    }
  }

  // Determine priority for different action types
  private getPriorityForAction(type: string, action: string): number {
    // Higher number = higher priority
    if (type === 'profile') return 100; // Profile changes highest priority
    if (action === 'create') return 80; // Creates before updates
    if (action === 'update') return 60; // Updates before deletes
    if (action === 'delete') return 40; // Deletes lowest priority
    return 50; // Default priority
  }

  // Save action to storage
  private async saveActionToStorage<T>(action: PendingAction<T>): Promise<void> {
    // Get existing actions
    const actions = await this.getPendingActions();

    // Check for duplicates (same entity and action type)
    const existingIndex = actions.findIndex(a =>
      a.id === action.id && a.type === action.type && a.action === action.action
    );

    if (existingIndex >= 0) {
      // Replace existing action
      actions[existingIndex] = action;
    } else {
      // Add new action
      actions.push(action);
    }

    // Sort by priority (higher first) and then by timestamp (older first)
    actions.sort((a, b) => {
      if (a.priority !== b.priority) return b.priority - a.priority;
      return a.timestamp - b.timestamp;
    });

    // Save to AsyncStorage
    await AsyncStorage.setItem(PENDING_ACTIONS_KEY, JSON.stringify(actions));

    // Also update the offline data cache for quick access
    await this.updateOfflineDataCache(action);
  }

  // Update offline data cache
  private async updateOfflineDataCache<T>(action: PendingAction<T>): Promise<void> {
    const offlineData = await this.getOfflineData();

    // Initialize type object if it doesn't exist
    offlineData[action.type] = offlineData[action.type] || {};

    if (action.action === 'delete') {
      // Remove from cache if it's a delete action
      if (offlineData[action.type][action.id]) {
        delete offlineData[action.type][action.id];
      }
    } else {
      // Add or update in cache
      offlineData[action.type][action.id] = {
        ...action.data,
        _syncMetadata: {
          syncId: action.syncId,
          timestamp: action.timestamp,
          version: action.version,
          action: action.action
        }
      };
    }

    await AsyncStorage.setItem(OFFLINE_DATA_KEY, JSON.stringify(offlineData));
  }

  // Get all pending actions
  public async getPendingActions<T = any>(): Promise<PendingAction<T>[]> {
    try {
      const data = await AsyncStorage.getItem(PENDING_ACTIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting pending actions:', error);
      return [];
    }
  }

  // Get offline data cache
  public async getOfflineData(): Promise<Record<string, Record<string, any>>> {
    try {
      const data = await AsyncStorage.getItem(OFFLINE_DATA_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error getting offline data:', error);
      return {};
    }
  }

  // Get offline data for a specific type
  public async getOfflineDataByType<T>(type: string): Promise<Record<string, T>> {
    const allData = await this.getOfflineData();
    return (allData[type] || {}) as Record<string, T>;
  }

  // Get a specific offline entity
  public async getOfflineEntity<T>(type: string, id: string): Promise<T | null> {
    const typeData = await this.getOfflineDataByType<T>(type);
    return typeData[id] || null;
  }

  // Schedule sync with exponential backoff
  private scheduleSyncWithServer(): void {
    if (this.syncTimeoutId) {
      clearTimeout(this.syncTimeoutId);
    }

    this.syncTimeoutId = setTimeout(() => {
      this.syncWithServer();
    }, 100); // Start almost immediately
  }

  // Sync with server
  public async syncWithServer(): Promise<boolean> {
    if (this.isSyncing) return false;

    try {
      this.isSyncing = true;
      syncEvents.emit(SyncEventType.SYNC_STARTED);

      const allActions = await this.getPendingActions();
      if (allActions.length === 0) {
        syncEvents.emit(SyncEventType.SYNC_COMPLETED, { success: true, processed: 0, failed: 0 });
        return true;
      }

      // Process in batches for better performance and UX
      const batches = this.createBatches(allActions, this.batchSize);
      let processedCount = 0;
      let failedCount = 0;
      let overallSuccess = true;

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        const batchResult = await this.processBatch(batch);

        processedCount += batchResult.processed;
        failedCount += batchResult.failed;

        if (!batchResult.success) {
          overallSuccess = false;
        }

        // Emit progress event
        syncEvents.emit(SyncEventType.SYNC_PROGRESS, {
          currentBatch: i + 1,
          totalBatches: batches.length,
          processed: processedCount,
          failed: failedCount,
          total: allActions.length,
          percentComplete: Math.round((processedCount + failedCount) / allActions.length * 100)
        });

        // Check if we should continue syncing
        const networkState = await NetInfo.fetch();
        if (!networkState.isConnected) {
          syncEvents.emit(SyncEventType.SYNC_FAILED, { reason: 'network_disconnected' });
          return false;
        }
      }

      // Update metadata
      const remainingActions = await this.getPendingActions();
      await this.updateSyncMetadata({
        lastSyncTime: Date.now(),
        lastSyncStatus: overallSuccess ? 'success' : remainingActions.length > 0 ? 'partial' : 'success',
        pendingCount: remainingActions.length,
        failedCount: remainingActions.filter(a => a.retryCount > 0).length
      });

      // Emit completion event
      syncEvents.emit(SyncEventType.SYNC_COMPLETED, {
        success: overallSuccess,
        processed: processedCount,
        failed: failedCount,
        remaining: remainingActions.length
      });

      return overallSuccess;
    } catch (error) {
      console.error('Error in syncWithServer:', error);
      syncEvents.emit(SyncEventType.SYNC_FAILED, { reason: 'unexpected_error', error });
      return false;
    } finally {
      this.isSyncing = false;
    }
  }

  // Create batches from actions array
  private createBatches<T>(actions: T[], size: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < actions.length; i += size) {
      batches.push(actions.slice(i, i + size));
    }
    return batches;
  }

  // Process a batch of actions
  private async processBatch(batch: PendingAction[]): Promise<{ success: boolean, processed: number, failed: number }> {
    let processed = 0;
    let failed = 0;
    let batchSuccess = true;

    // Get current pending actions (might have changed since we started)
    const currentActions = await this.getPendingActions();
    const remainingActions = [...currentActions];

    for (const action of batch) {
      try {
        // Check if action still exists (might have been processed by another sync)
        const actionIndex = remainingActions.findIndex(a => a.syncId === action.syncId);
        if (actionIndex === -1) continue;

        // Process the action
        const success = await this.processAction(action);

        if (success) {
          // Remove from remaining actions
          remainingActions.splice(actionIndex, 1);
          processed++;

          // Emit event
          syncEvents.emit(SyncEventType.ACTION_PROCESSED, { action });
        } else {
          // Update retry count and last attempt
          const updatedAction = {
            ...action,
            retryCount: action.retryCount + 1,
            lastAttempt: Date.now()
          };

          // Check if we've exceeded max retries
          if (updatedAction.retryCount >= this.maxRetries) {
            // Remove from remaining actions if max retries exceeded
            remainingActions.splice(actionIndex, 1);
            failed++;

            // Emit event
            syncEvents.emit(SyncEventType.ACTION_FAILED, {
              action: updatedAction,
              reason: 'max_retries_exceeded'
            });
          } else {
            // Update the action with new retry count
            remainingActions[actionIndex] = updatedAction;
            batchSuccess = false;
            failed++;

            // Emit event
            syncEvents.emit(SyncEventType.ACTION_FAILED, {
              action: updatedAction,
              reason: 'temporary_failure',
              willRetry: true
            });
          }
        }
      } catch (error) {
        console.error('Error processing action:', error, action);
        batchSuccess = false;
        failed++;
      }
    }

    // Save updated actions list
    await AsyncStorage.setItem(PENDING_ACTIONS_KEY, JSON.stringify(remainingActions));

    return { success: batchSuccess, processed, failed };
  }

  // Process a single action
  private async processAction(action: PendingAction): Promise<boolean> {
    try {
      // Construct endpoint based on action type and action
      const endpoint = `/${action.type}s${action.action === 'create' ? '' : `/${action.id}`}`;

      // Determine HTTP method
      const method = action.action === 'create' ? 'post' : action.action === 'update' ? 'put' : 'delete';

      // Add version and device ID for conflict detection
      const dataWithMetadata = action.action !== 'delete' ? {
        ...action.data,
        _version: action.version,
        _deviceId: action.deviceId
      } : undefined;

      // Make API request
      const response = await api.request(endpoint, {
        method,
        data: dataWithMetadata
      });

      // Handle potential conflicts
      if (response && response.conflict) {
        return await this.handleConflict(action, response.serverData);
      }

      return true;
    } catch (error: any) {
      // Check for specific error types
      if (error.status === 409) {
        // Conflict detected by server
        return await this.handleConflict(action, error.data);
      }

      // For network errors or server errors, we'll retry
      if (error.status >= 500 || !error.status) {
        return false; // Will be retried
      }

      // For client errors (4xx except 409), we won't retry
      if (error.status >= 400 && error.status < 500 && error.status !== 409) {
        // Add error information to the action
        action.error = error.message || 'Client error';
        return true; // Mark as processed but log the error
      }

      return false;
    }
  }

  // Handle data conflicts
  private async handleConflict(action: PendingAction, serverData: any): Promise<boolean> {
    // Store conflict data
    action.conflictData = serverData;

    // Emit conflict event
    syncEvents.emit(SyncEventType.CONFLICT_DETECTED, {
      action,
      serverData,
      clientData: action.data
    });

    // Apply conflict resolution strategy
    switch (this.defaultConflictStrategy) {
      case ConflictStrategy.SERVER_WINS:
        // Accept server version and remove our action
        action.conflictResolved = true;
        return true;

      case ConflictStrategy.CLIENT_WINS:
        // Force our changes by incrementing version and retrying
        action.version += 1;
        action.retryCount = 0; // Reset retry count
        await this.saveActionToStorage(action);
        return false; // Will be retried with higher version

      case ConflictStrategy.MANUAL_RESOLUTION:
        // Mark as unresolved, will require manual intervention
        action.conflictResolved = false;
        return false;
    }
  }

  // Clear synced data
  public async clearSyncedData(): Promise<void> {
    const pending = await this.getPendingActions();
    if (pending.length === 0) {
      await AsyncStorage.removeItem(OFFLINE_DATA_KEY);
      await this.updateSyncMetadata({
        pendingCount: 0,
        failedCount: 0
      });
    }
  }

  // Get sync status
  public async getSyncStatus(): Promise<{
    pendingCount: number;
    failedCount: number;
    lastSyncTime: number;
    lastSyncStatus: string;
    isSyncing: boolean;
  }> {
    const metadata = await this.getSyncMetadata() || {
      lastSyncTime: 0,
      lastSyncStatus: 'success',
      pendingCount: 0,
      failedCount: 0,
      version: 1,
      deviceId: await getDeviceId()
    };

    return {
      pendingCount: metadata.pendingCount,
      failedCount: metadata.failedCount,
      lastSyncTime: metadata.lastSyncTime,
      lastSyncStatus: metadata.lastSyncStatus,
      isSyncing: this.isSyncing
    };
  }

  // Initialize the service
  public async initialize(): Promise<void> {
    await this.initSyncMetadata();

    // Set up network change listener
    NetInfo.addEventListener(state => {
      if (state.isConnected && !this.isSyncing) {
        this.scheduleSyncWithServer();
      }
    });
  }
}

// Export singleton instance
export const offlineSync = new OfflineSyncService();
