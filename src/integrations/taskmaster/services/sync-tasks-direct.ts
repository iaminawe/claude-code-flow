/**
 * Direct task synchronization without dependencies
 * Used for syncing tasks to shared storage
 */

import { SimpleMemoryManager } from '../../../cli/commands/memory.ts';
import { SharedStorage } from './shared-storage.ts';

export async function syncTasksDirectly(): Promise<any[]> {
  try {
    // Get tasks from memory
    const memory = new SimpleMemoryManager();
    const recentTasks = await memory.query('tasks', 'taskmaster_tasks');
    
    if (recentTasks.length === 0) {
      return [];
    }
    
    // Get the most recent task set
    const mostRecent = recentTasks[recentTasks.length - 1];
    const tasks = mostRecent.value as any[];
    
    // Sync to shared storage
    const storage = new SharedStorage({ autoInit: false });
    if (!await storage.isInitialized()) {
      await storage.initialize();
    }
    
    await storage.writeTasks(tasks);
    
    return tasks;
  } catch (error) {
    console.error('Failed to sync tasks directly:', error);
    return [];
  }
}