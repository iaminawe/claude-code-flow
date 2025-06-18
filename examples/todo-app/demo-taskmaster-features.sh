#!/bin/bash

# TaskMaster Integration Demo Script
# Demonstrates all features of the TaskMaster-Swarm v2 integration

echo "🎯 TaskMaster-Swarm v2 Integration Demo"
echo "======================================="
echo ""

CLAUDE_FLOW="../../claude-flow"
PRD_FILE="todo-app.prd"

# Feature 1: Generate tasks from PRD with AI enhancement
echo "📋 1. Generating tasks from PRD with SPARC mapping..."
echo "Command: $CLAUDE_FLOW taskmaster generate $PRD_FILE --sparc-mapping"
$CLAUDE_FLOW taskmaster generate $PRD_FILE --sparc-mapping --output tasks-demo.json
echo ""
sleep 2

# Feature 2: List stored PRDs and tasks
echo "📚 2. Listing stored TaskMaster data..."
echo "Command: $CLAUDE_FLOW taskmaster list"
$CLAUDE_FLOW taskmaster list
echo ""
sleep 2

# Feature 3: View and manage configuration
echo "⚙️  3. Configuration management..."
echo "Command: $CLAUDE_FLOW taskmaster config show"
$CLAUDE_FLOW taskmaster config show | head -20
echo "..."
echo ""

echo "Setting max concurrent tasks to 10..."
echo "Command: $CLAUDE_FLOW taskmaster config set execution.maxConcurrentTasks 10"
$CLAUDE_FLOW taskmaster config set execution.maxConcurrentTasks 10
echo ""
sleep 2

# Feature 4: Get configuration recommendations
echo "💡 4. Getting configuration recommendations..."
echo "Command: $CLAUDE_FLOW taskmaster config recommend 31 high"
$CLAUDE_FLOW taskmaster config recommend 31 high
echo ""
sleep 2

# Feature 5: Optimize task execution order
echo "🔄 5. Optimizing task execution order..."
echo "Command: $CLAUDE_FLOW taskmaster optimize --save"
$CLAUDE_FLOW taskmaster optimize --save --output tasks-optimized-demo.json
echo ""
sleep 2

# Feature 6: Execute a single task
echo "▶️  6. Executing a single task..."
echo "Command: $CLAUDE_FLOW taskmaster execute task-001 --agent-type developer"
# Note: This would actually execute if we had real task IDs
echo "[Demo mode - would execute task-001 with developer agent]"
echo ""
sleep 2

# Feature 7: Execute tasks with filters
echo "🚀 7. Executing filtered tasks..."
echo "Command: $CLAUDE_FLOW taskmaster execute-all --filter priority=high,status=pending --parallel"
$CLAUDE_FLOW taskmaster execute-all --filter priority=high --parallel --dryRun
echo ""
sleep 2

# Feature 8: Monitor execution (would run continuously)
echo "📊 8. Real-time execution monitoring..."
echo "Command: $CLAUDE_FLOW taskmaster monitor --interval 2"
echo "[Demo mode - monitor would show live dashboard]"
echo ""
echo "Dashboard features:"
echo "  - Task progress and completion percentage"
echo "  - Active task details with assigned agents"
echo "  - Time estimates and velocity metrics"
echo "  - Sync status with conflict detection"
echo ""
sleep 2

# Feature 9: Swarm integration
echo "🐝 9. Swarm mode integration..."
echo "Command: $CLAUDE_FLOW swarm start --taskmaster --max-agents 8"
echo "[Demo mode - would start swarm with TaskMaster tasks]"
echo ""
echo "Alternative commands:"
echo "  $CLAUDE_FLOW swarm start --taskmaster-prd $PRD_FILE"
echo "  $CLAUDE_FLOW swarm start --taskmaster-file tasks-optimized.json"
echo ""
sleep 2

# Feature 10: Project management
echo "📁 10. Project management features..."
echo "Command: $CLAUDE_FLOW taskmaster projects list"
echo "[Demo mode - would list all projects with task counts]"
echo ""
echo "Project commands:"
echo "  taskmaster projects select <project-id>  - Filter tasks by project"
echo "  taskmaster projects current             - Show current selection"
echo ""
sleep 2

# Feature 11: Export tasks
echo "💾 11. Exporting tasks..."
echo "Command: $CLAUDE_FLOW taskmaster export --format markdown"
$CLAUDE_FLOW taskmaster export --format markdown --output tasks-export-demo.md
echo ""
sleep 2

# Feature 12: Update task status
echo "✏️  12. Updating task status..."
echo "Command: $CLAUDE_FLOW taskmaster update task-001 completed"
echo "[Demo mode - would update task-001 to completed status]"
echo ""
sleep 2

# Feature 13: VS Code sync
echo "🔄 13. VS Code extension sync..."
echo "Command: $CLAUDE_FLOW taskmaster sync"
$CLAUDE_FLOW taskmaster sync --verbose
echo ""
sleep 2

# Feature 14: Advanced configuration
echo "🎛️  14. Advanced configuration options..."
$CLAUDE_FLOW taskmaster config export config-backup-demo.json
echo "✅ Configuration exported to config-backup-demo.json"
echo ""
echo "Other config commands:"
echo "  config import <file>  - Import configuration"
echo "  config reset         - Reset to defaults"
echo ""

# Summary
echo "📈 Demo Summary"
echo "=============="
echo ""
echo "TaskMaster-Swarm v2 Integration provides:"
echo "✅ PRD to task generation with SPARC mapping"
echo "✅ Task optimization and dependency analysis"
echo "✅ Parallel execution with swarm orchestration"
echo "✅ Real-time monitoring and progress tracking"
echo "✅ Flexible configuration and project management"
echo "✅ VS Code extension integration"
echo "✅ Multiple export formats"
echo ""
echo "🎉 Demo complete! The todo app tasks are ready for execution."
echo ""
echo "To build the actual todo app, run:"
echo "  ./build-todo-app.sh"
echo ""
echo "To execute all tasks with monitoring:"
echo "  $CLAUDE_FLOW taskmaster execute-all --parallel"
echo "  $CLAUDE_FLOW taskmaster monitor  # In another terminal"