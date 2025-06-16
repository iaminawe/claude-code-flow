/**
 * Shared Storage Service for VS Code Sync
 * Manages the .taskmaster directory structure and provides atomic operations
 */

import { ensureDir } from "https://deno.land/std@0.224.0/fs/ensure_dir.ts";
import { exists } from "https://deno.land/std@0.224.0/fs/exists.ts";
import { join } from "https://deno.land/std@0.224.0/path/mod.ts";
import { TaskMasterTask } from "../types/task-types.ts";

export interface SharedStorageConfig {
  basePath?: string;
  autoInit?: boolean;
}

export class SharedStorage {
  private basePath: string;
  private tasksPath: string;
  private configPath: string;
  private sparcPath: string;
  private logsPath: string;
  private historyPath: string;
  private lockFile: string;
  private isLocked: boolean = false;

  constructor(config: SharedStorageConfig = {}) {
    this.basePath = config.basePath || join(Deno.cwd(), '.taskmaster');
    this.tasksPath = join(this.basePath, 'tasks');
    this.configPath = join(this.basePath, 'config');
    this.sparcPath = join(this.basePath, 'sparc');
    this.logsPath = join(this.basePath, 'logs');
    this.historyPath = join(this.tasksPath, 'history');
    this.lockFile = join(this.tasksPath, 'tasks.lock');

    if (config.autoInit) {
      this.initialize();
    }
  }

  /**
   * Initialize the .taskmaster directory structure
   */
  async initialize(): Promise<void> {
    try {
      // Create directory structure
      await ensureDir(this.tasksPath);
      await ensureDir(this.configPath);
      await ensureDir(this.sparcPath);
      await ensureDir(this.logsPath);
      await ensureDir(this.historyPath);

      // Create default config files if they don't exist
      const syncConfigPath = join(this.configPath, 'sync.json');
      if (!await exists(syncConfigPath)) {
        await this.writeJSON(syncConfigPath, {
          version: '1.0.0',
          syncMode: 'real-time',
          conflictResolution: 'last-write-wins',
          autoSync: true,
          port: 5173,
          host: 'localhost'
        });
      }

      // Create empty tasks file if it doesn't exist
      const tasksFilePath = join(this.tasksPath, 'tasks.json');
      if (!await exists(tasksFilePath)) {
        await this.writeJSON(tasksFilePath, []);
      }

      // Initialize SPARC mappings
      const sparcMappingsPath = join(this.sparcPath, 'mappings.json');
      if (!await exists(sparcMappingsPath)) {
        await this.writeJSON(sparcMappingsPath, {
          taskTypeToSparc: {
            'architecture': 'architect',
            'implementation': 'code',
            'testing': 'tdd',
            'security': 'security-review',
            'documentation': 'docs-writer',
            'database': 'backend-only',
            'frontend': 'frontend-only',
            'api': 'api-only'
          }
        });
      }

      await this.log('info', 'Shared storage initialized');
    } catch (error) {
      await this.log('error', `Failed to initialize storage: ${error}`);
      throw error;
    }
  }

  /**
   * Acquire lock for atomic operations
   */
  async acquireLock(timeout: number = 5000): Promise<boolean> {
    const startTime = Date.now();
    
    while (await exists(this.lockFile)) {
      if (Date.now() - startTime > timeout) {
        await this.log('warn', 'Lock acquisition timeout');
        return false;
      }
      await this.delay(100);
    }

    try {
      await Deno.writeTextFile(this.lockFile, JSON.stringify({
        pid: Deno.pid,
        timestamp: new Date().toISOString()
      }));
      this.isLocked = true;
      return true;
    } catch (error) {
      await this.log('error', `Failed to acquire lock: ${error}`);
      return false;
    }
  }

  /**
   * Release lock
   */
  async releaseLock(): Promise<void> {
    if (this.isLocked) {
      try {
        await Deno.remove(this.lockFile);
        this.isLocked = false;
      } catch (error) {
        await this.log('error', `Failed to release lock: ${error}`);
      }
    }
  }

  /**
   * Read tasks with lock
   */
  async readTasks(): Promise<TaskMasterTask[]> {
    const acquired = await this.acquireLock();
    if (!acquired) {
      throw new Error('Failed to acquire lock for reading tasks');
    }

    try {
      const tasksPath = join(this.tasksPath, 'tasks.json');
      const content = await Deno.readTextFile(tasksPath);
      const data = JSON.parse(content);
      
      // Handle both formats - array or extension format
      if (Array.isArray(data)) {
        return data;
      } else if (data.tasks && Array.isArray(data.tasks)) {
        // Convert from extension format back to TaskMaster format
        return data.tasks.map((task: any) => ({
          id: task.id,
          title: task.title,
          description: task.description,
          type: task.type || 'implementation',
          priority: task.priority || 'medium',
          status: task.status === 'todo' ? 'pending' : task.status.replace('-', '_'),
          assignee: task.assignedAgent || null,
          sparc_mode: task.sparcPhase,
          subtasks: task.subtasks || [],
          createdAt: task.createdAt,
          metadata: task.metadata
        }));
      }
      return [];
    } catch (error) {
      await this.log('error', `Failed to read tasks: ${error}`);
      return [];
    } finally {
      await this.releaseLock();
    }
  }

