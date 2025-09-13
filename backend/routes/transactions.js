const express = require('express');
const { body, validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');
const Department = require('../models/Department');
const Project = require('../models/Project');
const { auth, authorize, checkInstitutionAccess } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/transactions
// @desc    Get transactions (filtered by institution access)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let query = {};


    if (req.user.role !== 'admin' && req.user.institution) {
      query.institution = req.user.institution;
    }

    if (req.query.type) query.type = req.query.type;
    if (req.query.status) query.status = req.query.status;
    if (req.query.department) query.department = req.query.department;
    if (req.query.project) query.project = req.query.project;
    if (req.query.category) query.category = req.query.category;

    if (req.query.startDate || req.query.endDate) {
      query.createdAt = {};
      if (req.query.startDate) query.createdAt.$gte = new Date(req.query.startDate);
      if (req.query.endDate) query.createdAt.$lte = new Date(req.query.endDate);
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find(query)
      .populate('institution', 'name type')
      .populate('department', 'name')
      .populate('project', 'name')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments(query);

    res.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/transactions/:id
// @desc    Get transaction by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('institution', 'name type')
      .populate('department', 'name')
      .populate('project', 'name')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }


    if (req.user.role !== 'admin' &&
      transaction.institution._id.toString() !== req.user.institution?.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ transaction });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/transactions
// @desc    Create new transaction
// @access  Admin/Institution Admin/Department Head
router.post('/', auth, authorize('admin', 'institution_admin', 'department_head'), [
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('type').isIn(['expense', 'income', 'transfer', 'adjustment']).withMessage('Invalid transaction type'),
  body('category').trim().isLength({ min: 2 }).withMessage('Category is required'),
  body('description').trim().isLength({ min: 5 }).withMessage('Description must be at least 5 characters'),
  body('institution').isMongoId().withMessage('Valid institution ID required')
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


    if (req.body.department) {
      const department = await Department.findOne({
        _id: req.body.department,
        institution: req.body.institution
      });
      if (!department) {
        return res.status(400).json({ message: 'Department does not belong to this institution' });
      }
    }


    if (req.body.project) {
      const project = await Project.findOne({
        _id: req.body.project,
        institution: req.body.institution
      });
      if (!project) {
        return res.status(400).json({ message: 'Project does not belong to this institution' });
      }
    }

    const transaction = new Transaction({
      ...req.body,
      createdBy: req.user._id
    });

    await transaction.save();


    if (req.body.department && req.body.type === 'expense') {
      await Department.findByIdAndUpdate(req.body.department, {
        $inc: { 'budget.spent': req.body.amount }
      });
    }


    if (req.body.project && req.body.type === 'expense') {
      await Project.findByIdAndUpdate(req.body.project, {
        $inc: { 'budget.spent': req.body.amount }
      });
    }

    await transaction.populate('institution department project createdBy');

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ message: 'Server error during transaction creation' });
  }
});

// @route   PUT /api/transactions/:id
// @desc    Update transaction
// @access  Admin/Institution Admin/Department Head (own transactions)
router.put('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }


    const hasAccess =
      req.user.role === 'admin' ||
      (req.user.role === 'institution_admin' &&
        transaction.institution.toString() === req.user.institution?.toString()) ||
      (req.user.role === 'department_head' &&
        transaction.createdBy.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }


    if (['approved', 'completed'].includes(transaction.status)) {
      return res.status(400).json({ message: 'Cannot update approved or completed transactions' });
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('institution department project createdBy approvedBy');

    res.json({
      message: 'Transaction updated successfully',
      transaction: updatedTransaction
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ message: 'Server error during transaction update' });
  }
});

// @route   PUT /api/transactions/:id/approve
// @desc    Approve transaction
// @access  Admin/Institution Admin
router.put('/:id/approve', auth, authorize('admin', 'institution_admin'), async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }


    if (req.user.role !== 'admin') {
      if (transaction.institution.toString() !== req.user.institution?.toString()) {
        return res.status(403).json({ message: 'Access denied to this institution' });
      }
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({ message: 'Transaction is not pending approval' });
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      {
        status: 'approved',
        approvedBy: req.user._id,
        approvedAt: new Date()
      },
      { new: true }
    ).populate('institution department project createdBy approvedBy');

    res.json({
      message: 'Transaction approved successfully',
      transaction: updatedTransaction
    });
  } catch (error) {
    console.error('Approve transaction error:', error);
    res.status(500).json({ message: 'Server error during transaction approval' });
  }
});

// @route   PUT /api/transactions/:id/reject
// @desc    Reject transaction
// @access  Admin/Institution Admin
router.put('/:id/reject', auth, authorize('admin', 'institution_admin'), async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }


    if (req.user.role !== 'admin') {
      if (transaction.institution.toString() !== req.user.institution?.toString()) {
        return res.status(403).json({ message: 'Access denied to this institution' });
      }
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({ message: 'Transaction is not pending approval' });
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      {
        status: 'rejected',
        approvedBy: req.user._id,
        approvedAt: new Date()
      },
      { new: true }
    ).populate('institution department project createdBy approvedBy');

    res.json({
      message: 'Transaction rejected successfully',
      transaction: updatedTransaction
    });
  } catch (error) {
    console.error('Reject transaction error:', error);
    res.status(500).json({ message: 'Server error during transaction rejection' });
  }
});

// @route   DELETE /api/transactions/:id
// @desc    Delete transaction
// @access  Admin/Institution Admin (own transactions)
router.delete('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }


    const hasAccess =
      req.user.role === 'admin' ||
      (req.user.role === 'institution_admin' &&
        transaction.institution.toString() === req.user.institution?.toString()) ||
      (transaction.createdBy.toString() === req.user._id.toString() &&
        transaction.status === 'pending');

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }


    if (['approved', 'completed'].includes(transaction.status)) {
      return res.status(400).json({ message: 'Cannot delete approved or completed transactions' });
    }

    await Transaction.findByIdAndDelete(req.params.id);

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ message: 'Server error during transaction deletion' });
  }
});

module.exports = router;
