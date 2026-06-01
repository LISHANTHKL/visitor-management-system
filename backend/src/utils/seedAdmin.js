import { connectDatabase } from '../config/db.js';
import { User } from '../models/user.model.js';

const seedAdmin = async () => {
  try {
    await connectDatabase();

    const adminEmail = 'admin@test.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('Admin user already exists:', adminEmail);
      process.exit(0);
    }

    await User.create({
      name: 'System Admin',
      email: adminEmail,
      password: 'Admin@12345',
      role: 'admin',
      department: 'Administration',
      phone: '',
      active: true
    });

    console.log('Admin user created:', adminEmail);
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed admin user:', error.message);
    process.exit(1);
  }
};

seedAdmin();

