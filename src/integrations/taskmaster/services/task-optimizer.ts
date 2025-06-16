/**
 * TaskMaster Task Optimizer
 * Optimizes task execution order and agent assignment
 */

import { TaskMasterTask } from '../types/task-types.ts';
import { IntegrationConfigService } from './integration-config.ts';
import { AgentMappingService } from './agent-mapping-service.ts';

export interface OptimizationResult {
  tasks: TaskMasterTask[];
  executionPlan: ExecutionPlan;
  recommendations: string[];
}

export interface ExecutionPlan {
  phases: ExecutionPhase[];
  estimatedDuration: number;
  parallelizationFactor: number;
}

export interface ExecutionPhase {
  phaseNumber: number;
  tasks: TaskMasterTask[];
  canRunParallel: boolean;
  estimatedDuration: number;
}

export interface TaskMetrics {
  taskId: string;
  complexity: number;
  dependencies: string[];
  estimatedDuration: number;
  requiredCapabilities: string[];
}

export class TaskOptimizer {
  private configService: IntegrationConfigService;
  private agentMapping: AgentMappingService;
  
  constructor() {
    this.configService = new IntegrationConfigService();
    this.agentMapping = new AgentMappingService();
  }
  
  /**
   * Initialize optimizer
   */
  async initialize(): Promise<void> {
    await this.configService.initialize();
  }
  
  /**
   * Optimize task execution order and create execution plan
   */
  async optimizeTasks(tasks: TaskMasterTask[]): Promise<OptimizationResult> {
    const config = this.configService.getConfig();
    const metrics = this.calculateTaskMetrics(tasks);
    
    // Sort tasks based on algorithm
    const sortedTasks = await this.sortTasksByAlgorithm(
      tasks,
      metrics,
      config.prioritization.algorithm
    );
    
    // Create execution phases
    const executionPlan = this.createExecutionPlan(sortedTasks, metrics);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(
      tasks,
      executionPlan,
      metrics
    );
    
    return {
      tasks: sortedTasks,
      executionPlan,
      recommendations
    };
  }
  
  /**
   * Calculate metrics for each task
   */
  private calculateTaskMetrics(tasks: TaskMasterTask[]): Map<string, TaskMetrics> {
    const metricsMap = new Map<string, TaskMetrics>();
    
    tasks.forEach(task => {
      const complexity = this.calculateComplexity(task);
      const estimatedDuration = this.estimateDuration(task, complexity);
      const requiredCapabilities = this.getRequiredCapabilities(task);
      
      metricsMap.set(task.id, {
        taskId: task.id,
        complexity,
        dependencies: task.dependencies || [],
        estimatedDuration,
        requiredCapabilities
      });
    });
    
    return metricsMap;
  }
  
  /**
   * Calculate task complexity
   */
  private calculateComplexity(task: TaskMasterTask): number {
    let complexity = 1;
    
    // Factor in priority
    switch (task.priority) {
      case 'high': complexity *= 2; break;
      case 'medium': complexity *= 1.5; break;
      case 'low': complexity *= 1; break;
    }
    
    // Factor in type
    const typeComplexity: Record<string, number> = {
      'architecture': 3,
      'implementation': 2,
      'testing': 2,
      'security': 3,
      'documentation': 1,
      'integration': 2.5,
      'debugging': 2,
      'optimization': 2.5
    };
    
    complexity *= typeComplexity[task.type] || 1.5;
    
    // Factor in subtasks
    complexity += (task.subtasks?.length || 0) * 0.5;
    
    // Factor in dependencies
    complexity += (task.dependencies?.length || 0) * 0.3;
    
    return complexity;
  }
  
  /**
   * Estimate task duration based on complexity
   */
  private estimateDuration(task: TaskMasterTask, complexity: number): number {
    // Base duration in milliseconds
    const baseDuration = 60000; // 1 minute
    
    // Apply complexity multiplier
    let duration = baseDuration * complexity;
    
    // Adjust based on SPARC mode
    const sparcMultipliers: Record<string, number> = {
      'architect': 2,
      'code': 1.5,
      'tdd': 2,
      'debug': 1.8,
      'docs-writer': 1.2,
      'security-review': 2.5,
      'integration': 1.8,
      'refinement-optimization-mode': 2
    };
    
    if (task.sparc_mode) {
      duration *= sparcMultipliers[task.sparc_mode] || 1.5;
    }
    
    return Math.round(duration);
  }
  
  /**
   * Get required capabilities for a task
   */
  private getRequiredCapabilities(task: TaskMasterTask): string[] {
    const agentInfo = this.agentMapping.getAgentTypeForSparcMode(
      task.sparc_mode || 'code'
    );
    return agentInfo.capabilities;
  }
  
