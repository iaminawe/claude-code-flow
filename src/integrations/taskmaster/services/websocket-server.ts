/**
 * WebSocket Server for TaskMaster VS Code Sync
 * Provides real-time synchronization between CLI and VS Code extension
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { SharedStorage } from "./shared-storage.ts";
import { TaskMasterTask } from "../types/task-types.ts";
import { FileWatcher } from "./file-watcher.ts";

interface Client {
  id: string;
  socket: WebSocket;
  subscriptions: string[];
  connectedAt: Date;
}

interface SyncMessage {
  id: string;
  type: 'request' | 'response' | 'event';
  method: string;
  params?: any;
  result?: any;
  error?: SyncError;
  timestamp: number;
}

interface SyncError {
  code: number;
  message: string;
  data?: any;
}

export class WebSocketServer {
  private server: Deno.HttpServer | null = null;
  private clients: Map<string, Client> = new Map();
  private storage: SharedStorage;
  private fileWatcher: FileWatcher | null = null;
  private port: number;
  private host: string;
  private isRunning: boolean = false;
  private handlers: Map<string, (params: any, client: Client) => Promise<any>>;

  constructor(storage: SharedStorage, port: number = 5173, host: string = 'localhost') {
    this.storage = storage;
    this.port = port;
    this.host = host;
    this.handlers = new Map();
    this.registerHandlers();
  }

  /**
   * Register message handlers
   */
  private registerHandlers() {
    // Task operations
    this.handlers.set('tasks.list', async () => {
      return await this.storage.readTasks();
    });

    this.handlers.set('task.create', async (params: any) => {
      const tasks = await this.storage.readTasks();
      tasks.push(params.task);
      await this.storage.writeTasks(tasks);
      await this.broadcast('task.created', { task: params.task });
      return { success: true, id: params.task.id };
    });

    this.handlers.set('task.update', async (params: any) => {
      await this.storage.updateTask(params.id, params.updates);
      await this.broadcast('task.updated', { id: params.id, updates: params.updates });
      return { success: true };
    });

    this.handlers.set('task.delete', async (params: any) => {
      const tasks = await this.storage.readTasks();
      const filtered = tasks.filter(t => t.id !== params.id);
      await this.storage.writeTasks(filtered);
      await this.broadcast('task.deleted', { id: params.id });
      return { success: true };
    });

    // Subscription management
    this.handlers.set('subscribe', async (params: any, client: Client) => {
      client.subscriptions = params.events || ['*'];
      return { success: true, subscribed: client.subscriptions };
    });

    this.handlers.set('unsubscribe', async (_params: any, client: Client) => {
      client.subscriptions = [];
      return { success: true };
    });

    // Status and info
    this.handlers.set('status', async () => {
      return {
        clients: this.clients.size,
        uptime: Date.now() - (this.server ? 0 : Date.now()),
        storage: await this.storage.isInitialized()
      };
    });

    // Config operations
    this.handlers.set('config.get', async () => {
      return await this.storage.getSyncConfig();
    });

    this.handlers.set('config.update', async (params: any) => {
      await this.storage.updateSyncConfig(params.config);
      await this.broadcast('config.updated', { config: params.config });
      return { success: true };
    });
  }

  /**
   * Start the WebSocket server
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error('Server is already running');
    }

    const handler = async (request: Request): Promise<Response> => {
      const url = new URL(request.url);
      
      // WebSocket upgrade
      if (url.pathname === '/taskmaster' && request.headers.get('upgrade') === 'websocket') {
        const { socket, response } = Deno.upgradeWebSocket(request);
        this.handleWebSocket(socket);
        return response;
      }

      // HTTP fallback endpoints
      if (url.pathname.startsWith('/api/')) {
        return await this.handleHttpRequest(request);
      }

      // Health check
      if (url.pathname === '/health') {
        return new Response(JSON.stringify({ status: 'ok', clients: this.clients.size }), {
          headers: { 'content-type': 'application/json' }
        });
      }

      return new Response('Not Found', { status: 404 });
    };

    this.server = await serve(handler, { 
      port: this.port, 
      hostname: this.host,
      onListen: ({ port, hostname }) => {
        console.log(`WebSocket server listening on ws://${hostname}:${port}/taskmaster`);
        console.log(`HTTP fallback available at http://${hostname}:${port}/api/`);
      }
    });

    this.isRunning = true;

    // Save server info to storage
    await this.storage.addConnection({
      id: 'server',
      type: 'server',
      host: this.host,
      port: this.port,
      startedAt: new Date().toISOString()
    });

    // Start file watcher
    try {
      this.fileWatcher = new FileWatcher(this.storage, this);
      this.fileWatcher.start().catch(err => {
        console.error('File watcher error:', err);
      });
      console.log('File watcher started for .taskmaster directory');
    } catch (error) {
      console.warn('Could not start file watcher:', error);
    }
  }

  /**
   * Stop the WebSocket server
   */
  async stop(): Promise<void> {
    if (!this.isRunning || !this.server) {
      throw new Error('Server is not running');
    }

    // Notify all clients
    await this.broadcast('server.shutdown', { reason: 'Server stopping' });

    // Stop file watcher
    if (this.fileWatcher) {
      this.fileWatcher.stop();
      this.fileWatcher = null;
    }

    // Close all client connections
    for (const [id, client] of this.clients) {
      client.socket.close(1001, 'Server shutting down');
      this.clients.delete(id);
    }

    // Stop the server
    await this.server.shutdown();
    this.server = null;
    this.isRunning = false;

    // Remove server info from storage
    await this.storage.removeConnection('server');
  }

  /**
   * Handle WebSocket connections
   */
  private handleWebSocket(socket: WebSocket) {
    const clientId = crypto.randomUUID();
    const client: Client = {
      id: clientId,
      socket,
      subscriptions: ['*'],
      connectedAt: new Date()
    };

    socket.onopen = async () => {
      this.clients.set(clientId, client);
      await this.storage.addConnection({
        id: clientId,
        type: 'client',
        connectedAt: client.connectedAt.toISOString()
      });
      
      // Send welcome message
      this.sendMessage(client, {
        id: 'welcome',
        type: 'event',
        method: 'sync.connected',
        params: { clientId, serverTime: Date.now() },
        timestamp: Date.now()
      });
    };

    socket.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data) as SyncMessage;
        await this.handleMessage(message, client);
      } catch (error) {
        this.sendError(client, 'parse-error', 1003, 'Invalid message format', error);
      }
    };

    socket.onclose = async () => {
      this.clients.delete(clientId);
      await this.storage.removeConnection(clientId);
      await this.broadcast('sync.disconnected', { clientId }, clientId);
    };

    socket.onerror = (error) => {
      console.error(`WebSocket error for client ${clientId}:`, error);
    };
  }

  /**
   * Handle incoming messages
   */
  private async handleMessage(message: SyncMessage, client: Client) {
    if (message.type !== 'request') {
      return;
    }

    const handler = this.handlers.get(message.method);
    if (!handler) {
      this.sendError(client, message.id, 1004, `Method not found: ${message.method}`);
      return;
    }

    try {
      const result = await handler(message.params, client);
      this.sendMessage(client, {
        id: message.id,
        type: 'response',
        method: message.method,
        result,
        timestamp: Date.now()
      });
    } catch (error) {
      this.sendError(client, message.id, 1000, `Method failed: ${message.method}`, error);
    }
  }

  /**
   * Handle HTTP fallback requests
   */
  private async handleHttpRequest(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const headers = { 
      'content-type': 'application/json',
      'access-control-allow-origin': '*'
    };

    try {
      switch (url.pathname) {
        case '/api/tasks':
          if (request.method === 'GET') {
            const tasks = await this.storage.readTasks();
            return new Response(JSON.stringify(tasks), { headers });
          }
          if (request.method === 'POST') {
            const data = await request.json();
            const tasks = await this.storage.readTasks();
            tasks.push(data);
            await this.storage.writeTasks(tasks);
            await this.broadcast('task.created', { task: data });
            return new Response(JSON.stringify({ success: true }), { headers });
          }
          break;

        case '/api/sync/status':
          const status = {
            wsClients: this.clients.size,
            serverRunning: this.isRunning,
            storageInitialized: await this.storage.isInitialized()
          };
          return new Response(JSON.stringify(status), { headers });

        case '/api/sync/event':
          if (request.method === 'POST') {
            const event = await request.json();
            await this.broadcast(event.type, event.data);
            return new Response(JSON.stringify({ success: true }), { headers });
          }
          break;
      }
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500, 
        headers 
      });
    }

    return new Response('Not Found', { status: 404 });
  }

  /**
   * Broadcast event to all subscribed clients
   */
  async broadcast(eventType: string, data: any, excludeClientId?: string) {
    const message: SyncMessage = {
      id: crypto.randomUUID(),
      type: 'event',
      method: eventType,
      params: data,
      timestamp: Date.now()
    };

    for (const [id, client] of this.clients) {
      if (id === excludeClientId) continue;
      
      // Check if client is subscribed to this event
      if (client.subscriptions.includes('*') || 
          client.subscriptions.some(sub => eventType.startsWith(sub))) {
        this.sendMessage(client, message);
      }
    }
  }

  /**
   * Send message to client
   */
  private sendMessage(client: Client, message: SyncMessage) {
    if (client.socket.readyState === WebSocket.OPEN) {
      client.socket.send(JSON.stringify(message));
    }
  }

  /**
   * Send error to client
   */
  private sendError(client: Client, id: string, code: number, message: string, data?: any) {
    this.sendMessage(client, {
      id,
      type: 'response',
      method: '',
      error: { code, message, data },
      timestamp: Date.now()
    });
  }

  /**
   * Get server status
   */
  getStatus() {
    return {
      running: this.isRunning,
      port: this.port,
      host: this.host,
      clients: this.clients.size,
      clientIds: Array.from(this.clients.keys())
    };
  }
}