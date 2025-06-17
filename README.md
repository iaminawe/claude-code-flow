# 🌊 Claude-Flow: Agent Orchestration Platform for Claude-Code 

<div align="center">

[![🌟 Star on GitHub](https://img.shields.io/github/stars/ruvnet/claude-code-flow?style=for-the-badge&logo=github&color=gold)](https://github.com/ruvnet/claude-code-flow)
[![📦 NPX Ready](https://img.shields.io/npm/v/claude-flow?style=for-the-badge&logo=npm&color=blue&label=NPX%20INSTALL)](https://www.npmjs.com/package/claude-flow)
[![✅ 95% Test Coverage](https://img.shields.io/badge/coverage-95%25-brightgreen?style=for-the-badge&logo=codecov)](./test-results/coverage-html/index.html)
[![🦕 Deno Powered](https://img.shields.io/badge/deno-v1.40+-blue?style=for-the-badge&logo=deno)](https://deno.land/)
[![⚡ TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![📖 Documentation](https://img.shields.io/badge/docs-comprehensive-green?style=for-the-badge&logo=gitbook)](./docs/)
[![🛡️ MIT License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge&logo=opensourceinitiative)](https://opensource.org/licenses/MIT)

</div>

## 🎯 **Transform Your Development Workflow**

**Claude-Flow** is the ultimate multi-terminal orchestration platform that revolutionizes how you work with Claude Code. Imagine coordinating **dozens of AI agents** simultaneously, each working on different aspects of your project while sharing knowledge through an intelligent memory bank.

> 🔥 **One command to rule them all**: `npx claude-flow` - Deploy a full AI agent coordination system in seconds!


## 🎉 **What's New in v1.1.4** 🆕

### 🚀 **TaskMaster Integration - Fully Operational!**
- **✅ Fixed Task Execution**: Resolved duplicate `getTaskById` method and memory retrieval issues
- **✅ SPARC Mode Configuration**: Fixed `.roomodes` parsing - all 17 modes now accessible
- **✅ Parallel Processing**: Implemented bulk task fetching for `executeAll` command
- **📋 AI-Powered Task Management**: Complete integration with Claude Task Master for PRD-based task generation
- **🔄 Bidirectional Task Sync**: Seamless synchronization between TaskMaster and ClaudeFlow formats
- **🎯 SPARC-Integrated Workflows**: Automatic task mapping to SPARC development phases with agent assignment
- **📄 PRD Processing**: AI-powered parsing of Product Requirements Documents with intelligent task hierarchy generation
- **⚡ Performance Metrics**: Sub-millisecond memory ops, ~1.4ms task queueing, 700+ ops/second
- **🛠️ Production-Ready CLI**: Complete command-line interface for task generation, sync, and management
- **🐝 Swarm Integration**: Execute TaskMaster tasks with parallel AI agents
- **📊 Real-time Monitoring**: Live execution tracking with `taskmaster monitor` command

### 🎯 **BatchTool Parallel Agent System (v1.0.50 Enhancements)**
- **✅ Hundreds Concurrent Agents**: Deploy up to 100+ AI agents simultaneously via BatchTool
- **✅ TypeScript Infrastructure Improvements**: 91% reduction in compilation errors (379→32)
- **✅ Enhanced Test Framework**: Parallel testing with comprehensive coverage
- **✅ Improved Build Process**: Streamlined Deno compilation with dependency fixes
- **✅ Advanced Swarm Coordination**: Multi-agent task distribution and monitoring
- **⚡ Performance Optimizations**: 71% faster parallel execution
- **🔧 Resource Management**: Connection pooling and intelligent caching

### 🆕 **Enhanced User Experience**
- **🚀 Text-Based Process Management UI**: New `--ui` flag for `start` command provides interactive process control
- **🎯 Simplified SPARC Syntax**: `npx claude-flow sparc "build app"` (no more double sparc!)
- **⚡ Auto-Skip Permissions**: `--dangerously-skip-permissions` by default (use `--enable-permissions` to restore prompts)
- **🤖 Non-Interactive Mode**: JSON output with `--non-interactive` flag for automation
- **📁 Directory Safety**: Enhanced guidance to prevent files in node_modules
- **🎯 17+ SPARC Modes**: Including new `sparc-orchestrator` for complex workflows
- **📂 Local Executable**: `init` now creates `./claude-flow` wrapper to ensure correct working directory
- **🔧 Fixed SPARC Path Resolution**: `.roomodes` now correctly found in project directory
- **📝 Claude Code Slash Commands**: `init --sparc` now creates `.claude/commands/` with slash commands for all SPARC modes
- **🏗️ Modular Init Structure**: Refactored init command into clean, maintainable modules for better extensibility

### 🐝 **Swarm System Features**
- **Timeout-Free Execution**: Background Claude processes that never timeout
- **Agent Specialization**: 9 agent types (coordinator, developer, researcher, analyzer, tester, reviewer, documenter, monitor, specialist)
- **Multiple Coordination Modes**: Centralized, distributed, hierarchical, mesh, hybrid
- **Advanced Scheduling**: FIFO, priority, deadline, shortest-job, critical-path, resource-aware, adaptive
- **Fault Tolerance**: Retry, redundancy, checkpoint, circuit-breaker, bulkhead, timeout, graceful-degradation
- **Communication Patterns**: Direct, broadcast, publish-subscribe, request-response, event-driven, gossip, hierarchical

### 🌟 **Why Claude-Flow?**

- **🚀 10x Faster Development**: Parallel AI agent execution with intelligent task distribution
- **🧠 Persistent Memory**: Agents learn and share knowledge across sessions
- **⚡ SPARC Methodology**: Systematic development with Specification → Pseudocode → Architecture → Refinement → Completion
- **🔄 Zero Configuration**: Works out-of-the-box with sensible defaults
- **🤖 VSCode Native**: Seamless integration with your favorite IDE
- **🔒 Enterprise Ready**: Production-grade security, monitoring, and scaling
- **🌐 MCP Compatible**: Full Model Context Protocol support for tool integration
- **🐝 Swarm Intelligence**: Advanced multi-agent coordination with timeout-free execution

## 📦 **Installation**

### 🚀 Get started in 30 seconds
```bash
# Initialize with SPARC development environment
Step 1. Install Claude Code: ``` npm install -g @anthropic-ai/claude-code ```
Step 2. ``` npx -y claude-flow@latest init --sparc ```

# Use the local wrapper after init
./claude-flow sparc "build and test my project"  # SPARC development
./claude-flow swarm "Build a REST API" --strategy development --monitor  # Swarm coordination
Optional: ./claude-flow start --ui  # Interactive process management
```

```bash
# ⚡ SPARC Development Workflow (NEW: Simplified!)
./claude-flow sparc "build a todo app"        # Orchestrator mode (default)
./claude-flow sparc run architect "design system"  # Specific mode
./claude-flow sparc tdd "user authentication"     # Test-driven development
```

## 🎮 **Core Features**

### 🤖 **TaskMaster Integration** 
- **PRD-Driven Development**: Convert Product Requirements Documents into actionable tasks
- **AI-Enhanced Task Generation**: Smart task breakdown with dependency detection
- **SPARC Mode Mapping**: Automatic assignment of tasks to appropriate development phases
- **VS Code Extension Support**: Visual task management with real-time sync
- **Memory Persistence**: Tasks stored in Claude-Flow's memory system
- **Export Formats**: JSON, Markdown, CSV for team collaboration

### 🐝 **Swarm Orchestration**
- **Multi-Agent Coordination**: Run dozens of agents in parallel
- **TaskMaster Strategy**: Execute tasks from PRDs with swarm mode
- **Smart Agent Assignment**: Match agent types to task requirements
- **Real-time Monitoring**: Live dashboards with `--ui` flag
- **Dependency Resolution**: Automatic task ordering and scheduling

### 🧠 **SPARC Development Framework**
```bash
# Available SPARC modes (17 specialized agents)
./claude-flow sparc modes

# Examples of SPARC workflows
./claude-flow sparc run architect "design microservice architecture"
./claude-flow sparc run code "implement user authentication"
./claude-flow sparc run tdd "create test suite for payment system"
./claude-flow sparc run security-review "audit API endpoints"
./claude-flow sparc run integration "connect all services"
./claude-flow sparc run devops "setup CI/CD pipeline"
```

### 📊 **Real-Time Monitoring**

#### TaskMaster Monitor Dashboard
```bash
# Start monitoring (best in a separate terminal)
./claude-flow taskmaster monitor

# Customize update intervals
./claude-flow taskmaster monitor --interval 1 --sync-interval 5
```

**Dashboard Features:**
- Task progress and completion percentage
- Active tasks with assigned agents
- Performance metrics and velocity
- Agent utilization statistics
- Sync status and conflict resolution

#### Swarm UI Integration
```bash
# Always use --ui for real-time visibility
./claude-flow swarm start --taskmaster --ui --max-agents 10

# With optimized task file
./claude-flow swarm start --taskmaster-file tasks.json --ui

# Direct PRD execution
./claude-flow swarm start --taskmaster-prd app.prd --ui
```

**UI Features:**
- Split-pane layout with agents, tasks, logs, and metrics
- Color-coded status indicators
- Interactive controls (pause, resume, stop)
- Resource monitoring
- Agent communication visualization

## 📋 **TaskMaster Commands**

### Core TaskMaster Operations
```bash
# Generate tasks from PRD
./claude-flow taskmaster generate project.prd --sparc-mapping --ai

# Execute tasks
./claude-flow taskmaster execute <task-id>
./claude-flow taskmaster execute-all --parallel --max-agents 5

# Monitor execution
./claude-flow taskmaster monitor

# Export tasks
./claude-flow taskmaster export --format markdown --output tasks.md

# Configuration
./claude-flow taskmaster config show
./claude-flow taskmaster config set execution.maxConcurrentTasks 10

# Optimization
./claude-flow taskmaster optimize --save
```

### TaskMaster + Swarm Integration
```bash
# Execute TaskMaster tasks with swarm (always use --ui)
./claude-flow swarm start --taskmaster --ui

# From specific PRD
./claude-flow swarm start --taskmaster-prd requirements.prd --ui

# From task file
./claude-flow swarm start --taskmaster-file optimized-tasks.json --ui
```

## 🚀 **Complete Workflow Example**

```bash
# 1. Create a PRD file
cat > project.prd << 'EOF'
# E-commerce Platform

## Overview
Build a modern e-commerce platform with user authentication and payments.

## Requirements
- User registration and login with JWT
- Product catalog with search
- Shopping cart functionality
- Payment processing with Stripe
- Order management
- Admin dashboard

## Technical Stack
- Frontend: React/TypeScript
- Backend: Node.js/Express
- Database: PostgreSQL
- Cache: Redis
EOF

# 2. Generate tasks from PRD
./claude-flow taskmaster generate project.prd --sparc-mapping

# 3. Execute single task
./claude-flow taskmaster execute "task-id"

# 4. Execute all tasks in parallel
./claude-flow taskmaster execute-all --max-agents 8

# 5. Monitor progress in real-time (separate terminal)
./claude-flow taskmaster monitor

# 6. Check execution status
./claude-flow taskmaster execute-status "execution-id"

# Alternative: Use swarm with TaskMaster PRD
./claude-flow swarm start --taskmaster-prd project.prd --ui --max-agents 8
```

## 🔧 **Configuration**

### TaskMaster Configuration
```javascript
// .taskmaster/config/integration.json
{
  "execution": {
    "defaultParallel": true,
    "maxConcurrentTasks": 10,
    "taskTimeout": 300000,
    "retryAttempts": 3
  },
  "prioritization": {
    "algorithm": "smart",
    "priorityWeights": {
      "high": 100,
      "medium": 50,
      "low": 10
    }
  },
  "monitoring": {
    "updateInterval": 3000,
    "syncInterval": 10000,
    "showMetrics": true
  }
}
```

### SPARC Configuration
```javascript
// .roomodes
{
  "modes": {
    "architect": { /* ... */ },
    "code": { /* ... */ },
    "tdd": { /* ... */ },
    // ... 17 modes total
  },
  "metadata": {
    "parallelExecution": true,
    "asyncProcessing": true,
    "connectionPooling": true,
    "intelligentCaching": true,
    "resourceMonitoring": true
  }
}
```

## 🔍 **AI Enhancement Setup**

### Configure Anthropic API
```bash
# Set API key for AI features
export ANTHROPIC_API_KEY='sk-ant-...'

# Verify AI configuration
./claude-flow taskmaster ai-status

# Generate with AI enhancement
./claude-flow taskmaster generate project.prd --ai --detailed --enhance
```

### AI vs Non-AI Comparison
- **Without AI**: Basic pattern matching and keyword extraction
- **With AI**: Intelligent task descriptions, effort estimation, and dependency detection

## 📁 **Project Structure**

```
claude-flow/
├── .claude/commands/          # Claude Code slash commands
├── .taskmaster/              # TaskMaster configuration
│   ├── config/               # Integration settings
│   ├── tasks/                # Generated tasks
│   └── sparc/                # SPARC mappings
├── bin/                      # Executables
│   ├── claude-flow-deno      # Deno wrapper
│   └── claude-flow-node-fallback
├── src/
│   ├── cli/                  # CLI implementation
│   ├── core/                 # Core systems
│   │   └── swarm/           # Swarm orchestration
│   └── integrations/
│       └── taskmaster/       # TaskMaster integration
├── memory/                   # Persistent storage
└── coordination/            # Agent coordination
```

## 🧪 **Testing**

```bash
# Run full test suite
deno task test

# Run specific tests
deno task test:unit
deno task test:integration
deno task test:e2e

# Test TaskMaster integration
deno test tests/integration/taskmaster/
```

## 📚 **Documentation**

- [TaskMaster Complete Guide](./docs/13-taskmaster-integration.md)
- [SPARC Methodology](./docs/sparc.md)
- [Swarm Mode Guide](./docs/swarm-mode.md)
- [Memory System](./docs/memory.md)
- [VS Code Extension Setup](./docs/16-vscode-taskmaster-sync.md)

## 🤝 **Contributing**

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📄 **License**

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- Built on top of Claude Code and Anthropic's Claude AI
- Inspired by the SPARC methodology
- Thanks to all contributors and the Claude community

## 📊 **Stats**

![GitHub stars](https://img.shields.io/github/stars/ruvnet/claude-code-flow?style=social)
![npm downloads](https://img.shields.io/npm/dm/claude-flow)
![Contributors](https://img.shields.io/github/contributors/ruvnet/claude-code-flow)
![Last commit](https://img.shields.io/github/last-commit/ruvnet/claude-code-flow)