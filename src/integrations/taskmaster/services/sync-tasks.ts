/**
 * Sync tasks from Claude-Flow memory to .taskmaster directory
 */

import { SharedStorage } from "./shared-storage.ts";
import { SimpleMemoryManager } from "../../../cli/commands/memory.ts";

export async function syncTasksToSharedStorage(): Promise<any> {
  try {
    // Initialize storage
    const storage = new SharedStorage({ autoInit: false });
    if (!await storage.isInitialized()) {
      console.log("Initializing TaskMaster storage...");
      await storage.initialize();
    }

    // Get tasks from memory
    const memoryManager = new SimpleMemoryManager();
    await memoryManager.load();
    const allTasks = [];

    // Get all task lists from memory
    const taskLists = await memoryManager.query({
      namespace: "taskmaster_tasks"
    });

    // Combine all tasks into a single array
    for (const entry of taskLists) {
      try {
        // Values might be stored as JSON strings
        let tasks = entry.value;
        if (typeof tasks === 'string') {
          tasks = JSON.parse(tasks);
        }
        if (Array.isArray(tasks)) {
          allTasks.push(...tasks);
        }
      } catch (e) {
        // Skip invalid entries
        console.debug("Skipping invalid entry:", e);
      }
    }

    // Write to shared storage
    await storage.writeTasks(allTasks);
    
    console.log(`✅ Synced ${allTasks.length} tasks to .taskmaster/tasks/tasks.json`);
    
    return allTasks;
  } catch (error) {
    console.error("Failed to sync tasks:", error);
    throw error;
  }
}

export async function syncTasksFromSharedStorage(): Promise<void> {
  try {
    const storage = new SharedStorage({ autoInit: false });
    const tasks = await storage.readTasks();
    
    if (tasks.length > 0) {
      const memoryManager = new SimpleMemoryManager();
      await memoryManager.load();
      await memoryManager.store({
        key: `tasks_synced_${Date.now()}`,
        value: tasks,
        namespace: "taskmaster_tasks"
      });
      
      console.log(`✅ Synced ${tasks.length} tasks from .taskmaster to memory`);
    }
  } catch (error) {
    console.error("Failed to sync from shared storage:", error);
    throw error;
  }
}