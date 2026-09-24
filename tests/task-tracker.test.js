import { describe, it, expect, beforeEach } from "vitest";
import { TaskTracker } from "../src/services/task-tracker.js";

class MockStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  clear() {
    this.store = {};
  }
}

describe("TaskTracker Service", () => {
  let tracker;
  let mockStorage;

  beforeEach(() => {
    mockStorage = new MockStorage();
    tracker = new TaskTracker(mockStorage);
  });

  it("adds tasks and generates valid ids", () => {
    const task = tracker.addTask("Read AI SecOps documentation");
    expect(task).toBeDefined();
    expect(task.title).toBe("Read AI SecOps documentation");
    expect(task.completed).toBe(false);
    expect(task.pomodoros).toBe(0);
    expect(tracker.tasks.length).toBe(1);
  });

  it("rejects empty or whitespace titles", () => {
    const task = tracker.addTask("   ");
    expect(task).toBeNull();
    expect(tracker.tasks.length).toBe(0);
  });

  it("toggles task completion status", () => {
    const task = tracker.addTask("Test Task");
    expect(tracker.toggleTask(task.id)).toBe(true);
    expect(tracker.getCompletedTasks().length).toBe(1);
    expect(tracker.getActiveTasks().length).toBe(0);

    expect(tracker.toggleTask(task.id)).toBe(false);
    expect(tracker.getActiveTasks().length).toBe(1);
  });

  it("increments pomodoro counts", () => {
    const task = tracker.addTask("Study Three.js Shaders");
    expect(tracker.incrementPomodoro(task.id)).toBe(1);
    expect(tracker.incrementPomodoro(task.id)).toBe(2);

    const summary = tracker.getSummary();
    expect(summary.totalPomodoros).toBe(2);
  });

  it("deletes tasks and clears completed", () => {
    const t1 = tracker.addTask("Task 1");
    const t2 = tracker.addTask("Task 2");
    tracker.toggleTask(t1.id);

    tracker.clearCompleted();
    expect(tracker.tasks.length).toBe(1);
    expect(tracker.tasks[0].id).toBe(t2.id);

    expect(tracker.removeTask(t2.id)).toBe(true);
    expect(tracker.tasks.length).toBe(0);
  });

  it("exports and imports JSON state correctly", () => {
    tracker.addTask("Task A");
    tracker.addTask("Task B");
    const json = tracker.exportJson();

    const newTracker = new TaskTracker(new MockStorage());
    const ok = newTracker.importJson(json);
    expect(ok).toBe(true);
    expect(newTracker.tasks.length).toBe(2);
    expect(newTracker.tasks[0].title).toBe("Task A");
  });

  it("supports target pomodoros configuration and summary", () => {
    const t = tracker.addTask("Task with target", 4);
    expect(t.targetPomodoros).toBe(4);
    expect(tracker.setTargetPomodoros(t.id, 6)).toBe(6);
    expect(t.targetPomodoros).toBe(6);

    const summary = tracker.getSummary();
    expect(summary.totalTargetPomodoros).toBe(6);
  });

  it("supports moving tasks up and down", () => {
    const t1 = tracker.addTask("Task 1");
    const t2 = tracker.addTask("Task 2");
    const t3 = tracker.addTask("Task 3");

    expect(tracker.moveTask(t2.id, "up")).toBe(true);
    expect(tracker.tasks[0].id).toBe(t2.id);
    expect(tracker.tasks[1].id).toBe(t1.id);

    expect(tracker.moveTask(t2.id, "up")).toBe(false); // Already at top

    expect(tracker.moveTask(t2.id, "down")).toBe(true);
    expect(tracker.tasks[1].id).toBe(t2.id);

    expect(tracker.moveTask(t3.id, "down")).toBe(false); // Already at bottom
  });

  it("supports reordering tasks with custom id sequence", () => {
    const t1 = tracker.addTask("Task 1");
    const t2 = tracker.addTask("Task 2");
    const t3 = tracker.addTask("Task 3");

    const ok = tracker.reorderTasks([t3.id, t1.id, t2.id]);
    expect(ok).toBe(true);
    expect(tracker.tasks.map((t) => t.id)).toEqual([t3.id, t1.id, t2.id]);
  });
});
