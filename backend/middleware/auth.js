const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const user = await User.findById(decoded.userId).select('-password');

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

const checkInstitutionAccess = async (req, res, next) => {
  try {
    const institutionId = req.params.institutionId || req.body.institution;

    if (!institutionId) {
      return res.status(400).json({ message: 'Institution ID required' });
    }


    if (req.user.role === 'admin') {
      return next();
    }


    if (req.user.institution && req.user.institution.toString() === institutionId.toString()) {
      return next();
    }

    res.status(403).json({ message: 'Access denied to this institution' });
  } catch (error) {
    res.status(500).json({ message: 'Error checking institution access' });
  }
};

module.exports = { auth, authorize, checkInstitutionAccess };
