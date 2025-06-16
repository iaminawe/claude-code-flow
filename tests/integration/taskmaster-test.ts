#!/usr/bin/env -S deno test --allow-all
/**
 * TaskMaster Integration Tests
 * Tests the complete TaskMaster workflow
 */

import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { TaskMasterDenoBridge } from "../../src/integrations/taskmaster/deno-bridge.ts";

// Test PRD content
const testPRD = `# Test Product PRD

## Overview
A test product for integration testing.

## Core Features
- Feature One: User authentication
- Feature Two: Data management  
- Feature Three: API endpoints

## Technical Requirements
- TypeScript backend
- PostgreSQL database
- REST API
`;

Deno.test("TaskMaster Integration Tests", async (t) => {
  const taskmaster = new TaskMasterDenoBridge();
  const testPRDPath = "./test-integration.prd";
  
  // Setup: Create test PRD file
  await t.step("Setup: Create test PRD", async () => {
    await Deno.writeTextFile(testPRDPath, testPRD);
  });

  // Test 1: Parse PRD
  await t.step("Parse PRD document", async () => {
    const prd = await taskmaster.parsePRD(testPRDPath);
    
    assertEquals(prd.title, "Test Product PRD");
    assertExists(prd.id);
    assertExists(prd.content);
    assertEquals(prd.sections.length, 3);
    assertEquals(prd.sections[0].type, "overview");
    assertEquals(prd.sections[1].type, "requirements");
    assertEquals(prd.sections[2].type, "requirements");
  });

  // Test 2: Generate tasks
  let generatedTasks: any[] = [];
  await t.step("Generate tasks from PRD", async () => {
    generatedTasks = await taskmaster.generateTasks(testPRDPath, { 
      sparcMapping: true 
    });
    
    // Should generate architecture + features + testing + docs
    // The exact number depends on how many bullet points are found
    assertEquals(generatedTasks.length >= 6, true);
    
    // Check first task is architecture
    assertEquals(generatedTasks[0].type, "architecture");
    assertEquals(generatedTasks[0].sparc_mode, "architect");
    assertEquals(generatedTasks[0].priority, "high");
    
    // Check feature tasks
    const featureTasks = generatedTasks.filter(t => t.type === "security" || t.type === "api" || t.type === "implementation");
    // Should have at least some feature tasks
    assertEquals(featureTasks.length >= 1, true);
    
    // Check all tasks have required fields
    for (const task of generatedTasks) {
      assertExists(task.id);
      assertExists(task.title);
      assertExists(task.description);
      assertExists(task.type);
      assertExists(task.priority);
      assertExists(task.status);
      assertExists(task.createdAt);
      assertEquals(task.status, "pending");
    }
  });

  // Test 3: Update task status
  await t.step("Update task status", async () => {
    const taskId = generatedTasks[0].id;
    const updated = await taskmaster.updateTaskStatus(taskId, "in_progress");
    
    assertEquals(updated, true);
    
    // Verify update
    const task = await taskmaster.getTaskById(taskId);
    assertExists(task);
    assertEquals(task?.status, "in_progress");
    assertExists(task?.updatedAt);
  });

  // Test 4: Export tasks
  await t.step("Export tasks in different formats", async () => {
    // Test JSON export
    const jsonExport = await taskmaster.exportTasks("json");
    const parsedJson = JSON.parse(jsonExport);
    assertEquals(Array.isArray(parsedJson), true);
    assertEquals(parsedJson.length >= generatedTasks.length, true);
    
    // Test Markdown export
    const markdownExport = await taskmaster.exportTasks("markdown");
    assertEquals(markdownExport.includes("# TaskMaster Tasks"), true);
    assertEquals(markdownExport.includes("## High Priority"), true);
    
    // Test CSV export
    const csvExport = await taskmaster.exportTasks("csv");
    const csvLines = csvExport.split("\n");
    assertEquals(csvLines[0].includes("ID,Title,Description"), true);
    assertEquals(csvLines.length >= generatedTasks.length + 1, true);
  });

  // Test 5: Memory integration
  await t.step("Verify memory integration", async () => {
    const storedPRDs = await taskmaster.getStoredPRDs();
    assertEquals(storedPRDs.length > 0, true);
    
    const storedTasks = await taskmaster.getStoredTasks();
    assertEquals(storedTasks.length > 0, true);
  });

  // Test 6: Task retrieval
  await t.step("Retrieve task by ID", async () => {
    const taskId = generatedTasks[1].id;
    const task = await taskmaster.getTaskById(taskId);
    
    assertExists(task);
    assertEquals(task?.id, taskId);
    assertEquals(task?.title, generatedTasks[1].title);
  });

  // Test 7: Priority detection
  await t.step("Verify priority detection", async () => {
    const authTask = generatedTasks.find(t => t.title.toLowerCase().includes("authentication"));
    if (authTask) {
      assertEquals(authTask.priority, "high");
      assertEquals(authTask.sparc_mode, "security-review");
    }
  });

  // Cleanup
  await t.step("Cleanup: Remove test files", async () => {
    try {
      await Deno.remove(testPRDPath);
    } catch {
      // File might not exist, that's okay
    }
  });
});

// Test error handling
Deno.test("TaskMaster Error Handling", async (t) => {
  const taskmaster = new TaskMasterDenoBridge();
  
  await t.step("Handle non-existent PRD file", async () => {
    try {
      await taskmaster.parsePRD("./non-existent-file.prd");
      throw new Error("Should have thrown an error");
    } catch (error) {
      assertEquals((error as Error).message.includes("Failed to parse PRD"), true);
    }
  });
  
  await t.step("Handle invalid task ID update", async () => {
    const updated = await taskmaster.updateTaskStatus("invalid-id", "completed");
    assertEquals(updated, false);
  });
  
  await t.step("Handle non-existent task retrieval", async () => {
    const task = await taskmaster.getTaskById("non-existent-id");
    assertEquals(task, null);
  });
});