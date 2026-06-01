import { AuditLog } from '../models/auditLog.model.js';

export const createAuditLog = async ({ visitorId, visitLogId = null, action, actor }) => {
  if (!visitorId || !action || !actor?._id) return null;

  return AuditLog.create({
    visitorId,
    visitLogId,
    action,
    actorId: actor._id,
    actorName: actor.name,
    actorRole: actor.role,
    timestamp: new Date()
  });
};
