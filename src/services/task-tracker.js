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

  importMarkdown(markdownText) {
    if (typeof markdownText !== "string") return [];
    const lines = markdownText.split("\n");
    const addedTasks = [];

    for (const rawLine of lines) {
      let line = rawLine.trim();
      if (!line) continue;

      // 1. Check completed status: - [x] or - [X]
      let completed = false;
      if (/^[-*+]\s*\[([xX])\]/i.test(line)) {
        completed = true;
        line = line.replace(/^[-*+]\s*\[([xX])\]\s*/i, "");
      } else if (/^[-*+]\s*\[\s*\]/.test(line)) {
        completed = false;
        line = line.replace(/^[-*+]\s*\[\s*\]\s*/, "");
      } else if (/^[-*+]\s+/.test(line)) {
        line = line.replace(/^[-*+]\s+/, "");
      } else if (/^\d+[.)]\s+/.test(line)) {
        line = line.replace(/^\d+[.)]\s+/, "");
      }

      // 2. Extract target pomodoros: e.g. (3), [2], 🍅 4, pomo: 2
      let targetPomodoros = 2;
      const pomoMatch = line.match(/(?:\((\d+)\)|\[(\d+)\]|🍅\s*(\d+)|pomo:\s*(\d+))\s*$/i);
      if (pomoMatch) {
        const val = Number(pomoMatch[1] || pomoMatch[2] || pomoMatch[3] || pomoMatch[4]);
        if (Number.isFinite(val) && val > 0) {
          targetPomodoros = Math.max(1, Math.min(20, Math.round(val)));
        }
        line = line.replace(/(?:\((\d+)\)|\[(\d+)\]|🍅\s*(\d+)|pomo:\s*(\d+))\s*$/i, "").trim();
      }

      const title = line.trim();
      if (!title) continue;

      const task = this.addTask(title, targetPomodoros);
      if (task) {
        if (completed) {
          task.completed = true;
          this.saveTasks();
        }
        addedTasks.push(task);
      }
    }

    return addedTasks;
  }

  getForecast(focusMinutes = 25) {
    const activeTasks = this.getActiveTasks();
    const remainingTasksCount = activeTasks.length;
    const remainingPomodoros = activeTasks.reduce(
      (sum, t) => sum + Math.max(1, t.targetPomodoros - (t.pomodoros || 0)),
      0,
    );
    const estimatedMinutes = remainingPomodoros * focusMinutes;
    const hours = Math.floor(estimatedMinutes / 60);
    const mins = estimatedMinutes % 60;
    const durationText = hours > 0 ? (mins > 0 ? `${hours} 小時 ${mins} 分` : `${hours} 小時`) : `${mins} 分鐘`;

    return {
      remainingTasksCount,
      remainingPomodoros,
      estimatedMinutes,
      durationText,
    };
  }

  clearCompleted() {
    const beforeLen = this.tasks.length;
    this.tasks = this.tasks.filter((t) => !t.completed);
    const removedCount = beforeLen - this.tasks.length;
    if (removedCount > 0) {
      this.saveTasks();
    }
    return removedCount;
  }
}
