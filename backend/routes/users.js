const express = require('express');
const {
  getUserProfile,
  updateUserProfile,
  getUserCourses,
  updateCourseProgress,
  getUserWishlist,
  getUserQuizResults,
  getUsers,
  updateUserStatus
} = require('../controllers/userController');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Protected routes (all users)
router.get('/profile', auth, getUserProfile);
router.put('/profile', auth, updateUserProfile);
router.get('/courses', auth, getUserCourses);
router.put('/courses/:courseId/progress', auth, updateCourseProgress);
router.get('/wishlist', auth, getUserWishlist);
router.get('/quiz-results', auth, getUserQuizResults);

// Admin only routes
router.get('/', auth, adminAuth, getUsers);
router.put('/:id/status', auth, adminAuth, updateUserStatus);

module.exports = router;