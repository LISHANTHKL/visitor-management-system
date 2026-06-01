import mongoose from 'mongoose';

export const VISIT_LOG_STATUS = ['approved', 'checked_in', 'checked_out', 'expired'];

const visitLogSchema = new mongoose.Schema(
  {
    visitorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VisitorRequest',
      required: true
    },
    visitorName: {
      type: String,
      required: true,
      trim: true
    },
    visitorEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    visitorPhone: {
      type: String,
      trim: true,
      default: ''
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    employeeName: {
      type: String,
      required: true,
      trim: true
    },
    department: {
      type: String,
      trim: true,
      default: ''
    },
    cabinNumber: {
      type: String,
      trim: true,
      default: ''
    },
    purpose: {
      type: String,
      trim: true,
      default: ''
    },
    visitDate: {
      type: Date,
      default: null
    },
    visitTime: {
      type: String,
      trim: true,
      default: ''
    },
    checkInTime: {
      type: Date,
      required: true
    },
    checkOutTime: {
      type: Date,
      default: null
    },
    duration: {
      type: Number,
      default: null,
      min: 0
    },
    status: {
      type: String,
      enum: VISIT_LOG_STATUS,
      required: true,
      default: 'checked_in'
    },
    securityUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

visitLogSchema.index(
  { visitorId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'checked_in' }
  }
);
visitLogSchema.index({ visitorName: 'text', employeeName: 'text', visitorEmail: 'text' });
visitLogSchema.index({ checkInTime: -1 });

export const VisitLog = mongoose.model('VisitLog', visitLogSchema);
