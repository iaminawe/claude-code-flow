#!/bin/bash
# TaskMaster Example Workflow
# This script demonstrates a complete TaskMaster workflow

echo "🚀 TaskMaster Example Workflow"
echo "============================="
echo

# Check if claude-flow is available
if ! command -v ./bin/claude-flow-deno &> /dev/null; then
    echo "❌ Error: claude-flow-deno not found"
    echo "Please run from the project root directory"
    exit 1
fi

# Create a sample PRD
echo "📝 Creating sample PRD..."
cat > example-todo-app.prd << 'EOF'
# Todo Application PRD

## Overview
Build a modern, responsive todo application with cloud synchronization and collaboration features.

## Core Features
- User authentication with OAuth support
- Create, edit, delete, and complete todos
- Categorize todos with tags and projects
- Due date and reminder functionality
- Real-time synchronization across devices
- Share lists with team members
- Dark mode support
- Mobile-responsive design

## Technical Requirements
- React 18+ with TypeScript
- Node.js backend with Express
- PostgreSQL database with Prisma ORM
- Redis for caching and sessions
- WebSocket support for real-time updates
- JWT-based authentication
- RESTful API with OpenAPI documentation
- Docker containerization
- CI/CD pipeline with GitHub Actions

## User Stories
- As a user, I want to quickly add todos so that I can capture tasks efficiently
- As a user, I want to organize todos by project so that I can focus on related tasks
- As a team member, I want to share lists so that we can collaborate on tasks
- As a mobile user, I want offline support so that I can work without internet

## Non-Functional Requirements
- Page load time < 2 seconds
- 99.9% uptime SLA
- Support 10,000 concurrent users
- GDPR compliant data handling
- Accessibility (WCAG 2.1 AA)

## Security Requirements
- Encrypted data at rest and in transit
- Multi-factor authentication support
- Regular security audits
- Rate limiting on all API endpoints
EOF

echo "✅ Sample PRD created: example-todo-app.prd"
echo

# Parse the PRD
echo "🔍 Parsing PRD..."
./bin/claude-flow-deno taskmaster parse example-todo-app.prd
echo

# Generate tasks with SPARC mapping
echo "🎯 Generating tasks with SPARC mapping..."
./bin/claude-flow-deno taskmaster generate example-todo-app.prd --sparc-mapping
echo

# List stored data
echo "📋 Listing stored TaskMaster data..."
./bin/claude-flow-deno taskmaster list
echo

# Export tasks in different formats
echo "💾 Exporting tasks..."
echo "  - JSON format..."
./bin/claude-flow-deno taskmaster export --format json --output todo-tasks.json
echo "  - Markdown format..."
./bin/claude-flow-deno taskmaster export --format markdown --output todo-tasks.md
echo "  - CSV format..."
./bin/claude-flow-deno taskmaster export --format csv --output todo-tasks.csv
echo

# Show exported files
echo "📁 Exported files:"
ls -la todo-tasks.*
echo

# Demonstrate task update (using a placeholder ID)
echo "🔄 Demonstrating task update..."
echo "Note: In a real workflow, you would use actual task IDs from the generated tasks"
echo "Example: ./bin/claude-flow-deno taskmaster update <task-id> in_progress"
echo

# Show SPARC integration
echo "🚀 SPARC Integration Example:"
echo "You can now use the generated tasks with SPARC modes:"
echo
echo "1. Start with architecture:"
echo "   ./bin/claude-flow-deno sparc run architect \"Design todo app architecture\""
echo
echo "2. Implement features:"
echo "   ./bin/claude-flow-deno sparc run code \"Implement user authentication\""
echo
echo "3. Add tests:"
echo "   ./bin/claude-flow-deno sparc run tdd \"Create tests for todo CRUD operations\""
echo

# Memory integration
echo "💾 Memory Integration:"
echo "TaskMaster data is stored in Claude-Flow's memory system:"
./bin/claude-flow-deno memory stats | grep taskmaster
echo

# Cleanup option
read -p "🧹 Clean up example files? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -f example-todo-app.prd todo-tasks.* taskmaster-output.json taskmaster-export.*
    echo "✅ Cleanup complete"
fi

echo
echo "✨ TaskMaster workflow example complete!"
echo "For more information, see: docs/15-taskmaster-cli-guide.md"