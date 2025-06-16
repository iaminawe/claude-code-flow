# Claude Code Configuration - SPARC Development Environment

## Project Overview
This project uses the SPARC (Specification, Pseudocode, Architecture, Refinement, Completion) methodology for systematic Test-Driven Development with AI assistance through Claude-Flow orchestration, enhanced with TaskMaster integration for PRD-driven development and BatchTool optimizations for parallel execution.

## SPARC Development Commands

### Core SPARC Commands
- `./claude-flow sparc modes`: List all available SPARC development modes
- `./claude-flow sparc run <mode> "<task>"`: Execute specific SPARC mode for a task
- `./claude-flow sparc tdd "<feature>"`: Run complete TDD workflow using SPARC methodology
- `./claude-flow sparc info <mode>`: Get detailed information about a specific mode

### TaskMaster Commands
- `./claude-flow taskmaster generate <prd-file>`: Generate tasks from PRD with SPARC mapping
- `./claude-flow taskmaster execute <task-id>`: Execute single task
- `./claude-flow taskmaster execute-all`: Execute all tasks in parallel
- `./claude-flow taskmaster monitor`: Real-time execution monitoring
- `./claude-flow taskmaster config`: Manage configuration settings
- `./claude-flow taskmaster optimize`: Optimize task execution order

### Standard Build Commands
- `npm run build`: Build the project
- `npm run test`: Run the test suite
- `npm run lint`: Run linter and format checks
- `npm run typecheck`: Run TypeScript type checking
- `./claude-flow start --ui`: Start the orchestration system with UI
- `./claude-flow --help`: Show all available commands

## SPARC Methodology Workflow

### 1. Specification Phase
```bash
# Create detailed specifications and requirements
./claude-flow sparc run spec-pseudocode "Define user authentication requirements"
```
- Define clear functional requirements
- Document edge cases and constraints
- Create user stories and acceptance criteria
- Establish non-functional requirements

### 2. Pseudocode Phase
```bash
# Develop algorithmic logic and data flows
./claude-flow sparc run spec-pseudocode "Create authentication flow pseudocode"
```
- Break down complex logic into steps
- Define data structures and interfaces
- Plan error handling and edge cases
- Create modular, testable components

### 3. Architecture Phase
```bash
# Design system architecture and component structure
./claude-flow sparc run architect "Design authentication service architecture"
```
- Create system diagrams and component relationships
- Define API contracts and interfaces
- Plan database schemas and data flows
- Establish security and scalability patterns

### 4. Refinement Phase (TDD Implementation)
```bash
# Execute Test-Driven Development cycle
./claude-flow sparc tdd "implement user authentication system"
```

**TDD Cycle:**
1. **Red**: Write failing tests first
2. **Green**: Implement minimal code to pass tests
3. **Refactor**: Optimize and clean up code
4. **Repeat**: Continue until feature is complete

### 5. Completion Phase
```bash
# Integration, documentation, and validation
./claude-flow sparc run integration "integrate authentication with user management"
```
- Integrate all components
- Perform end-to-end testing
- Create comprehensive documentation
- Validate against original requirements

## TaskMaster Integration Workflow

### PRD-Driven Development
```bash
# 1. Create a PRD file
cat > project.prd << 'EOF'
# Project Name
## Overview
Project description and goals
## Requirements
- Feature requirements
- Technical specifications
EOF

# 2. Generate tasks with AI enhancement
export ANTHROPIC_API_KEY='your-api-key'
./claude-flow taskmaster generate project.prd --ai --sparc-mapping

# 3. Optimize and execute
./claude-flow taskmaster optimize --save
./claude-flow taskmaster execute-all --parallel --max-agents 8

# 4. Monitor progress
./claude-flow taskmaster monitor
```

### Swarm Integration
```bash
# Execute TaskMaster tasks with swarm (always use --ui)
./claude-flow swarm start --taskmaster --ui --max-agents 10

# Direct PRD execution
./claude-flow swarm start --taskmaster-prd project.prd --ui
```

