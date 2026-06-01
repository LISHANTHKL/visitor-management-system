import mongoose from 'mongoose';
import { User } from '../models/user.model.js';
import { VisitorRequest } from '../models/visitorRequest.model.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[0-9+\-\s()]{7,20}$/;
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

const requestFields =
  'visitorName visitorEmail visitorPhone employeeId employeeName designation department cabinNumber purpose visitDate visitTime status createdAt updatedAt';

const getValidationError = ({ visitorName, visitorEmail, visitorPhone, employeeId, purpose, visitDate, visitTime }) => {
  if (!visitorName?.trim()) return 'Visitor name is required';
  if (!visitorEmail?.trim() || !emailPattern.test(visitorEmail)) return 'A valid visitor email is required';
  if (!visitorPhone?.trim() || !phonePattern.test(visitorPhone)) return 'A valid visitor phone is required';
  if (!mongoose.Types.ObjectId.isValid(employeeId)) return 'A valid employee is required';
  if (!purpose?.trim()) return 'Purpose is required';
  if (!visitDate || Number.isNaN(new Date(visitDate).getTime())) return 'A valid visit date is required';
  if (!visitTime?.trim() || !timePattern.test(visitTime)) return 'Visit time must use HH:mm format';

  return null;
};

export const createVisitorRequest = async (req, res, next) => {
  try {
    const {
      visitorName,
      visitorEmail,
      visitorPhone,
      employeeId,
      purpose,
      visitDate,
      visitTime
    } = req.body;

    const validationError = getValidationError({
      visitorName,
      visitorEmail,
      visitorPhone,
      employeeId,
      purpose,
      visitDate,
      visitTime
    });

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError
      });
    }

    const employee = await User.findOne({
      _id: employeeId,
      role: 'employee',
      active: true
    }).select('name designation department cabinNumber');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Selected employee is not available'
      });
    }

    const request = await VisitorRequest.create({
      visitorName,
      visitorEmail: visitorEmail.toLowerCase().trim(),
      visitorPhone,
      employeeId: employee._id,
      employeeName: employee.name,
      designation: employee.designation,
      department: employee.department,
      cabinNumber: employee.cabinNumber,
      purpose,
      visitDate,
      visitTime
    });

    return res.status(201).json({
      success: true,
      message: 'Visitor request submitted successfully',
      data: {
        request
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getVisitorRequestById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid visitor request id'
      });
    }

    const request = await VisitorRequest.findById(id).select(requestFields);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Visitor request not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Visitor request loaded successfully',
      data: {
        request
      }
    });
  } catch (error) {
    next(error);
  }
};

