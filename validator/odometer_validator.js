const { body, param } = require('express-validator');

exports.validateOdometerReading = [
  // param('id')
  //   .isString().withMessage('Vehicle ID in URL must be a string')
    
  //   .matches(/^(?:V\d{3}|[A-HJ-NPR-Z0-9]{11,17})$/i)
  //   .withMessage('Vehicle ID must be in the format V001 or a valid VIN'),

  body('mileage')
    .notEmpty().withMessage('mileage is required')
    .isNumeric().withMessage('mileage must be a number')
    .isInt({ min: 0 }).withMessage('mileage must be a positive number')
];