/**
 * TaskMaster project management commands
 */

import { cyan, bold, yellow, gray } from "https://deno.land/std@0.224.0/fmt/colors.ts";
import { Select } from "https://deno.land/x/cliffy@v1.0.0-rc.3/prompt/mod.ts";

export async function handleProjects(args: string[], options: any): Promise<void> {
  const action = args[0] || 'list';
  
  switch (action) {
    case 'list':
      await listProjects();
      break;
    case 'select':
      await selectProject();
      break;
    case 'current':
      await showCurrentProject();
      break;
    default:
      console.log("Unknown project action. Available: list, select, current");
  }
}

async function listProjects(): Promise<void> {
  console.log(bold(cyan("TaskMaster Projects")));
  console.log();
  
  try {
    // Read memory store to get all PRDs
    const memoryPath = "./memory/memory-store.json";
    const memoryData = JSON.parse(await Deno.readTextFile(memoryPath));
    
    const prdEntries = memoryData.taskmaster_prds || [];
    const taskEntries = memoryData.taskmaster_tasks || [];
    
    // Count tasks per project
    const taskCounts = new Map();
    for (const entry of taskEntries) {
      try {
        let tasks = entry.value;
        if (typeof tasks === 'string') {
          tasks = JSON.parse(tasks);
        }
        if (Array.isArray(tasks) && tasks.length > 0) {
          // Try to get project info from first task or metadata
          const projectId = entry.metadata?.prdId || tasks[0]?.metadata?.prdId;
          if (projectId) {
            taskCounts.set(projectId, (taskCounts.get(projectId) || 0) + tasks.length);
          }
        }
      } catch (e) {
        // Skip
      }
    }
    
    // Build project list
    const projectMap = new Map();
    for (const entry of prdEntries) {
      try {
        let prd = entry.value;
        if (typeof prd === 'string') {
          prd = JSON.parse(prd);
        }
        if (prd && prd.id && prd.title) {
          projectMap.set(prd.id, {
            id: prd.id,
            title: prd.title,
            path: prd.path || 'Unknown',
            created: prd.metadata?.created || entry.timestamp,
            taskCount: taskCounts.get(prd.id) || 0
          });
        }
      } catch (e) {
        // Skip
      }
    }
    
    // Also check for orphaned task groups
    for (const [projectId, count] of taskCounts) {
      if (!projectMap.has(projectId)) {
        projectMap.set(projectId, {
          id: projectId,
          title: `Unknown Project (${projectId.substring(0, 8)}...)`,
          path: 'Unknown',
          created: Date.now(),
          taskCount: count
        });
      }
    }
    
    if (projectMap.size === 0) {
      console.log(yellow("No projects found. Generate tasks from a PRD first."));
      return;
    }
    
    // Display projects
    const projects = Array.from(projectMap.values()).sort((a, b) => b.created - a.created);
    
    console.log(bold("Project                                          Tasks  Created       ID"));
    console.log("─".repeat(80));
    
    for (const p of projects) {
      const title = p.title.padEnd(45, ' ').substring(0, 45);
      const tasks = p.taskCount.toString().padStart(5, ' ');
      const date = new Date(p.created).toLocaleDateString();
      const id = gray(p.id.substring(0, 8) + "...");
      console.log(`${title} ${tasks}  ${date}  ${id}`);
    }
    
    // Check current project
    const { SharedStorage } = await import("../../integrations/taskmaster/services/shared-storage.ts");
    const storage = new SharedStorage();
    const config = await storage.getSyncConfig();
    
    if (config.currentProjectId) {
      const current = projectMap.get(config.currentProjectId);
      if (current) {
        console.log();
        console.log(`Current project: ${cyan(current.title)}`);
      }
    }
    
    console.log();
    console.log("To select a project: " + gray("taskmaster projects select"));
    
  } catch (error) {
    console.error("Failed to list projects:", error);
  }
}

async function selectProject(): Promise<void> {
  try {
    // Get project list
    const memoryPath = "./memory/memory-store.json";
    const memoryData = JSON.parse(await Deno.readTextFile(memoryPath));
    
    const projects = [];
    const prdEntries = memoryData.taskmaster_prds || [];
    
    for (const entry of prdEntries) {
      try {
        let prd = entry.value;
        if (typeof prd === 'string') {
          prd = JSON.parse(prd);
        }
        if (prd && prd.id && prd.title) {
          projects.push({
            name: prd.title,
            value: prd.id
          });
        }
      } catch (e) {
        // Skip
      }
    }
    
    if (projects.length === 0) {
      console.log(yellow("No projects found."));
      return;
    }
    
    // Add "All Projects" option
    projects.unshift({
      name: "All Projects (No Filter)",
      value: ""
    });
    
    const selected = await Select.prompt({
      message: "Select a project to work with:",
      options: projects
    });
    
    // Sync tasks for selected project
    const { syncTasksForProject } = await import("../../integrations/taskmaster/services/sync-with-project-filter.ts");
    await syncTasksForProject(selected);
    
    console.log();
    console.log("VS Code will now show tasks for the selected project.");
    console.log("Restart the sync server if it's running.");
    
  } catch (error) {
    console.error("Failed to select project:", error);
  }
}

async function showCurrentProject(): Promise<void> {
  try {
    const { SharedStorage } = await import("../../integrations/taskmaster/services/shared-storage.ts");
    const storage = new SharedStorage();
    const config = await storage.getSyncConfig();
    
    if (config.currentProjectId) {
      // Try to get project name
      const memoryPath = "./memory/memory-store.json";
      const memoryData = JSON.parse(await Deno.readTextFile(memoryPath));
      const prdEntries = memoryData.taskmaster_prds || [];
      
      for (const entry of prdEntries) {
        try {
          let prd = entry.value;
          if (typeof prd === 'string') {
            prd = JSON.parse(prd);
          }
          if (prd && prd.id === config.currentProjectId) {
            console.log(`Current project: ${cyan(prd.title)}`);
            console.log(`Project ID: ${gray(prd.id)}`);
            return;
          }
        } catch (e) {
          // Skip
        }
      }
      
      console.log(`Current project ID: ${config.currentProjectId}`);
      console.log(yellow("Project details not found in memory."));
    } else {
      console.log("No project selected. Showing all tasks.");
      console.log("Use " + cyan("taskmaster projects select") + " to filter by project.");
    }
  } catch (error) {
    console.error("Failed to get current project:", error);
  }
}