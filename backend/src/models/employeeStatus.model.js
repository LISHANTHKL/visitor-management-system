import mongoose from 'mongoose';

export const EMPLOYEE_AVAILABILITY_STATUS = ['available', 'occupied'];

const currentVisitorSchema = new mongoose.Schema(
  {
    visitorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VisitorRequest',
      default: null
    },
    visitLogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VisitLog',
      default: null
    },
    visitorName: {
      type: String,
      trim: true,
      default: ''
    },
    visitorEmail: {
      type: String,
      trim: true,
      default: ''
    },
    checkInTime: {
      type: Date,
      default: null
    }
  },
  { _id: false }
);

const employeeStatusSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    status: {
      type: String,
      enum: EMPLOYEE_AVAILABILITY_STATUS,
      default: 'available',
      required: true
    },
    currentVisitor: {
      type: currentVisitorSchema,
      default: null
    }
  },
  {
    timestamps: true
  }
);

employeeStatusSchema.index({ status: 1 });

export const EmployeeStatus = mongoose.model('EmployeeStatus', employeeStatusSchema);
