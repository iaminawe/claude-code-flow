#!/bin/bash

# Todo App Development Workflow Script
# This script orchestrates the development of a simple todo list application

echo "🚀 Starting Todo App Development Workflow"
echo "========================================"

# Clean up any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "swarm" 2>/dev/null
pkill -f "taskmaster" 2>/dev/null
sleep 2

# Step 1: Generate tasks from PRD
echo ""
echo "📋 Step 1: Generating tasks from PRD..."
./claude-flow taskmaster generate todo-app.prd --sparc-mapping

# Step 2: Start the development using SPARC methodology
echo ""
echo "🏗️  Step 2: Starting development with SPARC methodology..."

# Architecture phase
echo ""
echo "📐 Phase 1: Architecture Design"
./claude-flow sparc run architect "Design todo list application architecture with file-based storage"

# Specification phase
echo ""
echo "📝 Phase 2: Specification & Pseudocode"
./claude-flow sparc run spec-pseudocode "Define todo list CRUD operations and data structures"

# TDD Implementation phase
echo ""
echo "🧪 Phase 3: Test-Driven Development"
./claude-flow sparc tdd "implement todo list with add, complete, delete, and view features"

# Integration phase
echo ""
echo "🔗 Phase 4: Integration & Testing"
./claude-flow sparc run integration "integrate todo list components and create CLI interface"

# Documentation phase
echo ""
echo "📚 Phase 5: Documentation"
./claude-flow sparc run docs-writer "create documentation for todo list application"

echo ""
echo "✅ Todo App Development Workflow Complete!"
echo ""
echo "To monitor progress in real-time, run in another terminal:"
echo "  ./claude-flow monitor"
echo ""
echo "To check task status:"
echo "  ./claude-flow taskmaster list"