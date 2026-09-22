/**
 * Study Task Tracker Service
 * Manages daily study checklist with Pomodoro session associations and localStorage persistence.
 */

const STORAGE_KEY = "newworld_study_tasks_v1";

export class TaskTracker {
  constructor(storage = typeof localStorage !== "undefined" ? localStorage : null) {
    this.storage = storage;
    this.tasks = this.loadTasks();
  }

  loadTasks() {
    if (!this.storage) return [];
    try {
      const raw = this.storage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  saveTasks() {
    if (!this.storage) return;
    try {
      this.storage.setItem(STORAGE_KEY, JSON.stringify(this.tasks));
    } catch {}
  }

  addTask(title) {
    const trimmed = (title || "").trim();
    if (!trimmed) return null;

    const task = {
      id: "task_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      title: trimmed,
      completed: false,
      pomodoros: 0,
      createdAt: new Date().toISOString(),
    };

    this.tasks.push(task);
    this.saveTasks();
    return task;
  }

  toggleTask(id) {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) return false;
    task.completed = !task.completed;
    this.saveTasks();
    return task.completed;
  }

  removeTask(id) {
    const initialLen = this.tasks.length;
    this.tasks = this.tasks.filter((t) => t.id !== id);
    if (this.tasks.length !== initialLen) {
      this.saveTasks();
      return true;
    }
    return false;
  }

  incrementPomodoro(id) {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) return 0;
    task.pomodoros = (task.pomodoros || 0) + 1;
    this.saveTasks();
    return task.pomodoros;
  }

  getActiveTasks() {
    return this.tasks.filter((t) => !t.completed);
  }

  getCompletedTasks() {
    return this.tasks.filter((t) => t.completed);
  }

  getSummary() {
    const total = this.tasks.length;
    const completed = this.getCompletedTasks().length;
    const totalPomodoros = this.tasks.reduce((sum, t) => sum + (t.pomodoros || 0), 0);
    return {
      total,
      completed,
      pending: total - completed,
      totalPomodoros,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }

  exportJson() {
    return JSON.stringify(this.tasks, null, 2);
  }

  importJson(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed)) {
        this.tasks = parsed;
        this.saveTasks();
        return true;
      }
    } catch {}
    return false;
  }

  clearCompleted() {
    this.tasks = this.tasks.filter((t) => !t.completed);
    this.saveTasks();
  }
}
