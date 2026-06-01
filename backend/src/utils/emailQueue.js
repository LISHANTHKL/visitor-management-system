import { VisitorRequest } from '../models/visitorRequest.model.js';
import { sendEmail } from '../services/email.service.js';
import {
  buildVisitCheckInEmail,
  buildVisitCheckOutEmail,
  buildRequestApprovedEmail,
  buildRequestRejectedEmail,
  buildRequestSubmittedEmail
} from '../services/emailTemplate.service.js';

const emailTemplateBuilders = {
  requestSubmitted: buildRequestSubmittedEmail,
  requestApproved: buildRequestApprovedEmail,
  requestRejected: buildRequestRejectedEmail
};

const visitEmailTemplateBuilders = {
  visitCheckIn: buildVisitCheckInEmail,
  visitCheckOut: buildVisitCheckOutEmail
};

const emailTypeLabels = {
  requestSubmitted: 'Request Submitted',
  requestApproved: 'Request Approved',
  requestRejected: 'Request Rejected'
};

const appendEmailLog = async ({ requestId, type, status, recipient, message }) => {
  await VisitorRequest.findByIdAndUpdate(requestId, {
    $push: {
      emailLogs: {
        type: emailTypeLabels[type] || type,
        status,
        recipient,
        message,
        timestamp: new Date()
      }
    }
  });
};

export const queueVisitorRequestEmail = ({ request, type }) => {
  const templateBuilder = emailTemplateBuilders[type];

  if (!templateBuilder || !request?.visitorEmail) {
    return;
  }

  setImmediate(async () => {
    const recipient = request.visitorEmail;

    try {
      const email = templateBuilder(request);
      await sendEmail({
        to: recipient,
        subject: email.subject,
        html: email.html,
        attachments: email.attachments
      });

      await appendEmailLog({
        requestId: request._id,
        type,
        status: 'sent',
        recipient,
        message: 'Email sent'
      });
    } catch (error) {
      console.error(`Email notification failed for request ${request._id}:`, error.message);

      try {
        await appendEmailLog({
          requestId: request._id,
          type,
          status: 'failed',
          recipient,
          message: error.message || 'Email failed'
        });
      } catch (logError) {
        console.error(`Email log failed for request ${request._id}:`, logError.message);
      }
    }
  });
};

export const queueVisitLogEmail = ({ visitLog, type }) => {
  const templateBuilder = visitEmailTemplateBuilders[type];

  if (!templateBuilder || !visitLog?.visitorEmail) {
    return;
  }

  setImmediate(async () => {
    const recipient = visitLog.visitorEmail;

    try {
      const email = templateBuilder(visitLog);
      await sendEmail({
        to: recipient,
        subject: email.subject,
        html: email.html,
        attachments: email.attachments
      });
    } catch (error) {
      console.error(`Visit log email failed for ${visitLog._id}:`, error.message);
    }
  });
};
