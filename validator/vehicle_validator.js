const { body } = require('express-validator');

exports.validateVehicle = [
  body('type')
    .isString().withMessage('Type must be a string')
    .isIn(['Car', 'Truck']).withMessage('Invalid vehicle type'),

  body('make')
    .isString().withMessage('Make must be a string')
    .isIn([
      'Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Mercedes-Benz',
      'Audi', 'Hyundai', 'Kia', 'Volkswagen', 'Nissan', 'Tata',
      'Mahindra', 'Suzuki', 'Renault'
    ]).withMessage('Unsupported brand'),

  body('model')
    .isString().withMessage('Model must be a string'),

  body('year')
    .isInt({ min: 2000 }).withMessage('Year must be a valid integer'),

  body('VIN')
    .isString().withMessage('VIN must be a string'),

  body('LastServiceDate')
    .isDate({ format: 'DD/MM/YYYY' }).withMessage('LastServiceDate must be a valid date in DD/MM/YYYY format')
];
