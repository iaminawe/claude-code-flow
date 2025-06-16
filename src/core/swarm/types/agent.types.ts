/**
 * Swarm Agent Types
 */

export interface AgentRequirements {
  capabilities: string[];
  tools: string[];
  permissions?: string[];
}