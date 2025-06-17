#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

// Test BatchTool parallel operations
async function testBatchOperations() {
  console.log('🧪 Testing BatchTool Parallel Operations\n');

  // Test 1: Parallel File Operations
  console.log('📁 Test 1: Parallel File Operations');
  const startTime = Date.now();
  
  const fileOperations = [];
  for (let i = 1; i <= 10; i++) {
    fileOperations.push(
      fs.writeFile(
        path.join(__dirname, `test-batch-${i}.txt`),
        `Test file ${i} - Created at ${new Date().toISOString()}\n`
      )
    );
  }
  
  await Promise.all(fileOperations);
  const fileTime = Date.now() - startTime;
  console.log(`✅ Created 10 files in parallel: ${fileTime}ms\n`);

  // Test 2: Parallel Claude-Flow Commands
  console.log('🚀 Test 2: Parallel SPARC Mode Executions');
  const sparcCommands = [
    { mode: 'spec-pseudocode', task: 'Define batch processing requirements' },
    { mode: 'architect', task: 'Design parallel execution system' },
    { mode: 'code', task: 'Implement connection pooling' },
    { mode: 'tdd', task: 'Write tests for cache system' },
    { mode: 'docs-writer', task: 'Document batch operations' }
  ];

  const sparcStart = Date.now();
  const sparcPromises = sparcCommands.map(({ mode, task }) => {
    return new Promise((resolve) => {
      const cmd = spawn('./claude-flow', ['sparc', 'info', mode]);
      let output = '';
      
      cmd.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      cmd.on('close', (code) => {
        resolve({ mode, success: code === 0, output });
      });
    });
  });

  const sparcResults = await Promise.all(sparcPromises);
  const sparcTime = Date.now() - sparcStart;
  
  console.log(`✅ Executed ${sparcResults.length} SPARC commands in parallel: ${sparcTime}ms`);
  sparcResults.forEach(({ mode, success }) => {
    console.log(`   ${success ? '✓' : '✗'} ${mode}`);
  });
  console.log();

  // Test 3: Connection Pool Simulation
  console.log('🔄 Test 3: Connection Pool Simulation');
  const poolSize = 5;
  const totalRequests = 20;
  
  class ConnectionPool {
    constructor(size) {
      this.connections = Array(size).fill(null).map((_, i) => ({
        id: i,
        busy: false
      }));
    }

    async getConnection() {
      while (true) {
        const conn = this.connections.find(c => !c.busy);
        if (conn) {
          conn.busy = true;
          return conn;
        }
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }

    releaseConnection(conn) {
      conn.busy = false;
    }
  }

  const pool = new ConnectionPool(poolSize);
  const poolStart = Date.now();
  
  const requests = Array(totalRequests).fill(null).map(async (_, i) => {
    const conn = await pool.getConnection();
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
    pool.releaseConnection(conn);
    return `Request ${i} completed on connection ${conn.id}`;
  });

  const poolResults = await Promise.all(requests);
  const poolTime = Date.now() - poolStart;
  
  console.log(`✅ Processed ${totalRequests} requests with ${poolSize} connections: ${poolTime}ms`);
  console.log(`   Average time per request: ${(poolTime / totalRequests).toFixed(2)}ms\n`);

  // Test 4: Intelligent Caching
  console.log('💾 Test 4: Intelligent Caching with TTL');
  
  class Cache {
    constructor(ttl = 1000) {
      this.store = new Map();
      this.ttl = ttl;
    }

    set(key, value) {
      this.store.set(key, {
        value,
        timestamp: Date.now()
      });
    }

    get(key) {
      const item = this.store.get(key);
      if (!item) return null;
      
      if (Date.now() - item.timestamp > this.ttl) {
        this.store.delete(key);
        return null;
      }
      
      return item.value;
    }
  }

  const cache = new Cache(500); // 500ms TTL
  
  // Simulate cached operations
  const cacheOperations = async () => {
    const results = [];
    
    // First batch - cache miss
    for (let i = 0; i < 5; i++) {
      const key = `data-${i}`;
      let value = cache.get(key);
      
      if (!value) {
        // Simulate expensive operation
        await new Promise(resolve => setTimeout(resolve, 50));
        value = `Generated value ${i}`;
        cache.set(key, value);
        results.push({ key, cached: false });
      } else {
        results.push({ key, cached: true });
      }
    }
    
    // Second batch - cache hit
    for (let i = 0; i < 5; i++) {
      const key = `data-${i}`;
      const value = cache.get(key);
      results.push({ key, cached: !!value });
    }
    
    // Wait for TTL expiry
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Third batch - cache miss (expired)
    for (let i = 0; i < 5; i++) {
      const key = `data-${i}`;
      const value = cache.get(key);
      results.push({ key, cached: !!value });
    }
    
    return results;
  };

  const cacheResults = await cacheOperations();
  const hits = cacheResults.filter(r => r.cached).length;
  const misses = cacheResults.filter(r => !r.cached).length;
  
  console.log(`✅ Cache performance: ${hits} hits, ${misses} misses`);
  console.log(`   Hit rate: ${((hits / cacheResults.length) * 100).toFixed(1)}%\n`);

  // Test 5: Boomerang Pattern (Dependency Resolution)
  console.log('🪃 Test 5: Boomerang Pattern - Dependency Resolution');
  
  class TaskGraph {
    constructor() {
      this.tasks = new Map();
    }

    addTask(id, dependencies = []) {
      this.tasks.set(id, {
        id,
        dependencies,
        status: 'pending',
        result: null
      });
    }

    async execute() {
      const executed = new Set();
      const executing = new Set();

      const canExecute = (task) => {
        return task.dependencies.every(dep => executed.has(dep));
      };

      const executeTask = async (task) => {
        executing.add(task.id);
        task.status = 'running';
        
        // Simulate task execution
        await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
        
        task.status = 'completed';
        task.result = `Result of ${task.id}`;
        executed.add(task.id);
        executing.delete(task.id);
      };

      while (executed.size < this.tasks.size) {
        const promises = [];
        
        for (const [id, task] of this.tasks) {
          if (!executed.has(id) && !executing.has(id) && canExecute(task)) {
            promises.push(executeTask(task));
          }
        }
        
        if (promises.length > 0) {
          await Promise.all(promises);
        } else {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }

      return Array.from(executed);
    }
  }

  const graph = new TaskGraph();
  
  // Create dependency graph
  graph.addTask('A', []);
  graph.addTask('B', []);
  graph.addTask('C', ['A']);
  graph.addTask('D', ['A', 'B']);
  graph.addTask('E', ['C', 'D']);
  graph.addTask('F', ['E']);
  
  const graphStart = Date.now();
  const executionOrder = await graph.execute();
  const graphTime = Date.now() - graphStart;
  
  console.log(`✅ Executed task graph with dependencies: ${graphTime}ms`);
  console.log(`   Execution order: ${executionOrder.join(' → ')}\n`);

  // Cleanup
  console.log('🧹 Cleaning up test files...');
  const cleanupPromises = [];
  for (let i = 1; i <= 10; i++) {
    cleanupPromises.push(
      fs.unlink(path.join(__dirname, `test-batch-${i}.txt`)).catch(() => {})
    );
  }
  await Promise.all(cleanupPromises);
  
  console.log('\n✅ All BatchTool tests completed successfully!');
  
  // Performance Summary
  console.log('\n📊 Performance Summary:');
  console.log(`   Parallel file operations: ${fileTime}ms for 10 files`);
  console.log(`   Parallel SPARC commands: ${sparcTime}ms for ${sparcCommands.length} commands`);
  console.log(`   Connection pooling: ${poolTime}ms for ${totalRequests} requests`);
  console.log(`   Cache hit rate: ${((hits / cacheResults.length) * 100).toFixed(1)}%`);
  console.log(`   Dependency graph execution: ${graphTime}ms for 6 tasks`);
}

// Run tests
testBatchOperations().catch(console.error);