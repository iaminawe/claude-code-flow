/**
 * TaskMaster Progress Monitor
 * Real-time tracking of task execution across all agents
 */

import { EventEmitter } from '../../cli/commands/start/event-emitter.ts';
import { TaskMasterDenoBridge } from '../deno-bridge.ts';
import type { Task as TaskMasterTask } from '../types/task-types.ts';

export interface ExecutionInfo {
  taskId: string;
  executionId: string;
  agentId?: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  progress?: number;
  logs?: string[];
  error?: string;
}

export interface ProgressDashboard {
  overview: {
    totalTasks: number;
    completedTasks: number;
    runningTasks: number;
    failedTasks: number;
    queuedTasks: number;
    progressPercentage: number;
  };
  activeTasks: Array<{
    taskId: string;
    title: string;
    agentId: string;
    status: string;
    duration: number;
    progress: number;
  }>;
  agentStatus: Array<{
    agentId: string;
    type: string;
    status: 'idle' | 'busy' | 'failed';
    currentTask?: string;
    tasksCompleted: number;
    utilization: number;
  }>;
  timeline: Array<{
    timestamp: Date;
    event: string;
    taskId?: string;
    agentId?: string;
    details?: any;
  }>;
  estimates: {
    estimatedCompletionTime: Date | null;
    averageTaskDuration: number;
    remainingTasks: number;
    currentVelocity: number;
  };
}

export class TaskMasterProgressMonitor extends EventEmitter {
  private executionState: Map<string, ExecutionInfo> = new Map();
  private taskmaster: TaskMasterDenoBridge;
  private startTime: Date;
  private updateInterval?: number;
  private dashboardUpdateCallback?: (dashboard: ProgressDashboard) => void;

  constructor(taskmaster?: TaskMasterDenoBridge) {
    super();
    this.taskmaster = taskmaster || new TaskMasterDenoBridge();
    this.startTime = new Date();
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Listen for task events
    this.on('task:queued', this.handleTaskQueued.bind(this));
    this.on('task:started', this.handleTaskStarted.bind(this));
    this.on('task:progress', this.handleTaskProgress.bind(this));
    this.on('task:completed', this.handleTaskCompleted.bind(this));
    this.on('task:failed', this.handleTaskFailed.bind(this));
  }

