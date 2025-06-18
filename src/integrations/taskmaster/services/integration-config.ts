/**
 * TaskMaster-Swarm Integration Configuration Service
 * Manages configuration for optimized task execution
 */

import { SimpleMemoryManager } from '../../../cli/commands/memory.ts';
import { SharedStorage } from './shared-storage.ts';

export interface IntegrationConfig {
  // Execution behavior
  execution: {
    defaultParallel: boolean;
    maxConcurrentTasks: number;
    taskTimeout: number;
    retryAttempts: number;
    retryDelay: number;
  };
  
  // Agent selection
  agentSelection: {
    preferredAgentTypes: Record<string, string[]>;
    agentLoadBalancing: boolean;
    maxAgentsPerType: number;
  };
  
  // Task prioritization
  prioritization: {
    algorithm: 'fifo' | 'priority' | 'dependencies' | 'smart';
    priorityWeights: {
      high: number;
      medium: number;
      low: number;
    };
    considerDeadlines: boolean;
  };
  
  // Monitoring & reporting
  monitoring: {
    enableDetailedLogging: boolean;
    progressUpdateInterval: number;
    metricsCollection: boolean;
    alertThresholds: {
      taskDurationWarning: number;
      failureRateAlert: number;
      queueSizeWarning: number;
    };
  };
  
  // Synchronization
  sync: {
    autoSync: boolean;
    syncInterval: number;
    conflictResolution: 'orchestrator' | 'taskmaster' | 'newest' | 'manual';
    syncOnTaskComplete: boolean;
  };
  
  // Optimization
  optimization: {
    enableSmartScheduling: boolean;
    predictiveAgentAssignment: boolean;
    adaptiveConcurrency: boolean;
    learningEnabled: boolean;
  };
}

export class IntegrationConfigService {
  private memory: SimpleMemoryManager;
  private storage: SharedStorage;
  private config: IntegrationConfig;
  private configKey = 'taskmaster_swarm_config';
  
  constructor() {
    this.memory = new SimpleMemoryManager();
    this.storage = new SharedStorage({ autoInit: false });
    this.config = this.getDefaultConfig();
  }
  
  /**
   * Initialize and load configuration
   */
  async initialize(): Promise<void> {
    // Ensure storage is initialized
    if (!await this.storage.isInitialized()) {
      await this.storage.initialize();
    }
    
    // Load config from memory
    await this.loadConfig();
    
    // Save initial config if none exists
    const existing = await this.memory.query('config', this.configKey);
    if (existing.length === 0) {
      await this.saveConfig();
    }
  }
  
  /**
   * Get default configuration
   */
  private getDefaultConfig(): IntegrationConfig {
    return {
      execution: {
        defaultParallel: true,
        maxConcurrentTasks: 5,
        taskTimeout: 300000, // 5 minutes
        retryAttempts: 3,
        retryDelay: 5000 // 5 seconds
      },
      
      agentSelection: {
        preferredAgentTypes: {
          'architect': ['coordinator', 'analyzer'],
          'code': ['developer', 'coder'],
          'tdd': ['tester', 'developer'],
          'debug': ['debugger', 'analyzer'],
          'docs-writer': ['documenter', 'writer'],
          'security-review': ['security', 'analyzer']
        },
        agentLoadBalancing: true,
        maxAgentsPerType: 3
      },
      
      prioritization: {
        algorithm: 'smart',
        priorityWeights: {
          high: 100,
          medium: 50,
          low: 10
        },
        considerDeadlines: true
      },
      
      monitoring: {
        enableDetailedLogging: false,
        progressUpdateInterval: 1000,
        metricsCollection: true,
        alertThresholds: {
          taskDurationWarning: 600000, // 10 minutes
          failureRateAlert: 0.2, // 20%
          queueSizeWarning: 50
        }
      },
      
      sync: {
        autoSync: true,
        syncInterval: 5000,
        conflictResolution: 'orchestrator',
        syncOnTaskComplete: true
      },
      
      optimization: {
        enableSmartScheduling: true,
        predictiveAgentAssignment: false,
        adaptiveConcurrency: true,
        learningEnabled: false
      }
    };
  }
  
  /**
   * Load configuration from memory
   */
  private async loadConfig(): Promise<void> {
    try {
      const stored = await this.memory.query('config', this.configKey);
      if (stored.length > 0) {
        this.config = stored[0].value as IntegrationConfig;
      }
    } catch (error) {
      console.error('Failed to load integration config:', error);
    }
  }
  
  /**
   * Save configuration to memory
   */
  private async saveConfig(): Promise<void> {
    try {
      await this.memory.store('config', this.configKey, this.config);
      
      // Also save to shared storage for VS Code extension
      const configPath = this.storage.getPaths().config;
      await Deno.writeTextFile(
        `${configPath}/integration.json`,
        JSON.stringify(this.config, null, 2)
      );
    } catch (error) {
      console.error('Failed to save integration config:', error);
    }
  }
  
  /**
   * Get current configuration
   */
  getConfig(): IntegrationConfig {
    return { ...this.config };
  }
  
