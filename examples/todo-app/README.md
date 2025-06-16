# Todo App Example - Claude-Flow + TaskMaster + SPARC

This example demonstrates building a complete React todo application using:
- **Claude-Flow**: AI-powered development orchestration
- **TaskMaster**: PRD-driven task generation and management
- **SPARC**: Systematic development methodology
- **Swarm Mode**: Parallel task execution

## 🚀 Quick Start

### 1. Generate and Optimize Tasks

```bash
# Generate tasks from PRD
./claude-flow taskmaster generate todo-app.prd --sparc-mapping

# Optimize execution order
./claude-flow taskmaster optimize --save

# View optimization results
./claude-flow taskmaster list
```

### 2. Configure for Optimal Performance

```bash
# Get recommendations for your task count
./claude-flow taskmaster config recommend 31 medium

# Update configuration
./claude-flow taskmaster config set execution.maxConcurrentTasks 7
```

### 3. Execute Tasks

#### Option A: Using TaskMaster Commands
```bash
# Execute all tasks in parallel
./claude-flow taskmaster execute-all --parallel

# Monitor progress in another terminal
./claude-flow taskmaster monitor
```

#### Option B: Using Swarm Mode
```bash
# Start swarm with TaskMaster integration (always use --ui for monitoring)
./claude-flow swarm start --taskmaster --max-agents 7 --ui

# Or use optimized task file with real-time UI
./claude-flow swarm start --taskmaster-file tasks-optimized.json --ui
```

### 4. Build the App with SPARC

```bash
# Run the build script that uses SPARC for each component
./build-todo-app.sh
```

## 📁 Project Structure

```
todo-app/
├── todo-app.prd                    # Product Requirements Document
├── tasks.json                      # Generated tasks
├── tasks-optimized.json           # Optimized execution plan
├── build-todo-app.sh              # SPARC-based build script
├── demo-taskmaster-features.sh    # Feature demonstration
└── README.md                      # This file
```

## 🎯 Features Demonstrated

### TaskMaster Integration
- ✅ PRD parsing and task generation
- ✅ SPARC mode mapping for each task
- ✅ Task optimization with dependency analysis
- ✅ Configuration management
- ✅ Project-based task filtering

### Swarm Orchestration
- ✅ Parallel task execution
- ✅ Agent type selection based on SPARC mode
- ✅ Real-time progress monitoring
- ✅ Status synchronization

### SPARC Methodology
- ✅ **Architect**: System design and component structure
- ✅ **Code**: Implementation with best practices
- ✅ **TDD**: Test-driven development
- ✅ **Integration**: Component integration
- ✅ **Docs**: Comprehensive documentation

## 📊 Monitoring and Control

### Real-time Dashboard
```bash
./claude-flow taskmaster monitor
```

Shows:
- Task progress and completion percentage
- Active tasks with assigned agents
- Time estimates and velocity
- Sync status and conflicts

### Execution Status
```bash
# Check specific execution
./claude-flow taskmaster execute-status <execution-id>

# View all executions
./claude-flow swarm status
```

## 🔧 Configuration Options

### Execution Settings
```javascript
{
  "execution": {
    "defaultParallel": true,
    "maxConcurrentTasks": 7,
    "taskTimeout": 300000,
    "retryAttempts": 3
  }
}
```

### Prioritization
```javascript
{
  "prioritization": {
    "algorithm": "smart",  // Options: fifo, priority, dependencies, smart
    "priorityWeights": {
      "high": 100,
      "medium": 50,
      "low": 10
    }
  }
}
```

## 🧪 Testing the Integration

Run the demo script to see all features:
```bash
./demo-taskmaster-features.sh
```

This demonstrates:
1. Task generation from PRD
2. Configuration management
3. Task optimization
4. Execution options
5. Monitoring capabilities
6. Export formats
7. VS Code sync

## 📈 Performance Optimization

### Task Analysis
```bash
# Analyze task complexity
./claude-flow taskmaster optimize todo-app.prd

# View recommendations
# - Parallelization opportunities
# - Dependency bottlenecks
# - Optimal agent count
```

### Configuration Tuning
```bash
# Apply performance optimizations
./claude-flow taskmaster config set optimization.adaptiveConcurrency true
./claude-flow taskmaster config set monitoring.metricsCollection true
```

## 🔄 Workflow Examples

### High-Priority Fast Track
```bash
# Execute only high-priority tasks first
./claude-flow taskmaster execute-all \
  --filter priority=high \
  --parallel \
  --max-agents 10
```

### Sequential Architecture First
```bash
# Run architecture tasks before implementation
./claude-flow taskmaster execute-all \
  --filter sparc_mode=architect
  
# Then run implementation
./claude-flow taskmaster execute-all \
  --filter sparc_mode=code \
  --parallel
```

### Test-Driven Approach
```bash
# Generate tests first
./claude-flow taskmaster execute-all \
  --filter sparc_mode=tdd
  
# Then implement to pass tests
./claude-flow taskmaster execute-all \
  --filter sparc_mode=code
```

## 🎉 Result

After running the complete workflow, you'll have:
1. A fully functional React todo app
2. Complete test coverage
3. Responsive design with dark mode
4. shadcn/ui components
5. TypeScript types
6. Comprehensive documentation

The app includes:
- Add, edit, delete, complete todos
- Filter by status (All/Active/Completed)
- Search functionality
- localStorage persistence
- Keyboard navigation
- Smooth animations

## 🚦 Next Steps

1. **Development**: `cd todo-app && npm run dev`
2. **Testing**: `npm test`
3. **Building**: `npm run build`
4. **Deployment**: Use your preferred hosting service

## 📚 Learn More

- [Claude-Flow Documentation](../../README.md)
- [TaskMaster Integration Guide](../../docs/13-taskmaster-integration.md)
- [SPARC Methodology](../../docs/sparc.md)
- [Swarm Mode Guide](../../docs/swarm-mode.md)