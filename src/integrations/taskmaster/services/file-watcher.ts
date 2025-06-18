/**
 * File System Watcher for TaskMaster
 * Monitors .taskmaster directory for changes and triggers sync events
 */

import { SharedStorage } from "./shared-storage.ts";
import { WebSocketServer } from "./websocket-server.ts";
import { debounce } from "https://deno.land/std@0.224.0/async/debounce.ts";

export interface FileWatcherOptions {
  debounceMs?: number;
  excludePatterns?: string[];
}

export class FileWatcher {
  private storage: SharedStorage;
  private server: WebSocketServer | null;
  private watcher: Deno.FsWatcher | null = null;
  private isWatching: boolean = false;
  private debounceMs: number;
  private excludePatterns: string[];
  private lastChangeTime: Map<string, number> = new Map();

  constructor(
    storage: SharedStorage, 
    server: WebSocketServer | null = null,
    options: FileWatcherOptions = {}
  ) {
    this.storage = storage;
    this.server = server;
    this.debounceMs = options.debounceMs || 300;
    this.excludePatterns = options.excludePatterns || [
      'tasks.lock',
      'sync.log',
      '.DS_Store'
    ];
  }

  /**
   * Start watching the .taskmaster directory
   */
  async start(): Promise<void> {
    if (this.isWatching) {
      throw new Error('File watcher is already running');
    }

    const paths = this.storage.getPaths();
    
    try {
      // Create watcher for the base directory
      this.watcher = Deno.watchFs(paths.base, { recursive: true });
      this.isWatching = true;

      console.log(`File watcher started for: ${paths.base}`);

      // Create debounced handler
      const handleChange = debounce(
        (path: string, kind: Deno.FsEvent["kind"]) => this.handleFileChange(path, kind),
        this.debounceMs
      );

      // Watch for changes
      for await (const event of this.watcher) {
        if (!this.isWatching) break;

        for (const path of event.paths) {
          // Skip excluded files
          if (this.shouldExclude(path)) continue;

          // Skip if same file changed within debounce window
          const lastChange = this.lastChangeTime.get(path) || 0;
          const now = Date.now();
          if (now - lastChange < this.debounceMs) continue;
          
          this.lastChangeTime.set(path, now);
          handleChange(path, event.kind);
        }
      }
    } catch (error) {
      console.error('File watcher error:', error);
      this.isWatching = false;
      throw error;
    }
  }

  /**
   * Stop watching
   */
  stop(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
      this.isWatching = false;
      console.log('File watcher stopped');
    }
  }

  /**
   * Handle file change events
   */
  private async handleFileChange(path: string, kind: Deno.FsEvent["kind"]) {
    try {
      const paths = this.storage.getPaths();
      
      // Determine what changed
      if (path.includes(paths.tasks)) {
        await this.handleTaskChange(path, kind);
      } else if (path.includes(paths.config)) {
        await this.handleConfigChange(path, kind);
      } else if (path.includes(paths.sparc)) {
        await this.handleSparcChange(path, kind);
      }
      
      // Log the change
      await this.logChange(path, kind);
      
    } catch (error) {
      console.error(`Error handling file change for ${path}:`, error);
    }
  }

  /**
   * Handle task file changes
   */
  private async handleTaskChange(path: string, kind: Deno.FsEvent["kind"]) {
    if (!path.endsWith('tasks.json')) return;

    console.log(`Tasks file ${kind}: ${path}`);
    
    // Broadcast change event if server is available
    if (this.server) {
      const tasks = await this.storage.readTasks();
      await this.broadcastEvent('file.changed', {
        type: 'tasks',
        path,
        kind,
        taskCount: tasks.length,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Handle config file changes
   */
  private async handleConfigChange(path: string, kind: Deno.FsEvent["kind"]) {
    if (!path.endsWith('.json')) return;

    console.log(`Config file ${kind}: ${path}`);
    
    if (this.server) {
      await this.broadcastEvent('file.changed', {
        type: 'config',
        path,
        kind,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Handle SPARC mapping changes
   */
  private async handleSparcChange(path: string, kind: Deno.FsEvent["kind"]) {
    if (!path.endsWith('mappings.json')) return;

    console.log(`SPARC mappings ${kind}: ${path}`);
    
    if (this.server) {
      await this.broadcastEvent('file.changed', {
        type: 'sparc',
        path,
        kind,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Check if file should be excluded
   */
  private shouldExclude(path: string): boolean {
    const filename = path.split('/').pop() || '';
    return this.excludePatterns.some(pattern => filename.includes(pattern));
  }

  /**
   * Log file change
   */
  private async logChange(path: string, kind: Deno.FsEvent["kind"]) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      path,
      kind,
      watcher: 'file-system'
    };
    
    // Could write to sync.log here if needed
    console.debug('File change:', logEntry);
  }

  /**
   * Broadcast event through WebSocket server
   */
  private async broadcastEvent(eventType: string, data: any) {
    if (this.server) {
      try {
        await this.server.broadcast(eventType, data);
      } catch (error) {
        console.error('Failed to broadcast event:', error);
      }
    }
  }

  /**
   * Get watcher status
   */
  getStatus() {
    return {
      watching: this.isWatching,
      paths: this.storage.getPaths(),
      debounceMs: this.debounceMs,
      excludePatterns: this.excludePatterns
    };
  }
}