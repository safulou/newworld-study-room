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
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed)
        ? parsed.map((t) => ({
            ...t,
            targetPomodoros: Math.max(1, Math.min(20, Number(t.targetPomodoros) || 2)),
          }))
        : [];
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

  addTask(title, targetPomodoros = 2) {
    const trimmed = (title || "").trim();
    if (!trimmed) return null;

    const target = Math.max(1, Math.min(20, Math.round(Number(targetPomodoros)) || 2));
    const task = {
      id: "task_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      title: trimmed,
      completed: false,
      pomodoros: 0,
      targetPomodoros: target,
      createdAt: new Date().toISOString(),
    };

    this.tasks.push(task);
    this.saveTasks();
    return task;
  }

  setTargetPomodoros(id, target) {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) return null;
    task.targetPomodoros = Math.max(1, Math.min(20, Math.round(Number(target)) || 1));
    this.saveTasks();
    return task.targetPomodoros;
  }

  moveTask(id, direction = "up") {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) return false;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= this.tasks.length) return false;
    const [task] = this.tasks.splice(index, 1);
    this.tasks.splice(targetIndex, 0, task);
    this.saveTasks();
    return true;
  }

  reorderTasks(orderedIds) {
    if (!Array.isArray(orderedIds)) return false;
    const idMap = new Map(this.tasks.map((t) => [t.id, t]));
    const reordered = [];
    for (const id of orderedIds) {
      if (idMap.has(id)) {
        reordered.push(idMap.get(id));
        idMap.delete(id);
      }
    }
    idMap.forEach((task) => reordered.push(task));
    this.tasks = reordered;
    this.saveTasks();
    return true;
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
    const totalTargetPomodoros = this.tasks.reduce((sum, t) => sum + (t.targetPomodoros || 1), 0);
    return {
      total,
      completed,
      pending: total - completed,
      totalPomodoros,
      totalTargetPomodoros,
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
        this.tasks = parsed.map((t) => ({
          ...t,
          targetPomodoros: Math.max(1, Math.min(20, Number(t.targetPomodoros) || 2)),
        }));
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
