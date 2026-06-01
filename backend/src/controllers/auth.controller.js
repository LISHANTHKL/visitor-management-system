import { User, USER_ROLES } from '../models/user.model.js';
import { signToken } from '../utils/jwt.js';

const userFields =
  'name email role department designation cabinNumber employeeCode officeLocation phone active createdAt updatedAt';

const validateEmployeeProfile = ({ role, designation, cabinNumber }) => {
  if (role !== 'employee') {
    return null;
  }

  if (!designation?.trim()) {
    return 'Designation is required for employee users';
  }

  if (!cabinNumber?.trim()) {
    return 'Cabin number is required for employee users';
  }

  return null;
};

export const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role = 'employee',
      department = '',
      designation = '',
      cabinNumber = '',
      employeeCode = '',
      officeLocation = '',
      phone = '',
      active = true
    } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedEmployeeCode = employeeCode == null ? '' : String(employeeCode).trim().toUpperCase();

    if (!USER_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user role'
      });
    }

    const employeeProfileError = validateEmployeeProfile({ role, designation, cabinNumber });

    if (employeeProfileError) {
      return res.status(400).json({
        success: false,
        message: employeeProfileError
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email is already registered'
      });
    }

    if (normalizedEmployeeCode) {
      const existingEmployeeCode = await User.findOne({ employeeCode: normalizedEmployeeCode });

      if (existingEmployeeCode) {
        return res.status(409).json({
          success: false,
          message: 'Employee code is already assigned'
        });
      }
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role,
      department,
      designation,
      cabinNumber,
      employeeCode: normalizedEmployeeCode || undefined,
      officeLocation,
      phone,
      active
    });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: await User.findById(user._id).select(userFields)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!user.active) {
      return res.status(403).json({
        success: false,
        message: 'User account is inactive'
      });
    }

    const token = signToken(user);
    user.password = undefined;

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Authenticated user loaded',
    data: {
      user: req.user
    }
  });
};

export const logout = (_req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
};
