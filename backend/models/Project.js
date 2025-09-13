const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  institution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    required: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  status: {
    type: String,
    enum: ['planning', 'active', 'completed', 'cancelled', 'on_hold'],
    default: 'planning'
  },
  budget: {
    allocated: {
      type: Number,
      required: true,
      default: 0
    },
    spent: {
      type: Number,
      default: 0
    },
    remaining: {
      type: Number,
      default: 0
    }
  },
  timeline: {
    startDate: Date,
    endDate: Date,
    actualStartDate: Date,
    actualEndDate: Date
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  stakeholders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  tags: [String],
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});


projectSchema.pre('save', function (next) {
  this.budget.remaining = this.budget.allocated - this.budget.spent;
  next();
});

module.exports = mongoose.model('Project', projectSchema);
