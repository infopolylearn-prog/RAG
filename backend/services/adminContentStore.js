const generateId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const adminContent = {
  courses: [],
  tutorials: [],
  studyCards: [],
  revisionItems: []
};

function getCourses() {
  return [...adminContent.courses];
}

function getCourseById(id) {
  return adminContent.courses.find(course => course.id === id) || null;
}

function createCourse(data) {
  const course = {
    id: generateId(),
    title: data.title || 'Untitled course',
    description: data.description || '',
    modules: [],
    createdAt: new Date().toISOString()
  };
  adminContent.courses.unshift(course);
  return course;
}

function updateCourse(id, data) {
  const course = getCourseById(id);
  if (!course) return null;
  course.title = data.title ?? course.title;
  course.description = data.description ?? course.description;
  return course;
}

function deleteCourse(id) {
  const index = adminContent.courses.findIndex(course => course.id === id);
  if (index === -1) return false;
  adminContent.courses.splice(index, 1);
  return true;
}

function addModule(courseId, data) {
  const course = getCourseById(courseId);
  if (!course) return null;
  const module = {
    id: generateId(),
    title: data.title || 'Untitled module',
    description: data.description || '',
    createdAt: new Date().toISOString()
  };
  course.modules.unshift(module);
  return module;
}

function updateModule(courseId, moduleId, data) {
  const course = getCourseById(courseId);
  if (!course) return null;
  const module = course.modules.find(item => item.id === moduleId);
  if (!module) return null;
  module.title = data.title ?? module.title;
  module.description = data.description ?? module.description;
  return module;
}

function deleteModule(courseId, moduleId) {
  const course = getCourseById(courseId);
  if (!course) return false;
  const index = course.modules.findIndex(item => item.id === moduleId);
  if (index === -1) return false;
  course.modules.splice(index, 1);
  return true;
}

function getTutorials() {
  return [...adminContent.tutorials];
}

function createTutorial(data) {
  const tutorial = {
    id: generateId(),
    title: data.title || 'Untitled tutorial',
    module_name: data.module_name || 'General',
    topic_name: data.topic_name || 'Overview',
    video_url: data.video_url || '',
    createdAt: new Date().toISOString()
  };
  adminContent.tutorials.unshift(tutorial);
  return tutorial;
}

function updateTutorial(id, data) {
  const tutorial = adminContent.tutorials.find(item => item.id === id);
  if (!tutorial) return null;
  tutorial.title = data.title ?? tutorial.title;
  tutorial.module_name = data.module_name ?? tutorial.module_name;
  tutorial.topic_name = data.topic_name ?? tutorial.topic_name;
  tutorial.video_url = data.video_url ?? tutorial.video_url;
  return tutorial;
}

function deleteTutorial(id) {
  const index = adminContent.tutorials.findIndex(item => item.id === id);
  if (index === -1) return false;
  adminContent.tutorials.splice(index, 1);
  return true;
}

function getStudyCards() {
  return [...adminContent.studyCards];
}

function createStudyCard(data) {
  const card = {
    id: generateId(),
    title: data.title || 'Study note',
    summary: data.summary || '',
    createdAt: new Date().toISOString()
  };
  adminContent.studyCards.unshift(card);
  return card;
}

function deleteStudyCard(id) {
  const index = adminContent.studyCards.findIndex(item => item.id === id);
  if (index === -1) return false;
  adminContent.studyCards.splice(index, 1);
  return true;
}

function getRevisionItems() {
  return [...adminContent.revisionItems];
}

function createRevisionItem(data) {
  const item = {
    id: generateId(),
    prompt: data.prompt || 'Revision prompt',
    answer: data.answer || '',
    createdAt: new Date().toISOString()
  };
  adminContent.revisionItems.unshift(item);
  return item;
}

function deleteRevisionItem(id) {
  const index = adminContent.revisionItems.findIndex(item => item.id === id);
  if (index === -1) return false;
  adminContent.revisionItems.splice(index, 1);
  return true;
}

module.exports = {
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
};
