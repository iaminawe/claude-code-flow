# VS Code TaskMaster Sync Integration

This document describes the complete VS Code sync integration for TaskMaster, enabling real-time synchronization between Claude-Flow CLI and the VS Code TaskMaster extension.

## Overview

The VS Code sync integration provides:
- Real-time WebSocket communication
- Shared file storage in `.taskmaster` directory
- Project-based task filtering
- Automatic format conversion
- Bidirectional synchronization

## Architecture

### Components

1. **Shared Storage Layer** (`.taskmaster/`)
   - Primary task storage location
   - File-based locking for concurrent access
   - Atomic operations for data integrity

2. **WebSocket Server** (Port 5173)
   - Real-time event broadcasting
   - HTTP fallback API
   - Client connection management

3. **File System Watcher**
   - Monitors `.taskmaster` directory
   - Debounced change detection
   - Automatic event broadcasting

4. **Format Converter**
   - Converts between TaskMaster and VS Code formats
   - Maintains data integrity
   - Handles status mappings

## Setup

### 1. Initialize the Environment

```bash
# Create the .taskmaster directory structure
./bin/claude-flow-deno taskmaster init
```

This creates:
```
.taskmaster/
├── tasks/         # Task storage
├── config/        # Sync configuration
├── sparc/         # SPARC mappings
└── logs/          # Sync logs
```

### 2. Start the Sync Server

```bash
# Start the WebSocket server
./bin/claude-flow-deno taskmaster sync server start

# Optional: Specify custom port/host
./bin/claude-flow-deno taskmaster sync server start --port 5174 --host 0.0.0.0
```

### 3. Install VS Code Extension

Install the `claude-task-master` extension from the VS Code marketplace. The extension will automatically detect the `.taskmaster` directory and connect to the sync server.

## Project Management

### List Projects

```bash
./bin/claude-flow-deno taskmaster projects list
```

Output:
```
TaskMaster Projects

Project                                          Tasks  Created       ID
────────────────────────────────────────────────────────────────────────────────
E-commerce Platform PRD                           8  6/15/2025  063c1a5a...
TaskMaster Integration                           12  6/16/2025  6f867aa6...
```

### Select a Project

```bash
# Select specific project (using first 8 chars of ID)
./bin/claude-flow-deno taskmaster projects select 063c1a5a

# Clear filter (show all tasks)
./bin/claude-flow-deno taskmaster projects select all
```

### Check Current Selection

```bash
./bin/claude-flow-deno taskmaster projects current
```

## Data Format

### TaskMaster Format

```typescript
interface TaskMasterTask {
  id: string;
  title: string;
  description?: string;
  type: string;
  priority: string;
  status: string;
  assignee?: string | null;
  sparc_mode?: string;
  subtasks: TaskMasterTask[];
  dependencies?: string[];
  projectId?: string;
  projectTitle?: string;
  metadata?: Record<string, any>;
}
```

### VS Code Extension Format

```typescript
interface VSCodeTask {
  id: string;
  title: string;
  description: string;
  type: string;
  priority: string;
  status: string;  // 'todo' | 'in-progress' | 'done' | 'blocked'
  assignedAgent?: string | null;
  sparcPhase?: string;
  subtasks?: string[];
  dependencies?: string[];
  projectId?: string;
  projectTitle?: string;
  metadata?: Record<string, any>;
}
```

### Status Mappings

| TaskMaster | VS Code Extension |
|------------|------------------|
| pending    | todo            |
| in_progress| in-progress     |
| completed  | done            |
| blocked    | blocked         |
| cancelled  | cancelled       |

## WebSocket Protocol

### Connection

```javascript
ws://localhost:5173/taskmaster
```

### Message Format

```json
{
  "type": "event_type",
  "data": { /* event data */ }
}
```

### Event Types

- `tasks:updated` - Tasks have been modified
- `tasks:created` - New tasks added
- `tasks:deleted` - Tasks removed
- `status:changed` - Task status updated
- `sync:started` - Sync operation began
- `sync:completed` - Sync operation finished

## HTTP Fallback API

For environments that don't support WebSocket:

### GET /api/tasks
Returns all tasks in VS Code format

### POST /api/tasks
Update tasks (requires VS Code format)

### GET /api/sync
Trigger manual sync

### GET /health
Check server status

## Sync Operations

### Manual Sync

```bash
# Sync from memory to shared storage
./bin/claude-flow-deno taskmaster sync
```

### Automatic Sync

The sync server automatically syncs when:
- Tasks are generated from PRD
- Task status is updated
- VS Code extension modifies tasks
- File system changes detected

## Troubleshooting

### Tasks Not Visible in VS Code

1. Check sync server is running:
   ```bash
   ./bin/claude-flow-deno taskmaster sync server status
   ```

2. Verify tasks exist:
   ```bash
   ./bin/claude-flow-deno taskmaster list
   ```

3. Force sync:
   ```bash
   ./bin/claude-flow-deno taskmaster sync
   ```

### Project Shows as "Unknown"

This occurs when tasks were generated before project ID support. To fix:

1. Regenerate tasks from PRD
2. Or manually update tasks to include `projectId` and `projectTitle`

### WebSocket Connection Failed

1. Check firewall settings
2. Verify port 5173 is available
3. Try HTTP fallback mode
4. Check VS Code extension logs

## Best Practices

1. **Always Initialize First**: Run `taskmaster init` before using sync features
2. **Keep Server Running**: Start sync server when working with VS Code
3. **Use Project Filtering**: Select specific projects to reduce clutter
4. **Regular Syncs**: Run manual sync if automatic sync seems delayed
5. **Clean Shutdown**: Use Ctrl+C to properly stop the sync server

## Implementation Files

- `/src/integrations/taskmaster/services/shared-storage.ts` - File storage with locking
- `/src/integrations/taskmaster/services/websocket-server.ts` - WebSocket server
- `/src/integrations/taskmaster/services/file-watcher.ts` - File system monitoring
- `/src/integrations/taskmaster/services/convert-to-extension-format.ts` - Format conversion
- `/src/integrations/taskmaster/services/sync-with-project-filter.ts` - Project filtering
- `/src/cli/commands/taskmaster-projects.ts` - Project management commands

## Future Enhancements

- [ ] Conflict resolution UI
- [ ] Multi-user collaboration
- [ ] Cloud sync backup
- [ ] Advanced filtering options
- [ ] Task history tracking
- [ ] Performance metrics dashboard