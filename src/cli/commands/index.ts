import { CLI, success, error, warning, info, VERSION } from "../cli-core.js";
import type { Command, CommandContext } from "../cli-core.js";
import colors from "chalk";
const { bold, blue, yellow } = colors;
import { Orchestrator } from "../../core/orchestrator-fixed.js";
import { ConfigManager } from "../../core/config.js";
import { MemoryManager } from "../../memory/manager.js";
import { EventBus } from "../../core/event-bus.js";
import { Logger } from "../../core/logger.js";
import { JsonPersistenceManager } from "../../core/json-persistence.js";
import { swarmAction } from "./swarm.js";
import { SimpleMemoryManager } from "./memory.js";
import { sparcAction } from "./sparc.js";
import { createMigrateCommand } from "./migrate.js";
import { taskmasterAction } from "./taskmaster.js";
import { enterpriseCommands } from "./enterprise.js";

// Import enhanced orchestration commands
import { startCommand } from "./start.js";
import { statusCommand } from "./status.js";
import { monitorCommand } from "./monitor.js";
import { sessionCommand } from "./session.js";

let orchestrator: Orchestrator | null = null;
let configManager: ConfigManager | null = null;
let persistence: JsonPersistenceManager | null = null;

async function getPersistence(): Promise<JsonPersistenceManager> {
  if (!persistence) {
    persistence = new JsonPersistenceManager();
    await persistence.initialize();
  }
  return persistence;
}

async function getOrchestrator(): Promise<Orchestrator> {
  if (!orchestrator) {
    const config = await getConfigManager();
    const eventBus = EventBus.getInstance();
    const logger = new Logger({ level: "info", format: "text", destination: "console" });
    orchestrator = new Orchestrator(config, eventBus, logger);
    await orchestrator.initialize();
  }
  return orchestrator;
}

async function getMemoryManager(): Promise<MemoryManager> {
  const orch = await getOrchestrator();
  return orch.memory as MemoryManager;
}

async function getConfigManager(): Promise<ConfigManager> {
  if (!configManager) {
    configManager = ConfigManager.getInstance();
    await configManager.loadConfig();
  }
  return configManager;
}

export async function createCommands(): Promise<Map<string, Command>> {
  const commands = new Map<string, Command>();
  
  // Configuration management
  commands.set("init", {
    name: "init",
    description: "Initialize a new Claude Flow project with advanced features",
    action: async (args, context) => {
      try {
        const { join } = await import("https://deno.land/std@0.224.0/path/mod.ts");
        const targetPath = args.path || Deno.cwd();
        
        info(`Initializing Claude Flow in ${targetPath}...`);
        
        // Create directory structure
        await Deno.mkdir(join(targetPath, ".claude", "logs"), { recursive: true });
        await Deno.mkdir(join(targetPath, ".claude", "commands"), { recursive: true });
        await Deno.mkdir(join(targetPath, "memory"), { recursive: true });
        await Deno.mkdir(join(targetPath, "sessions"), { recursive: true });
        await Deno.mkdir(join(targetPath, "coordination"), { recursive: true });
        await Deno.mkdir(join(targetPath, ".taskmaster"), { recursive: true });
        
        // Create default config
        const defaultConfig = {
          version: VERSION,
          orchestrator: {
            maxConcurrentTasks: 10,
            taskTimeout: 300000
          },
          memory: {
            provider: "sqlite",
            path: "./memory/claude-flow.db"
          },
          logging: {
            level: "info",
            destination: "console"
          }
        };
        
        await Deno.writeTextFile(
          join(targetPath, "claude-flow.config.json"),
          JSON.stringify(defaultConfig, null, 2)
        );
        
        // Create CLAUDE.md
        const claudeMd = `# Claude Code Configuration - SPARC Development Environment

## Project Overview
This project uses the SPARC (Specification, Pseudocode, Architecture, Refinement, Completion) methodology for systematic Test-Driven Development with AI assistance through Claude-Flow orchestration.

## Build Commands
- \`npm run build\`: Build the project
- \`npm run test\`: Run the test suite
- \`npm run lint\`: Run linter and format checks
- \`npm run typecheck\`: Run TypeScript type checking

## Claude Flow Commands
- \`claude-flow start --ui\`: Start the orchestration system with UI
- \`claude-flow sparc modes\`: List all available SPARC development modes
- \`claude-flow sparc run <mode> "<task>"\`: Execute specific SPARC mode
- \`claude-flow sparc tdd "<feature>"\`: Run complete TDD workflow
- \`claude-flow swarm start "<task>"\`: Execute task with swarm orchestration
- \`claude-flow monitor\`: Start live monitoring dashboard
- \`claude-flow taskmaster generate <prd-file>\`: Generate tasks from PRD
- \`claude-flow taskmaster execute-all\`: Execute all tasks in parallel

## Code Style and Best Practices
- Modular Design: Keep files under 500 lines, break into logical components
- Environment Safety: Never hardcode secrets or environment-specific values
- Test-First: Always write tests before implementation (Red-Green-Refactor)
- Clean Architecture: Separate concerns, use dependency injection
- Documentation: Maintain clear, up-to-date documentation
`;
        
        await Deno.writeTextFile(join(targetPath, "CLAUDE.md"), claudeMd);
        
        success("Claude Flow initialized successfully!");
        info(`
Next steps:
1. Review and customize claude-flow.config.json
2. Review CLAUDE.md for project conventions
3. Run 'claude-flow start' to begin orchestration
4. Use 'claude-flow sparc modes' to see available development modes
        `);
      } catch (err) {
        error("Failed to initialize project", err);
      }
    }
  });

  // Orchestration commands
  commands.set("start", startCommand);
  commands.set("status", statusCommand);
  commands.set("monitor", monitorCommand);
  commands.set("session", sessionCommand);
  
  // Memory management
  const memoryManager = new SimpleMemoryManager(async () => getMemoryManager());
  commands.set("memory", memoryManager.createCommand());

  // SPARC development
  commands.set("sparc", await sparcAction());
  
  // Swarm orchestration
  commands.set("swarm", await swarmAction());

  // TaskMaster integration
  commands.set("taskmaster", await taskmasterAction());
  
  // Enterprise features
  for (const [name, command] of enterpriseCommands) {
    commands.set(name, command);
  }

  // Utility commands
  commands.set("config", {
    name: "config",
    description: "Manage Claude Flow configuration",
    action: async (args) => {
      const config = await getConfigManager();
      
      if (args.get) {
        const value = config.get(args.get);
        if (value !== undefined) {
          console.log(JSON.stringify(value, null, 2));
        } else {
          warning(`Configuration key '${args.get}' not found`);
        }
      } else if (args.set && args.value) {
        config.set(args.set, args.value);
        await config.saveConfig();
        success(`Set ${args.set} = ${args.value}`);
      } else {
        console.log(JSON.stringify(config.getAll(), null, 2));
      }
    }
  });

  commands.set("version", {
    name: "version",
    description: "Show Claude Flow version",
    action: () => {
      console.log(`Claude Flow v${VERSION}`);
    }
  });

  return commands;
}

export function registerCommands(cli: CLI, commands: Map<string, Command>): void {
  for (const [name, command] of commands) {
    cli.register(command);
  }
}