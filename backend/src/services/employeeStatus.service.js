import { EmployeeStatus } from '../models/employeeStatus.model.js';
import { emitAvailabilityUpdate, emitDashboardUpdate } from './socket.service.js';

export const formatEmployeeStatus = (statusRecord) => {
  if (!statusRecord) return null;

  const employee =
    typeof statusRecord.employeeId === 'object' && statusRecord.employeeId?.name
      ? statusRecord.employeeId
      : null;

  return {
    _id: statusRecord._id,
    employeeId: employee?._id || statusRecord.employeeId,
    employeeName: employee?.name || '',
    employeeEmail: employee?.email || '',
    department: employee?.department || '',
    designation: employee?.designation || '',
    cabinNumber: employee?.cabinNumber || '',
    status: statusRecord.status,
    currentVisitor: statusRecord.currentVisitor,
    updatedAt: statusRecord.updatedAt
  };
};

export const setEmployeeOccupied = async ({ employeeId, visitLog }) => {
  const statusRecord = await EmployeeStatus.findOneAndUpdate(
    { employeeId },
    {
      employeeId,
      status: 'occupied',
      currentVisitor: {
        visitorId: visitLog.visitorId,
        visitLogId: visitLog._id,
        visitorName: visitLog.visitorName,
        visitorEmail: visitLog.visitorEmail,
        checkInTime: visitLog.checkInTime
      }
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).populate('employeeId', 'name email department designation cabinNumber');

  const payload = formatEmployeeStatus(statusRecord);
  emitAvailabilityUpdate(payload);
  emitDashboardUpdate({ reason: 'employee_status_changed' });
  return statusRecord;
};

export const setEmployeeAvailable = async ({ employeeId }) => {
  const statusRecord = await EmployeeStatus.findOneAndUpdate(
    { employeeId },
    {
      employeeId,
      status: 'available',
      currentVisitor: null
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).populate('employeeId', 'name email department designation cabinNumber');

  const payload = formatEmployeeStatus(statusRecord);
  emitAvailabilityUpdate(payload);
  emitDashboardUpdate({ reason: 'employee_status_changed' });
  return statusRecord;
};

export const isEmployeeOccupied = async (employeeId) => {
  const statusRecord = await EmployeeStatus.findOne({ employeeId }).select('status');
  return statusRecord?.status === 'occupied';
};
