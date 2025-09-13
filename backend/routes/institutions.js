const express = require('express');
const { body, validationResult } = require('express-validator');
const Institution = require('../models/Institution');
const Department = require('../models/Department');
const Project = require('../models/Project');
const Transaction = require('../models/Transaction');
const { auth, authorize, checkInstitutionAccess } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/institutions
// @desc    Get all institutions (public or based on user access)
// @access  Public/Private
router.get('/', auth, async (req, res) => {
  try {
    let query = {};


    if (req.user.role !== 'admin') {
      if (req.user.institution) {
        query = { _id: req.user.institution };
      } else {
        query = { 'settings.allowPublicViewing': true };
      }
    }

    const institutions = await Institution.find(query)
      .populate('departments')
      .sort({ createdAt: -1 });

    res.json({ institutions });
  } catch (error) {
    console.error('Get institutions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/institutions/:id
// @desc    Get institution by ID
// @access  Public/Private
router.get('/:id', auth, checkInstitutionAccess, async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.id)
      .populate('departments')
      .populate('projects');

    if (!institution) {
      return res.status(404).json({ message: 'Institution not found' });
    }


    const departments = await Department.find({ institution: req.params.id });
    const projects = await Project.find({ institution: req.params.id });
    const transactions = await Transaction.find({ institution: req.params.id });

    const totalBudget = departments.reduce((sum, dept) => sum + dept.budget.allocated, 0);
    const totalSpent = departments.reduce((sum, dept) => sum + dept.budget.spent, 0);
    const totalRemaining = totalBudget - totalSpent;

    const projectBudget = projects.reduce((sum, project) => sum + project.budget.allocated, 0);
    const projectSpent = projects.reduce((sum, project) => sum + project.budget.spent, 0);

    const summary = {
      totalBudget,
      totalSpent,
      totalRemaining,
      projectBudget,
      projectSpent,
      departmentCount: departments.length,
      projectCount: projects.length,
      transactionCount: transactions.length
    };

    res.json({ institution, summary });
  } catch (error) {
    console.error('Get institution error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/institutions
// @desc    Create new institution
// @access  Admin only
router.post('/', auth, authorize('admin'), [
  body('name').trim().isLength({ min: 2 }).withMessage('Institution name must be at least 2 characters'),
  body('type').isIn(['government', 'university', 'school', 'ngo', 'hospital', 'municipality']).withMessage('Invalid institution type'),
  body('fiscalYear.start').optional().isISO8601().withMessage('Invalid start date'),
  body('fiscalYear.end').optional().isISO8601().withMessage('Invalid end date')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const institution = new Institution(req.body);
    await institution.save();

    res.status(201).json({
      message: 'Institution created successfully',
      institution
    });
  } catch (error) {
    console.error('Create institution error:', error);
    res.status(500).json({ message: 'Server error during institution creation' });
  }
});

// @route   PUT /api/institutions/:id
// @desc    Update institution
// @access  Admin/Institution Admin
router.put('/:id', auth, checkInstitutionAccess, authorize('admin', 'institution_admin'), [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Institution name must be at least 2 characters'),
  body('type').optional().isIn(['government', 'university', 'school', 'ngo', 'hospital', 'municipality']).withMessage('Invalid institution type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const institution = await Institution.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!institution) {
      return res.status(404).json({ message: 'Institution not found' });
    }

    res.json({
      message: 'Institution updated successfully',
      institution
    });
  } catch (error) {
    console.error('Update institution error:', error);
    res.status(500).json({ message: 'Server error during institution update' });
  }
});

// @route   DELETE /api/institutions/:id
// @desc    Delete institution
// @access  Admin only
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const institution = await Institution.findByIdAndDelete(req.params.id);

    if (!institution) {
      return res.status(404).json({ message: 'Institution not found' });
    }


    await Department.deleteMany({ institution: req.params.id });
    await Project.deleteMany({ institution: req.params.id });
    await Transaction.deleteMany({ institution: req.params.id });

    res.json({ message: 'Institution deleted successfully' });
  } catch (error) {
    console.error('Delete institution error:', error);
    res.status(500).json({ message: 'Server error during institution deletion' });
  }
});

// @route   GET /api/institutions/:id/dashboard
// @desc    Get institution dashboard data
// @access  Private
router.get('/:id/dashboard', auth, checkInstitutionAccess, async (req, res) => {
  try {
    const institutionId = req.params.id;


    const recentTransactions = await Transaction.find({ institution: institutionId })
      .populate('department project createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(10);


    const departments = await Department.find({ institution: institutionId });
    const departmentBudgets = departments.map(dept => ({
      name: dept.name,
      allocated: dept.budget.allocated,
      spent: dept.budget.spent,
      remaining: dept.budget.remaining,
      utilization: dept.budget.allocated > 0 ? (dept.budget.spent / dept.budget.allocated) * 100 : 0
    }));


    const monthlySpending = [];
    const currentDate = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const nextDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 1);

      const monthTransactions = await Transaction.find({
        institution: institutionId,
        type: 'expense',
        createdAt: { $gte: date, $lt: nextDate },
        status: 'completed'
      });

      const totalSpent = monthTransactions.reduce((sum, t) => sum + t.amount, 0);

      monthlySpending.push({
        month: date.toISOString().substring(0, 7),
        amount: totalSpent
      });
    }

    res.json({
      recentTransactions,
      departmentBudgets,
      monthlySpending
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
