const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: [true, 'Quiz reference is required']
  },
  questionText: {
    type: String,
    required: [true, 'Question text is required'],
    maxlength: [500, 'Question text cannot exceed 500 characters']
  },
  questionType: {
    type: String,
    enum: ['multiple-choice', 'true-false', 'short-answer'],
    default: 'multiple-choice'
  },
  options: [{
    text: {
      type: String,
      required: function() {
        return this.questionType === 'multiple-choice';
      }
    },
    isCorrect: {
      type: Boolean,
      default: false
    }
  }],
  correctAnswer: {
    type: String,
    required: function() {
      return this.questionType === 'short-answer' || this.questionType === 'true-false';
    }
  },
  explanation: {
    type: String,
    maxlength: [300, 'Explanation cannot exceed 300 characters']
  },
  points: {
    type: Number,
    min: [1, 'Points must be at least 1'],
    default: 1
  },
  order: {
    type: Number,
    min: [1, 'Order must be at least 1']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
questionSchema.index({ quiz: 1 });
questionSchema.index({ order: 1 });

// Validation for multiple choice questions
questionSchema.pre('save', function(next) {
  if (this.questionType === 'multiple-choice') {
    const correctOptions = this.options.filter(option => option.isCorrect);
    if (correctOptions.length === 0) {
      return next(new Error('Multiple choice questions must have at least one correct answer'));
    }
  }
  next();
});

module.exports = mongoose.model('Question', questionSchema);