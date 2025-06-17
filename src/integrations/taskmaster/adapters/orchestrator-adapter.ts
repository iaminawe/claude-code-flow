/**
 * TaskMaster Orchestrator Adapter
 * Bridges TaskMaster tasks with Claude-Flow orchestration system
 */

import { TaskAdapter } from './task-adapter-deno.ts';
import { TaskMasterDenoBridge } from '../deno-bridge.ts';
import { AgentMappingService } from '../services/agent-mapping-service.ts';
import { TaskMasterProgressMonitor } from '../services/progress-monitor.ts';
import { TaskMasterStatusSync } from '../services/status-sync.ts';
import { ExecutionStorage } from '../services/execution-storage.ts';
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
  private progressMonitor: TaskMasterProgressMonitor;
  private statusSync: TaskMasterStatusSync;
  private executionStorage: ExecutionStorage;

  constructor() {
    this.taskAdapter = new TaskAdapter();
    this.agentMapping = new AgentMappingService();
    this.taskmaster = new TaskMasterDenoBridge();
    this.progressMonitor = new TaskMasterProgressMonitor(this.taskmaster);
    this.statusSync = new TaskMasterStatusSync(this.taskmaster, this);
    this.executionStorage = new ExecutionStorage();
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
      
      // Save execution to storage
      await this.executionStorage.saveExecution({
        executionId,
        taskId,
        status: 'queued',
        mode: 'single',
        startTime: new Date().toISOString(),
        metadata: {
          taskTitle: tmTask.title,
          taskType: tmTask.type,
          priority: tmTask.priority,
          sparcMode: tmTask.sparc_mode,
          agentType: options?.agentType || 'auto'
        }
      });
      
      // Track execution in progress monitor
      this.progressMonitor.trackExecution(taskId, executionId);
      
      // Update task status in TaskMaster
      await this.taskmaster.updateTaskStatus(taskId, 'in_progress');
      
      // Update execution status to running
      await this.executionStorage.updateExecutionStatus(executionId, 'running');
      
      // Queue status sync
      this.statusSync.queueStatusUpdate(taskId, 'in_progress', 'orchestrator');

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
    const execution = await this.executionStorage.getExecution(executionId);
    
    if (!execution) {
      return {
        executionId,
        status: 'unknown',
        message: 'Execution not found'
      };
    }
    
    return {
      executionId: execution.executionId,
      status: execution.status,
      mode: execution.mode,
      startTime: execution.startTime,
      endTime: execution.endTime,
      progress: execution.progress,
      metadata: execution.metadata,
      logs: execution.logs,
      error: execution.error
    };
  }

  private async fetchTaskMasterTask(taskId: string): Promise<TaskMasterTask | null> {
    try {
      const task = await this.taskmaster.getTaskById(taskId);
      if (!task) {
        console.error(`Task ${taskId} not found in taskmaster.getTaskById`);
      }
      return task;
    } catch (error) {
      console.error(`Error fetching task ${taskId}:`, error);
      return null;
    }
  }

  private async fetchAllTasks(): Promise<TaskMasterTask[]> {
    try {
      // Get all tasks from memory storage
      const allTasks: TaskMasterTask[] = [];
      const taskEntries = await this.taskmaster.memory.query('tasks_', 'taskmaster_tasks');
      
      for (const entry of taskEntries) {
        try {
          const tasks = JSON.parse(entry.value) as TaskMasterTask[];
          allTasks.push(...tasks);
        } catch (e) {
          console.error(`Failed to parse tasks from ${entry.key}:`, e);
        }
      }
      
      return allTasks;
    } catch (error) {
      console.error('Error fetching all tasks:', error);
      return [];
    }
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

  /**
   * Start monitoring and status synchronization
   */
  startMonitoring(options?: {
    progressInterval?: number;
    syncInterval?: number;
    dashboardCallback?: (dashboard: any) => void;
  }): void {
    const { progressInterval = 1000, syncInterval = 5000, dashboardCallback } = options || {};
    
    // Start progress monitoring
    this.progressMonitor.startMonitoring(progressInterval);
    if (dashboardCallback) {
      this.progressMonitor.onDashboardUpdate(dashboardCallback);
    }
    
    // Start status synchronization
    this.statusSync.startSync(syncInterval);
  }

  /**
   * Stop monitoring and synchronization
   */
  stopMonitoring(): void {
    this.progressMonitor.stopMonitoring();
    this.statusSync.stopSync();
  }

  /**
   * Get current progress dashboard
   */
  async getProgressDashboard(): Promise<any> {
    return await this.progressMonitor.getProgressDashboard();
  }

  /**
   * Get sync status
   */
  getSyncStatus(): any {
    return this.statusSync.getSyncStatus();
  }

  /**
   * Simulate task completion (for testing)
   */
  simulateTaskCompletion(executionId: string, success: boolean = true): void {
    this.progressMonitor.updateExecution(executionId, {
      status: success ? 'completed' : 'failed',
      endTime: new Date(),
      error: success ? undefined : 'Simulated failure'
    });
  }
}