import { connectDatabase } from '../config/db.js';
import { User } from '../models/user.model.js';

const migrateEmployeeProfileFields = async () => {
  try {
    await connectDatabase();

    const defaultFieldResult = await User.updateMany(
      {},
      [
        {
          $set: {
            designation: { $ifNull: ['$designation', ''] },
            cabinNumber: { $ifNull: ['$cabinNumber', ''] },
            officeLocation: { $ifNull: ['$officeLocation', ''] }
          }
        }
      ]
    );

    const emptyCodeResult = await User.updateMany(
      { employeeCode: '' },
      { $unset: { employeeCode: '' } }
    );

    console.log(
      `Employee profile migration completed. Defaults matched: ${defaultFieldResult.matchedCount}, defaults modified: ${defaultFieldResult.modifiedCount}, empty codes modified: ${emptyCodeResult.modifiedCount}`
    );
    process.exit(0);
  } catch (error) {
    console.error('Employee profile migration failed:', error.message);
    process.exit(1);
  }
};

migrateEmployeeProfileFields();