  /**
   * Sort tasks based on selected algorithm
   */
  private async sortTasksByAlgorithm(
    tasks: TaskMasterTask[],
    metrics: Map<string, TaskMetrics>,
    algorithm: string
  ): Promise<TaskMasterTask[]> {
    const config = this.configService.getPrioritizationSettings();
    
    switch (algorithm) {
      case 'fifo':
        return [...tasks];
        
      case 'priority':
        return this.sortByPriority(tasks, config.priorityWeights);
        
      case 'dependencies':
        return this.topologicalSort(tasks);
        
      case 'smart':
        return this.smartSort(tasks, metrics, config);
        
      default:
        return [...tasks];
    }
  }
  
  /**
   * Sort by priority
   */
  private sortByPriority(
    tasks: TaskMasterTask[],
    weights: Record<string, number>
  ): TaskMasterTask[] {
    return [...tasks].sort((a, b) => {
      const weightA = weights[a.priority] || 0;
      const weightB = weights[b.priority] || 0;
      return weightB - weightA;
    });
  }
  
  /**
   * Topological sort for dependencies
   */
  private topologicalSort(tasks: TaskMasterTask[]): TaskMasterTask[] {
    const sorted: TaskMasterTask[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const taskMap = new Map(tasks.map(t => [t.id, t]));
    
    const visit = (taskId: string): void => {
      if (visited.has(taskId)) return;
      if (visiting.has(taskId)) {
        console.warn(`Circular dependency detected involving task ${taskId}`);
        return;
      }
      
      visiting.add(taskId);
      const task = taskMap.get(taskId);
      
      if (task) {
        // Visit dependencies first
        if (task.dependencies) {
          for (const depId of task.dependencies) {
            visit(depId);
          }
        }
        
        visited.add(taskId);
        visiting.delete(taskId);
        sorted.push(task);
      }
    };
    
    // Visit all tasks
    for (const task of tasks) {
      visit(task.id);
    }
    
    return sorted;
  }
  
  /**
   * Smart sort combining multiple factors
   */
  private smartSort(
    tasks: TaskMasterTask[],
    metrics: Map<string, TaskMetrics>,
    config: any
  ): TaskMasterTask[] {
    // First, do topological sort for dependencies
    const sorted = this.topologicalSort(tasks);
    
    // Then group by dependency levels
    const levels = this.groupByDependencyLevels(sorted);
    
    // Sort within each level by priority and complexity
    const result: TaskMasterTask[] = [];
    
    levels.forEach(level => {
      const sortedLevel = level.sort((a, b) => {
        // Priority weight
        const priorityA = config.priorityWeights[a.priority] || 0;
        const priorityB = config.priorityWeights[b.priority] || 0;
        
        // Complexity weight
        const metricsA = metrics.get(a.id)!;
        const metricsB = metrics.get(b.id)!;
        
        // Combined score (higher is better)
        const scoreA = priorityA * 2 + (1 / metricsA.complexity);
        const scoreB = priorityB * 2 + (1 / metricsB.complexity);
        
        return scoreB - scoreA;
      });
      
      result.push(...sortedLevel);
    });
    
    return result;
  }
  
  /**
   * Group tasks by dependency levels
   */
  private groupByDependencyLevels(tasks: TaskMasterTask[]): TaskMasterTask[][] {
    const levels: TaskMasterTask[][] = [];
    const taskMap = new Map(tasks.map(t => [t.id, t]));
    const processed = new Set<string>();
    
    while (processed.size < tasks.length) {
      const currentLevel: TaskMasterTask[] = [];
      
      for (const task of tasks) {
        if (processed.has(task.id)) continue;
        
        // Check if all dependencies are processed
        const allDepsProcessed = !task.dependencies || 
          task.dependencies.every(dep => processed.has(dep));
        
        if (allDepsProcessed) {
          currentLevel.push(task);
        }
      }
      
      if (currentLevel.length === 0) {
        // Circular dependency or error - add remaining tasks
        tasks.forEach(task => {
          if (!processed.has(task.id)) {
            currentLevel.push(task);
          }
        });
      }
      
      currentLevel.forEach(task => processed.add(task.id));
      if (currentLevel.length > 0) {
        levels.push(currentLevel);
      }
    }
    
    return levels;
  }
  
  /**
   * Create execution plan with phases
   */
  private createExecutionPlan(
    tasks: TaskMasterTask[],
    metrics: Map<string, TaskMetrics>
  ): ExecutionPlan {
    const config = this.configService.getExecutionSettings();
    const levels = this.groupByDependencyLevels(tasks);
    const phases: ExecutionPhase[] = [];
    
    let totalDuration = 0;
    let parallelTaskCount = 0;
    
    levels.forEach((level, index) => {
      const canRunParallel = config.defaultParallel && 
        level.length > 1 &&
        level.length <= config.maxConcurrentTasks;
      
      const phaseDurations = level.map(task => 
        metrics.get(task.id)?.estimatedDuration || 60000
      );
      
      const phaseDuration = canRunParallel
        ? Math.max(...phaseDurations)
        : phaseDurations.reduce((sum, d) => sum + d, 0);
      
      phases.push({
        phaseNumber: index + 1,
        tasks: level,
        canRunParallel,
        estimatedDuration: phaseDuration
      });
      
      totalDuration += phaseDuration;
      if (canRunParallel) {
        parallelTaskCount += level.length;
      }
    });
    
    const parallelizationFactor = tasks.length > 0
      ? parallelTaskCount / tasks.length
      : 0;
    
    return {
      phases,
      estimatedDuration: totalDuration,
      parallelizationFactor
    };
  }
  
  /**
   * Generate optimization recommendations
   */
  private generateRecommendations(
    tasks: TaskMasterTask[],
    plan: ExecutionPlan,
    metrics: Map<string, TaskMetrics>
  ): string[] {
    const recommendations: string[] = [];
    const config = this.configService.getConfig();
    
    // Check parallelization opportunities
    if (plan.parallelizationFactor < 0.3 && tasks.length > 10) {
      recommendations.push(
        'Consider breaking down large tasks into smaller, independent subtasks to improve parallelization'
      );
    }
    
    // Check for long-running tasks
    const longTasks = Array.from(metrics.values())
      .filter(m => m.estimatedDuration > config.monitoring.alertThresholds.taskDurationWarning);
    
    if (longTasks.length > 0) {
      recommendations.push(
        `${longTasks.length} tasks are estimated to take longer than ${config.monitoring.alertThresholds.taskDurationWarning / 60000} minutes. Consider breaking them down.`
      );
    }
    
    // Check for dependency bottlenecks
    const bottleneckPhases = plan.phases.filter(p => 
      !p.canRunParallel && p.tasks.length > 3
    );
    
    if (bottleneckPhases.length > 0) {
      recommendations.push(
        `${bottleneckPhases.length} phases have dependency bottlenecks preventing parallelization`
      );
    }
    
    // Suggest optimal concurrency
    const avgPhaseSize = plan.phases.reduce((sum, p) => sum + p.tasks.length, 0) / plan.phases.length;
    if (avgPhaseSize > config.execution.maxConcurrentTasks) {
      recommendations.push(
        `Consider increasing maxConcurrentTasks to ${Math.ceil(avgPhaseSize)} for better performance`
      );
    }
    
    // Check for unbalanced priorities
    const priorityCounts = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    if (priorityCounts.high > tasks.length * 0.5) {
      recommendations.push(
        'Over 50% of tasks are marked as high priority. Consider re-evaluating task priorities for better scheduling.'
      );
    }
    
    return recommendations;
  }
  
  /**
   * Optimize agent assignment for tasks
   */
  async optimizeAgentAssignment(
    tasks: TaskMasterTask[],
    availableAgents: string[]
  ): Promise<Map<string, string>> {
    const config = this.configService.getAgentSelectionSettings();
    const assignments = new Map<string, string>();
    const agentLoad = new Map<string, number>();
    
    // Initialize agent load
    availableAgents.forEach(agent => agentLoad.set(agent, 0));
    
    // Sort tasks by priority and complexity
    const metrics = this.calculateTaskMetrics(tasks);
    const sortedTasks = this.smartSort(tasks, metrics, config);
    
    // Assign agents
    for (const task of sortedTasks) {
      const agentInfo = this.agentMapping.getAgentTypeForSparcMode(
        task.sparc_mode || 'code'
      );
      
      // Find best available agent
      const preferredTypes = config.preferredAgentTypes[task.sparc_mode || 'code'] || [agentInfo.type];
      
      let bestAgent: string | null = null;
      let minLoad = Infinity;
      
      for (const agent of availableAgents) {
        const load = agentLoad.get(agent) || 0;
        
        // Check if agent matches preferred types (simplified check)
        // In real implementation, would check actual agent capabilities
        if (load < minLoad) {
          bestAgent = agent;
          minLoad = load;
        }
      }
      
      if (bestAgent) {
        assignments.set(task.id, bestAgent);
        agentLoad.set(bestAgent, (agentLoad.get(bestAgent) || 0) + 1);
      }
    }
    
    return assignments;
  }
}