const { checkSchema } = require('express-validator');
 
exports.validateRegistration = checkSchema({
  username: {
    in: ['body'],
    isString: {
      errorMessage: 'Username must be a string',
    },
    isLength: {
      options: { min: 3, max: 50 },
      errorMessage: 'Username must be between 3 and 50 characters',
    },
    matches: {
      options: /^[a-zA-Z0-9_]+$/,
      errorMessage: 'Username can only contain letters, numbers and underscores',
    },
  },
 
  email: {
    in: ['body'],
    isEmail: {
      errorMessage: 'Must provide a valid email address',
    },
    normalizeEmail: true,
  },
 
  password: {
    in: ['body'],
    isLength: {
      options: { min: 8 },
      errorMessage: 'Password must be at least 8 characters long',
    },
    matches: {
      options: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])/,
      errorMessage: 'Password must contain at least one letter, one number and one special character',
    },
  },
 
  confirmPassword: {
    in: ['body'],
    custom: {
      options: (value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Password confirmation does not match password');
        }
        return true;
      },
    },
  },
 
  availabilityDays: {
    in: ['body'],
    isArray: {
      errorMessage: 'Availability days must be an array',
    },
    custom: {
      options: (value) => {
        const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        return value.every(day => validDays.includes(day));
      },
      errorMessage: 'Invalid day selection. Must be valid weekdays',
    },
  },
 
  skills: {
    in: ['body'],
    isArray: {
      errorMessage: 'Skills must be an array',
    },
    custom: {
      options: (value) => {
        const validSkills = [
          'Oil Change',
          'Brake Repair',
          'Battery Test',
        ];
        return value.every(skill => validSkills.includes(skill));
      },
      errorMessage: 'Invalid skill selection. Must be from predefined skill set',
    },
  },
});
 