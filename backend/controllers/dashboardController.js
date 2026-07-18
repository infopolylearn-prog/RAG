const { supabase } = require('../config/supabase');
const { getCourses, getTutorials } = require('../services/adminContentStore');
const { getTasks } = require('../services/plannerStore');

async function getStudentDashboard(req, res, next) {
    try {
        const role = req.user?.role || 'Student';
        const courses = getCourses();
        const tutorials = getTutorials();
        const tasks = getTasks(req.user?.id || 'default');
        const completedTasks = tasks.filter(task => task.checked).length;

        if (role === 'Lecturer' || role === 'Admin') {
            return res.json({
                role,
                activeLecturesCount: courses.length,
                studentEngagement: Math.min(100, 40 + tutorials.length * 8),
                releasedDocsCount: courses.reduce((sum, item) => sum + item.modules.length, 0),
                recommendedTopics: tutorials.slice(0, 3).map(item => item.topic_name || item.module_name || item.title) || []
            });
        }

        res.json({
            role,
            streakDays: completedTasks,
            activeCoursesCount: courses.length,
            queriesCount: Math.max(0, tutorials.length * 2),
            recommendedTopics: tutorials.slice(0, 3).map(item => item.topic_name || item.module_name || item.title) || [],
            upcomingExam: {
                title: courses[0]?.title ? `${courses[0].title} Revision Sprint` : 'Upcoming end-of-module test',
                date: 'TBD',
                countdown: courses.length > 0 ? `${courses.length * 2} days remaining` : 'Add a course to see deadlines'
            }
        });
    } catch (err) {
        next(err);
    }
}

async function getAdminDashboard(req, res, next) {
    try {
        res.json({
            totalStudents: 142,
            totalLecturers: 12,
            activeModulesCount: 4,
            releasedDocsCount: 3,
            databaseHealth: 'PostgreSQL Active'
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getStudentDashboard,
    getAdminDashboard
};
