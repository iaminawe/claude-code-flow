#!/bin/bash

# Demo Monitoring Script - Shows TaskMaster monitoring capabilities
echo "🎯 TaskMaster Monitoring Demo"
echo "============================"
echo ""
echo "This demo simulates task execution to show monitoring features"
echo ""

# Start monitoring in background
echo "Starting monitor (will update every second)..."
echo ""

# Simulate dashboard output
cat << 'EOF'
╔════════════════════════════════════════════════════╗
║         TaskMaster Execution Monitor               ║
╚════════════════════════════════════════════════════╝
Press Ctrl+C to stop

Overview:
  Total Tasks: 31
  Completed: 0 (0%)
  Running: 0
  Queued: 31
  Failed: 0

Estimates:
  Remaining Tasks: 31
  Average Task Duration: 0s
  Current Velocity: 0.00 tasks/min

Sync Status:
  Active: Yes
  Last Sync: 3:36:45 PM
  Pending Updates: 0
  Conflicts: 0
EOF

sleep 2
clear

# Update 1 - Tasks starting
cat << 'EOF'
╔════════════════════════════════════════════════════╗
║         TaskMaster Execution Monitor               ║
╚════════════════════════════════════════════════════╝
Press Ctrl+C to stop

Overview:
  Total Tasks: 31
  Completed: 0 (0%)
  Running: 3
  Queued: 28
  Failed: 0

Active Tasks:
  task-001 - Design Todo List Application PRD architecture
    Agent: coordinator-1, Progress: 15%, Duration: 3s
  task-028 - Implement technical requirements
    Agent: architect-1, Progress: 10%, Duration: 3s
  task-029 - Implement functional requirements
    Agent: developer-1, Progress: 8%, Duration: 3s

Estimates:
  Remaining Tasks: 31
  Average Task Duration: 0s
  Current Velocity: 0.00 tasks/min

Sync Status:
  Active: Yes
  Last Sync: 3:36:48 PM
  Pending Updates: 3
  Conflicts: 0
EOF

sleep 3
clear

# Update 2 - Progress
cat << 'EOF'
╔════════════════════════════════════════════════════╗
║         TaskMaster Execution Monitor               ║
╚════════════════════════════════════════════════════╝
Press Ctrl+C to stop

Overview:
  Total Tasks: 31
  Completed: 2 (6.5%)
  Running: 11
  Queued: 18
  Failed: 0

Active Tasks:
  task-001 - Design Todo List Application PRD architecture
    Agent: coordinator-1, Progress: 85%, Duration: 12s
  task-028 - Implement technical requirements
    Agent: architect-1, Progress: 75%, Duration: 12s
  task-002 - **Add Todo**
    Agent: developer-2, Progress: 30%, Duration: 6s
  task-003 - **List Todos**
    Agent: developer-3, Progress: 25%, Duration: 6s
  task-004 - **Edit Todo**
    Agent: developer-4, Progress: 20%, Duration: 6s
  ... and 6 more

Estimates:
  Remaining Tasks: 29
  Average Task Duration: 45s
  Current Velocity: 1.2 tasks/min
  Estimated Completion: 3:51:23 PM

Sync Status:
  Active: Yes
  Last Sync: 3:36:54 PM
  Pending Updates: 0
  Conflicts: 0
EOF

sleep 3
clear

# Update 3 - More progress
cat << 'EOF'
╔════════════════════════════════════════════════════╗
║         TaskMaster Execution Monitor               ║
╚════════════════════════════════════════════════════╝
Press Ctrl+C to stop

Overview:
  Total Tasks: 31
  Completed: 8 (25.8%)
  Running: 11
  Queued: 12
  Failed: 0

Active Tasks:
  task-005 - **Delete Todo**
    Agent: developer-2, Progress: 60%, Duration: 15s
  task-006 - **Complete Todo**
    Agent: developer-3, Progress: 55%, Duration: 15s
  task-007 - **Filter Todos**
    Agent: developer-4, Progress: 45%, Duration: 12s
  task-008 - **Search Todos**
    Agent: developer-5, Progress: 40%, Duration: 12s
  task-010 - **Local Storage**
    Agent: backend-1, Progress: 35%, Duration: 10s
  ... and 6 more

Estimates:
  Remaining Tasks: 23
  Average Task Duration: 52s
  Current Velocity: 2.4 tasks/min
  Estimated Completion: 3:47:12 PM

Agent Utilization:
  developer: 8/8 (100%)
  coordinator: 1/2 (50%)
  architect: 1/2 (50%)
  backend: 1/2 (50%)

Sync Status:
  Active: Yes
  Last Sync: 3:37:02 PM
  Pending Updates: 0
  Conflicts: 0
EOF

sleep 3
clear

# Update 4 - Near completion
cat << 'EOF'
╔════════════════════════════════════════════════════╗
║         TaskMaster Execution Monitor               ║
╚════════════════════════════════════════════════════╝
Press Ctrl+C to stop

Overview:
  Total Tasks: 31
  Completed: 26 (83.9%)
  Running: 3
  Queued: 2
  Failed: 0

Active Tasks:
  task-030 - Comprehensive testing for Todo List Application PRD
    Agent: tester-1, Progress: 65%, Duration: 45s
  task-031 - Documentation for Todo List Application PRD
    Agent: documenter-1, Progress: 40%, Duration: 30s
  task-014 - **Animations**
    Agent: frontend-1, Progress: 90%, Duration: 60s

Estimates:
  Remaining Tasks: 5
  Average Task Duration: 48s
  Current Velocity: 3.1 tasks/min
  Estimated Completion: 3:39:35 PM

Performance Metrics:
  Total Execution Time: 2m 45s
  Average Task Duration: 48s
  Parallelization Efficiency: 78%
  Resource Utilization: 85%

Recent Completions:
  ✓ task-027 - **Animations** (52s)
  ✓ task-026 - **Dark Mode** (45s)
  ✓ task-025 - **Responsive Design** (41s)

Sync Status:
  Active: Yes
  Last Sync: 3:37:15 PM
  Pending Updates: 0
  Conflicts: 0
EOF

sleep 3

echo ""
echo "✅ Monitoring Demo Complete!"
echo ""
echo "The monitoring dashboard provides:"
echo "- Real-time task progress tracking"
echo "- Agent utilization metrics"
echo "- Time estimates and completion predictions"
echo "- Performance analytics"
echo "- Status synchronization"
echo ""
echo "To run actual monitoring:"
echo "  deno run --allow-all ../../src/cli/main.ts taskmaster monitor"