import { VisitorRequest } from '../models/visitorRequest.model.js';
import { VisitLog, VISIT_LOG_STATUS } from '../models/visitLog.model.js';
import { createAuditLog } from '../utils/auditLogger.js';
import { queueVisitLogEmail } from '../utils/emailQueue.js';
import { getVisitDateRange } from '../utils/visitSlots.js';
import { setEmployeeAvailable, setEmployeeOccupied } from '../services/employeeStatus.service.js';
import { emitDashboardUpdate } from '../services/socket.service.js';

const verificationFields =
  'visitorName visitorEmail visitorPhone employeeId employeeName department cabinNumber purpose visitDate visitTime status qrToken qrGeneratedAt';

const formatRequestDetails = (request) => ({
  _id: request._id,
  visitorName: request.visitorName,
  visitorEmail: request.visitorEmail,
  visitorPhone: request.visitorPhone,
  employeeId: request.employeeId,
  employeeName: request.employeeName,
  department: request.department,
  cabinNumber: request.cabinNumber,
  purpose: request.purpose,
  visitDate: request.visitDate,
  visitTime: request.visitTime,
  status: request.status
});

const formatSecurityUser = (securityUser) => {
  if (!securityUser) return null;

  if (typeof securityUser === 'object' && securityUser.name) {
    return {
      _id: securityUser._id,
      name: securityUser.name,
      email: securityUser.email
    };
  }

  return securityUser;
};

const formatVisitLog = (visitLog) => {
  if (!visitLog) return null;

  return {
    _id: visitLog._id,
    visitorId: visitLog.visitorId,
    visitorName: visitLog.visitorName,
    visitorEmail: visitLog.visitorEmail,
    employeeId: visitLog.employeeId,
    employeeName: visitLog.employeeName,
    department: visitLog.department,
    cabinNumber: visitLog.cabinNumber,
    visitorPhone: visitLog.visitorPhone,
    purpose: visitLog.purpose,
    visitDate: visitLog.visitDate,
    visitTime: visitLog.visitTime,
    checkInTime: visitLog.checkInTime,
    checkOutTime: visitLog.checkOutTime,
    duration: visitLog.duration,
    status: visitLog.status,
    securityUser: formatSecurityUser(visitLog.securityUser),
    createdAt: visitLog.createdAt,
    updatedAt: visitLog.updatedAt
  };
};

const invalidResponse = ({ res, message, code, request = null }) =>
  res.status(200).json({
    success: true,
    message,
    data: {
      valid: false,
      code,
      reason: message,
      request: request ? formatRequestDetails(request) : null
    }
  });

const getTodayRange = () => getVisitDateRange(new Date().toISOString().slice(0, 10));

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const calculateDurationMinutes = (checkInTime, checkOutTime) => {
  const diff = new Date(checkOutTime).getTime() - new Date(checkInTime).getTime();
  return Math.max(0, Math.round(diff / 60000));
};

const findRequestByQrToken = async (qrToken) => VisitorRequest.findOne({ qrToken }).select(verificationFields);

const getRequestByQrTokenOrResponse = async ({ qrToken, res }) => {
  const request = await findRequestByQrToken(qrToken);

  if (!request) {
    res.status(404).json({
      success: false,
      message: 'Invalid QR'
    });
    return null;
  }

  return request;
};

const getActiveVisitLog = (visitorId) =>
  VisitLog.findOne({ visitorId, status: 'checked_in' })
    .populate('securityUser', 'name email')
    .sort({ checkInTime: -1 });

const getLatestVisitLog = (visitorId) =>
  VisitLog.findOne({ visitorId }).populate('securityUser', 'name email').sort({ createdAt: -1 });

const isVisitValidForCheckIn = ({ request, res }) => {
  if (request.status !== 'approved') {
    res.status(400).json({
      success: false,
      message: `Request is ${request.status}`
    });
    return false;
  }

  const todayRange = getTodayRange();
  const visitRange = getVisitDateRange(request.visitDate);

  if (!visitRange) {
    res.status(400).json({
      success: false,
      message: 'Visit date is invalid'
    });
    return false;
  }

  if (visitRange.start < todayRange.start) {
    res.status(400).json({
      success: false,
      message: 'Expired Pass'
    });
    return false;
  }

  if (visitRange.start >= todayRange.end) {
    res.status(400).json({
      success: false,
      message: 'Pass is not valid for today'
    });
    return false;
  }

  return true;
};

