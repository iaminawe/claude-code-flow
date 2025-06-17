/**
 * TaskMaster Swarm Strategy
 * Enables swarm to execute TaskMaster-generated tasks
 */

import { SwarmStrategy } from '../types/swarm.types.ts';
import { Objective, Task, TaskDefinition } from '../types/objective.types.ts';
import { AgentRequirements } from '../types/agent.types.ts';
import { TaskMasterDenoBridge } from '../../../integrations/taskmaster/deno-bridge.ts';
import { AgentMappingService } from '../../../integrations/taskmaster/services/agent-mapping-service.ts';
import { TaskAdapter } from '../../../integrations/taskmaster/adapters/task-adapter-deno.ts';
import type { Task as TaskMasterTask } from '../../../integrations/taskmaster/types/task-types.ts';

export interface TaskMasterInput {
  source: 'memory' | 'file' | 'prd';
  prdId?: string;
  prdFile?: string;
  taskIds?: string[];
  filter?: {
    priority?: string;
    status?: string;
    sparc_mode?: string;
  };
}

export class TaskMasterStrategy implements SwarmStrategy {
  private taskmaster: TaskMasterDenoBridge;
  private agentMapping: AgentMappingService;
  private taskAdapter: TaskAdapter;

  constructor() {
    this.taskmaster = new TaskMasterDenoBridge();
    this.agentMapping = new AgentMappingService();
    this.taskAdapter = new TaskAdapter();
  }

  async createObjective(input: string | TaskMasterInput): Promise<Objective> {
    // Parse input
    const config = typeof input === 'string' ? this.parseStringInput(input) : input;
    
    // Load TaskMaster tasks
    const tasks = await this.loadTaskMasterTasks(config);
    
    if (tasks.length === 0) {
      throw new Error('No TaskMaster tasks found matching criteria');
    }

    // Get project info from first task or PRD
    const projectName = await this.getProjectName(tasks, config);
    const projectDescription = await this.getProjectDescription(tasks, config);

    // Convert to swarm objective
    return this.convertToObjective(tasks, projectName, projectDescription, config);
  }

  private parseStringInput(input: string): TaskMasterInput {
    // Simple parsing for string inputs like "taskmaster:memory" or "taskmaster:file:project.prd"
    const parts = input.split(':');
    
    if (parts.length < 2 || parts[0] !== 'taskmaster') {
      return { source: 'memory' };
    }

    const source = parts[1] as 'memory' | 'file' | 'prd';
    const result: TaskMasterInput = { source };

    if (source === 'file' && parts[2]) {
      result.prdFile = parts[2];
    } else if (source === 'prd' && parts[2]) {
      result.prdId = parts[2];
    }

    return result;
  }

  private async loadTaskMasterTasks(config: TaskMasterInput): Promise<TaskMasterTask[]> {
    let allTasks: TaskMasterTask[] = [];

    switch (config.source) {
      case 'memory':
        // Load from memory (most recent tasks)
        const storedTasks = await this.taskmaster.getStoredTasks();
        if (storedTasks.length > 0) {
          // Get tasks from the most recent PRD
          // This is simplified - in reality we'd need to fetch the actual task data
          allTasks = await this.loadTasksFromMemory();
        }
        break;

      case 'file':
        // Load from specific file
        if (config.prdFile) {
          const tasks = await this.loadTasksFromFile(config.prdFile);
          allTasks = tasks;
        }
        break;

      case 'prd':
        // Load from specific PRD ID
        if (config.prdId) {
          const tasks = await this.loadTasksFromPRD(config.prdId);
          allTasks = tasks;
        }
        break;
    }

    // Apply filters if any
    if (config.filter) {
      allTasks = this.filterTasks(allTasks, config.filter);
    }

    // Filter specific task IDs if provided
    if (config.taskIds && config.taskIds.length > 0) {
      allTasks = allTasks.filter(task => config.taskIds!.includes(task.id));
    }

    return allTasks;
  }

