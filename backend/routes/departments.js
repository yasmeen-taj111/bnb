const express = require('express');
const { body, validationResult } = require('express-validator');
const Department = require('../models/Department');
const Transaction = require('../models/Transaction');
const { auth, authorize, checkInstitutionAccess } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/departments
// @desc    Get departments (filtered by institution access)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let query = {};


    if (req.user.role !== 'admin' && req.user.institution) {
      query.institution = req.user.institution;
    }

    const departments = await Department.find(query)
      .populate('institution', 'name type')
      .populate('head', 'name email')
      .sort({ name: 1 });

    res.json({ departments });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/departments/:id
// @desc    Get department by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('institution', 'name type')
      .populate('head', 'name email');

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }


    if (req.user.role !== 'admin' &&
      department.institution._id.toString() !== req.user.institution?.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const transactions = await Transaction.find({ department: req.params.id })
      .populate('project', 'name')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ department, transactions });
  } catch (error) {
    console.error('Get department error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/departments
// @desc    Create new department
// @access  Admin/Institution Admin
router.post('/', auth, authorize('admin', 'institution_admin'), [
  body('name').trim().isLength({ min: 2 }).withMessage('Department name must be at least 2 characters'),
  body('institution').isMongoId().withMessage('Valid institution ID required'),
  body('budget.allocated').isNumeric().withMessage('Budget allocation must be a number')
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

    const department = new Department(req.body);
    await department.save();

    await department.populate('institution head');

    res.status(201).json({
      message: 'Department created successfully',
      department
    });
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({ message: 'Server error during department creation' });
  }
});

// @route   PUT /api/departments/:id
// @desc    Update department
// @access  Admin/Institution Admin/Department Head
router.put('/:id', auth, async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }


    const hasAccess =
      req.user.role === 'admin' ||
      (req.user.role === 'institution_admin' &&
        department.institution.toString() === req.user.institution?.toString()) ||
      (req.user.role === 'department_head' &&
        department.head?.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedDepartment = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('institution head');

    res.json({
      message: 'Department updated successfully',
      department: updatedDepartment
    });
  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({ message: 'Server error during department update' });
  }
});

// @route   DELETE /api/departments/:id
// @desc    Delete department
// @access  Admin/Institution Admin
router.delete('/:id', auth, authorize('admin', 'institution_admin'), async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }


    if (req.user.role !== 'admin') {
      if (department.institution.toString() !== req.user.institution?.toString()) {
        return res.status(403).json({ message: 'Access denied to this institution' });
      }
    }


    const transactionCount = await Transaction.countDocuments({ department: req.params.id });
    if (transactionCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete department with existing transactions'
      });
    }

    await Department.findByIdAndDelete(req.params.id);

    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({ message: 'Server error during department deletion' });
  }
});

// @route   GET /api/departments/:id/budget-summary
// @desc    Get department budget summary
// @access  Private
router.get('/:id/budget-summary', auth, async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Check access
    if (req.user.role !== 'admin' &&
      department.institution.toString() !== req.user.institution?.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }


    const categorySummary = await Transaction.aggregate([
      {
        $match: {
          department: department._id,
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


    const monthlySpending = await Transaction.aggregate([
      {
        $match: {
          department: department._id,
          type: 'expense',
          status: 'completed'
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
      },
      {
        $limit: 12
      }
    ]);

    res.json({
      department: {
        name: department.name,
        budget: department.budget
      },
      categorySummary,
      monthlySpending
    });
  } catch (error) {
    console.error('Get budget summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
