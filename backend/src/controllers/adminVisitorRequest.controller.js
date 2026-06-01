import mongoose from 'mongoose';
import { VisitorRequest, VISITOR_REQUEST_STATUS } from '../models/visitorRequest.model.js';
import { getVisitDateRange } from '../utils/visitSlots.js';
import { queueVisitorRequestEmail } from '../utils/emailQueue.js';

const requestFields =
  'visitorName visitorEmail visitorPhone employeeId employeeName designation department cabinNumber purpose visitDate visitTime status rejectionReason reviewedBy reviewedAt emailLogs createdAt updatedAt';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const isValidRequestId = (id) => mongoose.Types.ObjectId.isValid(id);

const getRequestOrNotFound = async (id) => {
  if (!isValidRequestId(id)) {
    const error = new Error('Invalid visitor request id');
    error.statusCode = 400;
    throw error;
  }

  const request = await VisitorRequest.findById(id).select(requestFields);

  if (!request) {
    const error = new Error('Visitor request not found');
    error.statusCode = 404;
    throw error;
  }

  return request;
};

export const getAdminVisitorRequests = async (req, res, next) => {
  try {
    const { searchVisitor = '', searchEmployee = '', date = '', status = '' } = req.query;
    const query = {};

    if (status && VISITOR_REQUEST_STATUS.includes(status)) {
      query.status = status;
    }

    if (date) {
      const dateRange = getVisitDateRange(date);

      if (!dateRange) {
        return res.status(400).json({
          success: false,
          message: 'A valid date is required'
        });
      }

      query.visitDate = {
        $gte: dateRange.start,
        $lt: dateRange.end
      };
    }

    if (searchVisitor.trim()) {
      const visitorRegex = new RegExp(escapeRegex(searchVisitor.trim()), 'i');
      query.$or = [
        { visitorName: visitorRegex },
        { visitorEmail: visitorRegex },
        { visitorPhone: visitorRegex }
      ];
    }

    if (searchEmployee.trim()) {
      const employeeRegex = new RegExp(escapeRegex(searchEmployee.trim()), 'i');
      query.$and = [
        ...(query.$and || []),
        {
          $or: [
            { employeeName: employeeRegex },
            { designation: employeeRegex },
            { department: employeeRegex },
            { cabinNumber: employeeRegex }
          ]
        }
      ];
    }

    const requests = await VisitorRequest.find(query).select(requestFields).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Visitor requests loaded successfully',
      data: {
        requests
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminVisitorRequestById = async (req, res, next) => {
  try {
    const request = await getRequestOrNotFound(req.params.id);

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

export const approveVisitorRequest = async (req, res, next) => {
  try {
    const request = await getRequestOrNotFound(req.params.id);

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending visitor requests can be approved'
      });
    }

    request.status = 'approved';
    request.rejectionReason = '';
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();

    queueVisitorRequestEmail({
      request,
      type: 'requestApproved'
    });

    return res.status(200).json({
      success: true,
      message: 'Visitor request approved successfully',
      data: {
        request
      }
    });
  } catch (error) {
    next(error);
  }
};

export const rejectVisitorRequest = async (req, res, next) => {
  try {
    const { reason = '' } = req.body;
    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const request = await getRequestOrNotFound(req.params.id);

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending visitor requests can be rejected'
      });
    }

    request.status = 'rejected';
    request.rejectionReason = trimmedReason;
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();

    queueVisitorRequestEmail({
      request,
      type: 'requestRejected'
    });

    return res.status(200).json({
      success: true,
      message: 'Visitor request rejected successfully',
      data: {
        request
      }
    });
  } catch (error) {
    next(error);
  }
};
