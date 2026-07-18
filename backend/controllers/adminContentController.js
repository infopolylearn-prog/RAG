const {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  addModule,
  updateModule,
  deleteModule,
  getTutorials,
  createTutorial,
  updateTutorial,
  deleteTutorial,
  getStudyCards,
  createStudyCard,
  deleteStudyCard,
  getRevisionItems,
  createRevisionItem,
  deleteRevisionItem
} = require('../services/adminContentStore');

function listCourses(req, res, next) {
  try {
    res.json(getCourses());
  } catch (err) {
    next(err);
  }
}

function createCourseHandler(req, res, next) {
  try {
    const course = createCourse(req.body);
    res.status(201).json(course);
  } catch (err) {
    next(err);
  }
}

function updateCourseHandler(req, res, next) {
  try {
    const course = updateCourse(req.params.id, req.body);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json(course);
  } catch (err) {
    next(err);
  }
}

function deleteCourseHandler(req, res, next) {
  try {
    const deleted = deleteCourse(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    next(err);
  }
}

function addModuleHandler(req, res, next) {
  try {
    const moduleItem = addModule(req.params.courseId, req.body);
    if (!moduleItem) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.status(201).json(moduleItem);
  } catch (err) {
    next(err);
  }
}

function updateModuleHandler(req, res, next) {
  try {
    const moduleItem = updateModule(req.params.courseId, req.params.moduleId, req.body);
    if (!moduleItem) {
      return res.status(404).json({ error: 'Course or module not found' });
    }
    res.json(moduleItem);
  } catch (err) {
    next(err);
  }
}

function deleteModuleHandler(req, res, next) {
  try {
    const deleted = deleteModule(req.params.courseId, req.params.moduleId);
    if (!deleted) {
      return res.status(404).json({ error: 'Course or module not found' });
    }
    res.json({ message: 'Module removed successfully' });
  } catch (err) {
    next(err);
  }
}

function listTutorials(req, res, next) {
  try {
    res.json(getTutorials());
  } catch (err) {
    next(err);
  }
}

function createTutorialHandler(req, res, next) {
  try {
    const tutorial = createTutorial(req.body);
    res.status(201).json(tutorial);
  } catch (err) {
    next(err);
  }
}

function updateTutorialHandler(req, res, next) {
  try {
    const tutorial = updateTutorial(req.params.id, req.body);
    if (!tutorial) {
      return res.status(404).json({ error: 'Tutorial not found' });
    }
    res.json(tutorial);
  } catch (err) {
    next(err);
  }
}

function deleteTutorialHandler(req, res, next) {
  try {
    const deleted = deleteTutorial(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Tutorial not found' });
    }
    res.json({ message: 'Tutorial deleted successfully' });
  } catch (err) {
    next(err);
  }
}

function listStudyCardsHandler(req, res, next) {
  try {
    res.json(getStudyCards());
  } catch (err) {
    next(err);
  }
}

function createStudyCardHandler(req, res, next) {
  try {
    const card = createStudyCard(req.body);
    res.status(201).json(card);
  } catch (err) {
    next(err);
  }
}

function deleteStudyCardHandler(req, res, next) {
  try {
    const deleted = deleteStudyCard(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Study card not found' });
    }
    res.json({ message: 'Study card deleted successfully' });
  } catch (err) {
    next(err);
  }
}

function listRevisionItemsHandler(req, res, next) {
  try {
    res.json(getRevisionItems());
  } catch (err) {
    next(err);
  }
}

function createRevisionItemHandler(req, res, next) {
  try {
    const item = createRevisionItem(req.body);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

function deleteRevisionItemHandler(req, res, next) {
  try {
    const deleted = deleteRevisionItem(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Revision item not found' });
    }
    res.json({ message: 'Revision item deleted successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listCourses,
  createCourseHandler,
  updateCourseHandler,
  deleteCourseHandler,
  addModuleHandler,
  updateModuleHandler,
  deleteModuleHandler,
  listTutorials,
  createTutorialHandler,
  updateTutorialHandler,
  deleteTutorialHandler,
  listStudyCardsHandler,
  createStudyCardHandler,
  deleteStudyCardHandler,
  listRevisionItemsHandler,
  createRevisionItemHandler,
  deleteRevisionItemHandler
};
