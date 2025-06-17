/**
 * Execution Storage Service
 * Manages persistent storage of execution data
 */

import { join } from 'https://deno.land/std@0.224.0/path/mod.ts';
import { ensureDir, exists } from 'https://deno.land/std@0.224.0/fs/mod.ts';

export interface ExecutionRecord {
  executionId: string;
  taskId?: string;
  taskIds?: string[];
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  mode: 'single' | 'bulk';
  startTime: string;
  endTime?: string;
  progress?: {
    total: number;
    completed: number;
    failed: number;
    running: number;
  };
  agentId?: string;
  result?: any;
  error?: string;
  logs?: string[];
  metadata?: Record<string, any>;
}

export class ExecutionStorage {
  private storageDir: string;
  private executionsFile: string;
  private detailsDir: string;

  constructor(baseDir: string = '.taskmaster') {
    this.storageDir = join(baseDir, 'executions');
    this.executionsFile = join(this.storageDir, 'executions.json');
    this.detailsDir = join(this.storageDir, 'details');
  }

  async init(): Promise<void> {
    await ensureDir(this.storageDir);
    await ensureDir(this.detailsDir);
    
    // Initialize executions file if it doesn't exist
    if (!await exists(this.executionsFile)) {
      await Deno.writeTextFile(this.executionsFile, JSON.stringify({
        version: '1.0.0',
        executions: {}
      }, null, 2));
    }
  }

  async saveExecution(execution: ExecutionRecord): Promise<void> {
    await this.init();
    
    // Load existing executions
    const data = JSON.parse(await Deno.readTextFile(this.executionsFile));
    
    // Update execution record
    data.executions[execution.executionId] = {
      executionId: execution.executionId,
      taskId: execution.taskId,
      taskIds: execution.taskIds,
      status: execution.status,
      mode: execution.mode,
      startTime: execution.startTime,
      endTime: execution.endTime,
      metadata: execution.metadata
    };
    
    // Save back to file
    await Deno.writeTextFile(this.executionsFile, JSON.stringify(data, null, 2));
    
    // Save detailed execution data
    const detailFile = join(this.detailsDir, `${execution.executionId}.json`);
    await Deno.writeTextFile(detailFile, JSON.stringify(execution, null, 2));
  }

  async getExecution(executionId: string): Promise<ExecutionRecord | null> {
    try {
      const detailFile = join(this.detailsDir, `${executionId}.json`);
      if (await exists(detailFile)) {
        const content = await Deno.readTextFile(detailFile);
        return JSON.parse(content);
      }
      
      // Fallback to main file
      const data = JSON.parse(await Deno.readTextFile(this.executionsFile));
      const execution = data.executions[executionId];
      
      if (execution) {
        return execution;
      }
    } catch (error) {
      console.error('Failed to get execution:', error);
    }
    
    return null;
  }

  async updateExecutionStatus(
    executionId: string, 
    status: ExecutionRecord['status'],
    updates?: Partial<ExecutionRecord>
  ): Promise<void> {
    const execution = await this.getExecution(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }

    execution.status = status;
    if (status === 'completed' || status === 'failed' || status === 'cancelled') {
      execution.endTime = new Date().toISOString();
    }

    if (updates) {
      Object.assign(execution, updates);
    }

    await this.saveExecution(execution);
  }

  async updateProgress(
    executionId: string,
    progress: ExecutionRecord['progress']
  ): Promise<void> {
    await this.updateExecutionStatus(executionId, 'running', { progress });
  }

  async addLog(executionId: string, log: string): Promise<void> {
    const execution = await this.getExecution(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }

    if (!execution.logs) {
      execution.logs = [];
    }
    execution.logs.push(`[${new Date().toISOString()}] ${log}`);
    
    await this.saveExecution(execution);
  }

  async getAllExecutions(): Promise<ExecutionRecord[]> {
    try {
      const data = JSON.parse(await Deno.readTextFile(this.executionsFile));
      return Object.values(data.executions);
    } catch {
      return [];
    }
  }

  async getRecentExecutions(limit: number = 10): Promise<ExecutionRecord[]> {
    const executions = await this.getAllExecutions();
    return executions
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, limit);
  }

  async cleanupOldExecutions(daysToKeep: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const executions = await this.getAllExecutions();
    let cleaned = 0;
    
    for (const execution of executions) {
      const startDate = new Date(execution.startTime);
      if (startDate < cutoffDate) {
        // Remove detail file
        const detailFile = join(this.detailsDir, `${execution.executionId}.json`);
        try {
          await Deno.remove(detailFile);
          cleaned++;
        } catch {
          // File might not exist
        }
      }
    }
    
    // Update main file
    const data = JSON.parse(await Deno.readTextFile(this.executionsFile));
    const remainingExecutions: Record<string, ExecutionRecord> = {};
    
    for (const [id, execution] of Object.entries(data.executions as Record<string, ExecutionRecord>)) {
      const startDate = new Date(execution.startTime);
      if (startDate >= cutoffDate) {
        remainingExecutions[id] = execution;
      }
    }
    
    data.executions = remainingExecutions;
    await Deno.writeTextFile(this.executionsFile, JSON.stringify(data, null, 2));
    
    return cleaned;
  }
}