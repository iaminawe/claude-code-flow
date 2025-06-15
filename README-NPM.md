# @iaminawe/claude-flow-taskmaster

Enhanced Claude-Flow with TaskMaster integration featuring AI, Enterprise, and Autonomous capabilities.

## Installation

```bash
# Install globally
npm install -g @iaminawe/claude-flow-taskmaster

# Or use with npx
npx @iaminawe/claude-flow-taskmaster --help
```

## Quick Start

### Initialize TaskMaster with all features
```bash
npx @iaminawe/claude-flow-taskmaster taskmaster init --with-ai --enterprise --autonomous
```

### Initialize SPARC development environment
```bash
npx @iaminawe/claude-flow-taskmaster init --sparc
```

## Key Features

### 🤖 AI-Powered Task Management
- Natural language task creation
- Automatic agent assignment based on task type
- Predictive analytics for task completion
- Smart prioritization using ML algorithms

### 🏢 Enterprise Features
- Multi-user collaboration
- Integration with Jira, Asana, GitHub, and Slack
- Advanced reporting and analytics
- Role-based access control
- Complete audit trail

### 🚀 Autonomous Capabilities
- 85% autonomous decision-making threshold
- Self-improving algorithms
- Global task synchronization
- Distributed task execution
- Automatic failure recovery

### 🔧 SPARC Methodology Integration
All tasks are automatically enhanced with SPARC phases:
- Specification
- Pseudocode
- Architecture
- Refinement
- Completion

## TaskMaster VS Code Extension

After initializing, install the companion VS Code extension:
1. Open VS Code
2. Search for "claude-task-master" in extensions
3. Install and reload
4. Use the TaskMaster sidebar for visual task management

## Commands

```bash
# TaskMaster commands
claude-flow taskmaster init           # Initialize TaskMaster
claude-flow taskmaster stats          # Show task statistics
claude-flow taskmaster sync           # Sync with VS Code extension

# SPARC commands
claude-flow sparc modes               # List all SPARC modes
claude-flow sparc run code "feature"  # Run specific mode
claude-flow sparc tdd "tests"         # Run TDD workflow

# Core commands
claude-flow start                     # Start orchestration system
claude-flow agent spawn researcher    # Create AI agent
claude-flow memory store key "value"  # Store information
claude-flow status                    # Check system status
```

## Documentation

For full documentation, visit: https://github.com/iaminawe/claude-code-flow

## License

MIT

---

This is an enhanced fork of [claude-code-flow](https://github.com/ruvnet/claude-code-flow) by rUv.