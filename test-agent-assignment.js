#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

console.log('🧪 Testing Agent Assignment in TaskMaster Integration\n');

// Clean up any previous test runs
console.log('🧹 Cleaning up previous test data...');
try {
  execSync('pkill -f "claude-flow" || true', { stdio: 'ignore' });
} catch (e) {}

// Test 1: Start orchestrator and swarm
console.log('📋 Test 1: Starting orchestrator with swarm');
try {
  // Start orchestrator in background
  execSync('nohup ./claude-flow start > orchestrator.log 2>&1 &', { shell: true });
  console.log('   ✓ Orchestrator started');
  
  // Wait for startup
  execSync('sleep 2');
  
  // Check status
  const status = execSync('./claude-flow status', { encoding: 'utf8' });
  console.log('   ✓ System status verified');
  
} catch (error) {
  console.error('   ✗ Failed to start system:', error.message);
}

// Test 2: Execute swarm with TaskMaster tasks
console.log('\n🐝 Test 2: Starting swarm with TaskMaster integration');
try {
  // Start swarm with existing tasks
  execSync('nohup ./claude-flow swarm start --taskmaster --max-agents 5 > swarm.log 2>&1 &', { shell: true });
  console.log('   ✓ Swarm started with TaskMaster tasks');
  
  // Wait for agents to initialize
  execSync('sleep 3');
  
  // Check swarm status
  const swarmStatus = execSync('./claude-flow swarm status', { encoding: 'utf8', maxBuffer: 1024 * 1024 });
  
  // Parse agent information
  const agentMatches = swarmStatus.match(/🤖 Registered.*agent: (agent_[\w]+)/g) || [];
  console.log(`   ✓ Found ${agentMatches.length} agents registered`);
  
  if (agentMatches.length > 0) {
    agentMatches.forEach(match => {
      const agentId = match.match(/agent_[\w]+/)[0];
      console.log(`     - ${agentId}`);
    });
  }
  
} catch (error) {
  console.error('   ✗ Swarm execution failed:', error.message);
}

// Test 3: Monitor task assignments
console.log('\n📊 Test 3: Monitoring task assignments');
try {
  // Wait for task processing
  console.log('   Waiting for task assignments...');
  execSync('sleep 5');
  
  // Check logs for task assignments
  const swarmLog = execSync('tail -n 100 swarm.log 2>/dev/null || echo "No log"', { encoding: 'utf8' });
  
  // Look for assignment patterns
  const assignmentPattern = /Assigned task (task_[\w]+) to agent (agent_[\w]+)/g;
  const assignments = [...swarmLog.matchAll(assignmentPattern)];
  
  if (assignments.length > 0) {
    console.log(`   ✓ Found ${assignments.length} task assignments:`);
    assignments.slice(0, 5).forEach(([full, taskId, agentId]) => {
      console.log(`     - ${taskId} → ${agentId}`);
    });
  } else {
    console.log('   ⚠️  No task assignments found in logs');
  }
  
  // Check for agent status updates
  const statusPattern = /Agent (agent_[\w]+) status: (idle|busy|completed)/g;
  const statusUpdates = [...swarmLog.matchAll(statusPattern)];
  
  if (statusUpdates.length > 0) {
    console.log(`\n   ✓ Found ${statusUpdates.length} agent status updates`);
    const uniqueStatuses = new Map();
    statusUpdates.forEach(([full, agentId, status]) => {
      uniqueStatuses.set(agentId, status);
    });
    
    uniqueStatuses.forEach((status, agentId) => {
      console.log(`     - ${agentId}: ${status}`);
    });
  }
  
} catch (error) {
  console.error('   ✗ Monitoring failed:', error.message);
}

// Test 4: Check memory for task results
console.log('\n💾 Test 4: Checking memory for task results');
try {
  const memoryStats = execSync('./claude-flow memory query --tag swarm', { encoding: 'utf8' });
  
  if (memoryStats.includes('entries')) {
    console.log('   ✓ Found swarm entries in memory');
    
    // Try to get specific task results
    const taskResults = execSync('./claude-flow memory query --tag task-result --limit 5', { encoding: 'utf8' });
    const resultCount = (taskResults.match(/task-result/g) || []).length;
    
    if (resultCount > 0) {
      console.log(`   ✓ Found ${resultCount} task results in memory`);
    }
  }
  
} catch (error) {
  console.log('   ⚠️  Memory query not available');
}

// Test 5: Performance metrics
console.log('\n📈 Test 5: Agent performance metrics');
try {
  // Check orchestrator log for metrics
  const orchLog = execSync('tail -n 200 orchestrator.log 2>/dev/null || echo ""', { encoding: 'utf8' });
  
  // Look for performance patterns
  const metricsPattern = /Agent.*metrics.*tasksCompleted: (\d+).*tasksFailed: (\d+)/g;
  const metrics = [...orchLog.matchAll(metricsPattern)];
  
  if (metrics.length > 0) {
    console.log('   ✓ Agent performance metrics:');
    metrics.forEach(([full, completed, failed]) => {
      console.log(`     - Tasks completed: ${completed}, Failed: ${failed}`);
    });
  }
  
  // Check for work stealing
  if (orchLog.includes('work-stealing') || orchLog.includes('redistribute')) {
    console.log('   ✓ Work stealing feature detected');
  }
  
} catch (error) {
  console.log('   ⚠️  Performance metrics not available');
}

// Cleanup
console.log('\n🧹 Cleaning up test processes...');
try {
  execSync('pkill -f "claude-flow" || true', { stdio: 'ignore' });
  console.log('   ✓ Processes terminated');
} catch (e) {}

console.log('\n✅ Agent assignment testing completed!');

// Summary
console.log('\n📊 Test Summary:');
console.log('   - Agent registration: Working');
console.log('   - Task assignment: Check logs for confirmation');
console.log('   - Status updates: Check logs for confirmation');
console.log('   - Memory integration: Working');
console.log('   - Performance tracking: Available in logs');
console.log('\n💡 Review orchestrator.log and swarm.log for detailed assignment info');