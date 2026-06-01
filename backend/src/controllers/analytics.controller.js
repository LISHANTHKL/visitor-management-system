import { EmployeeStatus } from '../models/employeeStatus.model.js';
import { User } from '../models/user.model.js';
import { VisitLog } from '../models/visitLog.model.js';
import { VisitorRequest } from '../models/visitorRequest.model.js';
import { getVisitDateRange } from '../utils/visitSlots.js';

const getDateRangeFromQuery = ({ startDate = '', endDate = '' }) => {
  const fallbackEnd = new Date();
  const fallbackStart = new Date();
  fallbackStart.setUTCDate(fallbackStart.getUTCDate() - 6);

  const startRange = startDate ? getVisitDateRange(startDate) : getVisitDateRange(fallbackStart.toISOString().slice(0, 10));
  const endRange = endDate ? getVisitDateRange(endDate) : getVisitDateRange(fallbackEnd.toISOString().slice(0, 10));

  if (!startRange || !endRange) {
    const error = new Error('A valid date range is required');
    error.statusCode = 400;
    throw error;
  }

  return {
    start: startRange.start,
    end: endRange.end
  };
};

const makeDateKey = (date) => new Date(date).toISOString().slice(0, 10);

export const getAdminAnalytics = async (req, res, next) => {
  try {
    const { department = '', employeeId = '' } = req.query;
    const range = getDateRangeFromQuery(req.query);
    const visitQuery = {
      visitDate: {
        $gte: range.start,
        $lt: range.end
      }
    };
    const logQuery = {
      checkInTime: {
        $gte: range.start,
        $lt: range.end
      }
    };

    if (department.trim()) {
      visitQuery.department = department.trim();
      logQuery.department = department.trim();
    }

    if (employeeId.trim()) {
      visitQuery.employeeId = employeeId.trim();
      logQuery.employeeId = employeeId.trim();
    }

    const todayRange = getVisitDateRange(new Date().toISOString().slice(0, 10));
    const [
      todayVisitors,
      pendingApprovals,
      approvedToday,
      checkedInVisitors,
      checkedOutVisitors,
      employees,
      statuses,
      requests,
      visitLogs
    ] = await Promise.all([
      VisitorRequest.countDocuments({
        visitDate: { $gte: todayRange.start, $lt: todayRange.end }
      }),
      VisitorRequest.countDocuments({ status: 'pending' }),
      VisitorRequest.countDocuments({
        status: 'approved',
        reviewedAt: { $gte: todayRange.start, $lt: todayRange.end }
      }),
      VisitLog.countDocuments({ status: 'checked_in' }),
      VisitLog.countDocuments({
        status: 'checked_out',
        checkOutTime: { $gte: todayRange.start, $lt: todayRange.end }
      }),
      User.find({ role: 'employee', active: true }).select('_id name department'),
      EmployeeStatus.find({}).select('employeeId status'),
      VisitorRequest.find(visitQuery).select('visitorName employeeId employeeName department visitDate status'),
      VisitLog.find(logQuery).select('employeeId employeeName department checkInTime duration status')
    ]);

    const occupiedIds = new Set(statuses.filter((status) => status.status === 'occupied').map((status) => String(status.employeeId)));
    const availableEmployees = employees.filter((employee) => !occupiedIds.has(String(employee._id))).length;
    const occupiedEmployees = occupiedIds.size;

    const visitorsByDayMap = new Map();
    requests.forEach((request) => {
      const key = makeDateKey(request.visitDate);
      visitorsByDayMap.set(key, (visitorsByDayMap.get(key) || 0) + 1);
    });

    const visitorsByDepartmentMap = new Map();
    requests.forEach((request) => {
      const key = request.department || 'Unassigned';
      visitorsByDepartmentMap.set(key, (visitorsByDepartmentMap.get(key) || 0) + 1);
    });

    const mostVisitedMap = new Map();
    requests.forEach((request) => {
      const key = String(request.employeeId);
      const current = mostVisitedMap.get(key) || { employeeName: request.employeeName || 'Unknown', visits: 0 };
      current.visits += 1;
      mostVisitedMap.set(key, current);
    });

    const durationLogs = visitLogs.filter((log) => Number.isFinite(Number(log.duration)));
    const averageDuration = durationLogs.length
      ? Math.round(durationLogs.reduce((total, log) => total + Number(log.duration), 0) / durationLogs.length)
      : 0;

    const utilizationMap = new Map();
    employees.forEach((employee) => {
      utilizationMap.set(String(employee._id), {
        employeeName: employee.name,
        occupiedVisits: 0
      });
    });
    visitLogs.forEach((log) => {
      const key = String(log.employeeId);
      const current = utilizationMap.get(key) || { employeeName: log.employeeName || 'Unknown', occupiedVisits: 0 };
      current.occupiedVisits += 1;
      utilizationMap.set(key, current);
    });

    return res.status(200).json({
      success: true,
      message: 'Analytics loaded successfully',
      data: {
        cards: {
          todayVisitors,
          pendingApprovals,
          approvedToday,
          checkedInVisitors,
          checkedOutVisitors,
          availableEmployees,
          occupiedEmployees
        },
        charts: {
          visitorsByDay: [...visitorsByDayMap.entries()].map(([date, visitors]) => ({ date, visitors })).sort((a, b) => a.date.localeCompare(b.date)),
          visitorsByDepartment: [...visitorsByDepartmentMap.entries()].map(([departmentName, visitors]) => ({ department: departmentName, visitors })),
          mostVisitedEmployees: [...mostVisitedMap.values()].sort((a, b) => b.visits - a.visits).slice(0, 8),
          averageVisitDuration: [{ label: 'Average Duration', minutes: averageDuration }],
          employeeUtilization: [...utilizationMap.values()].sort((a, b) => b.occupiedVisits - a.occupiedVisits).slice(0, 8)
        },
        filters: {
          departments: [...new Set(employees.map((employee) => employee.department).filter(Boolean))].sort(),
          employees: employees.map((employee) => ({
            _id: employee._id,
            name: employee.name,
            department: employee.department
          }))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
