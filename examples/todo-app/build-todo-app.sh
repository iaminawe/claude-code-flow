#!/bin/bash

# Todo App Build Script using Claude-Flow, SPARC, and TaskMaster
# This script demonstrates the complete workflow from PRD to implementation

echo "🚀 Building Todo App with Claude-Flow + TaskMaster + SPARC"
echo "==========================================================="

# Set project directory
PROJECT_DIR="$(pwd)"
CLAUDE_FLOW="../../claude-flow"

# Step 1: Generate tasks from PRD (already done)
echo ""
echo "📋 Step 1: Tasks already generated from PRD"
echo "   - 31 tasks created with SPARC mapping"
echo "   - Tasks optimized for parallel execution"

# Step 2: Use SPARC to create the project architecture
echo ""
echo "🏗️  Step 2: Creating project architecture with SPARC"
$CLAUDE_FLOW sparc run architect "Design a React TypeScript todo app with shadcn/ui components, including folder structure, component hierarchy, and data flow architecture"

# Step 3: Initialize the React project
echo ""
echo "📦 Step 3: Initializing React project with Vite"
npm create vite@latest todo-app -- --template react-ts
cd todo-app

# Step 4: Install dependencies
echo ""
echo "📥 Step 4: Installing dependencies"
npm install
npm install -D tailwindcss postcss autoprefixer
npm install @radix-ui/react-checkbox @radix-ui/react-dialog @radix-ui/react-label
npm install class-variance-authority clsx tailwind-merge lucide-react
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install -D vitest jsdom @vitest/ui

# Step 5: Setup Tailwind CSS
echo ""
echo "🎨 Step 5: Configuring Tailwind CSS"
npx tailwindcss init -p

# Step 6: Use SPARC to generate core components
echo ""
echo "🧩 Step 6: Generating components with SPARC"

# TodoInput component
$CLAUDE_FLOW sparc run code "Create a TodoInput React component with TypeScript that uses shadcn/ui Input and Button components. It should have an input field and add button, emit onAdd callback with the todo text, and clear input after adding"

# TodoItem component  
$CLAUDE_FLOW sparc run code "Create a TodoItem React component with TypeScript that displays a single todo with checkbox (using shadcn/ui Checkbox), editable text, and delete button. Props: todo object with id, text, completed, onToggle, onEdit, onDelete callbacks"

# TodoList component
$CLAUDE_FLOW sparc run code "Create a TodoList React component that renders a list of TodoItem components with proper keys and passes callbacks for toggle, edit, and delete operations"

# TodoFilter component
$CLAUDE_FLOW sparc run code "Create a TodoFilter React component with filter buttons (All, Active, Completed) using shadcn/ui Button component in a toggle group style. Emit onFilterChange callback"

# Step 7: Create custom hooks with SPARC
echo ""
echo "🪝 Step 7: Creating custom hooks"

$CLAUDE_FLOW sparc run code "Create a useTodos custom React hook with TypeScript that manages todo state (add, update, delete, toggle), provides filter functionality, and persists to localStorage. Return todos array and action functions"

$CLAUDE_FLOW sparc run code "Create a useLocalStorage custom React hook with TypeScript that syncs state with localStorage, handles JSON serialization, and provides type safety"

# Step 8: Generate tests with SPARC TDD mode
echo ""
echo "🧪 Step 8: Generating tests with SPARC TDD"

$CLAUDE_FLOW sparc run tdd "Write comprehensive tests for TodoInput component including: renders correctly, handles input changes, calls onAdd when form submitted, clears input after adding, disables button when input empty"

$CLAUDE_FLOW sparc run tdd "Write tests for TodoItem component including: renders todo text, shows checkbox state, toggles completion, enables edit mode, saves edit changes, calls delete callback"

$CLAUDE_FLOW sparc run tdd "Write tests for useTodos hook including: adds new todos, toggles todo completion, updates todo text, deletes todos, filters todos correctly, persists to localStorage"

# Step 9: Create main App component
echo ""
echo "🎯 Step 9: Creating main App component"

$CLAUDE_FLOW sparc run code "Create the main App component that uses TodoInput, TodoList, TodoFilter components and useTodos hook. Include a header, stats showing active/completed counts, and clear completed button"

# Step 10: Add styling and dark mode
echo ""
echo "🌙 Step 10: Adding styling and dark mode support"

$CLAUDE_FLOW sparc run code "Create a theme provider component that detects system theme preference and provides dark mode toggle using React context. Include proper TypeScript types"

# Step 11: Run integration tests
echo ""
echo "🔄 Step 11: Running integration tests"

$CLAUDE_FLOW sparc run integration "Create integration tests for the todo app including: full CRUD workflow, filter functionality, localStorage persistence, keyboard navigation"

# Step 12: Documentation
echo ""
echo "📚 Step 12: Generating documentation"

$CLAUDE_FLOW sparc run docs-writer "Create comprehensive README.md for the todo app including: project overview, features, installation instructions, usage guide, architecture explanation, and testing instructions"

# Step 13: Execute all tasks with monitoring
echo ""
echo "⚡ Step 13: Executing all tasks in parallel with monitoring"
echo ""
echo "You can now run:"
echo "  $CLAUDE_FLOW taskmaster execute-all --parallel --max-agents 7"
echo "  $CLAUDE_FLOW taskmaster monitor"
echo ""
echo "Or use swarm mode:"
echo "  $CLAUDE_FLOW swarm start --taskmaster-file ../tasks-optimized.json --max-agents 7"

echo ""
echo "✅ Todo app setup complete!"
echo ""
echo "Next steps:"
echo "1. cd todo-app"
echo "2. npm run dev - Start development server"
echo "3. npm test - Run tests"
echo "4. npm run build - Build for production"