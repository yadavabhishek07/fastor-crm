const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');

const generateToken = (employee) => {
  const secret = process.env.JWT_SECRET || 'fastor-crm-jwt-secret-key-2026';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(
    {
      id: employee._id,
      email: employee.email,
      role: employee.role
    },
    secret,
    { expiresIn }
  );
};

// @desc    Register new employee/counselor
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(409).json({
        success: false,
        message: 'An employee with this email is already registered.'
      });
    }

    const employee = await Employee.create({
      name,
      email,
      password,
      role: role || 'counselor'
    });

    const token = generateToken(employee);

    res.status(201).json({
      success: true,
      message: 'Employee registered successfully',
      token,
      employee: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        createdAt: employee.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate employee & return token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await employee.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = generateToken(employee);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      employee: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        createdAt: employee.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in employee profile
// @route   GET /api/auth/me
// @access  Private (Bearer JWT)
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      employee: req.user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe
};
