#!/usr/bin/env -S deno run --allow-all
/**
 * Claude-Flow CLI entry point
 * This redirects to simple-cli.ts for remote execution compatibility
 */

// Import and run the simple CLI which doesn't have external dependencies
import "./simple-cli.ts";
// Spinner import removed - not available in current cliffy version
import { Command } from '@cliffy/command';
import { colors } from '@cliffy/ansi/colors';
import { logger } from '../core/logger.js';
import { configManager } from '../core/config.js';
import { startCommand } from './commands/start.js';
import { agentCommand } from './commands/agent.js';
import { taskCommand } from './commands/task.js';
import { memoryCommand } from './commands/memory.js';
import { configCommand } from './commands/config.js';
import { statusCommand } from './commands/status.js';
import { monitorCommand } from './commands/monitor.js';
import { sessionCommand } from './commands/session.js';
import { workflowCommand } from './commands/workflow.js';
import { helpCommand } from './commands/help.js';
import { mcpCommand } from './commands/mcp.js';
import { formatError, displayBanner, displayVersion } from './formatter.js';
import { startREPL } from './repl.js';
import { CompletionGenerator } from './completion.js';

// Version information
const VERSION = '1.0.70';
const BUILD_DATE = new Date().toISOString().split('T')[0];

// Main CLI command
const cli = new Command()
  .name('claude-flow')
  .version(VERSION)
  .description('Claude-Flow: Advanced AI agent orchestration system for multi-agent coordination')
  .meta('Build', BUILD_DATE)
  .meta('Runtime', 'Deno')
  .globalOption('-c, --config <path:string>', 'Path to configuration file', {
    default: './claude-flow.config.json',
  })
  .globalOption('-v, --verbose', 'Enable verbose logging')
  .globalOption('--no-banner', 'Disable startup banner')
  .globalOption('--json', 'Output in JSON format')
  .action(() => {
    // Show help when no command is provided
    cli.showHelp();
  });

// Add commands
cli
  .command('start', startCommand)
  .command('agent', agentCommand)
  .command('task', taskCommand)
  .command('memory', memoryCommand)
  .command('config', configCommand)
  .command('status', statusCommand)
  .command('monitor', monitorCommand)
  .command('session', sessionCommand)
  .command('workflow', workflowCommand)
  .command('mcp', mcpCommand)
  .command('help', helpCommand);

// REPL command
cli.command('repl')
  .description('Start interactive REPL session')
  .option('-e, --enhanced', 'Use enhanced REPL with syntax highlighting')
  .action(async (options) => {
    if (!options.noBanner) {
      displayBanner(VERSION);
    }
    
    logger.info('Starting REPL session...');
    await startREPL({
      enhanced: options.enhanced,
      config: await configManager.load(options.config),
    });
  });

// Completion command
cli.command('completion')
  .description('Generate shell completion script')
  .option('-s, --shell <shell:string>', 'Shell type (bash, zsh, fish)', {
    default: 'bash',
  })
  .action((options) => {
    const generator = new CompletionGenerator(cli);
    const script = generator.generate(options.shell);
    console.log(script);
  });

// Version command with detailed info
cli.command('version')
  .description('Show detailed version information')
  .option('--json', 'Output as JSON')
  .action((options) => {
    const versionInfo = {
      version: VERSION,
      build: BUILD_DATE,
      runtime: 'Deno',
      platform: Deno.build.os,
      arch: Deno.build.arch,
    };
    
    if (options.json) {
      console.log(JSON.stringify(versionInfo, null, 2));
    } else {
      displayVersion(versionInfo);
    }
  });

// Parse and run
async function main() {
  try {
    // Load configuration
    const args = Deno.args;
    const configPath = args.includes('-c') || args.includes('--config')
      ? args[args.indexOf('-c') + 1] || args[args.indexOf('--config') + 1]
      : './claude-flow.config.json';
    
    await configManager.load(configPath);
    
    // Set verbose logging if requested
    if (args.includes('-v') || args.includes('--verbose')) {
      logger.setLevel('debug');
    }
    
    // Show banner unless disabled
    if (!args.includes('--no-banner')) {
      displayBanner(VERSION);
    }
    
    // Parse command
    await cli.parse(args);
  } catch (error) {
    formatError(error);
    Deno.exit(1);
  }
}

// Check if running as main module
if (import.meta.main) {
  main();
}

export { cli, VERSION };