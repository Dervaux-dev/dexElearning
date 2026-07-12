const express = require('express');
const {
  getQuizzesByCourse,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuiz,
  getQuizResults
} = require('../controllers/quizController');
const { auth } = require('../middleware/auth');
const { validateQuizCreation } = require('../utils/validation');

const router = express.Router();

// Protected routes
router.get('/course/:courseId', auth, getQuizzesByCourse);
router.get('/:id', auth, getQuiz);
router.get('/:id/results', auth, getQuizResults);

router.post('/', auth, validateQuizCreation, createQuiz);
router.put('/:id', auth, updateQuiz);
router.delete('/:id', auth, deleteQuiz);

router.post('/:id/submit', auth, submitQuiz);

module.exports = router;