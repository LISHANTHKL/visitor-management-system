import crypto from 'crypto';
import QRCode from 'qrcode';
import { env } from '../config/env.js';
import { VisitorRequest } from '../models/visitorRequest.model.js';

const generateSecureToken = () => crypto.randomBytes(32).toString('hex');

const getPassUrl = (requestId) => `${env.frontendUrl.replace(/\/$/, '')}/visitor/pass/${requestId}`;

const buildQrPayload = (request) => ({
  type: 'visitor-pass',
  qrToken: request.qrToken,
  passUrl: getPassUrl(request._id),
  visitId: request._id.toString(),
  visitorName: request.visitorName,
  visitorEmail: request.visitorEmail,
  employeeId: request.employeeId?.toString(),
  employeeName: request.employeeName,
  department: request.department,
  cabinNumber: request.cabinNumber,
  visitDate: request.visitDate,
  visitTime: request.visitTime,
  status: request.status
});

export const generateUniqueQrToken = async (requestId) => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const token = generateSecureToken();
    const existingRequest = await VisitorRequest.exists({
      _id: { $ne: requestId },
      qrToken: token
    });

    if (!existingRequest) {
      return token;
    }
  }

  throw new Error('Unable to generate a unique QR token');
};

export const generateVisitorPassQr = async (request) => {
  request.qrToken = await generateUniqueQrToken(request._id);

  const qrCodeImage = await QRCode.toDataURL(JSON.stringify(buildQrPayload(request)), {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 420
  });

  request.qrCodeImage = qrCodeImage;
  request.qrGeneratedAt = new Date();

  return request;
};

export const getVisitorPassUrl = getPassUrl;
