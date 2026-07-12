const User = require('../models/User');
const Course = require('../models/Course');
const Quiz = require('../models/Quiz');

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalCourses,
      totalQuizzes,
      activeUsers,
      publishedCourses,
      recentUsers,
      recentCourses
    ] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      Quiz.countDocuments(),
      User.countDocuments({ isActive: true }),
      Course.countDocuments({ isPublished: true }),
      User.find({ isActive: true }).sort('-createdAt').limit(5).select('profile.fullname email createdAt'),
      Course.find({ isPublished: true }).sort('-createdAt').limit(5)
        .populate('instructor', 'username')
        .select('title createdAt instructor')
    ]);

    // Calculate enrollment stats
    const courses = await Course.find({ isPublished: true }).select('enrolledStudents');
    const totalEnrollments = courses.reduce((sum, course) => sum + course.enrolledStudents.length, 0);

    // Calculate average rating
    const ratedCourses = await Course.find({ 'rating.count': { $gt: 0 } }).select('rating');
    const averageRating = ratedCourses.length > 0
      ? ratedCourses.reduce((sum, course) => sum + course.rating.average, 0) / ratedCourses.length
      : 0;

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalCourses,
          totalQuizzes,
          activeUsers,
          publishedCourses,
          totalEnrollments,
          averageRating: Math.round(averageRating * 10) / 10
        },
        recent: {
          users: recentUsers,
          courses: recentCourses
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

// @desc    Get all courses (Admin)
// @route   GET /api/admin/courses
// @access  Private (Admin)
const getAllCourses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      isPublished,
      instructor
    } = req.query;

    let query = {};

    if (search) {
      query.$text = { $search: search };
    }
    if (category) query.category = category;
    if (isPublished !== undefined) query.isPublished = isPublished === 'true';
    if (instructor) query.instructor = instructor;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: '-createdAt',
      populate: [
        { path: 'instructor', select: 'profile.fullname email' },
        { path: 'enrolledStudents', select: 'profile.fullname' }
      ]
    };

    const courses = await Course.find(query)
      .populate(options.populate)
      .sort(options.sort)
      .limit(options.limit)
      .skip((options.page - 1) * options.limit);

    const total = await Course.countDocuments(query);

    res.json({
      success: true,
      data: {
        courses,
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

// @desc    Update course status (Admin)
// @route   PUT /api/admin/courses/:id/status
// @access  Private (Admin)
const updateCourseStatus = async (req, res) => {
  try {
    const { isPublished, isActive } = req.body;

    const updateData = {};
    if (isPublished !== undefined) updateData.isPublished = isPublished;
    if (isActive !== undefined) updateData.isActive = isActive;

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('instructor', 'profile.fullname profile');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      message: 'Course status updated successfully',
      data: { course }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all quizzes (Admin)
// @route   GET /api/admin/quizzes
// @access  Private (Admin)
const getAllQuizzes = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      course,
      isPublished
    } = req.query;

    let query = {};

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    if (course) query.course = course;
    if (isPublished !== undefined) query.isPublished = isPublished === 'true';

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: '-createdAt',
      populate: [
        { path: 'course', select: 'title' },
        { path: 'instructor', select: 'profile.fullname' }
      ]
    };

    const quizzes = await Quiz.find(query)
      .populate(options.populate)
      .sort(options.sort)
      .limit(options.limit)
      .skip((options.page - 1) * options.limit);

    const total = await Quiz.countDocuments(query);

    res.json({
      success: true,
      data: {
        quizzes,
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

// @desc    Update quiz status (Admin)
// @route   PUT /api/admin/quizzes/:id/status
// @access  Private (Admin)
const updateQuizStatus = async (req, res) => {
  try {
    const { isPublished, isActive } = req.body;

    const updateData = {};
    if (isPublished !== undefined) updateData.isPublished = isPublished;
    if (isActive !== undefined) updateData.isActive = isActive;

    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate(['course', 'instructor']);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    res.json({
      success: true,
      message: 'Quiz status updated successfully',
      data: { quiz }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user analytics
// @route   GET /api/admin/analytics/users
// @access  Private (Admin)
const getUserAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const [
      newUsers,
      activeUsers,
      userRoles,
      enrollmentStats
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: startDate } }),
      User.countDocuments({ lastLogin: { $gte: startDate } }),
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]),
      User.aggregate([
        { $unwind: '$enrolledCourses' },
        { $group: { _id: null, totalEnrollments: { $sum: 1 } } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        period: `${period} days`,
        newUsers,
        activeUsers,
        userRoles,
        totalEnrollments: enrollmentStats[0]?.totalEnrollments || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get course analytics
// @route   GET /api/admin/analytics/courses
// @access  Private (Admin)
const getCourseAnalytics = async (req, res) => {
  try {
    const [
      categoryStats,
      levelStats,
      topRatedCourses,
      mostEnrolledCourses
    ] = await Promise.all([
      Course.aggregate([
        { $match: { isPublished: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      Course.aggregate([
        { $match: { isPublished: true } },
        { $group: { _id: '$level', count: { $sum: 1 } } }
      ]),
      Course.find({ isPublished: true, 'rating.count': { $gt: 0 } })
        .sort('-rating.average')
        .limit(5)
        .select('title rating'),
      Course.aggregate([
        { $match: { isPublished: true } },
        { $addFields: { enrollmentCount: { $size: '$enrolledStudents' } } },
        { $sort: { enrollmentCount: -1 } },
        { $limit: 5 },
        { $project: { title: 1, enrollmentCount: 1 } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        categoryStats,
        levelStats,
        topRatedCourses,
        mostEnrolledCourses
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getDashboardStats,
  getAllCourses,
  updateCourseStatus,
  getAllQuizzes,
  updateQuizStatus,
  getUserAnalytics,
  getCourseAnalytics
};