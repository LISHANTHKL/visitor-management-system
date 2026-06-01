import { VisitorRequest } from '../models/visitorRequest.model.js';
import { getVisitDateRange } from '../utils/visitSlots.js';

const verificationFields =
  'visitorName visitorEmail employeeName department cabinNumber visitDate visitTime status qrToken qrGeneratedAt';

const formatRequestDetails = (request) => ({
  visitorName: request.visitorName,
  visitorEmail: request.visitorEmail,
  employeeName: request.employeeName,
  department: request.department,
  cabinNumber: request.cabinNumber,
  visitDate: request.visitDate,
  visitTime: request.visitTime,
  status: request.status
});

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

    return res.status(200).json({
      success: true,
      message: 'Valid Pass',
      data: {
        valid: true,
        code: 'VALID_PASS',
        request: formatRequestDetails(request)
      }
    });
  } catch (error) {
    next(error);
  }
};