  /**
   * Update configuration
   */
  async updateConfig(updates: Partial<IntegrationConfig>): Promise<void> {
    this.config = this.deepMerge(this.config, updates);
    await this.saveConfig();
  }
  
  /**
   * Get execution settings
   */
  getExecutionSettings() {
    return { ...this.config.execution };
  }
  
  /**
   * Get agent selection settings
   */
  getAgentSelectionSettings() {
    return { ...this.config.agentSelection };
  }
  
  /**
   * Get prioritization settings
   */
  getPrioritizationSettings() {
    return { ...this.config.prioritization };
  }
  
  /**
   * Get monitoring settings
   */
  getMonitoringSettings() {
    return { ...this.config.monitoring };
  }
  
  /**
   * Get sync settings
   */
  getSyncSettings() {
    return { ...this.config.sync };
  }
  
  /**
   * Get optimization settings
   */
  getOptimizationSettings() {
    return { ...this.config.optimization };
  }
  
  /**
   * Update specific section
   */
  async updateSection(
    section: keyof IntegrationConfig,
    updates: any
  ): Promise<void> {
    this.config[section] = { ...this.config[section], ...updates };
    await this.saveConfig();
  }
  
  /**
   * Reset to default configuration
   */
  async resetToDefault(): Promise<void> {
    this.config = this.getDefaultConfig();
    await this.saveConfig();
  }
  
  /**
   * Export configuration
   */
  async exportConfig(path: string): Promise<void> {
    await Deno.writeTextFile(path, JSON.stringify(this.config, null, 2));
  }
  
  /**
   * Import configuration
   */
  async importConfig(path: string): Promise<void> {
    try {
      const content = await Deno.readTextFile(path);
      const imported = JSON.parse(content) as IntegrationConfig;
      
      // Validate structure
      if (this.validateConfig(imported)) {
        this.config = imported;
        await this.saveConfig();
      } else {
        throw new Error('Invalid configuration structure');
      }
    } catch (error) {
      throw new Error(`Failed to import config: ${error}`);
    }
  }
  
  /**
   * Validate configuration structure
   */
  private validateConfig(config: any): config is IntegrationConfig {
    return (
      config &&
      typeof config === 'object' &&
      config.execution &&
      config.agentSelection &&
      config.prioritization &&
      config.monitoring &&
      config.sync &&
      config.optimization
    );
  }
  
  /**
   * Deep merge objects
   */
  private deepMerge(target: any, source: any): any {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }
  
  /**
   * Get recommended settings based on task characteristics
   */
  getRecommendedSettings(taskCount: number, complexity: 'low' | 'medium' | 'high'): Partial<IntegrationConfig> {
    const recommendations: Partial<IntegrationConfig> = {};
    
    // Execution recommendations
    if (taskCount > 20) {
      recommendations.execution = {
        ...this.config.execution,
        maxConcurrentTasks: Math.min(10, Math.ceil(taskCount / 5))
      };
    }
    
    // Prioritization recommendations
    if (complexity === 'high') {
      recommendations.prioritization = {
        ...this.config.prioritization,
        algorithm: 'dependencies'
      };
    }
    
    // Monitoring recommendations
    if (taskCount > 50 || complexity === 'high') {
      recommendations.monitoring = {
        ...this.config.monitoring,
        enableDetailedLogging: true,
        progressUpdateInterval: 500
      };
    }
    
    // Optimization recommendations
    if (taskCount > 10) {
      recommendations.optimization = {
        ...this.config.optimization,
        enableSmartScheduling: true,
        adaptiveConcurrency: true
      };
    }
    
    return recommendations;
  }
  
  /**
   * Apply performance optimizations based on metrics
   */
  async applyPerformanceOptimizations(metrics: {
    averageTaskDuration: number;
    failureRate: number;
    concurrentTasksAvg: number;
  }): Promise<void> {
    const updates: Partial<IntegrationConfig> = {};
    
    // Adjust timeout based on average duration
    if (metrics.averageTaskDuration > this.config.execution.taskTimeout * 0.8) {
      updates.execution = {
        ...this.config.execution,
        taskTimeout: Math.ceil(metrics.averageTaskDuration * 1.5)
      };
    }
    
    // Adjust retry settings based on failure rate
    if (metrics.failureRate > 0.1) {
      updates.execution = {
        ...updates.execution,
        retryAttempts: Math.min(5, this.config.execution.retryAttempts + 1),
        retryDelay: Math.min(10000, this.config.execution.retryDelay * 1.5)
      };
    }
    
    // Adjust concurrency based on performance
    if (this.config.optimization.adaptiveConcurrency) {
      const optimalConcurrency = Math.max(
        2,
        Math.min(20, Math.ceil(metrics.concurrentTasksAvg * 1.2))
      );
      
      updates.execution = {
        ...updates.execution,
        maxConcurrentTasks: optimalConcurrency
      };
    }
    
    if (Object.keys(updates).length > 0) {
      await this.updateConfig(updates);
    }
  }
}