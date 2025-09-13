const express = require('express');
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const Transaction = require('../models/Transaction');
const { auth, authorize, checkInstitutionAccess } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/projects
// @desc    Get projects (filtered by institution access)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let query = {};


    if (req.user.role !== 'admin' && req.user.institution) {
      query.institution = req.user.institution;
    }

    const projects = await Project.find(query)
      .populate('institution', 'name type')
      .populate('department', 'name')
      .populate('manager', 'name email')
      .sort({ createdAt: -1 });

    res.json({ projects });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/projects/:id
// @desc    Get project by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('institution', 'name type')
      .populate('department', 'name')
      .populate('manager', 'name email')
      .populate('stakeholders', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }


    if (req.user.role !== 'admin' &&
      project.institution._id.toString() !== req.user.institution?.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }


    const transactions = await Transaction.find({ project: req.params.id })
      .populate('department', 'name')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ project, transactions });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/projects
// @desc    Create new project
// @access  Admin/Institution Admin/Department Head
router.post('/', auth, authorize('admin', 'institution_admin', 'department_head'), [
  body('name').trim().isLength({ min: 2 }).withMessage('Project name must be at least 2 characters'),
  body('institution').isMongoId().withMessage('Valid institution ID required'),
  body('budget.allocated').isNumeric().withMessage('Budget allocation must be a number'),
  body('timeline.startDate').optional().isISO8601().withMessage('Invalid start date'),
  body('timeline.endDate').optional().isISO8601().withMessage('Invalid end date')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }


    if (req.user.role !== 'admin') {
      if (req.body.institution !== req.user.institution.toString()) {
        return res.status(403).json({ message: 'Access denied to this institution' });
      }
    }

    const project = new Project(req.body);
    await project.save();

    await project.populate('institution department manager');

    res.status(201).json({
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Server error during project creation' });
  }
});

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Admin/Institution Admin/Project Manager
router.put('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }


    const hasAccess =
      req.user.role === 'admin' ||
      (req.user.role === 'institution_admin' &&
        project.institution.toString() === req.user.institution?.toString()) ||
      (project.manager?.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('institution department manager');

    res.json({
      message: 'Project updated successfully',
      project: updatedProject
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Server error during project update' });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Admin/Institution Admin
router.delete('/:id', auth, authorize('admin', 'institution_admin'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }


    if (req.user.role !== 'admin') {
      if (project.institution.toString() !== req.user.institution?.toString()) {
        return res.status(403).json({ message: 'Access denied to this institution' });
      }
    }


    const transactionCount = await Transaction.countDocuments({ project: req.params.id });
    if (transactionCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete project with existing transactions'
      });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Server error during project deletion' });
  }
});

// @route   GET /api/projects/:id/progress
// @desc    Get project progress and financial status
// @access  Private
router.get('/:id/progress', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }


    if (req.user.role !== 'admin' &&
      project.institution.toString() !== req.user.institution?.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }


    let timeProgress = 0;
    if (project.timeline.startDate && project.timeline.endDate) {
      const now = new Date();
      const start = new Date(project.timeline.startDate);
      const end = new Date(project.timeline.endDate);

      if (now >= start && now <= end) {
        timeProgress = ((now - start) / (end - start)) * 100;
      } else if (now > end) {
        timeProgress = 100;
      }
    }


    const budgetUtilization = project.budget.allocated > 0
      ? (project.budget.spent / project.budget.allocated) * 100
      : 0;


    const recentTransactions = await Transaction.find({ project: project._id })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      project: {
        name: project.name,
        status: project.status,
        budget: project.budget
      },
      progress: {
        timeProgress: Math.round(timeProgress),
        budgetUtilization: Math.round(budgetUtilization),
        budgetRemaining: project.budget.remaining
      },
      recentTransactions
    });
  } catch (error) {
    console.error('Get project progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