  private async loadTasksFromMemory(): Promise<TaskMasterTask[]> {
    // Try to load from the most recent task file
    try {
      const files = await Deno.readDir('./');
      const taskFiles: string[] = [];
      
      for await (const file of files) {
        if (file.name.endsWith('-tasks.json')) {
          taskFiles.push(file.name);
        }
      }

      if (taskFiles.length > 0) {
        // Sort by modification time and get the most recent
        const mostRecent = taskFiles.sort().pop()!;
        const content = await Deno.readTextFile(mostRecent);
        return JSON.parse(content) as TaskMasterTask[];
      }
    } catch (error) {
      console.error('Failed to load tasks from memory:', error);
    }

    return [];
  }

  private async loadTasksFromFile(filename: string): Promise<TaskMasterTask[]> {
    try {
      const content = await Deno.readTextFile(filename);
      
      // Check if it's a JSON file (task export)
      if (filename.endsWith('.json')) {
        const data = JSON.parse(content);
        // Handle both direct task array and wrapped format
        if (Array.isArray(data)) {
          return data as TaskMasterTask[];
        } else if (data.tasks && Array.isArray(data.tasks)) {
          return data.tasks as TaskMasterTask[];
        }
      } 
      // If it's a PRD file, we need to generate tasks first
      else if (filename.endsWith('.prd') || filename.endsWith('.md')) {
        console.log('Generating tasks from PRD file...');
        // Use TaskMaster to generate tasks from PRD
        const tasks = await this.taskmaster.generateTasksFromPRD(filename);
        return tasks;
      }
      
      throw new Error('Unsupported file format. Use .json (exported tasks) or .prd (PRD document)');
    } catch (error) {
      console.error(`Failed to load tasks from file ${filename}:`, error);
      return [];
    }
  }

  private async loadTasksFromPRD(prdId: string): Promise<TaskMasterTask[]> {
    // This would need to be implemented to fetch tasks by PRD ID
    console.warn('Loading tasks by PRD ID not yet implemented');
    return [];
  }

  private filterTasks(tasks: TaskMasterTask[], filter: any): TaskMasterTask[] {
    return tasks.filter(task => {
      if (filter.priority && task.priority !== filter.priority) return false;
      if (filter.status && task.status !== filter.status) return false;
      if (filter.sparc_mode && task.sparc_mode !== filter.sparc_mode) return false;
      return true;
    });
  }

  private async getProjectName(tasks: TaskMasterTask[], config: TaskMasterInput): Promise<string> {
    // Try to get from PRD metadata or use generic name
    if (config.prdFile) {
      const filename = config.prdFile.split('/').pop() || config.prdFile;
      return filename.replace(/\.(prd|json)$/, '').replace(/[-_]/g, ' ');
    }
    return 'TaskMaster Project';
  }

  private async getProjectDescription(tasks: TaskMasterTask[], config: TaskMasterInput): Promise<string> {
    return `Executing ${tasks.length} tasks generated by TaskMaster with SPARC methodology`;
  }

  private convertToObjective(
    tasks: TaskMasterTask[],
    projectName: string,
    projectDescription: string,
    config: TaskMasterInput
  ): Objective {
    // Sort tasks by dependencies
    const sortedTasks = this.sortByDependencies(tasks);
    
    // Convert to swarm tasks
    const swarmTasks = sortedTasks.map(task => this.convertToSwarmTask(task));

    // Extract dependencies
    const dependencies = this.extractDependencies(sortedTasks);

    return {
      id: `taskmaster-${Date.now()}`,
      name: projectName,
      description: projectDescription,
      tasks: swarmTasks,
      constraints: {
        dependencies,
        parallel: true,
        maxConcurrentTasks: 10
      },
      metadata: {
        source: 'taskmaster',
        totalTasks: tasks.length,
        config
      }
    };
  }