export const verifySecurityQr = async (req, res, next) => {
  try {
    const qrToken = String(req.body.qrToken || '').trim();

    if (!qrToken) {
      return res.status(400).json({
        success: false,
        message: 'QR token is required'
      });
    }

    const request = await VisitorRequest.findOne({ qrToken }).select(verificationFields);

    if (!request) {
      return invalidResponse({
        res,
        message: 'Invalid QR',
        code: 'INVALID_QR'
      });
    }

    if (request.status !== 'approved') {
      return invalidResponse({
        res,
        message: `Request is ${request.status}`,
        code: `${request.status.toUpperCase()}_REQUEST`,
        request
      });
    }

    const activeVisitLog = await getActiveVisitLog(request._id);

    if (activeVisitLog) {
      return res.status(200).json({
        success: true,
        message: 'Visitor is checked in',
        data: {
          valid: true,
          code: 'CHECKED_IN',
          nextAction: 'check_out',
          request: formatRequestDetails(request),
          visitLog: formatVisitLog(activeVisitLog)
        }
      });
    }

    const todayRange = getTodayRange();
    const visitRange = getVisitDateRange(request.visitDate);

    if (!visitRange) {
      return invalidResponse({
        res,
        message: 'Visit date is invalid',
        code: 'INVALID_VISIT_DATE',
        request
      });
    }

    if (visitRange.start < todayRange.start) {
      return invalidResponse({
        res,
        message: 'Expired Pass',
        code: 'EXPIRED_PASS',
        request
      });
    }

    if (visitRange.start >= todayRange.end) {
      return invalidResponse({
        res,
        message: 'Pass is not valid for today',
        code: 'INVALID_VISIT_DATE',
        request
      });
    }

    const latestVisitLog = await getLatestVisitLog(request._id);
    const nextAction = latestVisitLog?.status === 'checked_out' ? null : 'check_in';

    return res.status(200).json({
      success: true,
      message: 'Valid Pass',
      data: {
        valid: true,
        code: latestVisitLog?.status === 'checked_out' ? 'CHECKED_OUT' : 'VALID_PASS',
        nextAction,
        request: formatRequestDetails(request),
        visitLog: formatVisitLog(latestVisitLog)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const checkInVisitor = async (req, res, next) => {
  try {
    const qrToken = String(req.body.qrToken || '').trim();

    if (!qrToken) {
      return res.status(400).json({
        success: false,
        message: 'QR token is required'
      });
    }

    const request = await getRequestByQrTokenOrResponse({ qrToken, res });

    if (!request) {
      return;
    }

    if (!isVisitValidForCheckIn({ request, res })) {
      return;
    }

    const activeVisitLog = await getActiveVisitLog(request._id);

    if (activeVisitLog) {
      return res.status(409).json({
        success: false,
        message: 'Visitor is already checked in'
      });
    }

    const latestVisitLog = await getLatestVisitLog(request._id);

    if (latestVisitLog?.status === 'checked_out') {
      return res.status(409).json({
        success: false,
        message: 'Visitor has already checked out for this pass'
      });
    }

    const visitLog = await VisitLog.create({
      visitorId: request._id,
      visitorName: request.visitorName,
      visitorEmail: request.visitorEmail,
      visitorPhone: request.visitorPhone,
      employeeId: request.employeeId,
      employeeName: request.employeeName,
      department: request.department,
      cabinNumber: request.cabinNumber,
      purpose: request.purpose,
      visitDate: request.visitDate,
      visitTime: request.visitTime,
      checkInTime: new Date(),
      status: 'checked_in',
      securityUser: req.user._id
    });

    await visitLog.populate('securityUser', 'name email');

    queueVisitLogEmail({
      visitLog,
      type: 'visitCheckIn'
    });

    await setEmployeeOccupied({
      employeeId: request.employeeId,
      visitLog
    });

    await createAuditLog({
      visitorId: request._id,
      visitLogId: visitLog._id,
      action: 'checked_in',
      actor: req.user
    });

    emitDashboardUpdate({ reason: 'visitor_checked_in' });

    return res.status(201).json({
      success: true,
      message: 'Visitor checked in successfully',
      data: {
        visitLog: formatVisitLog(visitLog),
        request: formatRequestDetails(request),
        nextAction: 'check_out'
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Visitor is already checked in'
      });
    }

    next(error);
  }
};

export const checkOutVisitor = async (req, res, next) => {
  try {
    const qrToken = String(req.body.qrToken || '').trim();

    if (!qrToken) {
      return res.status(400).json({
        success: false,
        message: 'QR token is required'
      });
    }

    const request = await getRequestByQrTokenOrResponse({ qrToken, res });

    if (!request) {
      return;
    }

    const visitLog = await getActiveVisitLog(request._id);

    if (!visitLog) {
      return res.status(404).json({
        success: false,
        message: 'No active check-in found for this visitor'
      });
    }

    visitLog.checkOutTime = new Date();
    visitLog.duration = calculateDurationMinutes(visitLog.checkInTime, visitLog.checkOutTime);
    visitLog.status = 'checked_out';
    await visitLog.save();
    await visitLog.populate('securityUser', 'name email');

    await setEmployeeAvailable({
      employeeId: visitLog.employeeId
    });

    await createAuditLog({
      visitorId: request._id,
      visitLogId: visitLog._id,
      action: 'checked_out',
      actor: req.user
    });

    queueVisitLogEmail({
      visitLog,
      type: 'visitCheckOut'
    });

    emitDashboardUpdate({ reason: 'visitor_checked_out' });

    return res.status(200).json({
      success: true,
      message: 'Visitor checked out successfully',
      data: {
        visitLog: formatVisitLog(visitLog),
        request: formatRequestDetails(request),
        nextAction: null
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getSecurityVisitLogs = async (req, res, next) => {
  try {
    const { searchVisitor = '', searchEmployee = '', date = '', status = '' } = req.query;
    const query = {};

    if (status && VISIT_LOG_STATUS.includes(status)) {
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

      query.checkInTime = {
        $gte: dateRange.start,
        $lt: dateRange.end
      };
    }

    if (searchVisitor.trim()) {
      const visitorRegex = new RegExp(escapeRegex(searchVisitor.trim()), 'i');
      query.$or = [{ visitorName: visitorRegex }, { visitorEmail: visitorRegex }];
    }

    if (searchEmployee.trim()) {
      const employeeRegex = new RegExp(escapeRegex(searchEmployee.trim()), 'i');
      query.$and = [
        ...(query.$and || []),
        {
          $or: [
            { employeeName: employeeRegex },
            { department: employeeRegex },
            { cabinNumber: employeeRegex }
          ]
        }
      ];
    }

    const logs = await VisitLog.find(query)
      .populate('securityUser', 'name email')
      .sort({ checkInTime: -1 });

    return res.status(200).json({
      success: true,
      message: 'Visit logs loaded successfully',
      data: {
        logs: logs.map(formatVisitLog)
      }
    });
  } catch (error) {
    next(error);
  }
};
