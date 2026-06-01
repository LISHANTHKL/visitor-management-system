import { User } from '../models/user.model.js';
import { EmployeeStatus } from '../models/employeeStatus.model.js';
import { formatEmployeeStatus } from '../services/employeeStatus.service.js';

const buildEmployeeStatusQuery = async (employeeQuery = {}) => {
  const employees = await User.find({
    role: 'employee',
    active: true,
    ...employeeQuery
  }).select('name email department designation cabinNumber');

  const statusRecords = await EmployeeStatus.find({
    employeeId: {
      $in: employees.map((employee) => employee._id)
    }
  }).populate('employeeId', 'name email department designation cabinNumber');

  const statusByEmployee = new Map(
    statusRecords.map((record) => [String(record.employeeId._id), record])
  );

  return employees.map((employee) => {
    const statusRecord = statusByEmployee.get(String(employee._id));

    if (statusRecord) {
      return formatEmployeeStatus(statusRecord);
    }

    return {
      _id: null,
      employeeId: employee._id,
      employeeName: employee.name,
      employeeEmail: employee.email,
      department: employee.department,
      designation: employee.designation,
      cabinNumber: employee.cabinNumber,
      status: 'available',
      currentVisitor: null,
      updatedAt: employee.updatedAt
    };
  });
};

export const getEmployeeStatuses = async (_req, res, next) => {
  try {
    const statuses = await buildEmployeeStatusQuery();
    const availableEmployees = statuses.filter((employee) => employee.status === 'available');
    const occupiedEmployees = statuses.filter((employee) => employee.status === 'occupied');

    return res.status(200).json({
      success: true,
      message: 'Employee availability loaded successfully',
      data: {
        statuses,
        availableEmployees,
        occupiedEmployees,
        summary: {
          available: availableEmployees.length,
          occupied: occupiedEmployees.length
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMyEmployeeStatus = async (req, res, next) => {
  try {
    const statuses = await buildEmployeeStatusQuery({ _id: req.user._id });
    const status = statuses[0] || null;

    return res.status(200).json({
      success: true,
      message: 'Employee status loaded successfully',
      data: {
        status
      }
    });
  } catch (error) {
    next(error);
  }
};
