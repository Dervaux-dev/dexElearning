const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const User = require('../models/User');
const Course = require('../models/Course');

// @desc    Get quizzes for a course
// @route   GET /api/quizzes/course/:courseId
// @access  Private (Enrolled students)
const getQuizzesByCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is enrolled or is the instructor
    const isEnrolled = course.enrolledStudents.includes(req.user._id);
    const isInstructor = course.instructor.toString() === req.user._id.toString();

    if (!isEnrolled && !isInstructor && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view quizzes'
      });
    }

    const quizzes = await Quiz.find({
      course: req.params.courseId,
      isPublished: true,
      isActive: true
    })
    .populate('instructor', 'profile.fullname profile')
    .sort('createdAt');

    res.json({
      success: true,
      data: { quizzes }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single quiz
// @route   GET /api/quizzes/:id
// @access  Private (Enrolled students/Instructor)
const getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('course', 'title instructor')
      .populate('instructor', 'profile.fullname profile')
      .populate('questions');

    if (!quiz || !quiz.isPublished || !quiz.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Check authorization
    const course = await Course.findById(quiz.course);
    const isEnrolled = course.enrolledStudents.includes(req.user._id);
    const isInstructor = quiz.instructor.toString() === req.user._id.toString();

    if (!isEnrolled && !isInstructor && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this quiz'
      });
    }

    // If student, don't show answers
    if (!isInstructor && req.user.role !== 'admin') {
      quiz.questions = quiz.questions.map(question => {
        const { options, ...questionWithoutAnswers } = question.toObject();
        if (question.questionType === 'multiple-choice') {
          questionWithoutAnswers.options = options.map(({ isCorrect, ...option }) => option);
        }
        return questionWithoutAnswers;
      });
    }

    res.json({
      success: true,
      data: { quiz }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create quiz
// @route   POST /api/quizzes
// @access  Private (Instructor/Admin)
const createQuiz = async (req, res) => {
  try {
    const { courseId, ...quizData } = req.body;

    // Verify course exists and user is instructor
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create quiz for this course'
      });
    }

    const quiz = await Quiz.create({
      ...quizData,
      course: courseId,
      instructor: req.user._id
    });

    await quiz.populate(['course', 'instructor']);

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: { quiz }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update quiz
// @route   PUT /api/quizzes/:id
// @access  Private (Instructor/Admin)
const updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    if (quiz.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this quiz'
      });
    }

    const updatedQuiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate(['course', 'instructor']);

    res.json({
      success: true,
      message: 'Quiz updated successfully',
      data: { quiz: updatedQuiz }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete quiz
// @route   DELETE /api/quizzes/:id
// @access  Private (Instructor/Admin)
const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    if (quiz.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this quiz'
      });
    }

    await Quiz.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Submit quiz answers
// @route   POST /api/quizzes/:id/submit
// @access  Private (Enrolled students)
const submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body; // Array of { questionId, selectedAnswer }

    const quiz = await Quiz.findById(req.params.id).populate('questions');
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Check if user is enrolled
    const course = await Course.findById(quiz.course);
    if (!course.enrolledStudents.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not enrolled in this course'
      });
    }

    // Check attempt limit
    const user = await User.findById(req.user._id);
    const previousAttempts = user.quizResults.filter(
      result => result.quiz.toString() === quiz._id.toString()
    ).length;

    if (previousAttempts >= quiz.maxAttempts) {
      return res.status(400).json({
        success: false,
        message: 'Maximum attempts reached'
      });
    }

    // Calculate score
    let correctAnswers = 0;
    const detailedAnswers = [];

    for (const answer of answers) {
      const question = quiz.questions.find(q => q._id.toString() === answer.questionId);

      if (question) {
        let isCorrect = false;

        if (question.questionType === 'multiple-choice') {
          const correctOption = question.options.find(opt => opt.isCorrect);
          isCorrect = correctOption && correctOption.text === answer.selectedAnswer;
        } else if (question.questionType === 'true-false') {
          isCorrect = question.correctAnswer.toLowerCase() === answer.selectedAnswer.toLowerCase();
        } else if (question.questionType === 'short-answer') {
          // For short answer, we'll need manual grading or exact match
          isCorrect = question.correctAnswer.toLowerCase().trim() === answer.selectedAnswer.toLowerCase().trim();
        }

        if (isCorrect) correctAnswers++;

        detailedAnswers.push({
          question: question._id,
          selectedAnswer: answer.selectedAnswer,
          isCorrect
        });
      }
    }

    const score = (correctAnswers / quiz.questions.length) * 100;
    const passed = score >= quiz.passingScore;

    // Save result
    const quizResult = {
      quiz: quiz._id,
      score,
      totalQuestions: quiz.questions.length,
      answers: detailedAnswers,
      completedAt: new Date()
    };

    user.quizResults.push(quizResult);
    await user.save();

    res.json({
      success: true,
      message: 'Quiz submitted successfully',
      data: {
        score,
        totalQuestions: quiz.questions.length,
        correctAnswers,
        passed,
        passingScore: quiz.passingScore
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get quiz results for user
// @route   GET /api/quizzes/:id/results
// @access  Private
const getQuizResults = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'quizResults.quiz',
        select: 'title course passingScore'
      });

    const quizResults = user.quizResults.filter(
      result => result.quiz._id.toString() === req.params.id
    );

    res.json({
      success: true,
      data: { results: quizResults }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getQuizzesByCourse,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuiz,
  getQuizResults
};