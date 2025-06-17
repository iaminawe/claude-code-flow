#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🧪 Testing BatchTool Caching Features\n');

// Test 1: Run same command multiple times to test caching
console.log('📝 Test 1: Command result caching');
const times = [];

for (let i = 0; i < 5; i++) {
  const start = Date.now();
  
  try {
    // This should be cached after first run
    execSync('./claude-flow sparc info architect', { encoding: 'utf8' });
    const elapsed = Date.now() - start;
    times.push(elapsed);
    console.log(`   Run ${i + 1}: ${elapsed}ms`);
  } catch (error) {
    console.error(`   Run ${i + 1}: Failed`);
  }
}

const avgFirst = times[0];
const avgCached = times.slice(1).reduce((a, b) => a + b, 0) / (times.length - 1);

console.log(`\n✅ Cache Performance:`);
console.log(`   First run: ${avgFirst}ms`);
console.log(`   Cached runs average: ${avgCached.toFixed(2)}ms`);
console.log(`   Speed improvement: ${((avgFirst / avgCached - 1) * 100).toFixed(1)}%\n`);

// Test 2: Memory stats to verify caching
console.log('💾 Test 2: Memory and cache statistics');
try {
  const stats = execSync('./claude-flow memory stats', { encoding: 'utf8' });
  console.log(stats);
} catch (error) {
  console.log('   Memory stats not available');
}

console.log('\n✅ Cache testing completed!');