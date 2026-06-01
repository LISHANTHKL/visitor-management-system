import mongoose from 'mongoose';
import { User, USER_ROLES } from '../models/user.model.js';

const userFields =
  'name email role department designation cabinNumber employeeCode officeLocation phone active createdAt updatedAt';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const isValidUserId = (id) => mongoose.Types.ObjectId.isValid(id);

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

const getUserOrNotFound = async (id) => {
  if (!isValidUserId(id)) {
    const error = new Error('Invalid user id');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(id).select(userFields);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

export const getUsers = async (req, res, next) => {
  try {
    const { search = '', role = '', department = '', designation = '' } = req.query;
    const query = {};

    if (role && USER_ROLES.includes(role)) {
      query.role = role;
    }

    if (department.trim()) {
      query.department = new RegExp(escapeRegex(department.trim()), 'i');
    }

    if (designation.trim()) {
      query.designation = new RegExp(escapeRegex(designation.trim()), 'i');
    }

    if (search.trim()) {
      const searchRegex = new RegExp(escapeRegex(search.trim()), 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { department: searchRegex },
        { designation: searchRegex },
        { cabinNumber: searchRegex },
        { employeeCode: searchRegex },
        { officeLocation: searchRegex },
        { phone: searchRegex }
      ];
    }

    const users = await User.find(query).select(userFields).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Users loaded successfully',
      data: {
        users
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await getUserOrNotFound(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'User loaded successfully',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      role,
      department,
      designation,
      cabinNumber,
      employeeCode,
      officeLocation,
      phone,
      active
    } = req.body;

    if (!isValidUserId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user id'
      });
    }

    if (role && !USER_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user role'
      });
    }

    if (typeof active !== 'undefined' && typeof active !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'active must be a boolean value'
      });
    }

    if (req.user._id.toString() === id && active === false) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }

    const existingUser = await User.findById(id).select(userFields);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const nextRole = typeof role !== 'undefined' ? role : existingUser.role;
    const nextDesignation = typeof designation !== 'undefined' ? designation : existingUser.designation;
    const nextCabinNumber = typeof cabinNumber !== 'undefined' ? cabinNumber : existingUser.cabinNumber;
    const employeeProfileError = validateEmployeeProfile({
      role: nextRole,
      designation: nextDesignation,
      cabinNumber: nextCabinNumber
    });

    if (employeeProfileError) {
      return res.status(400).json({
        success: false,
        message: employeeProfileError
      });
    }

    const update = {};
    const unset = {};

    if (typeof name !== 'undefined') update.name = name;
    if (typeof role !== 'undefined') update.role = role;
    if (typeof department !== 'undefined') update.department = department;
    if (typeof designation !== 'undefined') update.designation = designation;
    if (typeof cabinNumber !== 'undefined') update.cabinNumber = cabinNumber;
    if (typeof officeLocation !== 'undefined') update.officeLocation = officeLocation;
    if (typeof phone !== 'undefined') update.phone = phone;
    if (typeof active !== 'undefined') update.active = active;

    if (typeof email !== 'undefined') {
      const normalizedEmail = email.toLowerCase().trim();
      const existingEmailUser = await User.findOne({ email: normalizedEmail, _id: { $ne: id } });

      if (existingEmailUser) {
        return res.status(409).json({
          success: false,
          message: 'Email is already registered'
        });
      }

      update.email = normalizedEmail;
    }

    if (typeof employeeCode !== 'undefined') {
      const normalizedEmployeeCode = employeeCode == null ? '' : String(employeeCode).trim().toUpperCase();

      if (normalizedEmployeeCode) {
        const existingEmployeeCode = await User.findOne({
          employeeCode: normalizedEmployeeCode,
          _id: { $ne: id }
        });

        if (existingEmployeeCode) {
          return res.status(409).json({
            success: false,
            message: 'Employee code is already assigned'
          });
        }

        update.employeeCode = normalizedEmployeeCode;
      } else {
        unset.employeeCode = '';
      }
    }

    const updateOperation = Object.keys(unset).length > 0 ? { $set: update, $unset: unset } : update;
    const user = await User.findByIdAndUpdate(id, updateOperation, { new: true, runValidators: true }).select(userFields);

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { active } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user id'
      });
    }

    if (typeof active !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'active must be a boolean value'
      });
    }

    if (req.user._id.toString() === id && active === false) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }

    const user = await User.findByIdAndUpdate(id, { active }, { new: true, runValidators: true }).select(userFields);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: `User ${active ? 'activated' : 'deactivated'} successfully`,
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidUserId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user id'
      });
    }

    if (req.user._id.toString() === id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    const user = await User.findByIdAndDelete(id).select(userFields);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

export const resetUserPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!isValidUserId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user id'
      });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters'
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.password = password;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    next(error);
  }
};
