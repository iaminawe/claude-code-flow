/**
 * TaskMaster Template CLI Commands
 * Commands for managing task templates and workflows
 */

import { Command } from 'npm:commander@11.0.0';
import { TemplateService } from '../../integrations/taskmaster/templates/service/template-service.ts';
import { WorkflowService } from '../../integrations/taskmaster/workflows/service/workflow-service.ts';
import { SimpleMemoryManager } from '../commands/memory.ts';
import { TaskTemplate, TemplateCategory, Workflow, TriggerType } from '../../integrations/taskmaster/templates/types/template-types.ts';
import chalk from 'npm:chalk@5.3.0';

export function createTaskMasterTemplateCommands(): Command {
  const templates = new Command('templates')
    .description('Manage TaskMaster templates and workflows');

  // Template commands
  templates
    .command('list')
    .description('List all available templates')
    .option('-c, --category <category>', 'Filter by category')
    .action(async (options) => {
      try {
        const memoryService = new SimpleMemoryManager();
        const templateService = new TemplateService(memoryService);
        
        let templates = await templateService.getAllTemplates();
        
        if (options.category) {
          templates = templates.filter(t => t.category === options.category);
        }

        if (templates.length === 0) {
          console.log(chalk.yellow('No templates found'));
          return;
        }

        console.log(chalk.cyan('\nAvailable Templates:\n'));
        for (const template of templates) {
          console.log(chalk.bold(`  ${template.name}`) + chalk.gray(` (${template.id})`));
          console.log(`    Category: ${chalk.blue(template.category)}`);
          console.log(`    Description: ${template.description}`);
          console.log(`    Tasks: ${template.tasks.length}`);
          console.log(`    Variables: ${template.variables.length}`);
          if (template.metadata?.estimatedHours) {
            console.log(`    Estimated Hours: ${template.metadata.estimatedHours}`);
          }
          console.log();
        }
      } catch (error) {
        console.error(chalk.red('Error listing templates:'), error);
        process.exit(1);
      }
    });

  templates
    .command('show <templateId>')
    .description('Show details of a specific template')
    .action(async (templateId) => {
      try {
        const memoryService = new SimpleMemoryManager();
        const templateService = new TemplateService(memoryService);
        
        const template = await templateService.getTemplate(templateId);
        if (!template) {
          console.log(chalk.red(`Template ${templateId} not found`));
          return;
        }

        console.log(chalk.cyan('\nTemplate Details:\n'));
        console.log(chalk.bold('Name:'), template.name);
        console.log(chalk.bold('ID:'), template.id);
        console.log(chalk.bold('Category:'), template.category);
        console.log(chalk.bold('Description:'), template.description);
        console.log(chalk.bold('Version:'), template.version);
        
        if (template.variables.length > 0) {
          console.log(chalk.bold('\nVariables:'));
          for (const variable of template.variables) {
            console.log(`  - ${variable.name} (${variable.type})${variable.required ? ' *required' : ''}`);
            console.log(`    ${variable.description}`);
            if (variable.default !== undefined) {
              console.log(`    Default: ${variable.default}`);
            }
          }
        }

        console.log(chalk.bold('\nTasks:'));
        for (const task of template.tasks) {
          console.log(`  - ${task.title}`);
          if (task.description) {
            console.log(`    ${task.description}`);
          }
          if (task.dependencies?.length > 0) {
            console.log(`    Dependencies: ${task.dependencies.join(', ')}`);
          }
        }
      } catch (error) {
        console.error(chalk.red('Error showing template:'), error);
        process.exit(1);
      }
    });

  templates
    .command('apply <templateId>')
    .description('Apply a template to create tasks')
    .option('-v, --variable <key=value...>', 'Set template variables', (value, previous) => {
      const [key, val] = value.split('=');
      return { ...previous, [key]: val };
    }, {})
    .option('-p, --project <project>', 'Target project')
    .option('--prefix <prefix>', 'Add prefix to task titles')
    .option('--suffix <suffix>', 'Add suffix to task titles')
    .action(async (templateId, options) => {
      try {
        const memoryService = new SimpleMemoryManager();
        const templateService = new TemplateService(memoryService);
        
        const result = await templateService.applyTemplate({
          templateId,
          variables: options.variable || {},
          targetProject: options.project,
          options: {
            addPrefix: options.prefix,
            addSuffix: options.suffix
          }
        });

        if (result.success) {
          console.log(chalk.green(`✓ Template applied successfully`));
          console.log(`  Created ${result.tasksCreated.length} tasks`);
        } else {
          console.log(chalk.red('✗ Failed to apply template'));
          if (result.errors) {
            result.errors.forEach(err => console.log(`  - ${err}`));
          }
        }
      } catch (error) {
        console.error(chalk.red('Error applying template:'), error);
        process.exit(1);
      }
    });

  templates
    .command('import <file>')
    .description('Import templates from JSON file')
    .action(async (file) => {
      try {
        const memoryService = new SimpleMemoryManager();
        const templateService = new TemplateService(memoryService);
        
        const json = await Deno.readTextFile(file);
        const result = await templateService.importTemplates(json);
        
        console.log(chalk.green(`✓ Imported ${result.imported} templates`));
        if (result.errors.length > 0) {
          console.log(chalk.yellow('\nWarnings:'));
          result.errors.forEach(err => console.log(`  - ${err}`));
        }
      } catch (error) {
        console.error(chalk.red('Error importing templates:'), error);
        process.exit(1);
      }
    });

  templates
    .command('export')
    .description('Export templates to JSON file')
    .option('-o, --output <file>', 'Output file', 'templates.json')
    .option('-i, --ids <ids...>', 'Specific template IDs to export')
    .action(async (options) => {
      try {
        const memoryService = new SimpleMemoryManager();
        const templateService = new TemplateService(memoryService);
        
        const json = await templateService.exportTemplates(options.ids);
        await Deno.writeTextFile(options.output, json);
        
        console.log(chalk.green(`✓ Exported templates to ${options.output}`));
      } catch (error) {
        console.error(chalk.red('Error exporting templates:'), error);
        process.exit(1);
      }
    });

  templates
    .command('delete <templateId>')
    .description('Delete a template')
    .action(async (templateId) => {
      try {
        const memoryService = new SimpleMemoryManager();
        const templateService = new TemplateService(memoryService);
        
        const success = await templateService.deleteTemplate(templateId);
        if (success) {
          console.log(chalk.green(`✓ Template ${templateId} deleted`));
        } else {
          console.log(chalk.red(`Template ${templateId} not found`));
        }
      } catch (error) {
        console.error(chalk.red('Error deleting template:'), error);
        process.exit(1);
      }
    });

  // Workflow commands
  const workflows = templates
    .command('workflows')
    .description('Manage workflows');

  workflows
    .command('list')
    .description('List all workflows')
    .action(async () => {
      try {
        const memoryService = new SimpleMemoryManager();
        const templateService = new TemplateService(memoryService);
        const workflowService = new WorkflowService(memoryService, templateService);
        
        const workflows = await workflowService.getAllWorkflows();
        
        if (workflows.length === 0) {
          console.log(chalk.yellow('No workflows found'));
          return;
        }

        console.log(chalk.cyan('\nAvailable Workflows:\n'));
        for (const workflow of workflows) {
          console.log(chalk.bold(`  ${workflow.name}`) + chalk.gray(` (${workflow.id})`));
          console.log(`    Description: ${workflow.description}`);
          console.log(`    Templates: ${workflow.templates.length}`);
          if (workflow.triggers && workflow.triggers.length > 0) {
            console.log(`    Triggers: ${workflow.triggers.map(t => t.type).join(', ')}`);
          }
          console.log();
        }
      } catch (error) {
        console.error(chalk.red('Error listing workflows:'), error);
        process.exit(1);
      }
    });

  workflows
    .command('execute <workflowId>')
    .description('Execute a workflow')
    .option('-v, --variable <key=value...>', 'Set workflow variables', (value, previous) => {
      const [key, val] = value.split('=');
      return { ...previous, [key]: val };
    }, {})
    .action(async (workflowId, options) => {
      try {
        const memoryService = new SimpleMemoryManager();
        const templateService = new TemplateService(memoryService);
        const workflowService = new WorkflowService(memoryService, templateService);
        
        console.log(chalk.cyan(`Executing workflow ${workflowId}...`));
        
        const execution = await workflowService.executeWorkflow(
          workflowId,
          options.variable || {}
        );

        if (execution.status === 'completed') {
          console.log(chalk.green('✓ Workflow completed successfully'));
          console.log(`  Total tasks created: ${execution.results.reduce((sum, r) => sum + r.tasksCreated.length, 0)}`);
        } else if (execution.status === 'failed') {
          console.log(chalk.red('✗ Workflow failed'));
          console.log(`  Error: ${execution.error}`);
        }
      } catch (error) {
        console.error(chalk.red('Error executing workflow:'), error);
        process.exit(1);
      }
    });

  workflows
    .command('history [workflowId]')
    .description('Show workflow execution history')
    .action(async (workflowId) => {
      try {
        const memoryService = new SimpleMemoryManager();
        const templateService = new TemplateService(memoryService);
        const workflowService = new WorkflowService(memoryService, templateService);
        
        const executions = await workflowService.getExecutions(workflowId);
        
        if (executions.length === 0) {
          console.log(chalk.yellow('No executions found'));
          return;
        }

        console.log(chalk.cyan('\nWorkflow Executions:\n'));
        for (const execution of executions) {
          const duration = execution.completedAt 
            ? (new Date(execution.completedAt).getTime() - new Date(execution.startedAt).getTime()) / 1000
            : 'N/A';
            
          console.log(chalk.bold(`  Workflow: ${execution.workflowId}`));
          console.log(`    Status: ${execution.status}`);
          console.log(`    Started: ${new Date(execution.startedAt).toLocaleString()}`);
          console.log(`    Duration: ${duration}s`);
          if (execution.error) {
            console.log(`    Error: ${chalk.red(execution.error)}`);
          }
          console.log();
        }
      } catch (error) {
        console.error(chalk.red('Error showing history:'), error);
        process.exit(1);
      }
    });

  return templates;
}