/**
 * TaskMaster Orchestrator Adapter
 * Bridges TaskMaster tasks with Claude-Flow orchestration system
 */

import { TaskAdapter } from './task-adapter-deno.ts';
import { TaskMasterDenoBridge } from '../deno-bridge.ts';
import { AgentMappingService } from '../services/agent-mapping-service.ts';
import type { Task as TaskMasterTask } from '../types/task-types.ts';
import type { Task as ClaudeFlowTask } from '../../../core/types/task.types.ts';

export interface ExecutionResult {
  executionId: string;
  taskId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  agentId?: string;
  startTime?: Date;
  endTime?: Date;
  result?: any;
  error?: string;
}

export interface ExecutionOptions {
  agentType?: string;
  timeout?: number;
  retryCount?: number;
  priority?: number;
}

export class TaskMasterOrchestratorAdapter {
  private taskAdapter: TaskAdapter;
  private agentMapping: AgentMappingService;
  private taskmaster: TaskMasterDenoBridge;

  constructor() {
    this.taskAdapter = new TaskAdapter();
    this.agentMapping = new AgentMappingService();
    this.taskmaster = new TaskMasterDenoBridge();
  }

  /**
   * Execute a single TaskMaster task through the orchestrator
   */
  async executeTask(taskId: string, options?: ExecutionOptions): Promise<ExecutionResult> {
    try {
      // 1. Fetch TaskMaster task
      const tmTask = await this.fetchTaskMasterTask(taskId);
      if (!tmTask) {
        throw new Error(`Task ${taskId} not found`);
      }

      // 2. Convert to Claude-Flow format
      const cfTask = this.taskAdapter.toClaudeFlow(tmTask);

      // 3. Enhance with SPARC mapping
      const enhancedTask = this.enhanceWithSparcMapping(cfTask, tmTask);

      // 4. Apply execution options
      if (options) {
        if (options.priority !== undefined) {
          enhancedTask.priority = options.priority;
        }
        if (options.timeout) {
          enhancedTask.metadata = {
            ...enhancedTask.metadata,
            timeout: options.timeout
          };
        }
      }

      // 5. Submit to orchestrator (placeholder for now)
      const executionId = this.generateExecutionId();
      
      // Update task status in TaskMaster
      await this.taskmaster.updateTaskStatus(taskId, 'in_progress');

      // Return execution result
      return {
        executionId,
        taskId,
        status: 'queued',
        startTime: new Date()
      };

    } catch (error) {
      return {
        executionId: this.generateExecutionId(),
        taskId,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Execute all tasks from a PRD or task list
   */
  async executeAll(options?: {
    prdId?: string;
    taskIds?: string[];
    filter?: any;
    parallel?: boolean;
    maxAgents?: number;
  }): Promise<{
    executionId: string;
    totalTasks: number;
    status: string;
  }> {
    try {
      // Get tasks based on options
      let tasks: TaskMasterTask[] = [];
      
      if (options?.taskIds) {
        // Execute specific tasks
        for (const id of options.taskIds) {
          const task = await this.fetchTaskMasterTask(id);
          if (task) tasks.push(task);
        }
      } else {
        // Get all stored tasks
        const storedTasks = await this.taskmaster.getStoredTasks();
        if (storedTasks.length > 0) {
          // Get tasks from the most recent PRD
          const latestPrd = storedTasks[storedTasks.length - 1];
          // Fetch actual tasks (this is a simplified version)
          tasks = await this.fetchAllTasks();
        }
      }

      // Apply filters if any
      if (options?.filter) {
        tasks = this.filterTasks(tasks, options.filter);
      }

      // Sort by dependencies
      const sortedTasks = this.sortByDependencies(tasks);

      // Execute tasks
      const executionId = this.generateExecutionId();
      
      for (const task of sortedTasks) {
        await this.executeTask(task.id, {
          priority: this.getPriorityValue(task.priority)
        });
      }

      return {
        executionId,
        totalTasks: tasks.length,
        status: 'running'
      };

    } catch (error) {
      return {
        executionId: this.generateExecutionId(),
        totalTasks: 0,
        status: 'failed'
      };
    }
  }

  /**
   * Get execution status
   */
  async getExecutionStatus(executionId: string): Promise<any> {
    // Placeholder implementation
    return {
      executionId,
      status: 'unknown',
      message: 'Status tracking not yet implemented'
    };
  }

  private async fetchTaskMasterTask(taskId: string): Promise<TaskMasterTask | null> {
    try {
      const task = await this.taskmaster.getTaskById(taskId);
      return task;
    } catch {
      return null;
    }
  }

  private async fetchAllTasks(): Promise<TaskMasterTask[]> {
    // This would need to be implemented in TaskMasterDenoBridge
    // For now, return empty array
    return [];
  }

  private enhanceWithSparcMapping(
    cfTask: ClaudeFlowTask,
    tmTask: TaskMasterTask
  ): ClaudeFlowTask {
    // Get agent type from SPARC mode
    const agentInfo = this.agentMapping.getAgentTypeForSparcMode(tmTask.sparc_mode || 'code');
    
    return {
      ...cfTask,
      metadata: {
        ...cfTask.metadata,
        agentType: agentInfo.type,
        requiredCapabilities: agentInfo.capabilities,
        sparcMode: tmTask.sparc_mode
      }
    };
  }

  private filterTasks(tasks: TaskMasterTask[], filter: any): TaskMasterTask[] {
    return tasks.filter(task => {
      if (filter.priority && task.priority !== filter.priority) return false;
      if (filter.status && task.status !== filter.status) return false;
      if (filter.sparc_mode && task.sparc_mode !== filter.sparc_mode) return false;
      return true;
    });
  }

  private sortByDependencies(tasks: TaskMasterTask[]): TaskMasterTask[] {
    // Simple topological sort
    const sorted: TaskMasterTask[] = [];
    const visited = new Set<string>();
    const taskMap = new Map(tasks.map(t => [t.id, t]));

    const visit = (taskId: string) => {
      if (visited.has(taskId)) return;
      visited.add(taskId);
      
      const task = taskMap.get(taskId);
      if (!task) return;

      // Visit dependencies first
      if (task.dependencies) {
        for (const depId of task.dependencies) {
          visit(depId);
        }
      }

      sorted.push(task);
    };

    // Visit all tasks
    for (const task of tasks) {
      visit(task.id);
    }

    return sorted;
  }

  private getPriorityValue(priority: string): number {
    switch (priority) {
      case 'high': return 80;
      case 'medium': return 50;
      case 'low': return 20;
      default: return 50;
    }
  }

  private generateExecutionId(): string {
    return `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}