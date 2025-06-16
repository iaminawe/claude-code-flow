import { CommandContext, info, success, error, warning } from "../cli-core.ts";
import { cyan, bold, yellow, green, gray } from "https://deno.land/std@0.224.0/fmt/colors.ts";
import { TaskMasterDenoBridge } from "../../integrations/taskmaster/deno-bridge.ts";
import { TaskMasterAIBridge } from "../../integrations/taskmaster/deno-bridge-ai.ts";
import { join } from "https://deno.land/std@0.224.0/path/mod.ts";
import { createTaskMasterTemplateCommands } from "./taskmaster-templates.ts";
import { SharedStorage } from "../../integrations/taskmaster/services/shared-storage.ts";
import { WebSocketServer } from "../../integrations/taskmaster/services/websocket-server.ts";

export async function taskmasterAction(ctx: CommandContext): Promise<void> {
  const { args, flags = {} } = ctx;
  const subcommand = args[0];
  const options = flags; // Map flags to options for consistency

  // Show help if no subcommand provided
  if (!subcommand || subcommand === '--help' || subcommand === '-h') {
    showTaskmasterHelp();
    return;
  }

  try {
    switch (subcommand) {
      case "parse":
        await handleParse(args[1], options);
        break;

      case "generate":
        await handleGenerate(args[1], options);
        break;

      case "sync":
        // Check if it's a sync server command
        if (args[1] === 'server') {
          await handleSyncServer(args.slice(2), options);
        } else {
          await handleSync(options);
        }
        break;
        
      case "list":
        await handleList(options);
        break;
        
      case "update":
        await handleUpdate(args[1], args[2], options);
        break;
        
      case "export":
        await handleExport(options);
        break;

      case "init":
        await handleInit(options);
        break;

      case "templates":
        await handleTemplates(args.slice(1), options);
        break;

      case "info":
        await handleInfo();
        break;
        
      case "analyze":
        await handleAnalyze(args[1], options);
        break;
        
      case "ai-status":
        await handleAIStatus();
        break;

      case "execute":
        await handleExecute(args[1], options);
        break;

      case "execute-all":
        await handleExecuteAll(options);
        break;

      case "execute-status":
        await handleExecuteStatus(args[1], options);
        break;

      case "help":
        showTaskmasterHelp();
        break;

      default:
        error(`Unknown taskmaster subcommand: ${subcommand}`);
        showTaskmasterHelp();
    }
  } catch (err) {
    error(`TaskMaster command failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function handleParse(prdPath: string | undefined, options: any): Promise<void> {
  if (!prdPath) {
    error("PRD file path is required");
    return;
  }

  info(`Parsing PRD from: ${prdPath}`);
  
  try {
    // Use AI bridge if --ai flag is present
    const aiOptions = options.ai ? { apiKey: options.apiKey, model: options.model } : undefined;
    const taskmaster = options.ai 
      ? new TaskMasterAIBridge(aiOptions)
      : new TaskMasterDenoBridge();
    
    const prd = await taskmaster.parsePRD(prdPath, {
      ...options,
      useAI: options.ai,
      extractDetailedFeatures: options.detailed
    });
    
    success(`PRD parsed successfully: ${prd.title}`);
    if (options.verbose) {
      console.log(`  Sections: ${prd.sections.length}`);
      console.log(`  Created: ${prd.metadata.created}`);
    }
  } catch (err) {
    error(`Failed to parse PRD: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function handleGenerate(prdPath: string | undefined, options: any): Promise<void> {
  if (!prdPath) {
    error("PRD file path is required");
    return;
  }

  info(`Generating tasks from PRD: ${prdPath}`);
  
  try {
    // Use AI bridge if --ai flag is present
    const aiOptions = options.ai ? { apiKey: options.apiKey, model: options.model } : undefined;
    const taskmaster = options.ai 
      ? new TaskMasterAIBridge(aiOptions)
      : new TaskMasterDenoBridge();
      
    // Enable SPARC mapping and AI features
    const enhancedOptions = { 
      ...options, 
      sparcMapping: true,
      useAI: options.ai,
      enhanceDescriptions: options.ai && options.enhance !== false,
      extractDetailedFeatures: options.detailed,
      aiSuggestSparcModes: options.ai
    };
    const tasks = await taskmaster.generateTasks(prdPath, enhancedOptions);
    
    success(`Generated ${tasks.length} tasks successfully`);
    
    // Show tasks (temporarily always show for testing)
    tasks.forEach((task, index) => {
      console.log(`  ${index + 1}. ${cyan(task.title)} [${task.priority}]`);
      if (task.sparc_mode) {
        console.log(`     SPARC Mode: ${task.sparc_mode}`);
      }
    });
    
    // For testing, always save to a JSON file
    const outputPath = options.output || 'taskmaster-output.json';
    const outputFormat = options.format || 'json';
    
    let outputContent: string;
    if (outputFormat === 'json') {
      outputContent = JSON.stringify(tasks, null, 2);
    } else if (outputFormat === 'markdown') {
      outputContent = `# Generated Tasks\n\n${tasks.map((t, i) => 
        `## ${i + 1}. ${t.title}\n- **Priority**: ${t.priority}\n- **Type**: ${t.type}\n- **Status**: ${t.status}\n${t.sparc_mode ? `- **SPARC Mode**: ${t.sparc_mode}\n` : ''}- **Description**: ${t.description}\n`
      ).join('\n')}`;
    } else {
      outputContent = tasks.map(t => `- ${t.title}: ${t.description}`).join('\n');
    }
    
    await Deno.writeTextFile(outputPath, outputContent);
    info(`Tasks written to: ${outputPath}`);
  } catch (err) {
    error(`Failed to generate tasks: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function handleSync(options: any): Promise<void> {
  info("Syncing TaskMaster data...");
  
  try {
    const taskmaster = new TaskMasterDenoBridge();
    
    if (options.verbose) {
      taskmaster.on('sync:started', () => console.log('  Starting sync...'));
      taskmaster.on('sync:completed', () => console.log('  Sync completed'));
      taskmaster.on('sync:error', (err) => console.log(`  Sync error: ${err.message}`));
    }
    
    await taskmaster.syncWithVSCode();
    success("TaskMaster sync completed");
  } catch (err) {
    error(`Failed to sync: ${err instanceof Error ? err.message : String(err)}`);
  }
}

// Global WebSocket server instance
let wsServer: WebSocketServer | null = null;

async function handleSyncServer(args: string[], options: any): Promise<void> {
  const action = args[0] || 'start';
  
  switch (action) {
    case 'start':
      await startSyncServer(options);
      break;
      
    case 'stop':
      await stopSyncServer();
      break;
      
    case 'status':
      await showSyncServerStatus();
      break;
      
    default:
      error(`Unknown sync server action: ${action}`);
      console.log("\nAvailable actions: start, stop, status");
  }
}

async function startSyncServer(options: any): Promise<void> {
  info("Starting VS Code sync server...");
  
  try {
    // Check if server is already running
    if (wsServer) {
      warning("Sync server is already running!");
      await showSyncServerStatus();
      return;
    }
    
    // Initialize storage if needed
    const storage = new SharedStorage({ autoInit: false });
    if (!await storage.isInitialized()) {
      warning("TaskMaster not initialized. Running init...");
      await storage.initialize();
    }
    
    // Get configuration
    const config = await storage.getSyncConfig();
    const port = options.port || config.port || 5173;
    const host = options.host || config.host || 'localhost';
    
    // Create and start server
    wsServer = new WebSocketServer(storage, port, host);
    await wsServer.start();
    
    success("VS Code sync server started!");
    console.log();
    console.log("Server details:");
    console.log(`  WebSocket: ${cyan(`ws://${host}:${port}/taskmaster`)}`);
    console.log(`  HTTP API:  ${cyan(`http://${host}:${port}/api/`)}`);
    console.log(`  Health:    ${cyan(`http://${host}:${port}/health`)}`);
    console.log();
    console.log("The VS Code extension will automatically connect to this server.");
    console.log("To stop the server, run: " + cyan("taskmaster sync server stop"));
    
    // Keep the process running
    console.log("\nPress Ctrl+C to stop the server...");
    
    // Handle graceful shutdown
    const shutdownHandler = async () => {
      console.log("\n\nShutting down sync server...");
      if (wsServer) {
        await wsServer.stop();
        wsServer = null;
      }
      Deno.exit(0);
    };
    
    Deno.addSignalListener("SIGINT", shutdownHandler);
    Deno.addSignalListener("SIGTERM", shutdownHandler);
    
    // Keep process alive
    await new Promise(() => {});
    
  } catch (err) {
    error(`Failed to start sync server: ${err instanceof Error ? err.message : String(err)}`);
    wsServer = null;
  }
}

async function stopSyncServer(): Promise<void> {
  info("Stopping VS Code sync server...");
  
  try {
    if (!wsServer) {
      warning("No sync server is currently running.");
      return;
    }
    
    await wsServer.stop();
    wsServer = null;
    success("VS Code sync server stopped!");
    
  } catch (err) {
    error(`Failed to stop sync server: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function showSyncServerStatus(): Promise<void> {
  info("VS Code sync server status:");
  
  if (!wsServer) {
    console.log(yellow("  Server is not running"));
    console.log("\nTo start the server, run: " + cyan("taskmaster sync server start"));
    return;
  }
  
  const status = wsServer.getStatus();
  console.log(green("  Server is running"));
  console.log(`  Host: ${status.host}`);
  console.log(`  Port: ${status.port}`);
  console.log(`  Connected clients: ${status.clients}`);
  
  if (status.clients > 0) {
    console.log("\nConnected client IDs:");
    status.clientIds.forEach(id => {
      console.log(`  - ${id}`);
    });
  }
}

async function handleList(options: any): Promise<void> {
  try {
    const taskmaster = new TaskMasterDenoBridge();
    const storedPRDs = await taskmaster.getStoredPRDs();
    const storedTasks = await taskmaster.getStoredTasks();
    
    console.log();
    console.log(bold(cyan("Stored TaskMaster Data")));
    console.log();
    
    if (storedPRDs.length > 0) {
      console.log(bold("Recent PRDs:"));
      storedPRDs.forEach((prd, index) => {
        console.log(`  ${index + 1}. ${cyan(prd.title)}`);
        console.log(`     Path: ${prd.path}`);
        console.log(`     Created: ${new Date(prd.created).toLocaleString()}`);
      });
      console.log();
    }
    
    if (storedTasks.length > 0) {
      console.log(bold("Task Summaries:"));
      storedTasks.forEach((summary, index) => {
        console.log(`  ${index + 1}. ${cyan(summary.prdTitle)}`);
        console.log(`     Total Tasks: ${summary.taskCount}`);
        console.log(`     High Priority: ${summary.priorities.high}`);
        console.log(`     Medium Priority: ${summary.priorities.medium}`);
        console.log(`     Low Priority: ${summary.priorities.low}`);
        console.log(`     Generated: ${new Date(summary.created).toLocaleString()}`);
      });
    }
    
    if (storedPRDs.length === 0 && storedTasks.length === 0) {
      console.log("No TaskMaster data stored yet.");
      console.log("Use 'taskmaster generate <prd-file>' to get started.");
    }
  } catch (err) {
    error(`Failed to list stored data: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function handleUpdate(taskId: string | undefined, status: string | undefined, options: any): Promise<void> {
  if (!taskId || !status) {
    error("Task ID and status are required");
    console.log("Usage: taskmaster update <task-id> <status>");
    console.log("Status options: pending, in_progress, completed, blocked");
    return;
  }
  
  const validStatuses = ['pending', 'in_progress', 'completed', 'blocked'];
  if (!validStatuses.includes(status)) {
    error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    return;
  }
  
  try {
    const taskmaster = new TaskMasterDenoBridge();
    const updated = await taskmaster.updateTaskStatus(taskId, status);
    
    if (updated) {
      success(`Task ${taskId} updated to status: ${status}`);
      
      // Show task details if verbose
      if (options.verbose) {
        const task = await taskmaster.getTaskById(taskId);
        if (task) {
          console.log(`  Title: ${cyan(task.title)}`);
          console.log(`  Type: ${task.type}`);
          console.log(`  Priority: ${task.priority}`);
          console.log(`  Updated: ${new Date(task.updatedAt!).toLocaleString()}`);
        }
      }
    } else {
      error(`Task ${taskId} not found`);
    }
  } catch (err) {
    error(`Failed to update task: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function handleTemplates(args: string[], options: any): Promise<void> {
  // Delegate to template commands handler
  const templateCommands = createTaskMasterTemplateCommands();
  const subcommand = args[0] || 'help';
  
  // Convert to commander-compatible format
  const argv = ['node', 'taskmaster', 'templates', subcommand, ...args.slice(1)];
  
  // Add options as flags
  Object.entries(options).forEach(([key, value]) => {
    if (typeof value === 'boolean' && value) {
      argv.push(`--${key}`);
    } else if (value !== undefined && value !== null) {
      argv.push(`--${key}`, String(value));
    }
  });
  
  await templateCommands.parseAsync(argv);
}

async function handleExport(options: any): Promise<void> {
  try {
    const taskmaster = new TaskMasterDenoBridge();
    const format = options.format || 'json';
    const validFormats = ['json', 'markdown', 'csv'];
    
    if (!validFormats.includes(format)) {
      error(`Invalid format. Must be one of: ${validFormats.join(', ')}`);
      return;
    }
    
    info(`Exporting all tasks as ${format}...`);
    const content = await taskmaster.exportTasks(format as 'json' | 'markdown' | 'csv');
    
    const outputPath = options.output || `taskmaster-export.${format === 'markdown' ? 'md' : format}`;
    await Deno.writeTextFile(outputPath, content);
    
    success(`Tasks exported to: ${outputPath}`);
  } catch (err) {
    error(`Failed to export tasks: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function handleInfo(): Promise<void> {
  console.log();
  console.log(bold(cyan("TaskMaster Integration")));
  console.log();
  console.log("TaskMaster provides intelligent task generation from PRD documents.");
  console.log();
  console.log(bold("Features:"));
  console.log("  • Parse PRD documents (with optional AI enhancement)");
  console.log("  • Generate hierarchical task structures");
  console.log("  • SPARC methodology integration");
  console.log("  • VS Code extension sync");
  console.log("  • Memory-based storage and retrieval");
  console.log();
  console.log(bold("AI Features (when enabled):"));
  console.log("  • Enhanced PRD analysis and summarization");
  console.log("  • Detailed feature extraction");
  console.log("  • Intelligent task descriptions");
  console.log("  • Automatic SPARC mode suggestions");
  console.log("  • Effort estimation");
  console.log();
  console.log(bold("Available Commands:"));
  console.log(`  ${cyan("parse")}     Parse a PRD document`);
  console.log(`  ${cyan("generate")}  Generate tasks from PRD`);
  console.log(`  ${cyan("sync")}      Sync with VS Code extension`);
  console.log(`  ${cyan("list")}      Show stored PRDs and tasks`);
  console.log(`  ${cyan("update")}    Update task status`);
  console.log(`  ${cyan("export")}    Export all tasks`);
  console.log(`  ${cyan("templates")} Manage task templates`);
  console.log(`  ${cyan("analyze")} <prd>  Analyze PRD with AI (requires API key)`);
  console.log(`  ${cyan("ai-status")}  Check AI service status`);
  console.log(`  ${cyan("info")}      Show TaskMaster information`);
  console.log();
}

async function handleAnalyze(prdPath: string | undefined, options: any): Promise<void> {
  if (!prdPath) {
    error("PRD file path is required");
    return;
  }
  
  info(`Analyzing PRD with AI: ${prdPath}`);
  
  try {
    const taskmaster = new TaskMasterAIBridge({ apiKey: options.apiKey, model: options.model });
    const analysis = await taskmaster.analyzePRD(prdPath);
    
    console.log();
    console.log(bold(cyan("PRD Analysis Results")));
    console.log();
    console.log(bold("Summary:"));
    console.log(`  ${analysis.analysis.summary}`);
    console.log();
    console.log(bold("Complexity:"), analysis.analysis.complexity);
    console.log(bold("Estimated Effort:"), analysis.analysis.estimatedEffort);
    console.log();
    console.log(bold("Features Identified:"));
    analysis.analysis.features.forEach((feature: string, index: number) => {
      console.log(`  ${index + 1}. ${feature}`);
    });
    console.log();
    console.log(bold("Requirements:"));
    analysis.analysis.requirements.forEach((req: string, index: number) => {
      console.log(`  ${index + 1}. ${req}`);
    });
    
    success("PRD analysis completed");
  } catch (err) {
    error(`Failed to analyze PRD: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function handleAIStatus(): Promise<void> {
  try {
    const taskmaster = new TaskMasterAIBridge();
    const status = taskmaster.getAIStatus();
    
    console.log();
    console.log(bold(cyan("AI Service Status")));
    console.log();
    console.log(`Status: ${status.available ? green("✅ Available") : yellow("⚠️  Not Available")}`);
    
    if (status.available) {
      console.log(`Model: ${status.model}`);
      console.log();
      console.log(bold("Available Features:"));
      status.features.forEach(feature => {
        console.log(`  • ${feature}`);
      });
    } else {
      console.log();
      console.log(yellow("To enable AI features:"));
      console.log("  1. Get an API key from https://console.anthropic.com");
      console.log("  2. Set the environment variable:");
      console.log(gray("     export ANTHROPIC_API_KEY='your-key-here'"));
      console.log("  3. Or use the --api-key flag when running commands");
    }
    console.log();
  } catch (err) {
    error(`Failed to check AI status: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function handleInit(options: any): Promise<void> {
  info("Initializing TaskMaster VS Code sync environment...");
  
  try {
    const storage = new SharedStorage({ autoInit: false });
    
    // Check if already initialized
    if (await storage.isInitialized()) {
      warning("TaskMaster directory already exists!");
      console.log("\nExisting structure found at: " + cyan(".taskmaster/"));
      console.log("\nTo reinitialize, first remove the existing directory:");
      console.log(gray("  rm -rf .taskmaster"));
      return;
    }
    
    // Initialize storage
    await storage.initialize();
    
    success("TaskMaster sync environment initialized!");
    console.log();
    console.log("Created directory structure:");
    console.log(cyan("  .taskmaster/"));
    console.log("  ├── tasks/         " + gray("# Task storage"));
    console.log("  ├── config/        " + gray("# Sync configuration"));
    console.log("  ├── sparc/         " + gray("# SPARC mappings"));
    console.log("  └── logs/          " + gray("# Sync logs"));
    console.log();
    console.log("Next steps:");
    console.log("  1. Install the VS Code extension: " + cyan("claude-task-master"));
    console.log("  2. Start the sync server: " + cyan("taskmaster sync server start"));
    console.log("  3. Open VS Code in this directory");
    console.log();
    console.log("The extension will automatically detect the .taskmaster directory.");
  } catch (err) {
    error(`Failed to initialize: ${err instanceof Error ? err.message : String(err)}`);
  }
}

function showTaskmasterHelp(): void {
  console.log();
  console.log(bold(cyan("TaskMaster - PRD Parsing and Task Generation")));
  console.log();
  console.log("Usage: claude-flow taskmaster <command> [options]");
  console.log();
  console.log(bold("Commands:"));
  console.log();
  
  // Init command
  console.log(`  ${cyan("init")}                    Initialize VS Code sync environment`);
  console.log(`    ${gray("Creates .taskmaster directory for extension integration")}`);
  console.log();
  
  // Parse command
  console.log(`  ${cyan("parse")} <prd-file>        Parse and validate a PRD document`);
  console.log(`    ${gray("Options:")}`);
  console.log(`    ${gray("--ai                  Use AI for enhanced parsing")}`);
  console.log(`    ${gray("--detailed            Extract detailed features")}`);
  console.log(`    ${gray("--verbose             Show detailed parsing info")}`);
  console.log();
  
  // Generate command
  console.log(`  ${cyan("generate")} <prd-file>     Generate tasks from PRD`);
  console.log(`    ${gray("Options:")}`);
  console.log(`    ${gray("--output <file>       Output file path (default: stdout)")}`);
  console.log(`    ${gray("--format <type>       Output format: json|markdown|csv (default: json)")}`);
  console.log(`    ${gray("--depth <number>      Task hierarchy depth (default: 3)")}`);
  console.log(`    ${gray("--sparc-mapping       Enable SPARC mode mapping (default: true)")}`);
  console.log(`    ${gray("--ai                  Enable AI enhancement")}`);
  console.log(`    ${gray("--detailed            Generate detailed descriptions")}`);
  console.log(`    ${gray("--enhance             Enhance with AI suggestions")}`);
  console.log(`    ${gray("--verbose             Show generation progress")}`);
  console.log();
  
  // List command
  console.log(`  ${cyan("list")}                    Display stored PRDs and task summaries`);
  console.log(`    ${gray("No options")}`);
  console.log();
  
  // Update command
  console.log(`  ${cyan("update")} <task-id> <status>  Update task status`);
  console.log(`    ${gray("Status options: pending | in_progress | completed | blocked")}`);
  console.log();
  
  // Export command
  console.log(`  ${cyan("export")}                  Export all stored tasks`);
  console.log(`    ${gray("Options:")}`);
  console.log(`    ${gray("--format <type>       Export format: json|markdown|csv")}`);
  console.log(`    ${gray("--output <file>       Output file path")}`);
  console.log(`    ${gray("--filter <status>     Filter by status")}`);
  console.log();
  
  // AI Status command
  console.log(`  ${cyan("ai-status")}               Check AI configuration status`);
  console.log(`    ${gray("No options")}`);
  console.log();
  
  // Analyze command
  console.log(`  ${cyan("analyze")} <prd-file>      Analyze PRD with AI (requires API key)`);
  console.log(`    ${gray("Returns: Executive summary, complexity assessment, feature breakdown")}`);
  console.log(`    ${gray("         effort estimation, and risk analysis")}`);
  console.log();
  
  // Execute commands
  console.log(`  ${cyan("execute")} <task-id>       Execute a single task through orchestrator`);
  console.log(`    ${gray("Options:")}`);
  console.log(`    ${gray("--agent-type <type>   Specify agent type")}`);
  console.log(`    ${gray("--timeout <ms>        Execution timeout")}`);
  console.log(`    ${gray("--retry <count>       Retry count on failure")}`);
  console.log(`    ${gray("--priority <0-100>    Task priority")}`);
  console.log();
  
  console.log(`  ${cyan("execute-all")}             Execute all tasks (or filtered subset)`);
  console.log(`    ${gray("Options:")}`);
  console.log(`    ${gray("--prd-id <id>         Execute tasks from specific PRD")}`);
  console.log(`    ${gray("--tasks <id1,id2>     Execute specific task IDs")}`);
  console.log(`    ${gray("--filter <key=val>    Filter tasks (e.g., priority=high,status=pending)")}`);
  console.log(`    ${gray("--parallel            Enable parallel execution (default: true)")}`);
  console.log(`    ${gray("--max-agents <n>      Maximum concurrent agents")}`);
  console.log();
  
  console.log(`  ${cyan("execute-status")} <id>     Check execution status`);
  console.log(`    ${gray("No options")}`);
  console.log();
  
  // Sync commands
  console.log(`  ${cyan("sync")}                    Sync with VS Code extension`);
  console.log(`    ${gray("Options:")}`);
  console.log(`    ${gray("--verbose             Show sync details")}`);
  console.log();
  
  console.log(`  ${cyan("sync server start")}       Start VS Code sync server`);
  console.log(`    ${gray("Options:")}`);
  console.log(`    ${gray("--port <number>       Server port (default: 5173)")}`);
  console.log(`    ${gray("--host <address>      Host address (default: localhost)")}`);
  console.log();
  
  console.log(`  ${cyan("sync server stop")}        Stop VS Code sync server`);
  console.log(`  ${cyan("sync server status")}      Check sync server status`);
  console.log();
  
  // Templates command
  console.log(`  ${cyan("templates list")}          List available templates`);
  console.log(`    ${gray("Note: Template system is partially implemented")}`);
  console.log();
  
  // Info and help
  console.log(`  ${cyan("info")}                    Display TaskMaster capabilities`);
  console.log(`  ${cyan("help")}                    Show this help message`);
  console.log();
  
  console.log(bold("Global Options:"));
  console.log("  --ai                    Enable AI features (requires ANTHROPIC_API_KEY)");
  console.log("  --api-key <key>         Anthropic API key (overrides env var)");
  console.log("  --model <name>          AI model (default: claude-3-haiku-20240307)");
  console.log();
  
  console.log(bold("Examples:"));
  console.log();
  console.log(`  ${yellow("# Basic task generation (no AI):")}`);  
  console.log(`  ${gray("claude-flow taskmaster generate requirements.prd --output tasks.json")}`);
  console.log();
  console.log(`  ${yellow("# Generate with SPARC mapping and markdown output:")}`);  
  console.log(`  ${gray("claude-flow taskmaster generate app.prd --sparc-mapping --format markdown")}`);
  console.log();
  console.log(`  ${yellow("# AI-enhanced generation (requires API key):")}`);
  console.log(`  ${gray("export ANTHROPIC_API_KEY='your-key'")}`);
  console.log(`  ${gray("claude-flow taskmaster generate app.prd --ai --detailed --enhance")}`);
  console.log();
  console.log(`  ${yellow("# Analyze PRD with AI:")}`);  
  console.log(`  ${gray("claude-flow taskmaster analyze requirements.prd")}`);
  console.log();
  console.log(`  ${yellow("# Export tasks in different formats:")}`);
  console.log(`  ${gray("claude-flow taskmaster export --format markdown --output tasks.md")}`);
  console.log(`  ${gray("claude-flow taskmaster export --format csv --output tasks.csv")}`);
  console.log();
  console.log(`  ${yellow("# Update task status:")}`);
  console.log(`  ${gray("claude-flow taskmaster update task-001 completed")}`);
  console.log();
  console.log(`  ${yellow("# Check AI configuration:")}`);
  console.log(`  ${gray("claude-flow taskmaster ai-status")}`);
  console.log();
  console.log(`  ${yellow("# Execute tasks:")}`);
  console.log(`  ${gray("claude-flow taskmaster execute task-001 --agent-type developer")}`);
  console.log(`  ${gray("claude-flow taskmaster execute-all --filter priority=high --parallel")}`);
  console.log(`  ${gray("claude-flow taskmaster execute-status exec-1234567890")}`);
  console.log();
}

async function handleExecute(taskId: string | undefined, options: any): Promise<void> {
  if (!taskId) {
    error("Task ID is required");
    console.log("Usage: taskmaster execute <task-id> [options]");
    return;
  }

  info(`Executing task: ${taskId}`);
  
  try {
    const { TaskMasterOrchestratorAdapter } = await import("../../integrations/taskmaster/adapters/orchestrator-adapter.ts");
    const adapter = new TaskMasterOrchestratorAdapter();
    
    const result = await adapter.executeTask(taskId, {
      agentType: options.agentType,
      timeout: options.timeout ? parseInt(options.timeout) : undefined,
      retryCount: options.retry ? parseInt(options.retry) : undefined,
      priority: options.priority ? parseInt(options.priority) : undefined
    });
    
    if (result.status === 'failed') {
      error(`Task execution failed: ${result.error}`);
      return;
    }
    
    success(`Task ${taskId} queued for execution`);
    console.log(`  Execution ID: ${cyan(result.executionId)}`);
    console.log(`  Status: ${result.status}`);
    if (result.agentId) {
      console.log(`  Agent: ${result.agentId}`);
    }
    
    console.log();
    console.log("To check execution status:");
    console.log(`  ${gray(`claude-flow taskmaster execute-status ${result.executionId}`)}`);
    
  } catch (err) {
    error(`Failed to execute task: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function handleExecuteAll(options: any): Promise<void> {
  info("Executing all tasks...");
  
  try {
    const { TaskMasterOrchestratorAdapter } = await import("../../integrations/taskmaster/adapters/orchestrator-adapter.ts");
    const adapter = new TaskMasterOrchestratorAdapter();
    
    // Parse filter options
    let filter;
    if (options.filter) {
      filter = {};
      const filterParts = options.filter.split(',');
      for (const part of filterParts) {
        const [key, value] = part.split('=');
        filter[key] = value;
      }
    }
    
    const result = await adapter.executeAll({
      prdId: options.prdId,
      taskIds: options.tasks ? options.tasks.split(',') : undefined,
      filter: filter,
      parallel: options.parallel !== false,
      maxAgents: options.maxAgents ? parseInt(options.maxAgents) : undefined
    });
    
    if (result.status === 'failed') {
      error("Bulk execution failed");
      return;
    }
    
    success(`Bulk execution started`);
    console.log(`  Execution ID: ${cyan(result.executionId)}`);
    console.log(`  Total Tasks: ${result.totalTasks}`);
    console.log(`  Status: ${result.status}`);
    console.log(`  Mode: ${options.parallel !== false ? 'Parallel' : 'Sequential'}`);
    
    if (options.parallel !== false && options.maxAgents) {
      console.log(`  Max Agents: ${options.maxAgents}`);
    }
    
    console.log();
    console.log("To monitor progress:");
    console.log(`  ${gray(`claude-flow taskmaster execute-status ${result.executionId}`)}`);
    console.log(`  ${gray(`claude-flow swarm status --watch`)}`);
    
  } catch (err) {
    error(`Failed to execute tasks: ${err instanceof Error ? err.message : String(err)}`);
  }
}

async function handleExecuteStatus(executionId: string | undefined, options: any): Promise<void> {
  if (!executionId) {
    error("Execution ID is required");
    console.log("Usage: taskmaster execute-status <execution-id>");
    return;
  }

  try {
    const { TaskMasterOrchestratorAdapter } = await import("../../integrations/taskmaster/adapters/orchestrator-adapter.ts");
    const adapter = new TaskMasterOrchestratorAdapter();
    
    const status = await adapter.getExecutionStatus(executionId);
    
    console.log();
    console.log(bold(cyan("Execution Status")));
    console.log(`  Execution ID: ${executionId}`);
    console.log(`  Status: ${status.status}`);
    if (status.message) {
      console.log(`  Message: ${status.message}`);
    }
    console.log();
    
    // Note about future implementation
    if (status.status === 'unknown') {
      console.log(yellow("Note: Full execution tracking is not yet implemented."));
      console.log("This feature will be available when swarm integration is complete.");
    }
    
  } catch (err) {
    error(`Failed to get execution status: ${err instanceof Error ? err.message : String(err)}`);
  }
}