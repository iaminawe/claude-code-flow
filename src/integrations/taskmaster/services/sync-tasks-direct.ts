/**
 * Direct sync implementation that reads from memory store file
 */

import { SharedStorage } from "./shared-storage.ts";

export async function syncTasksDirectly(): Promise<any> {
  try {
    // Initialize storage
    const storage = new SharedStorage({ autoInit: false });
    if (!await storage.isInitialized()) {
      console.log("Initializing TaskMaster storage...");
      await storage.initialize();
    }

    // Read memory store directly
    const memoryPath = "./memory/memory-store.json";
    const memoryData = JSON.parse(await Deno.readTextFile(memoryPath));
    
    const allTasks = [];
    const taskEntries = memoryData.taskmaster_tasks || [];
    
    // Process each entry
    for (const entry of taskEntries) {
      try {
        let tasks = entry.value;
        if (typeof tasks === 'string') {
          tasks = JSON.parse(tasks);
        }
        if (Array.isArray(tasks)) {
          allTasks.push(...tasks);
        }
      } catch (e) {
        console.debug("Skipping invalid entry:", e);
      }
    }

    // Remove duplicates by ID
    const uniqueTasks = Array.from(
      new Map(allTasks.map(task => [task.id, task])).values()
    );

    // Write to shared storage
    await storage.writeTasks(uniqueTasks);
    
    console.log(`✅ Synced ${uniqueTasks.length} tasks to .taskmaster/tasks/tasks.json`);
    
    return uniqueTasks;
  } catch (error) {
    console.error("Failed to sync tasks:", error);
    throw error;
  }
}