const { checkSchema } = require('express-validator');

exports.validateSchedule = checkSchema({
  vehicleVIN: {
    in: ['body'],
    isString: true,
    notEmpty: {
      errorMessage: 'Vehicle VIN is required'
    },
    trim: true
  },

  serviceType: {
    in: ['body'],
    isString: true,
    notEmpty: {
      errorMessage: 'Service type is required'
    },
    trim: true,
    isIn: {
      options: [['Oil Change', 'Brake Repair', 'Battery Test']],
      errorMessage: 'Unsupported service type'
    }
  },

  dueServiceDate: {
    in: ['body'],
    notEmpty: {
      errorMessage: 'Due service date is required'
    },
    isISO8601: {
      errorMessage: 'Due service date must be a valid ISO date'
    },
    custom: {
      options: (value) => {
        const inputDate = new Date(value);
        const now = new Date();
        if (inputDate <= now) {
          throw new Error('Due service date must be in the future');
        }
        return true;
      }
    }
  },

  technicianId: {
    in: ['body'],
    optional: true,
    isMongoId: {
      errorMessage: 'Technician ID must be a valid MongoDB ObjectId'
    }
  }
});
