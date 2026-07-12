const express = require('express');
const {
  getDashboardStats,
  getAllCourses,
  updateCourseStatus,
  getAllQuizzes,
  updateQuizStatus,
  getUserAnalytics,
  getCourseAnalytics
} = require('../controllers/adminController');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(auth);
router.use(adminAuth);

// Dashboard and analytics
router.get('/dashboard', getDashboardStats);
router.get('/analytics/users', getUserAnalytics);
router.get('/analytics/courses', getCourseAnalytics);

// Course management
router.get('/courses', getAllCourses);
router.put('/courses/:id/status', updateCourseStatus);

// Quiz management
router.get('/quizzes', getAllQuizzes);
router.put('/quizzes/:id/status', updateQuizStatus);

module.exports = router;