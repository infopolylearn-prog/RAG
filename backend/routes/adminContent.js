const express = require('express');
const router = express.Router();
const adminContentController = require('../controllers/adminContentController');
const { verifyToken, requireRole } = require('../middleware/auth');

// Course and module management
router.get('/courses', verifyToken, adminContentController.listCourses);
router.post('/courses', verifyToken, requireRole(['Admin']), adminContentController.createCourseHandler);
router.put('/courses/:id', verifyToken, requireRole(['Admin']), adminContentController.updateCourseHandler);
router.delete('/courses/:id', verifyToken, requireRole(['Admin']), adminContentController.deleteCourseHandler);
router.post('/courses/:courseId/modules', verifyToken, requireRole(['Admin']), adminContentController.addModuleHandler);
router.put('/courses/:courseId/modules/:moduleId', verifyToken, requireRole(['Admin']), adminContentController.updateModuleHandler);
router.delete('/courses/:courseId/modules/:moduleId', verifyToken, requireRole(['Admin']), adminContentController.deleteModuleHandler);

// Tutorials and study content
router.get('/tutorials', verifyToken, adminContentController.listTutorials);
router.post('/tutorials', verifyToken, requireRole(['Admin']), adminContentController.createTutorialHandler);
router.put('/tutorials/:id', verifyToken, requireRole(['Admin']), adminContentController.updateTutorialHandler);
router.delete('/tutorials/:id', verifyToken, requireRole(['Admin']), adminContentController.deleteTutorialHandler);

router.get('/study-cards', verifyToken, adminContentController.listStudyCardsHandler);
router.post('/study-cards', verifyToken, requireRole(['Admin']), adminContentController.createStudyCardHandler);
router.delete('/study-cards/:id', verifyToken, requireRole(['Admin']), adminContentController.deleteStudyCardHandler);

router.get('/revision-items', verifyToken, adminContentController.listRevisionItemsHandler);
router.post('/revision-items', verifyToken, requireRole(['Admin']), adminContentController.createRevisionItemHandler);
router.delete('/revision-items/:id', verifyToken, requireRole(['Admin']), adminContentController.deleteRevisionItemHandler);

module.exports = router;
