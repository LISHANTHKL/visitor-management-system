import mongoose from 'mongoose';
import { User } from '../models/user.model.js';
import { VisitorRequest } from '../models/visitorRequest.model.js';
import {
  generateVisitSlots,
  getVisitDateRange,
  isValidVisitSlot,
  UNAVAILABLE_VISITOR_REQUEST_STATUSES
} from '../utils/visitSlots.js';
import { queueVisitorRequestEmail } from '../utils/emailQueue.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[0-9+\-\s()]{7,20}$/;

const requestFields =
  'visitorName visitorEmail visitorPhone employeeId employeeName designation department cabinNumber purpose visitDate visitTime status createdAt updatedAt';

const getBookedSlots = async (employeeId, dateRange) => {
  const bookedRequests = await VisitorRequest.find({
    employeeId,
    visitDate: {
      $gte: dateRange.start,
      $lt: dateRange.end
    },
    status: {
      $in: UNAVAILABLE_VISITOR_REQUEST_STATUSES
    }
  }).select('visitTime');

  return [...new Set(bookedRequests.map((request) => request.visitTime).filter(isValidVisitSlot))];
};

const getValidationError = ({ visitorName, visitorEmail, visitorPhone, employeeId, purpose, visitDate, visitTime }) => {
  if (!visitorName?.trim()) return 'Visitor name is required';
  if (!visitorEmail?.trim() || !emailPattern.test(visitorEmail)) return 'A valid visitor email is required';
  if (!visitorPhone?.trim() || !phonePattern.test(visitorPhone)) return 'A valid visitor phone is required';
  if (!mongoose.Types.ObjectId.isValid(employeeId)) return 'A valid employee is required';
  if (!purpose?.trim()) return 'Purpose is required';
  if (!getVisitDateRange(visitDate)) return 'A valid visit date is required';
  if (!visitTime?.trim() || !isValidVisitSlot(visitTime)) return 'Visit time must be a valid 15-minute office slot';

  return null;
};

export const getAvailableSlots = async (req, res, next) => {
  try {
    const { employeeId, date } = req.query;

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({
        success: false,
        message: 'A valid employee is required'
      });
    }

    const dateRange = getVisitDateRange(date);

    if (!dateRange) {
      return res.status(400).json({
        success: false,
        message: 'A valid date is required'
      });
    }

    const employee = await User.findOne({
      _id: employeeId,
      role: 'employee',
      active: true
    }).select('_id');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Selected employee is not available'
      });
    }

    const allSlots = generateVisitSlots();
    const bookedSlots = await getBookedSlots(employee._id, dateRange);
    const bookedSlotSet = new Set(bookedSlots);
    const availableSlots = allSlots.filter((slot) => !bookedSlotSet.has(slot));

    return res.status(200).json({
      success: true,
      message: 'Available slots loaded successfully',
      data: {
        availableSlots,
        bookedSlots
      }
    });
  } catch (error) {
    next(error);
  }
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

    const dateRange = getVisitDateRange(visitDate);
    const bookedSlots = await getBookedSlots(employee._id, dateRange);

    if (bookedSlots.includes(visitTime)) {
      return res.status(409).json({
        success: false,
        message: 'Selected slot is no longer available. Please choose another slot.'
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
      visitDate: dateRange.start,
      visitTime
    });

    queueVisitorRequestEmail({
      request,
      type: 'requestSubmitted'
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
