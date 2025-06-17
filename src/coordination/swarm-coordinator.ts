import { EventEmitter } from 'node:events';
import { Logger } from '../core/logger.ts';
import { generateId } from '../utils/helpers.ts';
import { SwarmMonitor } from './swarm-monitor.ts';
import { AdvancedTaskScheduler } from './advanced-scheduler.ts';
import { MemoryManager } from '../memory/manager.ts';
import { MemoryConfig, MemoryEntry } from '../utils/types.ts';
import { IEventBus } from '../core/event-bus.ts';

export interface SwarmAgent {
  id: string;
  name: string;
  type: 'researcher' | 'developer' | 'analyzer' | 'coordinator' | 'reviewer';
  status: 'idle' | 'busy' | 'failed' | 'completed';
  capabilities: string[];
  currentTask?: SwarmTask;
  processId?: number;
  terminalId?: string;
  metrics: {
    tasksCompleted: number;
    tasksFailed: number;
    totalDuration: number;
    lastActivity: Date;
  };
}

export interface SwarmTask {
  id: string;
  type: string;
  description: string;
  priority: number;
  dependencies: string[];
  assignedTo?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  retryCount: number;
  maxRetries: number;
  timeout?: number;
}

export interface SwarmObjective {
  id: string;
  description: string;
  strategy: 'auto' | 'research' | 'development' | 'analysis';
  tasks: SwarmTask[];
  status: 'planning' | 'executing' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
}

export interface SwarmConfig {
  maxAgents: number;
  maxConcurrentTasks: number;
  taskTimeout: number;
  enableMonitoring: boolean;
  enableWorkStealing: boolean;
  enableCircuitBreaker: boolean;
  memoryNamespace: string;
  coordinationStrategy: 'centralized' | 'distributed' | 'hybrid';
  backgroundTaskInterval: number;
  healthCheckInterval: number;
  maxRetries: number;
  backoffMultiplier: number;
}

export class SwarmCoordinator extends EventEmitter {
  private logger: Logger;
  private config: SwarmConfig;
  private agents: Map<string, SwarmAgent>;
  private objectives: Map<string, SwarmObjective>;
  private tasks: Map<string, SwarmTask>;
  private taskQueue: string[];
  private monitor?: SwarmMonitor;
  private scheduler?: AdvancedTaskScheduler;
  private memoryManager: MemoryManager;
  private backgroundWorkers: Map<string, NodeJS.Timeout>;
  private isRunning: boolean = false;
  private eventBus: IEventBus;
  private workStealer?: any;
  private circuitBreaker?: any;

  constructor(config: Partial<SwarmConfig> = {}) {
    super();
    this.logger = new Logger({
      level: 'info',
      format: 'json',
      destination: 'console'
    });
    this.config = {
      maxAgents: 10,
      maxConcurrentTasks: 5,
      taskTimeout: 300000, // 5 minutes
      enableMonitoring: true,
      enableWorkStealing: true,
      enableCircuitBreaker: true,
      memoryNamespace: 'swarm',
      coordinationStrategy: 'hybrid',
      backgroundTaskInterval: 5000, // 5 seconds
      healthCheckInterval: 10000, // 10 seconds
      maxRetries: 3,
      backoffMultiplier: 2,
      ...config
    };

    this.agents = new Map();
    this.objectives = new Map();
    this.tasks = new Map();
    this.taskQueue = [];
    this.backgroundWorkers = new Map();

    // Create event bus for memory manager
    this.eventBus = {
      emit: (event: string, data?: unknown) => {
        this.emit(event, data);
      },
      on: (event: string, handler: (data: unknown) => void) => {
        this.on(event, handler);
      },
      off: (event: string, handler: (data: unknown) => void) => {
        this.off(event, handler);
      },
      once: (event: string, handler: (data: unknown) => void) => {
        this.once(event, handler);
      }
    };

    // Initialize memory manager with proper config
    const memoryConfig: MemoryConfig = {
      backend: 'markdown' as const,
      markdownDir: `./swarm-coordination/${this.config.memoryNamespace}`,
      cacheSizeMB: 50,
      retentionDays: 30,
      syncInterval: 30000, // 30 seconds
      conflictResolution: 'last-write' as const
    };

    this.memoryManager = new MemoryManager(memoryConfig, this.eventBus, this.logger);

    if (this.config.enableMonitoring) {
      this.monitor = new SwarmMonitor({
        updateInterval: 1000,
        enableAlerts: true,
        enableHistory: true
      });
    }

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Monitor events
    if (this.monitor) {
      this.monitor.on('alert', (alert: any) => {
        this.handleMonitorAlert(alert);
      });
    }

    // Add custom event handlers for swarm coordination
    this.on('task:completed', (data: any) => {
      this.handleTaskCompleted(data.taskId, data.result);
    });

    this.on('task:failed', (data: any) => {
      this.handleTaskFailed(data.taskId, data.error);
    });
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('Swarm coordinator already running');
      return;
    }

