#!/bin/bash

# Complete End-to-End Example: Todo App with TaskMaster + SPARC + Swarm
# This demonstrates the full integration workflow

echo "🎯 Complete Todo App Example"
echo "============================"
echo ""
echo "This example demonstrates:"
echo "1. PRD → Tasks (TaskMaster)"
echo "2. Tasks → Optimized Plan (Optimizer)"
echo "3. Plan → Parallel Execution (Swarm)"
echo "4. Execution → Monitoring (Dashboard)"
echo "5. SPARC methodology for each component"
echo ""

# Use deno directly since claude-flow wrapper has issues
CLAUDE_FLOW="deno run --allow-all ../../src/cli/main.ts"

# Step 1: Show the PRD
echo "📄 Step 1: Product Requirements Document"
echo "----------------------------------------"
echo "File: todo-app.prd"
echo ""
head -20 todo-app.prd
echo "... (truncated)"
echo ""
read -p "Press Enter to continue..."

# Step 2: Generate tasks with TaskMaster
echo ""
echo "🔄 Step 2: Generate Tasks from PRD"
echo "----------------------------------"
echo "Command: taskmaster generate todo-app.prd --sparc-mapping"
echo ""
$CLAUDE_FLOW taskmaster generate todo-app.prd --sparc-mapping --output tasks-example.json
echo ""
read -p "Press Enter to continue..."

# Step 3: View task statistics
echo ""
echo "📊 Step 3: Task Statistics"
echo "-------------------------"
$CLAUDE_FLOW taskmaster list | grep -A 6 "Todo List Application PRD" | head -7
echo ""
read -p "Press Enter to continue..."

# Step 4: Get configuration recommendations
echo ""
echo "⚙️  Step 4: Configuration Optimization"
echo "------------------------------------"
echo "Getting recommendations for 31 tasks..."
$CLAUDE_FLOW taskmaster config recommend 31 medium
echo ""
echo "Applying recommended settings..."
$CLAUDE_FLOW taskmaster config set execution.maxConcurrentTasks 7
echo ""
read -p "Press Enter to continue..."

# Step 5: Optimize task execution order
echo ""
echo "📈 Step 5: Task Optimization"
echo "---------------------------"
$CLAUDE_FLOW taskmaster optimize --save --output tasks-optimized-example.json
echo ""
read -p "Press Enter to continue..."

# Step 6: Show execution options
echo ""
echo "🚀 Step 6: Execution Options"
echo "---------------------------"
echo ""
echo "Option 1: Execute with TaskMaster (Recommended)"
echo "  $CLAUDE_FLOW taskmaster execute-all --parallel --max-agents 7"
echo ""
echo "Option 2: Execute with Swarm Mode"
echo "  $CLAUDE_FLOW swarm start --taskmaster-file tasks-optimized-example.json"
echo ""
echo "Option 3: Execute specific tasks"
echo "  $CLAUDE_FLOW taskmaster execute-all --filter priority=high"
echo ""
read -p "Press Enter to continue..."

# Step 7: Demonstrate SPARC methodology
echo ""
echo "🔧 Step 7: SPARC Methodology Example"
echo "-----------------------------------"
echo ""
echo "Let's create a component using SPARC..."
echo ""
echo "Command: sparc run architect \"Design TodoItem component architecture\""
$CLAUDE_FLOW sparc run architect "Design a TodoItem React component architecture with TypeScript interfaces, props definition, and state management approach"
echo ""
read -p "Press Enter to continue..."

echo ""
echo "Now implement it..."
echo "Command: sparc run code \"Implement TodoItem component\""
$CLAUDE_FLOW sparc run code "Implement TodoItem React component with TypeScript that shows a checkbox, editable text, and delete button. Use shadcn/ui components"
echo ""
read -p "Press Enter to continue..."

echo ""
echo "Add tests..."
echo "Command: sparc run tdd \"Test TodoItem component\""
$CLAUDE_FLOW sparc run tdd "Write comprehensive tests for TodoItem component including render, interaction, and edge cases"
echo ""
read -p "Press Enter to continue..."

# Step 8: Show monitoring capabilities
echo ""
echo "📊 Step 8: Monitoring Dashboard"
echo "------------------------------"
echo ""
echo "The monitoring dashboard provides:"
echo "- Real-time task progress"
echo "- Agent utilization"
echo "- Time estimates"
echo "- Sync status"
echo ""
echo "To start monitoring:"
echo "  $CLAUDE_FLOW taskmaster monitor"
echo ""
echo "Dashboard preview:"
cat << 'EOF'
╔══════════════════════════════════════════╗
║     TaskMaster Execution Monitor         ║
╠══════════════════════════════════════════╣
║ Overview:                                ║
║   Total Tasks: 31                        ║
║   Completed: 12 (38.7%)                  ║
║   Running: 5                             ║
║   Queued: 14                             ║
║                                          ║
║ Active Tasks:                            ║
║   task-001 - Architecture Design         ║
║     Agent: coordinator-1, Progress: 75%  ║
║   task-002 - Component Implementation    ║
║     Agent: developer-2, Progress: 45%    ║
║                                          ║
║ Estimates:                               ║
║   Remaining: 19 tasks                    ║
║   Velocity: 2.4 tasks/min                ║
║   ETA: 3:45 PM                          ║
╚══════════════════════════════════════════╝
EOF
echo ""
read -p "Press Enter to continue..."

# Step 9: Export and sharing
echo ""
echo "💾 Step 9: Export and Sharing"
echo "----------------------------"
echo ""
echo "Export tasks in different formats:"
$CLAUDE_FLOW taskmaster export --format markdown --output todo-tasks.md
echo "✅ Exported to todo-tasks.md"
echo ""
$CLAUDE_FLOW taskmaster export --format csv --output todo-tasks.csv
echo "✅ Exported to todo-tasks.csv"
echo ""
read -p "Press Enter to continue..."

# Step 10: Summary
echo ""
echo "🎉 Example Complete!"
echo "==================="
echo ""
echo "You've seen how to:"
echo "✅ Generate tasks from PRD with SPARC mapping"
echo "✅ Optimize task execution order"
echo "✅ Configure for optimal performance"
echo "✅ Execute tasks in parallel with swarm"
echo "✅ Use SPARC methodology for development"
echo "✅ Monitor progress in real-time"
echo "✅ Export tasks for sharing"
echo ""
echo "Ready to build? Run one of these commands:"
echo ""
echo "1. Full automated execution:"
echo "   $CLAUDE_FLOW taskmaster execute-all --parallel"
echo ""
echo "2. Step-by-step with SPARC:"
echo "   ./build-todo-app.sh"
echo ""
echo "3. Interactive swarm mode:"
echo "   $CLAUDE_FLOW swarm start --taskmaster"
echo ""
echo "Happy coding! 🚀"