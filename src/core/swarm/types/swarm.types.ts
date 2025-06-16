/**
 * Swarm Core Types
 */

import { Objective } from './objective.types.ts';

export interface SwarmStrategy {
  createObjective(input: any): Promise<Objective>;
  validateObjective?(objective: Objective): Promise<boolean>;
  getStrategyMetadata?(): StrategyMetadata;
}

export interface StrategyMetadata {
  name: string;
  version: string;
  description: string;
  capabilities: string[];
}