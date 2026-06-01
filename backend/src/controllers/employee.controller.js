import { User } from '../models/user.model.js';

const employeeFields = 'name designation department cabinNumber officeLocation employeeCode';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const getPublicEmployees = async (req, res, next) => {
  try {
    const { search = '' } = req.query;
    const query = {
      role: 'employee',
      active: true
    };

    if (search.trim()) {
      const searchRegex = new RegExp(escapeRegex(search.trim()), 'i');
      query.$or = [
        { name: searchRegex },
        { employeeCode: searchRegex },
        { department: searchRegex }
      ];
    }

    const employees = await User.find(query).select(employeeFields).sort({ name: 1 }).limit(25);

    return res.status(200).json({
      success: true,
      message: 'Employees loaded successfully',
      data: {
        employees
      }
    });
  } catch (error) {
    next(error);
  }
};

