/**
 * Sync tasks with project filtering support
 */

import { SharedStorage } from "./shared-storage.ts";

export async function syncTasksForProject(projectId?: string): Promise<any> {
  try {
    // Initialize storage
    const storage = new SharedStorage({ autoInit: false });
    if (!await storage.isInitialized()) {
      await storage.initialize();
    }

    // Read memory store directly
    const memoryPath = "./memory/memory-store.json";
    const memoryData = JSON.parse(await Deno.readTextFile(memoryPath));
    
    const allTasks = [];
    const taskEntries = memoryData.taskmaster_tasks || [];
    
    // Get project metadata from memory
    const prdEntries = memoryData.taskmaster_prds || [];
    const projectMap = new Map();
    
    // Build project map
    for (const entry of prdEntries) {
      try {
        let prd = entry.value;
        if (typeof prd === 'string') {
          prd = JSON.parse(prd);
        }
        if (prd && prd.id) {
          projectMap.set(prd.id, prd.title);
        }
      } catch (e) {
        console.debug("Skipping invalid PRD entry:", e);
      }
    }
    
    // Process task entries and add project info
    for (const entry of taskEntries) {
      try {
        let tasks = entry.value;
        if (typeof tasks === 'string') {
          tasks = JSON.parse(tasks);
        }
        if (Array.isArray(tasks)) {
          // Try to determine project from entry key or metadata
          const projectIdFromKey = entry.metadata?.prdId || extractProjectId(entry.key);
          
          for (const task of tasks) {
            // Add project information to task
            task.projectId = task.projectId || projectIdFromKey;
            task.projectTitle = projectMap.get(task.projectId) || 'Unknown Project';
            
            // Filter by project if specified
            if (!projectId || task.projectId === projectId) {
              allTasks.push(task);
            }
          }
        }
      } catch (e) {
        console.debug("Skipping invalid entry:", e);
      }
    }

    // Remove duplicates by ID
    const uniqueTasks = Array.from(
      new Map(allTasks.map(task => [task.id, task])).values()
    );

    // Update config with current project
    if (projectId) {
      const config = await storage.getSyncConfig();
      await storage.updateSyncConfig({
        ...config,
        currentProjectId: projectId
      });
    }

    // Write to shared storage
    await storage.writeTasks(uniqueTasks);
    
    console.log(`✅ Synced ${uniqueTasks.length} tasks${projectId ? ` for project ${projectId}` : ''} to .taskmaster/tasks/tasks.json`);
    
    // Show project breakdown
    const projectCounts = new Map();
    for (const task of uniqueTasks) {
      const proj = task.projectTitle || 'Unknown';
      projectCounts.set(proj, (projectCounts.get(proj) || 0) + 1);
    }
    
    console.log("\nTasks by project:");
    for (const [proj, count] of projectCounts) {
      console.log(`  - ${proj}: ${count} tasks`);
    }
    
    return uniqueTasks;
  } catch (error) {
    console.error("Failed to sync tasks:", error);
    throw error;
  }
}

function extractProjectId(key: string): string | undefined {
  // Try to extract project ID from key patterns like "tasks_PROJECT-ID_timestamp"
  const match = key.match(/tasks_([a-f0-9-]+)_/);
  return match ? match[1] : undefined;
}