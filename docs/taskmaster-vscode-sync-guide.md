# TaskMaster VS Code Sync Setup Guide

## Overview

TaskMaster VS Code Sync enables real-time synchronization between the Claude-Flow CLI and the VS Code extension, allowing you to manage tasks visually while maintaining full CLI functionality.

## Prerequisites

- Claude-Flow installed and working
- VS Code or Cursor IDE
- Node.js 18+ (for WebSocket support)
- [claude-task-master](https://github.com/iaminawe/claude-task-master-extension) VS Code extension

## Quick Start

### 1. Initialize TaskMaster Sync Environment

```bash
# Navigate to your project directory
cd your-project

# Initialize TaskMaster sync
claude-flow taskmaster init
```

This creates the `.taskmaster/` directory structure:
```
.taskmaster/
├── tasks/         # Task storage
│   └── tasks.json # Main task file
├── config/        # Configuration
│   └── sync.json  # Sync settings
├── sparc/         # SPARC mappings
└── logs/          # Sync logs
```

### 2. Install VS Code Extension

1. Open VS Code/Cursor
2. Go to Extensions (Cmd/Ctrl + Shift + X)
3. Search for "claude-task-master"
4. Click Install
5. Reload VS Code

The extension will automatically detect the `.taskmaster/` directory.

### 3. Start the Sync Server

```bash
# Start the sync server
claude-flow taskmaster sync server start

# Or with custom port
claude-flow taskmaster sync server start --port 5173
```

You'll see:
```
✅ VS Code sync server started!

Server details:
  WebSocket: ws://localhost:5173/taskmaster
  HTTP API:  http://localhost:5173/api/
  Health:    http://localhost:5173/health

The VS Code extension will automatically connect to this server.
Press Ctrl+C to stop the server...
```

### 4. Verify Connection

In VS Code:
- Open the TaskMaster panel (Activity Bar)
- Check the status indicator (should show "Connected")
- Tasks will appear in the tree view

## Features

### Real-time Synchronization

All changes are synchronized instantly:
- Tasks created in CLI appear in VS Code immediately
- Status updates in VS Code reflect in CLI
- File changes are detected and broadcast

### Task Management

**From CLI:**
```bash
# Generate tasks from PRD
claude-flow taskmaster generate requirements.prd

# Update task status
claude-flow taskmaster update task-001 completed

# List all tasks
claude-flow taskmaster list
```

**From VS Code:**
- Right-click tasks for context menu
- Click status icons to update
- Drag & drop to reorganize
- Filter by status/priority

### File Watching

The sync server monitors `.taskmaster/` for changes:
- Detects external task modifications
- Syncs configuration updates
- Maintains consistency across tools

## Configuration

### Sync Configuration (`.taskmaster/config/sync.json`)

```json
{
  "version": "1.0.0",
  "syncMode": "real-time",
  "conflictResolution": "last-write-wins",
  "autoSync": true,
  "port": 5173,
  "host": "localhost"
}
```

**Options:**
- `syncMode`: "real-time" | "manual" | "polling"
- `conflictResolution`: "last-write-wins" | "merge" | "manual"
- `autoSync`: Enable automatic synchronization
- `port`: WebSocket server port
- `host`: Server host (use "0.0.0.0" for network access)

### SPARC Mappings (`.taskmaster/sparc/mappings.json`)

Customize how task types map to SPARC modes:
```json
{
  "taskTypeToSparc": {
    "architecture": "architect",
    "implementation": "code",
    "testing": "tdd",
    "security": "security-review",
    "documentation": "docs-writer"
  }
}
```

## WebSocket API

The sync server provides a WebSocket API for custom integrations:

### Connection
```javascript
const ws = new WebSocket('ws://localhost:5173/taskmaster');

ws.onopen = () => {
  console.log('Connected to TaskMaster sync server');
};
```

### Subscribe to Events
```javascript
ws.send(JSON.stringify({
  id: '1',
  type: 'request',
  method: 'subscribe',
  params: { events: ['task.*'] }
}));
```

### List Tasks
```javascript
ws.send(JSON.stringify({
  id: '2',
  type: 'request',
  method: 'tasks.list'
}));
```

### Update Task
```javascript
ws.send(JSON.stringify({
  id: '3',
  type: 'request',
  method: 'task.update',
  params: {
    id: 'task-001',
    updates: { status: 'completed' }
  }
}));
```

## HTTP Fallback API

For environments where WebSocket is blocked:

### Get All Tasks
```bash
curl http://localhost:5173/api/tasks
```

### Create/Update Tasks
```bash
curl -X POST http://localhost:5173/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"id": "new-task", "title": "New Task", "status": "pending"}'
```

### Check Status
```bash
curl http://localhost:5173/api/sync/status
```

## Troubleshooting

### Extension Not Connecting

1. **Check server is running:**
   ```bash
   claude-flow taskmaster sync server status
   ```

2. **Verify `.taskmaster/` exists:**
   ```bash
   ls -la .taskmaster/
   ```

3. **Check firewall/port:**
   - Ensure port 5173 is not blocked
   - Try a different port: `--port 8080`

4. **Reload VS Code window:**
   - Cmd/Ctrl + Shift + P → "Reload Window"

### Tasks Not Syncing

1. **Check sync configuration:**
   ```bash
   cat .taskmaster/config/sync.json
   ```

2. **View sync logs:**
   ```bash
   tail -f .taskmaster/logs/sync.log
   ```

3. **Test WebSocket connection:**
   ```bash
   # Install wscat if needed
   npm install -g wscat
   
   # Test connection
   wscat -c ws://localhost:5173/taskmaster
   ```

### Server Won't Start

1. **Port already in use:**
   ```bash
   # Find process using port
   lsof -i :5173
   
   # Use different port
   claude-flow taskmaster sync server start --port 5180
   ```

2. **Permission issues:**
   ```bash
   # Check directory permissions
   ls -la .taskmaster/
   
   # Fix permissions if needed
   chmod -R 755 .taskmaster/
   ```

## Advanced Usage

### Running Server in Background

**Using nohup:**
```bash
nohup claude-flow taskmaster sync server start > sync-server.log 2>&1 &
```

**Using PM2:**
```bash
# Install PM2
npm install -g pm2

# Start server
pm2 start "claude-flow taskmaster sync server start" --name taskmaster-sync

# View logs
pm2 logs taskmaster-sync

# Stop server
pm2 stop taskmaster-sync
```

### Network Access

To allow access from other machines:
```bash
# Start server on all interfaces
claude-flow taskmaster sync server start --host 0.0.0.0

# Access from another machine
ws://your-machine-ip:5173/taskmaster
```

### Custom Integration Example

```typescript
import { TaskMasterClient } from '@claude-flow/taskmaster-client';

const client = new TaskMasterClient({
  url: 'ws://localhost:5173/taskmaster'
});

// Subscribe to all task events
client.on('task.*', (event) => {
  console.log('Task event:', event);
});

// Get all tasks
const tasks = await client.getTasks();

// Update task
await client.updateTask('task-001', {
  status: 'completed'
});
```

## Security Considerations

### Local Development (Default)
- Server binds to localhost only
- No authentication required
- Safe for local development

### Network Access
If exposing to network:
1. Use HTTPS/WSS with proper certificates
2. Implement authentication tokens
3. Restrict IP access via firewall
4. Use VPN for team access

### Data Privacy
- All data stored locally in `.taskmaster/`
- No cloud sync unless explicitly configured
- Add `.taskmaster/` to `.gitignore` for sensitive data

## Best Practices

1. **Start Fresh Daily**
   - Stop server at end of day
   - Start fresh in morning for clean state

2. **Regular Backups**
   - TaskMaster auto-creates backups
   - Keep last 10 versions by default
   - Manual backup: `cp -r .taskmaster/ .taskmaster-backup/`

3. **Conflict Resolution**
   - Default: Last write wins
   - For critical tasks: Use manual conflict resolution
   - Check logs for conflict warnings

4. **Performance**
   - Limit concurrent connections (default: 10)
   - Use debouncing for rapid changes
   - Monitor memory usage for large task lists

## Limitations

- Maximum 10 concurrent connections
- Task files limited to reasonable size (~10MB)
- WebSocket requires modern browser/environment
- File watching may have OS-specific limitations

## Future Enhancements

Planned features:
- Cloud sync option
- Multi-project support
- Team collaboration
- Mobile app integration
- Webhooks for CI/CD

## Support

- **Documentation**: [TaskMaster Guide](./13-taskmaster-integration.md)
- **Issues**: [GitHub Issues](https://github.com/ruvnet/claude-code-flow/issues)
- **Extension**: [VS Code Extension Repo](https://github.com/iaminawe/claude-task-master-extension)