  private sortByDependencies(tasks: TaskMasterTask[]): TaskMasterTask[] {
    // Topological sort
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

  private convertToSwarmTask(tmTask: TaskMasterTask): TaskDefinition {
    // Get agent requirements from SPARC mode
    const agentInfo = this.agentMapping.getAgentTypeForSparcMode(tmTask.sparc_mode || 'code');
    
    // Build task instructions
    const instructions = this.buildTaskInstructions(tmTask);

    // Map priority
    const priority = this.mapPriority(tmTask.priority);

    return {
      id: tmTask.id,
      type: tmTask.type,
      name: tmTask.title,
      description: tmTask.description,
      instructions,
      requirements: {
        capabilities: agentInfo.capabilities,
        tools: agentInfo.tools,
        permissions: []
      },
      constraints: {
        dependencies: tmTask.dependencies || [],
        deadline: undefined,
        maxRetries: 3
      },
      priority,
      metadata: {
        sparcMode: tmTask.sparc_mode,
        agentType: agentInfo.type,
        originalTask: tmTask
      }
    };
  }

  private buildTaskInstructions(task: TaskMasterTask): string {
    let instructions = `Task: ${task.title}\n\n`;
    instructions += `Description: ${task.description}\n\n`;
    
    if (task.sparc_mode) {
      instructions += `SPARC Mode: ${task.sparc_mode}\n`;
      instructions += this.getSparcModeInstructions(task.sparc_mode);
    }

    if (task.metadata) {
      if (task.metadata.source_section) {
        instructions += `\nSource: ${task.metadata.source_section}\n`;
      }
      if (task.metadata.estimated_hours) {
        instructions += `Estimated Time: ${task.metadata.estimated_hours} hours\n`;
      }
    }

    return instructions;
  }

  private getSparcModeInstructions(sparcMode: string): string {
    const instructions: { [key: string]: string } = {
      'architect': '\nApproach: Design system architecture, create diagrams, define components and relationships.\n',
      'code': '\nApproach: Implement clean, modular, well-documented code following best practices.\n',
      'tdd': '\nApproach: Follow Red-Green-Refactor cycle. Write tests first, then implementation.\n',
      'security-review': '\nApproach: Analyze for vulnerabilities, check security best practices, review authentication.\n',
      'docs-writer': '\nApproach: Create clear, comprehensive documentation with examples.\n',
      'debug': '\nApproach: Identify root cause, analyze errors, implement fixes with tests.\n',
      'integration': '\nApproach: Connect systems, handle data flow, ensure compatibility.\n'
    };

    return instructions[sparcMode] || '\nApproach: Complete the task following best practices.\n';
  }

  private mapPriority(priority: string): number {
    switch (priority) {
      case 'high': return 80;
      case 'medium': return 50;
      case 'low': return 20;
      default: return 50;
    }
  }

  private extractDependencies(tasks: TaskMasterTask[]): Array<{ from: string; to: string }> {
    const dependencies: Array<{ from: string; to: string }> = [];

    for (const task of tasks) {
      if (task.dependencies && task.dependencies.length > 0) {
        for (const depId of task.dependencies) {
          dependencies.push({
            from: depId,
            to: task.id
          });
        }
      }
    }

    return dependencies;
  }

  async validateObjective(objective: Objective): Promise<boolean> {
    // Validate that all tasks have required fields
    for (const task of objective.tasks) {
      if (!task.id || !task.name || !task.instructions) {
        return false;
      }
    }

    // Validate dependencies exist
    if (objective.constraints?.dependencies) {
      const taskIds = new Set(objective.tasks.map(t => t.id));
      for (const dep of objective.constraints.dependencies) {
        if (!taskIds.has(dep.from) || !taskIds.has(dep.to)) {
          return false;
        }
      }
    }

    return true;
  }

  getStrategyMetadata() {
    return {
      name: 'TaskMaster Strategy',
      version: '1.0.0',
      description: 'Execute TaskMaster-generated tasks with SPARC methodology',
      capabilities: [
        'prd-parsing',
        'task-generation',
        'sparc-mapping',
        'dependency-management',
        'parallel-execution'
      ]
    };
  }
}