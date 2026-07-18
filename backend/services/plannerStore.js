const fs = require('fs');
const path = require('path');

const storageFile = path.join(__dirname, '..', 'data', 'planner-tasks.json');
const tasksByUserId = new Map();

function ensureStorageFile() {
    const dir = path.dirname(storageFile);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(storageFile)) {
        fs.writeFileSync(storageFile, JSON.stringify({}, null, 2));
    }
}

function loadState() {
    ensureStorageFile();
    try {
        const raw = fs.readFileSync(storageFile, 'utf8');
        const parsed = JSON.parse(raw);
        Object.entries(parsed).forEach(([userId, tasks]) => {
            tasksByUserId.set(userId, Array.isArray(tasks) ? tasks : []);
        });
    } catch (err) {
        console.warn('⚠️ Failed to load planner store from disk:', err.message);
    }
}

function saveState() {
    ensureStorageFile();
    const snapshot = {};
    tasksByUserId.forEach((tasks, userId) => {
        snapshot[userId] = tasks;
    });
    fs.writeFileSync(storageFile, JSON.stringify(snapshot, null, 2));
}

loadState();

function getTasks(userId) {
    const tasks = tasksByUserId.get(userId) || [];
    return tasks;
}

function createTask(userId, payload = {}) {
    const list = tasksByUserId.get(userId) || [];
    const nextTask = {
        id: payload.id || `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        text: payload.text || payload.task_text || 'Untitled task',
        checked: Boolean(payload.checked ?? payload.completed ?? false),
        priority: (payload.priority || 'Medium').toString().charAt(0).toUpperCase() + (payload.priority || 'Medium').toString().slice(1).toLowerCase(),
        createdAt: new Date().toISOString()
    };

    list.unshift(nextTask);
    tasksByUserId.set(userId, list);
    saveState();
    return nextTask;
}

function updateTask(userId, taskId, updates = {}) {
    const list = tasksByUserId.get(userId) || [];
    const index = list.findIndex(item => String(item.id) === String(taskId));
    if (index === -1) {
        return null;
    }

    list[index] = {
        ...list[index],
        ...updates,
        text: updates.text || updates.task_text || list[index].text,
        checked: updates.checked !== undefined ? Boolean(updates.checked) : list[index].checked,
        priority: updates.priority ? updates.priority.charAt(0).toUpperCase() + updates.priority.slice(1).toLowerCase() : list[index].priority
    };

    tasksByUserId.set(userId, list);
    saveState();
    return list[index];
}

function deleteTask(userId, taskId) {
    const list = tasksByUserId.get(userId) || [];
    const filtered = list.filter(item => String(item.id) !== String(taskId));
    tasksByUserId.set(userId, filtered);
    saveState();
    return filtered;
}

function clearCompleted(userId) {
    const list = (tasksByUserId.get(userId) || []).filter(item => !item.checked);
    tasksByUserId.set(userId, list);
    saveState();
    return list;
}

module.exports = {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    clearCompleted
};
