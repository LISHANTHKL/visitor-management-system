import mongoose from 'mongoose';

export const VISITOR_REQUEST_STATUS = ['pending', 'approved'];

const visitorRequestSchema = new mongoose.Schema(
  {
    visitorName: {
      type: String,
      required: [true, 'Visitor name is required'],
      trim: true
    },
    visitorEmail: {
      type: String,
      required: [true, 'Visitor email is required'],
      lowercase: true,
      trim: true
    },
    visitorPhone: {
      type: String,
      required: [true, 'Visitor phone is required'],
      trim: true
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee is required']
    },
    employeeName: {
      type: String,
      required: true,
      trim: true
    },
    designation: {
      type: String,
      trim: true,
      default: ''
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
      required: [true, 'Purpose is required'],
      trim: true,
      maxlength: [500, 'Purpose cannot exceed 500 characters']
    },
    visitDate: {
      type: Date,
      required: [true, 'Visit date is required']
    },
    visitTime: {
      type: String,
      required: [true, 'Visit time is required'],
      trim: true
    },
    status: {
      type: String,
      enum: VISITOR_REQUEST_STATUS,
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

visitorRequestSchema.index({ employeeId: 1, visitDate: 1, visitTime: 1 });

export const VisitorRequest = mongoose.model('VisitorRequest', visitorRequestSchema);
