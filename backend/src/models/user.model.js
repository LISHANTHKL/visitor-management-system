import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

export const USER_ROLES = ['admin', 'employee', 'security'];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: 'employee'
    },
    department: {
      type: String,
      trim: true,
      default: ''
    },
    designation: {
      type: String,
      trim: true,
      default: ''
    },
    cabinNumber: {
      type: String,
      trim: true,
      default: ''
    },
    employeeCode: {
      type: String,
      trim: true,
      uppercase: true,
      set: (value) => {
        if (typeof value !== 'string') {
          return value;
        }

        const trimmedValue = value.trim();
        return trimmedValue ? trimmedValue : undefined;
      }
    },
    officeLocation: {
      type: String,
      trim: true,
      default: ''
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

userSchema.index(
  { employeeCode: 1 },
  {
    unique: true,
    partialFilterExpression: {
      employeeCode: { $exists: true, $type: 'string' }
    }
  }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function toJSON() {
  const user = this.toObject();
  delete user.password;
  return user;
};

export const User = mongoose.model('User', userSchema);
