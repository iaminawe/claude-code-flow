/**
 * Swarm Objective Types
 */

export interface Objective {
  id: string;
  name: string;
  description: string;
  tasks: TaskDefinition[];
  constraints?: {
    dependencies?: Array<{ from: string; to: string }>;
    parallel?: boolean;
    maxConcurrentTasks?: number;
  };
  metadata?: Record<string, any>;
}

export interface TaskDefinition {
  id: string;
  type: string;
  name: string;
  description: string;
  instructions: string;
  requirements: {
    capabilities: string[];
    tools: string[];
    permissions: string[];
  };
  constraints?: {
    dependencies?: string[];
    deadline?: Date;
    maxRetries?: number;
  };
  priority: number;
  metadata?: Record<string, any>;
}

export interface Task extends TaskDefinition {
  status: 'pending' | 'queued' | 'assigned' | 'running' | 'completed' | 'failed';
  assignedTo?: string;
  startedAt?: Date;
  completedAt?: Date;
  result?: any;
  error?: string;
  retryCount?: number;
}