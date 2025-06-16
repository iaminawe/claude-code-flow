/**
 * Agent Mapping Service
 * Maps SPARC modes to agent types and capabilities
 */

export interface AgentTypeInfo {
  type: string;
  capabilities: string[];
  tools: string[];
  description?: string;
}

export class AgentMappingService {
  private readonly SPARC_AGENT_MAP: Record<string, AgentTypeInfo> = {
    'architect': {
      type: 'coordinator',
      capabilities: ['system_design', 'architecture_diagrams', 'api_design', 'database_schemas'],
      tools: ['read', 'write', 'edit', 'browser'],
      description: 'Design system architecture and create component diagrams'
    },
    'code': {
      type: 'developer',
      capabilities: ['code_generation', 'refactoring', 'optimization', 'best_practices'],
      tools: ['read', 'write', 'edit', 'execute'],
      description: 'Generate clean, modular, and well-documented code'
    },
    'tdd': {
      type: 'developer',
      capabilities: ['test_first', 'red_green_refactor', 'test_coverage', 'regression_testing'],
      tools: ['read', 'write', 'edit', 'execute'],
      description: 'Follow Red-Green-Refactor TDD cycle'
    },
    'debug': {
      type: 'analyzer',
      capabilities: ['error_analysis', 'performance_profiling', 'memory_debugging', 'trace_analysis'],
      tools: ['read', 'edit', 'execute', 'browser'],
      description: 'Advanced debugging and troubleshooting'
    },
    'security-review': {
      type: 'analyzer',
      capabilities: ['vulnerability_scanning', 'security_best_practices', 'penetration_testing', 'compliance_checking'],
      tools: ['read', 'edit', 'browser'],
      description: 'Security analysis and vulnerability assessment'
    },
    'docs-writer': {
      type: 'researcher',
      capabilities: ['api_documentation', 'user_guides', 'technical_specs', 'readme_generation'],
      tools: ['read', 'write', 'edit'],
      description: 'Create comprehensive documentation'
    },
    'integration': {
      type: 'coordinator',
      capabilities: ['api_integration', 'service_orchestration', 'data_mapping', 'protocol_handling'],
      tools: ['read', 'write', 'edit', 'execute', 'browser'],
      description: 'System integration and API coordination'
    },
    'spec-pseudocode': {
      type: 'researcher',
      capabilities: ['requirement_analysis', 'algorithm_design', 'data_flow_modeling', 'edge_case_analysis'],
      tools: ['read', 'write', 'edit'],
      description: 'Create detailed specifications and pseudocode'
    },
    'devops': {
      type: 'developer',
      capabilities: ['ci_cd_pipelines', 'containerization', 'infrastructure_as_code', 'monitoring_setup'],
      tools: ['read', 'write', 'edit', 'execute'],
      description: 'Deployment, CI/CD, and infrastructure management'
    },
    'api-only': {
      type: 'developer',
      capabilities: ['api_design', 'rest_development', 'graphql', 'api_documentation'],
      tools: ['read', 'write', 'edit', 'execute'],
      description: 'API-focused development'
    },
    'backend-only': {
      type: 'developer',
      capabilities: ['backend_development', 'database_design', 'server_architecture', 'data_processing'],
      tools: ['read', 'write', 'edit', 'execute'],
      description: 'Backend-focused development'
    },
    'frontend-only': {
      type: 'developer',
      capabilities: ['ui_development', 'component_design', 'state_management', 'responsive_design'],
      tools: ['read', 'write', 'edit', 'execute', 'browser'],
      description: 'Frontend-focused development'
    },
    'generic': {
      type: 'generic',
      capabilities: ['general_coding', 'problem_solving', 'research', 'prototyping'],
      tools: ['read', 'write', 'edit', 'execute', 'browser'],
      description: 'General purpose development'
    }
  };

  /**
   * Get agent type information for a given SPARC mode
   */
  getAgentTypeForSparcMode(sparcMode: string): AgentTypeInfo {
    return this.SPARC_AGENT_MAP[sparcMode] || this.SPARC_AGENT_MAP['generic'];
  }

  /**
   * Get all available SPARC modes
   */
  getAvailableSparcModes(): string[] {
    return Object.keys(this.SPARC_AGENT_MAP);
  }

  /**
   * Check if a SPARC mode is valid
   */
  isValidSparcMode(sparcMode: string): boolean {
    return sparcMode in this.SPARC_AGENT_MAP;
  }

  /**
   * Get agent types that can handle specific capabilities
   */
  getAgentTypesForCapabilities(requiredCapabilities: string[]): string[] {
    const matchingTypes: string[] = [];

    for (const [sparcMode, info] of Object.entries(this.SPARC_AGENT_MAP)) {
      const hasAllCapabilities = requiredCapabilities.every(cap =>
        info.capabilities.includes(cap)
      );
      if (hasAllCapabilities) {
        matchingTypes.push(info.type);
      }
    }

    // Remove duplicates
    return [...new Set(matchingTypes)];
  }

  /**
   * Score an agent for a specific task based on capability match
   */
  scoreAgentForTask(agentCapabilities: string[], taskRequirements: string[]): number {
    if (taskRequirements.length === 0) return 100;

    const matchedRequirements = taskRequirements.filter(req =>
      agentCapabilities.includes(req)
    );

    return (matchedRequirements.length / taskRequirements.length) * 100;
  }

  /**
   * Get recommended agent type based on task description
   */
  recommendAgentType(taskDescription: string): AgentTypeInfo {
    const desc = taskDescription.toLowerCase();

    // Keywords for different agent types
    if (desc.includes('architect') || desc.includes('design') || desc.includes('system')) {
      return this.SPARC_AGENT_MAP['architect'];
    }
    if (desc.includes('test') || desc.includes('tdd') || desc.includes('unit')) {
      return this.SPARC_AGENT_MAP['tdd'];
    }
    if (desc.includes('security') || desc.includes('vulnerability') || desc.includes('auth')) {
      return this.SPARC_AGENT_MAP['security-review'];
    }
    if (desc.includes('document') || desc.includes('doc') || desc.includes('readme')) {
      return this.SPARC_AGENT_MAP['docs-writer'];
    }
    if (desc.includes('debug') || desc.includes('fix') || desc.includes('error')) {
      return this.SPARC_AGENT_MAP['debug'];
    }
    if (desc.includes('deploy') || desc.includes('ci') || desc.includes('pipeline')) {
      return this.SPARC_AGENT_MAP['devops'];
    }
    if (desc.includes('integrat') || desc.includes('connect') || desc.includes('api')) {
      return this.SPARC_AGENT_MAP['integration'];
    }

    // Default to generic code mode
    return this.SPARC_AGENT_MAP['code'];
  }

  /**
   * Get agent pool configuration for a project
   */
  getAgentPoolConfig(tasks: Array<{ sparc_mode?: string }>): {
    [agentType: string]: number;
  } {
    const agentCounts: { [type: string]: number } = {};

    // Count required agents by type
    for (const task of tasks) {
      const agentInfo = this.getAgentTypeForSparcMode(task.sparc_mode || 'code');
      agentCounts[agentInfo.type] = (agentCounts[agentInfo.type] || 0) + 1;
    }

    // Ensure minimum agent counts
    const minAgents = {
      coordinator: 1,
      developer: 2,
      analyzer: 1,
      researcher: 1,
      generic: 1
    };

    for (const [type, minCount] of Object.entries(minAgents)) {
      if (!agentCounts[type] || agentCounts[type] < minCount) {
        agentCounts[type] = minCount;
      }
    }

    return agentCounts;
  }
}