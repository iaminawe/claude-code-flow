#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env

/**
 * Initialize TaskMaster Templates
 * Loads sample templates and workflows into the system
 */

import { MemoryService } from '../src/services/memory-service.ts';
import { TemplateService } from '../src/integrations/taskmaster/templates/service/template-service.ts';
import { WorkflowService } from '../src/integrations/taskmaster/workflows/service/workflow-service.ts';
import { loadSampleTemplates } from '../src/integrations/taskmaster/templates/samples/index.ts';
import { sampleWorkflows } from '../src/integrations/taskmaster/workflows/samples/prd-workflow.ts';

async function initializeTemplates() {
  console.log('🚀 Initializing TaskMaster Templates...\n');

  try {
    // Initialize services
    const memoryService = new MemoryService();
    const templateService = new TemplateService(memoryService);
    const workflowService = new WorkflowService(memoryService, templateService);

    // Load sample templates
    console.log('📝 Loading sample templates...');
    await loadSampleTemplates(templateService);

    // Load sample workflows
    console.log('\n🔄 Loading sample workflows...');
    for (const workflow of sampleWorkflows) {
      try {
        const { id, createdAt, updatedAt, ...workflowData } = workflow;
        await workflowService.createWorkflow(workflowData);
        console.log(`✓ Loaded workflow: ${workflow.name}`);
      } catch (error) {
        console.error(`✗ Failed to load workflow ${workflow.name}:`, error);
      }
    }

    // Display summary
    const templates = await templateService.getAllTemplates();
    const workflows = await workflowService.getAllWorkflows();

    console.log('\n✅ Initialization Complete!');
    console.log(`   Templates loaded: ${templates.length}`);
    console.log(`   Workflows loaded: ${workflows.length}`);

    console.log('\n📚 Available Templates:');
    templates.forEach(t => {
      console.log(`   - ${t.name} (${t.category})`);
    });

    console.log('\n🔄 Available Workflows:');
    workflows.forEach(w => {
      console.log(`   - ${w.name}`);
    });

    console.log('\n🎯 Next Steps:');
    console.log('   1. List templates: ./claude-flow taskmaster templates list');
    console.log('   2. Show template: ./claude-flow taskmaster templates show <template-id>');
    console.log('   3. Apply template: ./claude-flow taskmaster templates apply <template-id> -v key=value');
    console.log('   4. List workflows: ./claude-flow taskmaster templates workflows list');
    console.log('   5. Execute workflow: ./claude-flow taskmaster templates workflows execute <workflow-id>');

  } catch (error) {
    console.error('❌ Error initializing templates:', error);
    Deno.exit(1);
  }
}

// Run initialization
if (import.meta.main) {
  await initializeTemplates();
}