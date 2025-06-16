/**
 * Convert TaskMaster tasks to VS Code extension format
 */

export interface ExtensionTask {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'completed' | 'blocked';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  subtasks?: ExtensionTask[];
  parent?: string;
  progress?: number;
  expanded?: boolean;
  createdAt: string;
  updatedAt: string;
  sparcPhase?: string;
  assignedAgent?: string;
  estimatedHours?: number;
  dependencies?: string[];
  metadata?: any;
}

export interface ExtensionTaskFile {
  tasks: ExtensionTask[];
  version: string;
  metadata?: {
    lastSync?: string;
    source?: string;
  };
}

function convertStatus(status: string): 'todo' | 'in-progress' | 'completed' | 'blocked' {
  switch (status) {
    case 'pending':
      return 'todo';
    case 'in_progress':
      return 'in-progress';
    case 'completed':
      return 'completed';
    case 'blocked':
      return 'blocked';
    default:
      return 'todo';
  }
}

function convertPriority(priority: string): 'low' | 'medium' | 'high' | 'critical' {
  switch (priority) {
    case 'low':
      return 'low';
    case 'medium':
      return 'medium';
    case 'high':
      return 'high';
    case 'critical':
      return 'critical';
    default:
      return 'medium';
  }
}

export function convertToExtensionFormat(tasks: any[]): ExtensionTaskFile {
  const extensionTasks: ExtensionTask[] = tasks.map(task => ({
    id: task.id,
    title: task.title || `Task ${task.id}`,
    description: task.description,
    status: convertStatus(task.status),
    priority: task.priority ? convertPriority(task.priority) : 'medium',
    subtasks: task.subtasks?.map((subtask: any) => convertTaskToExtension(subtask)) || [],
    parent: task.parent_id,
    progress: task.progress || 0,
    expanded: true,
    createdAt: task.createdAt || new Date().toISOString(),
    updatedAt: task.updatedAt || new Date().toISOString(),
    sparcPhase: task.sparc_mode,
    assignedAgent: task.assignee,
    estimatedHours: task.estimated_hours,
    dependencies: task.dependencies || [],
    metadata: {
      ...task.metadata,
      claudeFlowEnhanced: true,
      aiGenerated: task.ai_generated || false
    }
  }));

  return {
    tasks: extensionTasks,
    version: '1.0.0',
    metadata: {
      lastSync: new Date().toISOString(),
      source: 'claude-flow-taskmaster'
    }
  };
}

function convertTaskToExtension(task: any): ExtensionTask {
  return {
    id: task.id,
    title: task.title || `Task ${task.id}`,
    description: task.description,
    status: convertStatus(task.status),
    priority: task.priority ? convertPriority(task.priority) : 'medium',
    subtasks: task.subtasks?.map((subtask: any) => convertTaskToExtension(subtask)) || [],
    parent: task.parent_id,
    progress: task.progress || 0,
    expanded: true,
    createdAt: task.createdAt || new Date().toISOString(),
    updatedAt: task.updatedAt || new Date().toISOString(),
    sparcPhase: task.sparc_mode,
    assignedAgent: task.assignee,
    estimatedHours: task.estimated_hours,
    dependencies: task.dependencies || [],
    metadata: {
      ...task.metadata,
      claudeFlowEnhanced: true
    }
  };
}