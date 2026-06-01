const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[0-9+\-\s()]{7,20}$/;

const validators = {
  required: (value) => value !== undefined && value !== null && String(value).trim() !== '',
  email: (value) => !value || emailPattern.test(String(value)),
  minLength: (value, length) => !value || String(value).length >= length,
  enum: (value, allowedValues) => !value || allowedValues.includes(value),
  phone: (value) => !value || phonePattern.test(String(value))
};

export const validate = (schema) => {
  return (req, res, next) => {
    const errors = [];

    Object.entries(schema).forEach(([field, rules]) => {
      const value = req.body[field];

      if (rules.required && !validators.required(value)) {
        errors.push(`${field} is required`);
        return;
      }

      if (rules.email && !validators.email(value)) {
        errors.push(`${field} must be a valid email address`);
      }

      if (rules.minLength && !validators.minLength(value, rules.minLength)) {
        errors.push(`${field} must be at least ${rules.minLength} characters`);
      }

      if (rules.enum && !validators.enum(value, rules.enum)) {
        errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
      }

      if (rules.phone && !validators.phone(value)) {
        errors.push(`${field} must be a valid phone number`);
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    next();
  };
};