  /**
   * Write tasks atomically
   */
  async writeTasks(tasks: TaskMasterTask[]): Promise<void> {
    const acquired = await this.acquireLock();
    if (!acquired) {
      throw new Error('Failed to acquire lock for writing tasks');
    }

    try {
      // Create backup in history
      await this.createBackup();

      // Convert to extension format
      const { convertToExtensionFormat } = await import("./convert-to-extension-format.ts");
      const extensionFormat = convertToExtensionFormat(tasks);

      // Write new tasks in extension format
      const tasksPath = join(this.tasksPath, 'tasks.json');
      await this.writeJSON(tasksPath, extensionFormat);

      await this.log('info', `Wrote ${tasks.length} tasks in VS Code extension format`);
    } catch (error) {
      await this.log('error', `Failed to write tasks: ${error}`);
      throw error;
    } finally {
      await this.releaseLock();
    }
  }

  /**
   * Update single task
   */
  async updateTask(taskId: string, updates: Partial<TaskMasterTask>): Promise<void> {
    const tasks = await this.readTasks();
    const index = tasks.findIndex(t => t.id === taskId);
    
    if (index === -1) {
      throw new Error(`Task ${taskId} not found`);
    }

    tasks[index] = { ...tasks[index], ...updates };
    await this.writeTasks(tasks);
  }

  /**
   * Create backup in history
   */
  private async createBackup(): Promise<void> {
    try {
      const tasksPath = join(this.tasksPath, 'tasks.json');
      if (await exists(tasksPath)) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = join(this.historyPath, `tasks-${timestamp}.json`);
        const content = await Deno.readTextFile(tasksPath);
        await Deno.writeTextFile(backupPath, content);

        // Clean old backups (keep last 10)
        await this.cleanOldBackups();
      }
    } catch (error) {
      await this.log('warn', `Failed to create backup: ${error}`);
    }
  }

  /**
   * Clean old backup files
   */
  private async cleanOldBackups(): Promise<void> {
    try {
      const files = [];
      for await (const entry of Deno.readDir(this.historyPath)) {
        if (entry.isFile && entry.name.startsWith('tasks-')) {
          files.push(entry.name);
        }
      }

      files.sort().reverse();
      const toDelete = files.slice(10);
      
      for (const file of toDelete) {
        await Deno.remove(join(this.historyPath, file));
      }
    } catch (error) {
      await this.log('warn', `Failed to clean backups: ${error}`);
    }
  }

  /**
   * Get sync configuration
   */
  async getSyncConfig(): Promise<any> {
    try {
      const configPath = join(this.configPath, 'sync.json');
      const content = await Deno.readTextFile(configPath);
      return JSON.parse(content);
    } catch (error) {
      await this.log('error', `Failed to read sync config: ${error}`);
      return {};
    }
  }

  /**
   * Update sync configuration
   */
  async updateSyncConfig(updates: any): Promise<void> {
    try {
      const config = await this.getSyncConfig();
      const newConfig = { ...config, ...updates };
      const configPath = join(this.configPath, 'sync.json');
      await this.writeJSON(configPath, newConfig);
    } catch (error) {
      await this.log('error', `Failed to update sync config: ${error}`);
      throw error;
    }
  }

  /**
   * Get active connections
   */
  async getConnections(): Promise<any[]> {
    try {
      const connPath = join(this.configPath, 'connection.json');
      if (await exists(connPath)) {
        const content = await Deno.readTextFile(connPath);
        return JSON.parse(content);
      }
      return [];
    } catch (error) {
      await this.log('error', `Failed to read connections: ${error}`);
      return [];
    }
  }

  /**
   * Add active connection
   */
  async addConnection(connection: any): Promise<void> {
    try {
      const connections = await this.getConnections();
      connections.push({
        ...connection,
        connectedAt: new Date().toISOString()
      });
      const connPath = join(this.configPath, 'connection.json');
      await this.writeJSON(connPath, connections);
    } catch (error) {
      await this.log('error', `Failed to add connection: ${error}`);
    }
  }

  /**
   * Remove connection
   */
  async removeConnection(id: string): Promise<void> {
    try {
      const connections = await this.getConnections();
      const filtered = connections.filter(c => c.id !== id);
      const connPath = join(this.configPath, 'connection.json');
      await this.writeJSON(connPath, filtered);
    } catch (error) {
      await this.log('error', `Failed to remove connection: ${error}`);
    }
  }

  /**
   * Log sync events
   */
  private async log(level: 'info' | 'warn' | 'error', message: string): Promise<void> {
    try {
      const logPath = join(this.logsPath, 'sync.log');
      const entry = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}\n`;
      await Deno.writeTextFile(logPath, entry, { append: true });
    } catch {
      // Ignore logging errors
    }
  }

  /**
   * Helper to write JSON files
   */
  private async writeJSON(path: string, data: any): Promise<void> {
    await Deno.writeTextFile(path, JSON.stringify(data, null, 2));
  }

  /**
   * Helper delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if storage is initialized
   */
  async isInitialized(): Promise<boolean> {
    return await exists(this.basePath) && 
           await exists(this.tasksPath) && 
           await exists(join(this.tasksPath, 'tasks.json'));
  }

  /**
   * Get storage paths
   */
  getPaths() {
    return {
      base: this.basePath,
      tasks: this.tasksPath,
      config: this.configPath,
      sparc: this.sparcPath,
      logs: this.logsPath,
      history: this.historyPath
    };
  }
}