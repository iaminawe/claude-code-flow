/**
 * TaskMaster Status Synchronization Service
 * Keeps TaskMaster and Orchestrator task statuses in sync
 */

import { EventEmitter } from '../../cli/commands/start/event-emitter.ts';
import { TaskMasterDenoBridge } from '../deno-bridge.ts';
import { TaskMasterOrchestratorAdapter } from '../adapters/orchestrator-adapter.ts';

export interface TaskStatusUpdate {
  taskId: string;
  status: string;
  timestamp: Date;
  source: 'taskmaster' | 'orchestrator';
  metadata?: Record<string, any>;
}

export interface SyncConflict {
  taskId: string;
  taskmasterStatus: string;
  orchestratorStatus: string;
  resolution: 'taskmaster' | 'orchestrator' | 'manual';
  timestamp: Date;
}

export interface SyncStatus {
  isActive: boolean;
  lastSync: Date | null;
  pendingUpdates: number;
  conflicts: number;
  syncedTasks: number;
  errors: string[];
}

export class TaskMasterStatusSync extends EventEmitter {
  private taskmaster: TaskMasterDenoBridge;
  private adapter: TaskMasterOrchestratorAdapter;
  private syncInterval?: number;
  private pendingUpdates: Map<string, TaskStatusUpdate> = new Map();
  private conflicts: Map<string, SyncConflict> = new Map();
  private syncStatus: SyncStatus;
  private isRunning: boolean = false;

  constructor(
    taskmaster?: TaskMasterDenoBridge,
    adapter?: TaskMasterOrchestratorAdapter
  ) {
    super();
    this.taskmaster = taskmaster || new TaskMasterDenoBridge();
    this.adapter = adapter || new TaskMasterOrchestratorAdapter();
    this.syncStatus = {
      isActive: false,
      lastSync: null,
      pendingUpdates: 0,
      conflicts: 0,
      syncedTasks: 0,
      errors: []
    };
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Listen for orchestrator task events
    this.on('orchestrator:task:completed', this.handleOrchestratorUpdate.bind(this));
    this.on('orchestrator:task:failed', this.handleOrchestratorUpdate.bind(this));
    this.on('orchestrator:task:started', this.handleOrchestratorUpdate.bind(this));
    
    // Listen for TaskMaster updates
    this.on('taskmaster:task:updated', this.handleTaskMasterUpdate.bind(this));
  }

  /**
   * Start automatic synchronization
   */
  startSync(intervalMs: number = 5000): void {
    if (this.isRunning) {
      console.warn('Status sync is already running');
      return;
    }

    this.isRunning = true;
    this.syncStatus.isActive = true;
    
    // Perform initial sync
    this.performSync().catch(err => {
      console.error('Initial sync failed:', err);
    });

    // Set up periodic sync
    this.syncInterval = setInterval(() => {
      this.performSync().catch(err => {
        console.error('Periodic sync failed:', err);
        this.syncStatus.errors.push(err.message);
      });
    }, intervalMs);

    this.emit('sync:started');
  }

