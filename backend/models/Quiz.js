const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Quiz title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required']
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Instructor is required']
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  timeLimit: {
    type: Number, // Time limit in minutes
    min: [1, 'Time limit must be at least 1 minute'],
    max: [180, 'Time limit cannot exceed 180 minutes']
  },
  passingScore: {
    type: Number,
    min: [0, 'Passing score cannot be negative'],
    max: [100, 'Passing score cannot exceed 100'],
    default: 70
  },
  maxAttempts: {
    type: Number,
    min: [1, 'Maximum attempts must be at least 1'],
    default: 3
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  totalQuestions: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
quizSchema.index({ course: 1 });
quizSchema.index({ instructor: 1 });
quizSchema.index({ isPublished: 1 });

// Pre-save middleware to update totalQuestions
quizSchema.pre('save', function(next) {
  this.totalQuestions = this.questions.length;
  next();
});

module.exports = mongoose.model('Quiz', quizSchema);