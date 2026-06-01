import { AuditLog } from '../models/auditLog.model.js';
import { VisitLog } from '../models/visitLog.model.js';
import { VisitorRequest } from '../models/visitorRequest.model.js';
import { getVisitDateRange } from '../utils/visitSlots.js';

const LOG_STATUSES = ['pending', 'approved', 'rejected', 'checked_in', 'checked_out', 'expired', 'cancelled'];
const requestFields =
  'visitorName visitorEmail visitorPhone employeeId employeeName department cabinNumber purpose visitDate visitTime status reviewedBy reviewedAt createdAt updatedAt';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getEffectiveStatus = (request, visitLog) => {
  if (visitLog?.status === 'checked_out') return 'checked_out';
  if (visitLog?.status === 'checked_in') return 'checked_in';

  if (request.status === 'approved') {
    const dateRange = getVisitDateRange(request.visitDate);

    if (dateRange && dateRange.end < new Date()) {
      return 'expired';
    }
  }

  return request.status;
};

const formatAuditTrail = (auditLogs = []) => {
  const trail = {};

  auditLogs.forEach((log) => {
    trail[log.action] = {
      actorName: log.actorName,
      actorRole: log.actorRole,
      timestamp: log.timestamp
    };
  });

  return trail;
};

const formatLogRow = ({ request, visitLog, auditTrail }) => ({
  visitorId: request._id,
  visitorName: request.visitorName,
  visitorEmail: request.visitorEmail,
  visitorPhone: request.visitorPhone,
  employeeId: request.employeeId,
  employeeName: request.employeeName,
  department: request.department,
  cabinNumber: request.cabinNumber,
  purpose: request.purpose,
  date: request.visitDate,
  time: request.visitTime,
  checkIn: visitLog?.checkInTime || null,
  checkOut: visitLog?.checkOutTime || null,
  duration: visitLog?.duration ?? null,
  status: getEffectiveStatus(request, visitLog),
  audit: {
    approvedBy: auditTrail.approved || null,
    rejectedBy: auditTrail.rejected || null,
    checkedInBy: auditTrail.checked_in || null,
    checkedOutBy: auditTrail.checked_out || null
  },
  createdAt: request.createdAt,
  updatedAt: request.updatedAt
});

const buildLogs = async (queryParams) => {
  const {
    search = '',
    status = '',
    date = '',
    department = '',
    sortBy = 'date',
    sortOrder = 'desc'
  } = queryParams;
  const query = {};

  if (date) {
    const dateRange = getVisitDateRange(date);

    if (!dateRange) {
      const error = new Error('A valid date is required');
      error.statusCode = 400;
      throw error;
    }

    query.visitDate = {
      $gte: dateRange.start,
      $lt: dateRange.end
    };
  }

  if (department.trim()) {
    query.department = new RegExp(escapeRegex(department.trim()), 'i');
  }

  if (search.trim()) {
    const searchRegex = new RegExp(escapeRegex(search.trim()), 'i');
    query.$or = [
      { visitorName: searchRegex },
      { visitorEmail: searchRegex },
      { visitorPhone: searchRegex },
      { employeeName: searchRegex },
      { department: searchRegex },
      { purpose: searchRegex }
    ];
  }

  const requests = await VisitorRequest.find(query).select(requestFields).sort({ visitDate: -1, visitTime: -1 });
  const requestIds = requests.map((request) => request._id);
  const visitLogs = await VisitLog.find({ visitorId: { $in: requestIds } }).sort({ createdAt: -1 });
  const auditLogs = await AuditLog.find({ visitorId: { $in: requestIds } }).sort({ timestamp: 1 });

  const visitLogByVisitor = new Map();
  visitLogs.forEach((log) => {
    const visitorId = String(log.visitorId);
    if (!visitLogByVisitor.has(visitorId)) {
      visitLogByVisitor.set(visitorId, log);
    }
  });

  const auditByVisitor = new Map();
  auditLogs.forEach((log) => {
    const visitorId = String(log.visitorId);
    auditByVisitor.set(visitorId, [...(auditByVisitor.get(visitorId) || []), log]);
  });

  const rows = requests.map((request) =>
    formatLogRow({
      request,
      visitLog: visitLogByVisitor.get(String(request._id)),
      auditTrail: formatAuditTrail(auditByVisitor.get(String(request._id)) || [])
    })
  );

  const filteredRows = status && LOG_STATUSES.includes(status)
    ? rows.filter((row) => row.status === status)
    : rows;

  const direction = sortOrder === 'asc' ? 1 : -1;
  const sortedRows = [...filteredRows].sort((a, b) => {
    const valueA = a[sortBy] || '';
    const valueB = b[sortBy] || '';

    if (sortBy === 'date' || sortBy === 'checkIn' || sortBy === 'checkOut') {
      return (new Date(valueA).getTime() - new Date(valueB).getTime()) * direction;
    }

    return String(valueA).localeCompare(String(valueB)) * direction;
  });

  return sortedRows;
};

export const getAdminLogs = async (req, res, next) => {
  try {
    const logs = await buildLogs(req.query);

    return res.status(200).json({
      success: true,
      message: 'Visitor and audit logs loaded successfully',
      data: {
        logs
      }
    });
  } catch (error) {
    next(error);
  }
};
