const { supabase } = require('../config/supabase');

async function getStudentDashboard(req, res, next) {
    try {
        const role = req.user?.role || 'Student';
        if (role === 'Lecturer' || role === 'Admin') {
            return res.json({
                role,
                activeLecturesCount: 3,
                studentEngagement: 92,
                releasedDocsCount: 4,
                recommendedTopics: [
                    'Assignment Review',
                    'Course Delivery',
                    'Assessment Planning'
                ]
            });
        }

        res.json({
            role,
            streakDays: 5,
            activeCoursesCount: 2,
            queriesCount: 12,
            recommendedTopics: [
                'Relational Schemas',
                '3NF Normalization',
                'TCP vs UDP Handshake'
            ],
            upcomingExam: {
                title: 'CS301: Relational Schema & Normalization Exam',
                date: 'July 21, 2026',
                countdown: '4 Days Left'
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
