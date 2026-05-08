const User = require('../models/User');
const Course = require('../models/Course');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'enrolledCourses.course',
        select: 'title thumbnail instructor duration price rating'
      })
      .populate({
        path: 'wishlist',
        select: 'title thumbnail price rating instructor'
      })
      .populate({
        path: 'quizResults.quiz',
        select: 'title course'
      });

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const { email, profile } = req.body;

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({
        $and: [
          { _id: { $ne: req.user._id } },
          { email }
        ]
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { email, profile },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user's enrolled courses
// @route   GET /api/users/courses
// @access  Private
const getUserCourses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'enrolledCourses.course',
        select: 'title description thumbnail instructor duration lessons rating',
        populate: {
          path: 'instructor',
          select: 'profile.fullname'
        }
      });

    const courses = user.enrolledCourses.map(enrollment => ({
      ...enrollment.course.toObject(),
      enrollment: {
        enrolledAt: enrollment.enrolledAt,
        progress: enrollment.progress,
        completed: enrollment.completed
      }
    }));

    res.json({
      success: true,
      data: { courses }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update course progress
// @route   PUT /api/users/courses/:courseId/progress
// @access  Private
const updateCourseProgress = async (req, res) => {
  try {
    const { progress, completed } = req.body;

    // Validate progress
    if (progress < 0 || progress > 100) {
      return res.status(400).json({
        success: false,
        message: 'Progress must be between 0 and 100'
      });
    }

    const user = await User.findById(req.user._id);

    // Find the enrolled course
    const enrolledCourse = user.enrolledCourses.find(
      ec => ec.course.toString() === req.params.courseId
    );

    if (!enrolledCourse) {
      return res.status(404).json({
        success: false,
        message: 'Course not found in enrolled courses'
      });
    }

    // Update progress
    enrolledCourse.progress = progress;
    if (completed !== undefined) {
      enrolledCourse.completed = completed;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Progress updated successfully',
      data: {
        courseId: req.params.courseId,
        progress: enrolledCourse.progress,
        completed: enrolledCourse.completed
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user's wishlist
// @route   GET /api/users/wishlist
// @access  Private
const getUserWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'wishlist',
        select: 'title description thumbnail price rating instructor category level',
        populate: {
          path: 'instructor',
          select: 'profile.fullname'
        }
      });

    res.json({
      success: true,
      data: { wishlist: user.wishlist }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user's quiz results
// @route   GET /api/users/quiz-results
// @access  Private
const getUserQuizResults = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'quizResults.quiz',
        select: 'title course passingScore timeLimit',
        populate: {
          path: 'course',
          select: 'title'
        }
      });

    const quizResults = user.quizResults.map(result => ({
      quiz: result.quiz,
      score: result.score,
      totalQuestions: result.totalQuestions,
      passed: result.score >= result.quiz.passingScore,
      completedAt: result.completedAt
    }));

    res.json({
      success: true,
      data: { quizResults }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private (Admin)
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, isActive } = req.query;

    let query = {};

    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { 'profile.fullname': { $regex: search, $options: 'i' } }
      ];
    }

    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: '-createdAt',
      select: '-password'
    };

    const users = await User.find(query)
      .sort(options.sort)
      .limit(options.limit)
      .skip((options.page - 1) * options.limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: options.page,
          limit: options.limit,
          total,
          pages: Math.ceil(total / options.limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user status (Admin only)
// @route   PUT /api/users/:id/status
// @access  Private (Admin)
const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getUserCourses,
  updateCourseProgress,
  getUserWishlist,
  getUserQuizResults,
  getUsers,
  updateUserStatus
};