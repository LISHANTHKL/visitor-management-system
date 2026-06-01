import mongoose from 'mongoose';

export const AUDIT_ACTIONS = ['approved', 'rejected', 'checked_in', 'checked_out'];

const auditLogSchema = new mongoose.Schema(
  {
    visitorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VisitorRequest',
      required: true
    },
    visitLogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VisitLog',
      default: null
    },
    action: {
      type: String,
      enum: AUDIT_ACTIONS,
      required: true
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    actorName: {
      type: String,
      required: true,
      trim: true
    },
    actorRole: {
      type: String,
      required: true,
      trim: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

auditLogSchema.index({ visitorId: 1, action: 1 });
auditLogSchema.index({ timestamp: -1 });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
