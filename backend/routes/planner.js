const express = require('express');
const router = express.Router();
const plannerController = require('../controllers/plannerController');
const { verifyToken } = require('../middleware/auth');

router.get('/tasks', verifyToken, plannerController.listTasks);
router.post('/tasks', verifyToken, plannerController.createTaskHandler);
router.put('/tasks/:id', verifyToken, plannerController.updateTaskHandler);
router.delete('/tasks/:id', verifyToken, plannerController.deleteTaskHandler);
router.delete('/tasks', verifyToken, plannerController.deleteTaskHandler);

module.exports = router;