  /**
   * Stop automatic synchronization
   */
  stopSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = undefined;
    }
    
    this.isRunning = false;
    this.syncStatus.isActive = false;
    this.emit('sync:stopped');
  }

  /**
   * Perform manual synchronization
   */
  async performSync(): Promise<void> {
    try {
      this.emit('sync:begin');
      
      // Process pending updates
      const updates = Array.from(this.pendingUpdates.values());
      for (const update of updates) {
        await this.processSyncUpdate(update);
        this.pendingUpdates.delete(update.taskId);
      }
      
      // Resolve conflicts
      const conflicts = Array.from(this.conflicts.values());
      for (const conflict of conflicts) {
        await this.resolveConflict(conflict);
        this.conflicts.delete(conflict.taskId);
      }
      
      // Update sync status
      this.syncStatus.lastSync = new Date();
      this.syncStatus.pendingUpdates = this.pendingUpdates.size;
      this.syncStatus.conflicts = this.conflicts.size;
      
      this.emit('sync:complete', {
        syncedCount: updates.length,
        conflictsResolved: conflicts.length
      });
      
    } catch (error) {
      this.emit('sync:error', error);
      throw error;
    }
  }

  /**
   * Process a single sync update
   */
  private async processSyncUpdate(update: TaskStatusUpdate): Promise<void> {
    try {
      if (update.source === 'orchestrator') {
        // Update TaskMaster with orchestrator status
        await this.taskmaster.updateTaskStatus(update.taskId, update.status);
        this.syncStatus.syncedTasks++;
      } else {
        // Update orchestrator with TaskMaster status
        // This would need implementation in the orchestrator
        console.log(`Would update orchestrator task ${update.taskId} to ${update.status}`);
      }
      
      this.emit('task:synced', {
        taskId: update.taskId,
        status: update.status,
        source: update.source
      });
      
    } catch (error) {
      console.error(`Failed to sync task ${update.taskId}:`, error);
      this.syncStatus.errors.push(`Sync failed for task ${update.taskId}: ${error}`);
    }
  }

  /**
   * Resolve a status conflict
   */
  private async resolveConflict(conflict: SyncConflict): Promise<void> {
    // Default resolution strategy: orchestrator wins
    const resolution = conflict.resolution || 'orchestrator';
    
    try {
      if (resolution === 'orchestrator') {
        // Update TaskMaster with orchestrator status
        await this.taskmaster.updateTaskStatus(
          conflict.taskId, 
          conflict.orchestratorStatus
        );
      } else if (resolution === 'taskmaster') {
        // Update orchestrator with TaskMaster status
        console.log(`Would update orchestrator task ${conflict.taskId} to ${conflict.taskmasterStatus}`);
      }
      
      this.emit('conflict:resolved', {
        taskId: conflict.taskId,
        resolution,
        finalStatus: resolution === 'orchestrator' ? 
          conflict.orchestratorStatus : conflict.taskmasterStatus
      });
      
    } catch (error) {
      console.error(`Failed to resolve conflict for task ${conflict.taskId}:`, error);
      this.syncStatus.errors.push(`Conflict resolution failed for task ${conflict.taskId}: ${error}`);
    }
  }

  /**
   * Handle orchestrator task updates
   */
  private handleOrchestratorUpdate(event: any): void {
    const update: TaskStatusUpdate = {
      taskId: event.taskId,
      status: this.mapOrchestratorStatus(event.status || event.type),
      timestamp: new Date(),
      source: 'orchestrator',
      metadata: event
    };
    
    // Check for conflicts
    const existing = this.pendingUpdates.get(update.taskId);
    if (existing && existing.source === 'taskmaster' && existing.status !== update.status) {
      // Conflict detected
      this.conflicts.set(update.taskId, {
        taskId: update.taskId,
        taskmasterStatus: existing.status,
        orchestratorStatus: update.status,
        resolution: 'orchestrator',
        timestamp: new Date()
      });
      this.pendingUpdates.delete(update.taskId);
    } else {
      this.pendingUpdates.set(update.taskId, update);
    }
    
    this.syncStatus.pendingUpdates = this.pendingUpdates.size;
    this.syncStatus.conflicts = this.conflicts.size;
  }

  /**
   * Handle TaskMaster updates
   */
  private handleTaskMasterUpdate(event: any): void {
    const update: TaskStatusUpdate = {
      taskId: event.taskId,
      status: event.status,
      timestamp: new Date(),
      source: 'taskmaster',
      metadata: event
    };
    
    // Check for conflicts
    const existing = this.pendingUpdates.get(update.taskId);
    if (existing && existing.source === 'orchestrator' && existing.status !== update.status) {
      // Conflict detected
      this.conflicts.set(update.taskId, {
        taskId: update.taskId,
        taskmasterStatus: update.status,
        orchestratorStatus: existing.status,
        resolution: 'orchestrator', // Default: orchestrator wins
        timestamp: new Date()
      });
      this.pendingUpdates.delete(update.taskId);
    } else {
      this.pendingUpdates.set(update.taskId, update);
    }
    
    this.syncStatus.pendingUpdates = this.pendingUpdates.size;
    this.syncStatus.conflicts = this.conflicts.size;
  }

  /**
   * Map orchestrator status to TaskMaster status
   */
  private mapOrchestratorStatus(orchestratorStatus: string): string {
    const statusMap: Record<string, string> = {
      'queued': 'pending',
      'assigned': 'in_progress',
      'running': 'in_progress',
      'completed': 'completed',
      'failed': 'blocked',
      'task:completed': 'completed',
      'task:failed': 'blocked',
      'task:started': 'in_progress'
    };
    
    return statusMap[orchestratorStatus] || orchestratorStatus;
  }

  /**
   * Queue a manual status update
   */
  queueStatusUpdate(taskId: string, status: string, source: 'taskmaster' | 'orchestrator'): void {
    const update: TaskStatusUpdate = {
      taskId,
      status,
      timestamp: new Date(),
      source
    };
    
    this.pendingUpdates.set(taskId, update);
    this.syncStatus.pendingUpdates = this.pendingUpdates.size;
    
    // Trigger immediate sync if auto-sync is enabled
    if (this.isRunning) {
      this.performSync().catch(err => {
        console.error('Immediate sync failed:', err);
      });
    }
  }

  /**
   * Get current sync status
   */
  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  /**
   * Get pending updates
   */
  getPendingUpdates(): TaskStatusUpdate[] {
    return Array.from(this.pendingUpdates.values());
  }

  /**
   * Get unresolved conflicts
   */
  getConflicts(): SyncConflict[] {
    return Array.from(this.conflicts.values());
  }

  /**
   * Manually resolve a conflict
   */
  resolveConflictManually(taskId: string, resolution: 'taskmaster' | 'orchestrator'): void {
    const conflict = this.conflicts.get(taskId);
    if (conflict) {
      conflict.resolution = resolution;
      this.performSync().catch(err => {
        console.error('Sync after manual resolution failed:', err);
      });
    }
  }

  /**
   * Clear all pending updates and conflicts
   */
  clear(): void {
    this.pendingUpdates.clear();
    this.conflicts.clear();
    this.syncStatus = {
      isActive: this.isRunning,
      lastSync: null,
      pendingUpdates: 0,
      conflicts: 0,
      syncedTasks: 0,
      errors: []
    };
  }
}