## Performance Optimizations (BatchTool)

### Parallel Execution Features
- **Connection Pooling**: Efficient resource management
- **Intelligent Caching**: TTL-based result caching
- **Resource Monitoring**: Slow task detection and optimization
- **Boomerang Pattern**: Advanced dependency resolution
- **Async Processing**: Non-blocking task execution

### Configuration
```javascript
// .roomodes metadata
{
  "parallelExecution": true,
  "asyncProcessing": true,
  "connectionPooling": true,
  "intelligentCaching": true,
  "resourceMonitoring": true,
  "maxConcurrency": 10
}
```

## Code Style and Best Practices

### SPARC Development Principles
- **Modular Design**: Keep files under 500 lines, break into logical components
- **Environment Safety**: Never hardcode secrets or environment-specific values
- **Test-First**: Always write tests before implementation (Red-Green-Refactor)
- **Clean Architecture**: Separate concerns, use dependency injection
- **Documentation**: Maintain clear, up-to-date documentation

### Coding Standards
- Use TypeScript for type safety and better tooling
- Follow consistent naming conventions (camelCase for variables, PascalCase for classes)
- Implement proper error handling and logging
- Use async/await for asynchronous operations
- Prefer composition over inheritance
- Use ES modules (import/export) syntax, not CommonJS (require)

### Memory and State Management
- Use claude-flow memory system for persistent state across sessions
- Store progress and findings using namespaced keys
- Query previous work before starting new tasks
- Export/import memory for backup and sharing

## Real-Time Monitoring

### Multi-Terminal Setup
```bash
# Terminal 1: Execute with UI
./claude-flow swarm start --taskmaster --ui

# Terminal 2: TaskMaster monitor
./claude-flow taskmaster monitor

# Terminal 3: System monitor
./claude-flow monitor
```

### Dashboard Features
- Task progress and completion tracking
- Agent utilization and performance metrics
- Real-time sync status
- Error highlighting and debugging

## Configuration Files

### Claude Code Integration
- **`.claude/commands/`**: Claude Code slash commands for all SPARC modes
- **`.claude/logs/`**: Conversation and session logs

### TaskMaster Configuration
- **`.taskmaster/config/`**: Integration and sync settings
- **`.taskmaster/tasks/`**: Generated task storage
- **`.taskmaster/sparc/`**: SPARC mode mappings

### Claude-Flow Configuration
- **`memory/`**: Persistent memory and session data
- **`coordination/`**: Multi-agent coordination settings
- **`.roomodes`**: SPARC mode definitions with BatchTool optimizations
- **`CLAUDE.md`**: This file - project instructions for Claude Code

## Git Workflow Integration

### Commit Strategy
- **Specification commits**: After completing requirements analysis
- **Architecture commits**: After design phase completion
- **TDD commits**: After each Red-Green-Refactor cycle
- **Integration commits**: After successful component integration
- **Documentation commits**: After completing documentation updates

## Troubleshooting

### Common Issues
- **Mode not found**: Check `.roomodes` file exists and is valid JSON
- **Memory persistence**: Ensure `memory/` directory has write permissions
- **Tool access**: Verify required tools are available for the selected mode
- **Performance issues**: Check BatchTool settings in `.roomodes` metadata
- **TaskMaster errors**: Verify PRD format and API key configuration

### Debug Commands
```bash
# Check system status
./claude-flow status

# Verify TaskMaster setup
./claude-flow taskmaster ai-status

# View memory stats
./claude-flow memory stats

# Check swarm health
./claude-flow swarm status
```

## Important Notes

- Always run tests before committing (`npm run test`)
- Use SPARC memory system to maintain context across sessions
- Follow the Red-Green-Refactor cycle during TDD phases
- Document architectural decisions in memory for future reference
- Regular security reviews for any authentication or data handling code
- Claude Code slash commands provide quick access to SPARC modes
- Use --ui flag with swarm commands for real-time monitoring

For more information about SPARC methodology, see: https://github.com/ruvnet/claude-code-flow/docs/sparc.md