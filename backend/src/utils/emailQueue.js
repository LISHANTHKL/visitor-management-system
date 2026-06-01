import { VisitorRequest } from '../models/visitorRequest.model.js';
import { sendEmail } from '../services/email.service.js';
import {
  buildRequestApprovedEmail,
  buildRequestRejectedEmail,
  buildRequestSubmittedEmail
} from '../services/emailTemplate.service.js';

const emailTemplateBuilders = {
  requestSubmitted: buildRequestSubmittedEmail,
  requestApproved: buildRequestApprovedEmail,
  requestRejected: buildRequestRejectedEmail
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
        html: email.html
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
