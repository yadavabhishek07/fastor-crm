const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');

const protect = async (req, res, next) => {
  try {
    let token = null;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication token provided.'
      });
    }

    const secret = process.env.JWT_SECRET || 'fastor-crm-jwt-secret-key-2026';
    const decoded = jwt.verify(token, secret);

    const employee = await Employee.findById(decoded.id).select('-password');
    if (!employee) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token: Counselor account not found.'
      });
    }

    req.user = employee;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Authentication token has expired. Please log in again.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token.'
    });
  }
};

module.exports = { protect };
