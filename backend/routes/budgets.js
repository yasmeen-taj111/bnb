const express = require('express');
const { body, validationResult } = require('express-validator');
const Institution = require('../models/Institution');
const Department = require('../models/Department');
const Project = require('../models/Project');
const Transaction = require('../models/Transaction');
const { auth, authorize, checkInstitutionAccess } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/budgets/summary/:institutionId
// @desc    Get comprehensive budget summary for an institution
// @access  Private
router.get('/summary/:institutionId', auth, checkInstitutionAccess, async (req, res) => {
  try {
    const institutionId = req.params.institutionId;


    const departments = await Department.find({ institution: institutionId });


    const projects = await Project.find({ institution: institutionId });

    const institution = await Institution.findById(institutionId);
    const fiscalYearStart = institution?.fiscalYear?.start || new Date(new Date().getFullYear(), 0, 1);
    const fiscalYearEnd = institution?.fiscalYear?.end || new Date(new Date().getFullYear(), 11, 31);

    const transactions = await Transaction.find({
      institution: institutionId,
      createdAt: { $gte: fiscalYearStart, $lte: fiscalYearEnd }
    });


    const totalAllocated = departments.reduce((sum, dept) => sum + dept.budget.allocated, 0);
    const totalSpent = departments.reduce((sum, dept) => sum + dept.budget.spent, 0);
    const totalRemaining = totalAllocated - totalSpent;

    const projectAllocated = projects.reduce((sum, project) => sum + project.budget.allocated, 0);
    const projectSpent = projects.reduce((sum, project) => sum + project.budget.spent, 0);


    const departmentBreakdown = departments.map(dept => ({
      id: dept._id,
      name: dept.name,
      allocated: dept.budget.allocated,
      spent: dept.budget.spent,
      remaining: dept.budget.remaining,
      utilization: dept.budget.allocated > 0 ? (dept.budget.spent / dept.budget.allocated) * 100 : 0
    }));


    const projectBreakdown = projects.map(project => ({
      id: project._id,
      name: project.name,
      status: project.status,
      allocated: project.budget.allocated,
      spent: project.budget.spent,
      remaining: project.budget.remaining,
      utilization: project.budget.allocated > 0 ? (project.budget.spent / project.budget.allocated) * 100 : 0
    }));


    const categoryBreakdown = await Transaction.aggregate([
      {
        $match: {
          institution: new require('mongoose').Types.ObjectId(institutionId),
          type: 'expense',
          status: 'completed',
          createdAt: { $gte: fiscalYearStart, $lte: fiscalYearEnd }
        }
      },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          transactionCount: { $sum: 1 }
        }
      },
      {
        $sort: { totalAmount: -1 }
      }
    ]);


    const monthlySpending = await Transaction.aggregate([
      {
        $match: {
          institution: new require('mongoose').Types.ObjectId(institutionId),
          type: 'expense',
          status: 'completed',
          createdAt: { $gte: fiscalYearStart, $lte: fiscalYearEnd }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalAmount: { $sum: '$amount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.json({
      summary: {
        totalAllocated,
        totalSpent,
        totalRemaining,
        projectAllocated,
        projectSpent,
        utilization: totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0
      },
      departmentBreakdown,
      projectBreakdown,
      categoryBreakdown,
      monthlySpending,
      fiscalYear: {
        start: fiscalYearStart,
        end: fiscalYearEnd
      }
    });
  } catch (error) {
    console.error('Get budget summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/budgets/department/:departmentId
// @desc    Get department budget details
// @access  Private
router.get('/department/:departmentId', auth, async (req, res) => {
  try {
    const department = await Department.findById(req.params.departmentId)
      .populate('institution', 'name type');

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }


    if (req.user.role !== 'admin' &&
      department.institution._id.toString() !== req.user.institution?.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }


    const transactions = await Transaction.find({ department: req.params.departmentId })
      .populate('project', 'name')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });


    const categoryBreakdown = await Transaction.aggregate([
      {
        $match: {
          department: department._id,
          type: 'expense',
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          transactionCount: { $sum: 1 }
        }
      },
      {
        $sort: { totalAmount: -1 }
      }
    ]);

    res.json({
      department,
      transactions,
      categoryBreakdown
    });
  } catch (error) {
    console.error('Get department budget error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/budgets/project/:projectId
// @desc    Get project budget details
// @access  Private
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate('institution', 'name type')
      .populate('department', 'name');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }


    if (req.user.role !== 'admin' &&
      project.institution._id.toString() !== req.user.institution?.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }


    const transactions = await Transaction.find({ project: req.params.projectId })
      .populate('department', 'name')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });


    const categoryBreakdown = await Transaction.aggregate([
      {
        $match: {
          project: project._id,
          type: 'expense',
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          transactionCount: { $sum: 1 }
        }
      },
      {
        $sort: { totalAmount: -1 }
      }
    ]);

    res.json({
      project,
      transactions,
      categoryBreakdown
    });
  } catch (error) {
    console.error('Get project budget error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/budgets/department/:departmentId
// @desc    Update department budget
// @access  Admin/Institution Admin
router.put('/department/:departmentId', auth, authorize('admin', 'institution_admin'), [
  body('budget.allocated').isNumeric().withMessage('Budget allocation must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const department = await Department.findById(req.params.departmentId);

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }


    if (req.user.role !== 'admin') {
      if (department.institution.toString() !== req.user.institution?.toString()) {
        return res.status(403).json({ message: 'Access denied to this institution' });
      }
    }

    const updatedDepartment = await Department.findByIdAndUpdate(
      req.params.departmentId,
      { budget: req.body.budget },
      { new: true, runValidators: true }
    ).populate('institution head');

    res.json({
      message: 'Department budget updated successfully',
      department: updatedDepartment
    });
  } catch (error) {
    console.error('Update department budget error:', error);
    res.status(500).json({ message: 'Server error during budget update' });
  }
});

// @route   PUT /api/budgets/project/:projectId
// @desc    Update project budget
// @access  Admin/Institution Admin/Project Manager
router.put('/project/:projectId', auth, [
  body('budget.allocated').isNumeric().withMessage('Budget allocation must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const project = await Project.findById(req.params.projectId);

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
      req.params.projectId,
      { budget: req.body.budget },
      { new: true, runValidators: true }
    ).populate('institution department manager');

    res.json({
      message: 'Project budget updated successfully',
      project: updatedProject
    });
  } catch (error) {
    console.error('Update project budget error:', error);
    res.status(500).json({ message: 'Server error during budget update' });
  }
});

module.exports = router;