  /**
   * Start monitoring with automatic dashboard updates
   */
  startMonitoring(updateIntervalMs: number = 1000): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(async () => {
      const dashboard = await this.getProgressDashboard();
      if (this.dashboardUpdateCallback) {
        this.dashboardUpdateCallback(dashboard);
      }
      this.emit('dashboard:update', dashboard);
    }, updateIntervalMs);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = undefined;
    }
  }

  /**
   * Set callback for dashboard updates
   */
  onDashboardUpdate(callback: (dashboard: ProgressDashboard) => void): void {
    this.dashboardUpdateCallback = callback;
  }

  /**
   * Track a new task execution
   */
  trackExecution(taskId: string, executionId: string): void {
    const execution: ExecutionInfo = {
      taskId,
      executionId,
      status: 'queued',
      startTime: new Date()
    };
    this.executionState.set(executionId, execution);
    this.emit('task:queued', { taskId, executionId });
  }

  /**
   * Update execution status
   */
  updateExecution(executionId: string, updates: Partial<ExecutionInfo>): void {
    const execution = this.executionState.get(executionId);
    if (execution) {
      Object.assign(execution, updates);
      this.executionState.set(executionId, execution);
      
      // Emit appropriate event
      if (updates.status === 'running' && updates.agentId) {
        this.emit('task:started', { 
          taskId: execution.taskId, 
          executionId, 
          agentId: updates.agentId 
        });
      } else if (updates.status === 'completed') {
        this.emit('task:completed', { 
          taskId: execution.taskId, 
          executionId,
          duration: execution.endTime ? 
            execution.endTime.getTime() - execution.startTime.getTime() : 0
        });
      } else if (updates.status === 'failed') {
        this.emit('task:failed', { 
          taskId: execution.taskId, 
          executionId,
          error: updates.error 
        });
      } else if (updates.progress !== undefined) {
        this.emit('task:progress', { 
          taskId: execution.taskId, 
          executionId,
          progress: updates.progress 
        });
      }
    }
  }

  /**
   * Get comprehensive progress dashboard
   */
  async getProgressDashboard(): Promise<ProgressDashboard> {
    const executions = Array.from(this.executionState.values());
    
    // Calculate overview
    const overview = this.calculateOverview(executions);
    
    // Get active tasks
    const activeTasks = this.getActiveTasks(executions);
    
    // Get agent status (mock for now)
    const agentStatus = this.getAgentStatus();
    
    // Generate timeline
    const timeline = this.generateTimeline();
    
    // Calculate estimates
    const estimates = this.calculateEstimates(executions);

    return {
      overview,
      activeTasks,
      agentStatus,
      timeline,
      estimates
    };
  }

  private calculateOverview(executions: ExecutionInfo[]): ProgressDashboard['overview'] {
    const totalTasks = executions.length;
    const completedTasks = executions.filter(e => e.status === 'completed').length;
    const runningTasks = executions.filter(e => e.status === 'running').length;
    const failedTasks = executions.filter(e => e.status === 'failed').length;
    const queuedTasks = executions.filter(e => e.status === 'queued').length;
    
    const progressPercentage = totalTasks > 0 ? 
      Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalTasks,
      completedTasks,
      runningTasks,
      failedTasks,
      queuedTasks,
      progressPercentage
    };
  }

  private getActiveTasks(executions: ExecutionInfo[]): ProgressDashboard['activeTasks'] {
    return executions
      .filter(e => e.status === 'running')
      .map(e => ({
        taskId: e.taskId,
        title: `Task ${e.taskId}`, // Would need to fetch from TaskMaster
        agentId: e.agentId || 'unknown',
        status: e.status,
        duration: Date.now() - e.startTime.getTime(),
        progress: e.progress || 0
      }));
  }

  private getAgentStatus(): ProgressDashboard['agentStatus'] {
    // Mock implementation - would integrate with actual agent pool
    return [];
  }

  private generateTimeline(): ProgressDashboard['timeline'] {
    // Return last 50 events
    const events: ProgressDashboard['timeline'] = [];
    
    // Add recent events from execution state
    for (const [execId, execution] of this.executionState.entries()) {
      events.push({
        timestamp: execution.startTime,
        event: 'task_queued',
        taskId: execution.taskId,
        details: { executionId: execId }
      });
      
      if (execution.endTime) {
        events.push({
          timestamp: execution.endTime,
          event: execution.status === 'completed' ? 'task_completed' : 'task_failed',
          taskId: execution.taskId,
          agentId: execution.agentId,
          details: { 
            executionId: execId,
            duration: execution.endTime.getTime() - execution.startTime.getTime()
          }
        });
      }
    }
    
    // Sort by timestamp and return last 50
    return events
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 50);
  }

  private calculateEstimates(executions: ExecutionInfo[]): ProgressDashboard['estimates'] {
    const completed = executions.filter(e => e.status === 'completed');
    const remaining = executions.filter(e => 
      e.status === 'queued' || e.status === 'running'
    ).length;
    
    // Calculate average duration
    let averageTaskDuration = 0;
    if (completed.length > 0) {
      const totalDuration = completed.reduce((sum, e) => {
        if (e.endTime) {
          return sum + (e.endTime.getTime() - e.startTime.getTime());
        }
        return sum;
      }, 0);
      averageTaskDuration = totalDuration / completed.length;
    }
    
    // Calculate velocity (tasks per minute)
    const elapsedMinutes = (Date.now() - this.startTime.getTime()) / 60000;
    const currentVelocity = elapsedMinutes > 0 ? completed.length / elapsedMinutes : 0;
    
    // Estimate completion time
    let estimatedCompletionTime: Date | null = null;
    if (currentVelocity > 0 && remaining > 0) {
      const remainingMinutes = remaining / currentVelocity;
      estimatedCompletionTime = new Date(Date.now() + remainingMinutes * 60000);
    }

    return {
      estimatedCompletionTime,
      averageTaskDuration,
      remainingTasks: remaining,
      currentVelocity
    };
  }

  // Event handlers
  private handleTaskQueued(event: any): void {
    // Log to timeline
    console.log(`Task ${event.taskId} queued for execution`);
  }

  private handleTaskStarted(event: any): void {
    console.log(`Task ${event.taskId} started on agent ${event.agentId}`);
  }

  private handleTaskProgress(event: any): void {
    console.log(`Task ${event.taskId} progress: ${event.progress}%`);
  }

  private handleTaskCompleted(event: any): void {
    console.log(`Task ${event.taskId} completed in ${event.duration}ms`);
    
    // Update TaskMaster status
    this.taskmaster.updateTaskStatus(event.taskId, 'completed').catch(err => {
      console.error(`Failed to update TaskMaster status: ${err}`);
    });
  }

  private handleTaskFailed(event: any): void {
    console.error(`Task ${event.taskId} failed: ${event.error}`);
    
    // Update TaskMaster status
    this.taskmaster.updateTaskStatus(event.taskId, 'blocked').catch(err => {
      console.error(`Failed to update TaskMaster status: ${err}`);
    });
  }

  /**
   * Get execution info for a specific task
   */
  getTaskExecution(taskId: string): ExecutionInfo | undefined {
    for (const execution of this.executionState.values()) {
      if (execution.taskId === taskId) {
        return execution;
      }
    }
    return undefined;
  }

  /**
   * Clear all execution state
   */
  clear(): void {
    this.executionState.clear();
    this.stopMonitoring();
  }
}