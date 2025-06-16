/**
 * Integration tests for TaskMaster VS Code sync functionality
 */

import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { describe, it, beforeEach, afterEach } from "https://deno.land/std@0.224.0/testing/bdd.ts";
import { SharedStorage } from "../../../src/integrations/taskmaster/services/shared-storage.ts";
import { WebSocketServer } from "../../../src/integrations/taskmaster/services/websocket-server.ts";
import { FileWatcher } from "../../../src/integrations/taskmaster/services/file-watcher.ts";
import { ensureDir } from "https://deno.land/std@0.224.0/fs/ensure_dir.ts";
import { exists } from "https://deno.land/std@0.224.0/fs/exists.ts";

const TEST_DIR = "./test-taskmaster-sync";

describe("TaskMaster Sync", () => {
  let storage: SharedStorage;
  let server: WebSocketServer;
  let watcher: FileWatcher;

  beforeEach(async () => {
    // Create test directory
    await ensureDir(TEST_DIR);
    
    // Initialize storage with test directory
    storage = new SharedStorage({ 
      basePath: TEST_DIR,
      autoInit: true 
    });
    await storage.initialize();
  });

  afterEach(async () => {
    // Cleanup
    try {
      if (watcher) watcher.stop();
      if (server) await server.stop();
      await Deno.remove(TEST_DIR, { recursive: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe("SharedStorage", () => {
    it("should initialize directory structure", async () => {
      const paths = storage.getPaths();
      
      assertExists(await exists(paths.base));
      assertExists(await exists(paths.tasks));
      assertExists(await exists(paths.config));
      assertExists(await exists(paths.sparc));
      assertExists(await exists(paths.logs));
    });

    it("should create default configuration files", async () => {
      const syncConfig = await storage.getSyncConfig();
      
      assertEquals(syncConfig.version, "1.0.0");
      assertEquals(syncConfig.syncMode, "real-time");
      assertEquals(syncConfig.port, 5173);
    });

    it("should handle task operations atomically", async () => {
      const testTasks = [
        { id: "1", title: "Test Task 1", status: "pending" },
        { id: "2", title: "Test Task 2", status: "in_progress" }
      ];

      await storage.writeTasks(testTasks);
      const readTasks = await storage.readTasks();
      
      assertEquals(readTasks.length, 2);
      assertEquals(readTasks[0].title, "Test Task 1");
    });

    it("should update single task", async () => {
      const tasks = [
        { id: "1", title: "Task 1", status: "pending" },
        { id: "2", title: "Task 2", status: "pending" }
      ];

      await storage.writeTasks(tasks);
      await storage.updateTask("1", { status: "completed" });
      
      const updated = await storage.readTasks();
      assertEquals(updated[0].status, "completed");
      assertEquals(updated[1].status, "pending");
    });

    it("should create backups when writing tasks", async () => {
      await storage.writeTasks([{ id: "1", title: "Task" }]);
      await new Promise(resolve => setTimeout(resolve, 100));
      await storage.writeTasks([{ id: "2", title: "Task 2" }]);
      
      const historyPath = storage.getPaths().history;
      let backupCount = 0;
      
      for await (const entry of Deno.readDir(historyPath)) {
        if (entry.name.startsWith("tasks-")) {
          backupCount++;
        }
      }
      
      assertEquals(backupCount >= 1, true);
    });
  });

  describe("WebSocketServer", () => {
    it("should start and stop server", async () => {
      server = new WebSocketServer(storage, 5180, "localhost");
      
      await server.start();
      assertEquals(server.getStatus().running, true);
      
      await server.stop();
      assertEquals(server.getStatus().running, false);
    });

    it("should handle WebSocket connections", async () => {
      server = new WebSocketServer(storage, 5181, "localhost");
      await server.start();

      const ws = new WebSocket("ws://localhost:5181/taskmaster");
      
      await new Promise<void>((resolve, reject) => {
        ws.onopen = () => resolve();
        ws.onerror = reject;
        setTimeout(() => reject(new Error("Connection timeout")), 2000);
      });

      assertEquals(server.getStatus().clients, 1);
      
      ws.close();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      assertEquals(server.getStatus().clients, 0);
      await server.stop();
    });

    it("should handle task list request", async () => {
      const testTasks = [
        { id: "1", title: "Test Task", status: "pending" }
      ];
      await storage.writeTasks(testTasks);

      server = new WebSocketServer(storage, 5182, "localhost");
      await server.start();

      const ws = new WebSocket("ws://localhost:5182/taskmaster");
      
      await new Promise<void>((resolve) => {
        ws.onopen = () => resolve();
      });

      const response = await new Promise<any>((resolve) => {
        ws.onmessage = (event) => {
          const msg = JSON.parse(event.data);
          if (msg.type === "response" && msg.method === "tasks.list") {
            resolve(msg);
          }
        };

        ws.send(JSON.stringify({
          id: "test-1",
          type: "request",
          method: "tasks.list"
        }));
      });

      assertEquals(response.result.length, 1);
      assertEquals(response.result[0].title, "Test Task");
      
      ws.close();
      await server.stop();
    });
  });

  describe("FileWatcher", () => {
    it("should detect task file changes", async () => {
      server = new WebSocketServer(storage, 5183, "localhost");
      await server.start();

      watcher = new FileWatcher(storage, server);
      
      // Start watcher in background
      const watchPromise = watcher.start();

      // Give it time to start
      await new Promise(resolve => setTimeout(resolve, 500));

      // Connect a client to receive events
      const ws = new WebSocket("ws://localhost:5183/taskmaster");
      await new Promise<void>((resolve) => {
        ws.onopen = () => resolve();
      });

      // Subscribe to all events
      ws.send(JSON.stringify({
        id: "sub-1",
        type: "request",
        method: "subscribe",
        params: { events: ["*"] }
      }));

      // Wait for subscription confirmation
      await new Promise(resolve => setTimeout(resolve, 100));

      // Set up event listener
      const eventPromise = new Promise<any>((resolve) => {
        ws.onmessage = (event) => {
          const msg = JSON.parse(event.data);
          if (msg.type === "event" && msg.method === "file.changed") {
            resolve(msg);
          }
        };
      });

      // Modify tasks file
      await storage.writeTasks([
        { id: "test-1", title: "File Watcher Test" }
      ]);

      // Wait for the event (with timeout)
      const event = await Promise.race([
        eventPromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Event timeout")), 2000)
        )
      ]);

      assertEquals(event.params.type, "tasks");
      
      ws.close();
      watcher.stop();
      await server.stop();
    });
  });

  describe("End-to-End Sync", () => {
    it("should sync task updates between clients", async () => {
      server = new WebSocketServer(storage, 5184, "localhost");
      await server.start();

      // Connect two clients
      const client1 = new WebSocket("ws://localhost:5184/taskmaster");
      const client2 = new WebSocket("ws://localhost:5184/taskmaster");

      await Promise.all([
        new Promise(resolve => client1.onopen = resolve),
        new Promise(resolve => client2.onopen = resolve)
      ]);

      // Client 2 subscribes to task events
      client2.send(JSON.stringify({
        id: "sub-2",
        type: "request",
        method: "subscribe",
        params: { events: ["task.*"] }
      }));

      // Set up event listener on client 2
      const eventPromise = new Promise<any>((resolve) => {
        client2.onmessage = (event) => {
          const msg = JSON.parse(event.data);
          if (msg.type === "event" && msg.method === "task.created") {
            resolve(msg);
          }
        };
      });

      // Client 1 creates a task
      client1.send(JSON.stringify({
        id: "create-1",
        type: "request",
        method: "task.create",
        params: {
          task: { id: "sync-test", title: "Sync Test Task" }
        }
      }));

      // Client 2 should receive the event
      const event = await eventPromise;
      assertEquals(event.params.task.title, "Sync Test Task");

      // Verify task was persisted
      const tasks = await storage.readTasks();
      assertEquals(tasks.length, 1);
      assertEquals(tasks[0].id, "sync-test");

      client1.close();
      client2.close();
      await server.stop();
    });
  });
});