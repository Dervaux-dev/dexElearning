const express = require('express');
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollCourse,
  addToWishlist,
  removeFromWishlist,
  addReview
} = require('../controllers/courseController');
const { auth, optionalAuth } = require('../middleware/auth');
const { validateCourseCreation } = require('../utils/validation');

const router = express.Router();

// Public routes (optional auth for enhanced features)
router.get('/', optionalAuth, getCourses);
router.get('/:id', optionalAuth, getCourse);

// Protected routes
router.post('/', auth, validateCourseCreation, createCourse);
router.put('/:id', auth, updateCourse);
router.delete('/:id', auth, deleteCourse);

// Enrollment and wishlist
router.post('/:id/enroll', auth, enrollCourse);
router.post('/:id/wishlist', auth, addToWishlist);
router.delete('/:id/wishlist', auth, removeFromWishlist);

// Reviews
router.post('/:id/reviews', auth, addReview);

module.exports = router;