import { VisitorRequest, VISITOR_REQUEST_STATUS } from '../models/visitorRequest.model.js';
import { getVisitDateRange } from '../utils/visitSlots.js';

const requestFields =
  'visitorName visitorEmail visitorPhone employeeId employeeName designation department cabinNumber purpose visitDate visitTime status rejectionReason createdAt updatedAt';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getLocalDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getEmployeeVisitorRequests = async (req, res, next) => {
  try {
    const { date = '', status = '', visitorName = '' } = req.query;
    const query = {
      employeeId: req.user._id
    };

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

    if (visitorName.trim()) {
      query.visitorName = new RegExp(escapeRegex(visitorName.trim()), 'i');
    }

    const requests = await VisitorRequest.find(query).select(requestFields).sort({ visitDate: -1, visitTime: -1 });

    return res.status(200).json({
      success: true,
      message: 'Employee visitor requests loaded successfully',
      data: {
        requests
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getTodayApprovedVisitors = async (req, res, next) => {
  try {
    const dateRange = getVisitDateRange(getLocalDateKey());
    const requests = await VisitorRequest.find({
      employeeId: req.user._id,
      status: 'approved',
      visitDate: {
        $gte: dateRange.start,
        $lt: dateRange.end
      }
    })
      .select(requestFields)
      .sort({ visitTime: 1 });

    return res.status(200).json({
      success: true,
      message: "Today's approved visitors loaded successfully",
      data: {
        requests
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getUpcomingApprovedVisitors = async (req, res, next) => {
  try {
    const todayRange = getVisitDateRange(getLocalDateKey());
    const requests = await VisitorRequest.find({
      employeeId: req.user._id,
      status: 'approved',
      visitDate: {
        $gte: todayRange.end
      }
    })
      .select(requestFields)
      .sort({ visitDate: 1, visitTime: 1 });

    return res.status(200).json({
      success: true,
      message: 'Upcoming approved visitors loaded successfully',
      data: {
        requests
      }
    });
  } catch (error) {
    next(error);
  }
};