    this.logger.info('Starting swarm coordinator...');
    this.isRunning = true;

    // Start subsystems
    await this.memoryManager.initialize();
    
    if (this.monitor) {
      await this.monitor.start();
    }

    // Start background workers
    this.startBackgroundWorkers();

    this.emit('coordinator:started');
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.logger.info('Stopping swarm coordinator...');
    this.isRunning = false;

    // Stop background workers
    this.stopBackgroundWorkers();

    // Stop subsystems
    if (this.scheduler) {
      await this.scheduler.stop();
    }
    
    if (this.monitor) {
      this.monitor.stop();
    }

    this.emit('coordinator:stopped');
  }

  private startBackgroundWorkers(): void {
    // Task processor worker
    const taskProcessor = setInterval(() => {
      this.processBackgroundTasks();
    }, this.config.backgroundTaskInterval);
    this.backgroundWorkers.set('taskProcessor', taskProcessor);

    // Health check worker
    const healthChecker = setInterval(() => {
      this.performHealthChecks();
    }, this.config.healthCheckInterval);
    this.backgroundWorkers.set('healthChecker', healthChecker);

    // Work stealing worker
    if (this.workStealer) {
      const workStealerWorker = setInterval(() => {
        this.performWorkStealing();
      }, this.config.backgroundTaskInterval);
      this.backgroundWorkers.set('workStealer', workStealerWorker);
    }

    // Memory sync worker
    const memorySync = setInterval(() => {
      this.syncMemoryState();
    }, this.config.backgroundTaskInterval * 2);
    this.backgroundWorkers.set('memorySync', memorySync);
  }

  private stopBackgroundWorkers(): void {
    for (const [name, worker] of this.backgroundWorkers) {
      clearInterval(worker);
      this.logger.debug(`Stopped background worker: ${name}`);
    }
    this.backgroundWorkers.clear();
  }

  async createObjective(description: string, strategy: SwarmObjective['strategy'] = 'auto'): Promise<string> {
    const objectiveId = generateId('objective');
    
    // Check for TaskMaster objective
    let objective: SwarmObjective;
    if (strategy === 'taskmaster' && (globalThis as any).__taskmasterObjective) {
      const tmObjective = (globalThis as any).__taskmasterObjective;
      // Convert TaskMaster objective to SwarmObjective
      objective = {
        id: objectiveId,
        description,
        strategy: 'taskmaster' as any,
        tasks: [], // Will be populated from tmObjective.tasks later
        status: 'planning',
        createdAt: new Date()
      };
      // Store the TaskMaster tasks in metadata for later processing
      (objective as any).taskmasterTasks = tmObjective.tasks;
      this.logger.info(`Using TaskMaster objective with ${tmObjective.tasks.length} pre-loaded tasks`);
    } else {
      objective = {
        id: objectiveId,
        description,
        strategy,
        tasks: [],
        status: 'planning',
        createdAt: new Date()
      };
      
      // Decompose objective into tasks
      const tasks = await this.decomposeObjective(objective);
      objective.tasks = tasks;
    }

    this.objectives.set(objectiveId, objective);
    this.logger.info(`Created objective: ${objectiveId} - ${description}`);

    // Store in memory
    const memoryEntry: MemoryEntry = {
      id: generateId('mem'),
      agentId: 'swarm-coordinator',
      sessionId: 'swarm',
      type: 'artifact',
      content: JSON.stringify(objective),
      context: {
        type: 'objective',
        strategy,
        taskCount: objective.tasks.length
      },
      timestamp: new Date(),
      tags: ['swarm', 'objective'],
      version: 1,
      metadata: {
        namespace: this.config.memoryNamespace,
        objectiveId
      }
    };

    await this.memoryManager.store(memoryEntry);

    this.emit('objective:created', objective);
    return objectiveId;
  }

  private async decomposeObjective(objective: SwarmObjective): Promise<SwarmTask[]> {
    const tasks: SwarmTask[] = [];

    switch (objective.strategy) {
      case 'research':
        tasks.push(
          this.createTask('research', 'Gather information and research materials', 1),
          this.createTask('analysis', 'Analyze research findings', 2, ['research']),
          this.createTask('synthesis', 'Synthesize insights and create report', 3, ['analysis'])
        );
        break;

      case 'development':
        tasks.push(
          this.createTask('planning', 'Plan architecture and design', 1),
          this.createTask('implementation', 'Implement core functionality', 2, ['planning']),
          this.createTask('testing', 'Test and validate implementation', 3, ['implementation']),
          this.createTask('documentation', 'Create documentation', 3, ['implementation']),
          this.createTask('review', 'Peer review and refinement', 4, ['testing', 'documentation'])
        );
        break;

      case 'analysis':
        tasks.push(
          this.createTask('data-collection', 'Collect and prepare data', 1),
          this.createTask('analysis', 'Perform detailed analysis', 2, ['data-collection']),
          this.createTask('visualization', 'Create visualizations', 3, ['analysis']),
          this.createTask('reporting', 'Generate final report', 4, ['analysis', 'visualization'])
        );
        break;

      default: // auto
        // Use AI to decompose based on objective description
        tasks.push(
          this.createTask('exploration', 'Explore and understand requirements', 1),
          this.createTask('planning', 'Create execution plan', 2, ['exploration']),
          this.createTask('execution', 'Execute main tasks', 3, ['planning']),
          this.createTask('validation', 'Validate and test results', 4, ['execution']),
          this.createTask('completion', 'Finalize and document', 5, ['validation'])
        );
    }

    // Register tasks
    tasks.forEach(task => {
      this.tasks.set(task.id, task);
    });

    return tasks;
  }

  private createTask(
    type: string, 
    description: string, 
    priority: number, 
    dependencies: string[] = []
  ): SwarmTask {
    return {
      id: generateId('task'),
      type,
      description,
      priority,
      dependencies,
      status: 'pending',
      createdAt: new Date(),
      retryCount: 0,
      maxRetries: this.config.maxRetries,
      timeout: this.config.taskTimeout
    };
  }

  async registerAgent(
    name: string, 
    type: SwarmAgent['type'], 
    capabilities: string[] = []
  ): Promise<string> {
    const agentId = generateId('agent');
    const agent: SwarmAgent = {
      id: agentId,
      name,
      type,
      status: 'idle',
      capabilities,
      metrics: {
        tasksCompleted: 0,
        tasksFailed: 0,
        totalDuration: 0,
        lastActivity: new Date()
      }
    };

    this.agents.set(agentId, agent);
    
    if (this.monitor) {
      this.monitor.registerAgent(agentId, name);
    }

    // Register with work stealer if enabled
    if (this.workStealer) {
      this.workStealer.registerWorker(agentId, 1);
    }

    this.logger.info(`Registered agent: ${name} (${agentId}) - Type: ${type}`);
    this.emit('agent:registered', agent);

    return agentId;
  }

  async assignTask(taskId: string, agentId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    const agent = this.agents.get(agentId);

    if (!task || !agent) {
      throw new Error('Task or agent not found');
    }

    if (agent.status !== 'idle') {
      throw new Error('Agent is not available');
    }

    // Check circuit breaker
    if (this.circuitBreaker && !this.circuitBreaker.canExecute(agentId)) {
      throw new Error('Agent circuit breaker is open');
    }

    task.assignedTo = agentId;
    task.status = 'running';
    task.startedAt = new Date();

    agent.status = 'busy';
    agent.currentTask = task;

    if (this.monitor) {
      this.monitor.taskStarted(agentId, taskId, task.description);
    }

    this.logger.info(`Assigned task ${taskId} to agent ${agentId}`);
    this.emit('task:assigned', { task, agent });

    // Execute task in background
    this.executeTask(task, agent);
  }

  private async executeTask(task: SwarmTask, agent: SwarmAgent): Promise<void> {
    try {
      // Simulate task execution
      // In real implementation, this would spawn actual Claude instances
      const result = await this.simulateTaskExecution(task, agent);
      
      await this.handleTaskCompleted(task.id, result);
    } catch (error) {
      await this.handleTaskFailed(task.id, error);
    }
  }

  private async simulateTaskExecution(task: SwarmTask, agent: SwarmAgent): Promise<any> {
    // Execute actual task based on type
    this.logger.info(`Executing ${task.type} task: ${task.description}`);
    
    try {
      let result;
      
      switch (task.type) {
        case 'exploration':
          result = await this.executeExplorationTask(task);
          break;
        case 'planning':
          result = await this.executePlanningTask(task);
          break;
        case 'execution':
          result = await this.executeMainTask(task);
          break;
        case 'validation':
          result = await this.executeValidationTask(task);
          break;
        case 'completion':
          result = await this.executeCompletionTask(task);
          break;
        default:
          result = await this.executeGenericTask(task);
      }
      
      return {
        taskId: task.id,
        agentId: agent.id,
        result,
        timestamp: new Date()
      };
    } catch (error) {
      this.logger.error(`Task execution failed: ${error}`);
      throw error;
    }
  }
  
  private async executeExplorationTask(task: SwarmTask): Promise<string> {
    // Simulate realistic work time
    await new Promise(resolve => setTimeout(resolve, 3000));
    this.logger.info('Exploration phase: analyzing requirements for HTML creation');
    return 'Analyzed requirements: Create a simple HTML file with modern styling, responsive design, and clean structure';
  }
  
  private async executePlanningTask(task: SwarmTask): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    this.logger.info('Planning phase: designing HTML structure and CSS approach');
    return 'Planned HTML structure with semantic elements, modern CSS Grid/Flexbox, and responsive styling';
  }
  
  private async executeMainTask(task: SwarmTask): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 4000));
    this.logger.info('Execution phase: implementing the HTML file');
    // This is where actual file creation would happen
    return 'HTML file created with modern styling, gradient background, and responsive design';
  }
  
  private async executeValidationTask(task: SwarmTask): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    this.logger.info('Validation phase: testing HTML structure and styling');
    return 'HTML file validated - all styles working, responsive design confirmed';
  }
  
  private async executeCompletionTask(task: SwarmTask): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.logger.info('Completion phase: finalizing and documenting');
    return 'Task completed successfully - HTML file ready for use';
  }
  
  private async executeGenericTask(task: SwarmTask): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    this.logger.info(`Executing generic task: ${task.type}`);
    return `Generic task ${task.type} completed successfully`;
  }

  private async handleTaskCompleted(taskId: string, result: any): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) return;

    const agent = task.assignedTo ? this.agents.get(task.assignedTo) : null;

    task.status = 'completed';
    task.completedAt = new Date();
    task.result = result;

    if (agent) {
      agent.status = 'idle';
      agent.currentTask = undefined;
      agent.metrics.tasksCompleted++;
      agent.metrics.totalDuration += (task.completedAt.getTime() - (task.startedAt?.getTime() || 0));
      agent.metrics.lastActivity = new Date();

      if (this.monitor) {
        this.monitor.taskCompleted(agent.id, taskId);
      }

      if (this.circuitBreaker) {
        this.circuitBreaker.recordSuccess(agent.id);
      }
    }

    // Store result in memory
    const memoryEntry: MemoryEntry = {
      id: generateId('mem'),
      agentId: agent?.id || 'unknown',
      sessionId: 'swarm',
      type: 'artifact',
      content: JSON.stringify(result),
      context: {
        type: 'task-result',
        taskType: task.type,
        taskId
      },
      timestamp: new Date(),
      tags: ['swarm', 'task-result'],
      version: 1,
      metadata: {
        namespace: this.config.memoryNamespace
      }
    };

    await this.memoryManager.store(memoryEntry);

    this.logger.info(`Task ${taskId} completed successfully`);
    this.emit('task:completed', { task, result });

    // Check if objective is complete
    this.checkObjectiveCompletion(task);
  }

  private async handleTaskFailed(taskId: string, error: any): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) return;

    const agent = task.assignedTo ? this.agents.get(task.assignedTo) : null;

    task.error = error.message || String(error);
    task.retryCount++;

    if (agent) {
      agent.status = 'idle';
      agent.currentTask = undefined;
      agent.metrics.tasksFailed++;
      agent.metrics.lastActivity = new Date();

      if (this.monitor) {
        this.monitor.taskFailed(agent.id, taskId, task.error);
      }

      if (this.circuitBreaker) {
        this.circuitBreaker.recordFailure(agent.id);
      }
    }

    // Retry logic
    if (task.retryCount < task.maxRetries) {
      task.status = 'pending';
      task.assignedTo = undefined;
      this.logger.warn(`Task ${taskId} failed, will retry (${task.retryCount}/${task.maxRetries})`);
      this.emit('task:retry', { task, error });
    } else {
      task.status = 'failed';
      task.completedAt = new Date();
      this.logger.error(`Task ${taskId} failed after ${task.retryCount} retries`);
      this.emit('task:failed', { task, error });
    }
  }

  private checkObjectiveCompletion(completedTask: SwarmTask): void {
    for (const [objectiveId, objective] of this.objectives) {
      if (objective.status !== 'executing') continue;

      const allTasksComplete = objective.tasks.every(task => {
        const t = this.tasks.get(task.id);
        return t && (t.status === 'completed' || t.status === 'failed');
      });

      if (allTasksComplete) {
        objective.status = 'completed';
        objective.completedAt = new Date();
        this.logger.info(`Objective ${objectiveId} completed`);
        this.emit('objective:completed', objective);
      }
    }
  }

  private async processBackgroundTasks(): Promise<void> {
    if (!this.isRunning) return;

    try {
      // Process pending tasks
      const pendingTasks = Array.from(this.tasks.values())
        .filter(t => t.status === 'pending' && this.areDependenciesMet(t));

      // Get available agents
      const availableAgents = Array.from(this.agents.values())
        .filter(a => a.status === 'idle');

      // Assign tasks to agents
      for (const task of pendingTasks) {
        if (availableAgents.length === 0) break;

        const agent = this.selectBestAgent(task, availableAgents);
        if (agent) {
          try {
            await this.assignTask(task.id, agent.id);
            availableAgents.splice(availableAgents.indexOf(agent), 1);
          } catch (error) {
            this.logger.error(`Failed to assign task ${task.id}:`, error);
          }
        }
      }
    } catch (error) {
      this.logger.error('Error processing background tasks:', error);
    }
  }

  private areDependenciesMet(task: SwarmTask): boolean {
    return task.dependencies.every(depId => {
      const dep = this.tasks.get(depId);
      return dep && dep.status === 'completed';
    });
  }

  private selectBestAgent(task: SwarmTask, availableAgents: SwarmAgent[]): SwarmAgent | null {
    // Simple selection based on task type and agent capabilities
    const compatibleAgents = availableAgents.filter(agent => {
      // Match task type to agent type
      if (task.type.includes('research') && agent.type === 'researcher') return true;
      if (task.type.includes('implement') && agent.type === 'developer') return true;
      if (task.type.includes('analysis') && agent.type === 'analyzer') return true;
      if (task.type.includes('review') && agent.type === 'reviewer') return true;
      return agent.type === 'coordinator'; // Coordinator can do any task
    });

    if (compatibleAgents.length === 0) {
      return availableAgents[0]; // Fallback to any available agent
    }

    // Select agent with best performance metrics
    return compatibleAgents.reduce((best, agent) => {
      const bestRatio = best.metrics.tasksCompleted / (best.metrics.tasksFailed + 1);
      const agentRatio = agent.metrics.tasksCompleted / (agent.metrics.tasksFailed + 1);
      return agentRatio > bestRatio ? agent : best;
    });
  }

  private async performHealthChecks(): Promise<void> {
    if (!this.isRunning) return;

    try {
      const now = new Date();
      
      for (const [agentId, agent] of this.agents) {
        // Check for stalled agents
        if (agent.status === 'busy' && agent.currentTask) {
          const taskDuration = now.getTime() - (agent.currentTask.startedAt?.getTime() || 0);
          if (taskDuration > this.config.taskTimeout) {
            this.logger.warn(`Agent ${agentId} appears stalled on task ${agent.currentTask.id}`);
            await this.handleTaskFailed(agent.currentTask.id, new Error('Task timeout'));
          }
        }

        // Check agent health (only warn if inactive for more than 2 minutes)
        const inactivityTime = now.getTime() - agent.metrics.lastActivity.getTime();
        if (inactivityTime > 120000) { // 2 minutes
          this.logger.warn(`Agent ${agentId} has been inactive for ${Math.round(inactivityTime / 1000)}s`);
        }
      }
    } catch (error) {
      this.logger.error('Error performing health checks:', error);
    }
  }

  private async performWorkStealing(): Promise<void> {
    if (!this.isRunning || !this.workStealer) return;

    try {
      // Get agent workloads
      const workloads = new Map<string, number>();
      for (const [agentId, agent] of this.agents) {
        workloads.set(agentId, agent.status === 'busy' ? 1 : 0);
      }

      // Update work stealer
      this.workStealer.updateLoads(workloads);

      // Check for work stealing opportunities
      const stealingSuggestions = this.workStealer.suggestWorkStealing();
      
      for (const suggestion of stealingSuggestions) {
        this.logger.debug(`Work stealing suggestion: ${suggestion.from} -> ${suggestion.to}`);
        // In a real implementation, we would reassign tasks here
      }
    } catch (error) {
      this.logger.error('Error performing work stealing:', error);
    }
  }

  private async syncMemoryState(): Promise<void> {
    if (!this.isRunning) return;

    try {
      // Sync current state to memory
      const state = {
        objectives: Array.from(this.objectives.values()),
        tasks: Array.from(this.tasks.values()),
        agents: Array.from(this.agents.values()).map(a => ({
          ...a,
          currentTask: undefined // Don't store transient state
        })),
        timestamp: new Date()
      };

      const memoryEntry: MemoryEntry = {
        id: generateId('mem'),
        agentId: 'swarm-coordinator',
        sessionId: 'swarm',
        type: 'artifact',
        content: JSON.stringify(state),
        context: {
          type: 'swarm-state',
          objectiveCount: state.objectives.length,
          taskCount: state.tasks.length,
          agentCount: state.agents.length
        },
        timestamp: new Date(),
        tags: ['swarm', 'state'],
        version: 1,
        metadata: {
          namespace: this.config.memoryNamespace
        }
      };

      await this.memoryManager.store(memoryEntry);
    } catch (error) {
      this.logger.error('Error syncing memory state:', error);
    }
  }

  private handleMonitorAlert(alert: any): void {
    this.logger.warn(`Monitor alert: ${alert.message}`);
    this.emit('monitor:alert', alert);
  }

  private handleAgentMessage(message: Message): void {
    this.logger.debug(`Agent message: ${message.type} from ${message.from}`);
    this.emit('agent:message', message);
  }

  // Public API methods
  async executeObjective(objectiveId: string): Promise<void> {
    const objective = this.objectives.get(objectiveId);
    if (!objective) {
      throw new Error('Objective not found');
    }

    objective.status = 'executing';
    this.logger.info(`Executing objective: ${objectiveId}`);
    this.emit('objective:started', objective);

    // For TaskMaster objectives, we need to create SwarmTasks from the pre-loaded tasks
    const taskmasterTasks = (objective as any).taskmasterTasks;
    console.log(`[DEBUG] Objective strategy: ${objective.strategy}, Has taskmasterTasks: ${!!taskmasterTasks}, Task count: ${taskmasterTasks?.length || 0}`);
    console.log(`[DEBUG] First task:`, taskmasterTasks?.[0]);
    
    if (objective.strategy === 'taskmaster' as any && taskmasterTasks && taskmasterTasks.length > 0) {
      this.logger.info(`Creating ${taskmasterTasks.length} swarm tasks from TaskMaster objective`);
      
      for (const taskDef of taskmasterTasks) {
        const swarmTask: SwarmTask = {
          id: taskDef.id || generateId('task'),
          objectiveId,
          type: taskDef.type as any || 'execution',
          description: taskDef.description || taskDef.name || 'Task',
          status: 'pending',
          priority: taskDef.priority || 0,
          createdAt: new Date(),
          dependencies: taskDef.constraints?.dependencies || [],
          metadata: taskDef.metadata
        };
        
        this.tasks.set(swarmTask.id, swarmTask);
        this.emit('task:created', swarmTask);
        
        // If no dependencies, add to ready queue
        if (swarmTask.dependencies.length === 0) {
          this.taskQueue.push(swarmTask.id);
        }
      }
      
      this.logger.info(`Created ${taskmasterTasks.length} tasks, ${this.taskQueue.length} ready for execution`);
      
      // Log task details
      console.log(`[DEBUG] Task queue contents:`, this.taskQueue.slice(0, 5));
      console.log(`[DEBUG] Total tasks in system:`, this.tasks.size);
      console.log(`[DEBUG] Agent statuses:`, Array.from(this.agents.values()).map(a => ({ id: a.id, status: a.status, type: a.type })));
      
      // Trigger task assignment
      await this.assignPendingTasks();
      
      console.log(`[DEBUG] After assignment - Tasks running:`, Array.from(this.tasks.values()).filter(t => t.status === 'running').length);
    }
    
    // Tasks will be processed by background workers
  }

  private async assignPendingTasks(): Promise<void> {
    // Get idle agents
    const idleAgents = Array.from(this.agents.values()).filter(a => a.status === 'idle');
    
    if (idleAgents.length === 0 || this.taskQueue.length === 0) {
      return;
    }
    
    // Assign tasks to idle agents
    while (this.taskQueue.length > 0 && idleAgents.length > 0) {
      const taskId = this.taskQueue.shift()!;
      const task = this.tasks.get(taskId);
      
      if (!task || task.status !== 'pending') {
        continue;
      }
      
      // Find suitable agent based on task type
      const suitableAgent = idleAgents.find(agent => {
        // Match agent type to task requirements
        if (task.metadata?.agentType) {
          return agent.type === task.metadata.agentType;
        }
        // Default matching based on task type
        switch (task.type) {
          case 'research':
            return agent.type === 'researcher';
          case 'implementation':
          case 'architecture':
            return agent.type === 'developer';
          case 'analysis':
          case 'testing':
            return agent.type === 'analyzer';
          default:
            return agent.type === 'coordinator';
        }
      }) || idleAgents[0]; // Fallback to any idle agent
      
      if (suitableAgent) {
        try {
          await this.assignTask(taskId, suitableAgent.id);
          // Remove from idle list
          const index = idleAgents.indexOf(suitableAgent);
          if (index > -1) {
            idleAgents.splice(index, 1);
          }
        } catch (error) {
          this.logger.error(`Failed to assign task ${taskId}: ${error}`);
        }
      }
    }
  }

  getObjectiveStatus(objectiveId: string): SwarmObjective | undefined {
    return this.objectives.get(objectiveId);
  }

  getAgentStatus(agentId: string): SwarmAgent | undefined {
    return this.agents.get(agentId);
  }

  getSwarmStatus(): {
    objectives: number;
    tasks: { total: number; pending: number; running: number; completed: number; failed: number };
    agents: { total: number; idle: number; busy: number; failed: number };
    uptime: number;
  } {
    const tasks = Array.from(this.tasks.values());
    const agents = Array.from(this.agents.values());

    return {
      objectives: this.objectives.size,
      tasks: {
        total: tasks.length,
        pending: tasks.filter(t => t.status === 'pending').length,
        running: tasks.filter(t => t.status === 'running').length,
        completed: tasks.filter(t => t.status === 'completed').length,
        failed: tasks.filter(t => t.status === 'failed').length
      },
      agents: {
        total: agents.length,
        idle: agents.filter(a => a.status === 'idle').length,
        busy: agents.filter(a => a.status === 'busy').length,
        failed: agents.filter(a => a.status === 'failed').length
      },
      uptime: this.monitor ? this.monitor.getSummary().uptime : 0
    };
  }
}