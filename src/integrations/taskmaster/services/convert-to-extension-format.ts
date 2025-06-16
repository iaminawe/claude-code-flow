/**
 * Convert TaskMaster tasks to VS Code extension format
 * Ensures compatibility with the VS Code TaskMaster extension
 */

import { TaskMasterTask } from "../types/task-types.ts";

export interface VSCodeTask {
  id: string;
  title: string;
  description: string;
  type: string;
  priority: string;
  status: string;
  assignedAgent?: string | null;
  sparcPhase?: string;
  subtasks?: string[];
  dependencies?: string[];
  createdAt: string;
  updatedAt?: string;
  projectId?: string;
  projectTitle?: string;
  metadata?: Record<string, any>;
}

export interface VSCodeTaskFormat {
  version: string;
  projectId?: string;
  tasks: VSCodeTask[];
  metadata: {
    createdAt: string;
    updatedAt: string;
    source: string;
    sparcMappings: Record<string, string>;
  };
}

/**
 * Convert TaskMaster tasks to VS Code extension format
 */
export function convertToExtensionFormat(tasks: TaskMasterTask[]): VSCodeTaskFormat {
  const now = new Date().toISOString();
  
  const vsTasks: VSCodeTask[] = tasks.map(task => ({
    id: task.id,
    title: task.title,
    description: task.description || '',
    type: task.type || 'implementation',
    priority: task.priority || 'medium',
    status: mapTaskMasterStatusToVSCode(task.status),
    assignedAgent: task.assignee,
    sparcPhase: task.sparc_mode,
    subtasks: task.subtasks || [],
    dependencies: task.dependencies || [],
    createdAt: task.createdAt || now,
    updatedAt: task.updatedAt || now,
    projectId: task.projectId,
    projectTitle: task.projectTitle,
    metadata: {
      ...task.metadata,
      originalStatus: task.status,
      taskMasterVersion: '1.0.0'
    }
  }));

  return {
    version: '1.0.0',
    tasks: vsTasks,
    metadata: {
      createdAt: now,
      updatedAt: now,
      source: 'taskmaster-claude-flow',
      sparcMappings: getDefaultSparcMappings()
    }
  };
}

/**
 * Convert VS Code extension format back to TaskMaster format
 */
export function convertFromExtensionFormat(vsFormat: VSCodeTaskFormat): TaskMasterTask[] {
  return vsFormat.tasks.map(vsTask => ({
    id: vsTask.id,
    title: vsTask.title,
    description: vsTask.description,
    type: vsTask.type,
    priority: vsTask.priority as 'high' | 'medium' | 'low',
    status: mapVSCodeStatusToTaskMaster(vsTask.status),
    assignee: vsTask.assignedAgent || null,
    sparc_mode: vsTask.sparcPhase,
    subtasks: vsTask.subtasks || [],
    dependencies: vsTask.dependencies || [],
    createdAt: vsTask.createdAt,
    updatedAt: vsTask.updatedAt,
    metadata: vsTask.metadata
  }));
}

/**
 * Map TaskMaster status to VS Code extension status
 */
function mapTaskMasterStatusToVSCode(status: string): string {
  const statusMap: Record<string, string> = {
    'pending': 'todo',
    'in_progress': 'in-progress',
    'completed': 'done',
    'blocked': 'blocked',
    'cancelled': 'cancelled'
  };
  
  return statusMap[status] || status;
}

/**
 * Map VS Code extension status to TaskMaster status
 */
function mapVSCodeStatusToTaskMaster(status: string): string {
  const statusMap: Record<string, string> = {
    'todo': 'pending',
    'in-progress': 'in_progress',
    'done': 'completed',
    'blocked': 'blocked',
    'cancelled': 'cancelled'
  };
  
  return statusMap[status] || status;
}

/**
 * Get default SPARC mappings for VS Code extension
 */
function getDefaultSparcMappings(): Record<string, string> {
  return {
    'architecture': 'architect',
    'implementation': 'code',
    'testing': 'tdd',
    'security': 'security-review',
    'documentation': 'docs-writer',
    'database': 'backend-only',
    'frontend': 'frontend-only',
    'api': 'api-only',
    'integration': 'integration',
    'debugging': 'debug',
    'optimization': 'refinement-optimization-mode'
  };
}

/**
 * Validate VS Code task format
 */
export function validateExtensionFormat(data: any): data is VSCodeTaskFormat {
  if (!data || typeof data !== 'object') return false;
  if (!data.version || typeof data.version !== 'string') return false;
  if (!Array.isArray(data.tasks)) return false;
  if (!data.metadata || typeof data.metadata !== 'object') return false;
  
  // Validate each task
  for (const task of data.tasks) {
    if (!task.id || !task.title || !task.status) return false;
  }
  
  return true;
}

/**
 * Merge task updates from VS Code extension
 */
export function mergeExtensionUpdates(
  existing: TaskMasterTask[],
  updates: VSCodeTaskFormat
): TaskMasterTask[] {
  const updatedTasks = convertFromExtensionFormat(updates);
  const taskMap = new Map(existing.map(t => [t.id, t]));
  
  // Merge updates
  for (const update of updatedTasks) {
    const existing = taskMap.get(update.id);
    if (existing) {
      // Merge with last-write-wins for most fields
      taskMap.set(update.id, {
        ...existing,
        ...update,
        // Preserve some fields from existing
        createdAt: existing.createdAt,
        metadata: {
          ...existing.metadata,
          ...update.metadata,
          lastSyncedAt: new Date().toISOString()
        }
      });
    } else {
      // New task from VS Code
      taskMap.set(update.id, update);
    }
  }
  
  return Array.from(taskMap.values());
}