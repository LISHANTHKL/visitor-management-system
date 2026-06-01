const formatDate = (value) => {
  if (!value) return '-';

  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  }).format(new Date(value));
};

const formatTime = (slot) => {
  if (!slot) return '-';

  const [hourValue, minuteValue] = slot.split(':').map(Number);
  const suffix = hourValue >= 12 ? 'PM' : 'AM';
  const hour = hourValue % 12 || 12;
  return `${String(hour).padStart(2, '0')}:${String(minuteValue).padStart(2, '0')} ${suffix}`;
};

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const detailRow = (label, value) => `
  <tr>
    <td style="padding:10px 12px;color:#64748b;font-size:14px;border-bottom:1px solid #e2e8f0;">${escapeHtml(label)}</td>
    <td style="padding:10px 12px;color:#0f172a;font-size:14px;font-weight:600;border-bottom:1px solid #e2e8f0;">${escapeHtml(value || '-')}</td>
  </tr>
`;

const renderLayout = ({ title, intro, statusLabel, statusColor = '#2563eb', rows = [] }) => `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
            <tr>
              <td style="background:#0f172a;padding:24px;">
                <div style="color:#ffffff;font-size:20px;font-weight:700;">Visitor Management</div>
                <div style="color:#cbd5e1;font-size:13px;margin-top:4px;">${escapeHtml(title)}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;">
                <h1 style="margin:0 0 12px;font-size:22px;color:#0f172a;">${escapeHtml(title)}</h1>
                <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.6;">${escapeHtml(intro)}</p>
                ${
                  statusLabel
                    ? `<div style="display:inline-block;background:${statusColor};color:#ffffff;padding:8px 12px;border-radius:999px;font-size:13px;font-weight:700;margin-bottom:20px;">${escapeHtml(statusLabel)}</div>`
                    : ''
                }
                ${
                  rows.length > 0
                    ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e2e8f0;border-radius:8px;border-collapse:separate;border-spacing:0;overflow:hidden;">${rows.join('')}</table>`
                    : ''
                }
                <p style="margin:24px 0 0;color:#64748b;font-size:13px;line-height:1.6;">This is an automated notification from the Visitor Management System.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

export const buildRequestSubmittedEmail = (request) => ({
  subject: 'Visitor Request Received',
  html: renderLayout({
    title: 'Visitor Request Received',
    intro: 'Your request has been received and is awaiting administrator review.',
    statusLabel: 'Awaiting Review',
    rows: [
      detailRow('Visitor Name', request.visitorName),
      detailRow('Employee Name', request.employeeName),
      detailRow('Visit Date', formatDate(request.visitDate)),
      detailRow('Visit Time', formatTime(request.visitTime))
    ]
  })
});

export const buildRequestApprovedEmail = (request) => ({
  subject: 'Visitor Request Approved',
  html: renderLayout({
    title: 'Visitor Request Approved',
    intro: 'Your visitor request has been approved. Please find your visit details below.',
    statusLabel: 'Status: Approved',
    statusColor: '#16a34a',
    rows: [
      detailRow('Visitor Name', request.visitorName),
      detailRow('Employee Name', request.employeeName),
      detailRow('Designation', request.designation),
      detailRow('Department', request.department),
      detailRow('Cabin Number', request.cabinNumber),
      detailRow('Visit Date', formatDate(request.visitDate)),
      detailRow('Visit Time', formatTime(request.visitTime)),
      detailRow('Status', 'Approved')
    ]
  })
});

export const buildRequestRejectedEmail = (request) => ({
  subject: 'Visitor Request Rejected',
  html: renderLayout({
    title: 'Visitor Request Rejected',
    intro: 'Your visitor request has been rejected. Please review the reason below.',
    statusLabel: 'Status: Rejected',
    statusColor: '#dc2626',
    rows: [
      detailRow('Visitor Name', request.visitorName),
      detailRow('Employee Name', request.employeeName),
      detailRow('Rejection Reason', request.rejectionReason),
      detailRow('Status', 'Rejected')
    ]
  })
});
