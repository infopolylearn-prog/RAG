const { getTasks, createTask, updateTask, deleteTask, clearCompleted } = require('../services/plannerStore');

async function listTasks(req, res, next) {
    try {
        const userId = req.user?.id || req.query.user_id || 'default';
        res.json(getTasks(userId));
    } catch (err) {
        next(err);
    }
}

async function createTaskHandler(req, res, next) {
    try {
        const userId = req.user?.id || req.body.user_id || 'default';
        const task = createTask(userId, req.body);
        res.status(201).json(task);
    } catch (err) {
        next(err);
    }
}

async function updateTaskHandler(req, res, next) {
    try {
        const userId = req.user?.id || req.body.user_id || 'default';
        const task = updateTask(userId, req.params.id, req.body);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json(task);
    } catch (err) {
        next(err);
    }
}

async function deleteTaskHandler(req, res, next) {
    try {
        const userId = req.user?.id || req.query.user_id || 'default';
        if (req.query.clearCompleted === 'true') {
            const tasks = clearCompleted(userId);
            return res.json({ message: 'Completed tasks cleared', tasks });
        }
        deleteTask(userId, req.params.id);
        res.json({ message: 'Task removed' });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    listTasks,
    createTaskHandler,
    updateTaskHandler,
    deleteTaskHandler
};
