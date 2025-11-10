const { body } = require('express-validator');

exports.validateAddServiceRecord = [
  body('serviceId')
    .notEmpty().withMessage('serviceId is required')
    .isString().withMessage('serviceId must be a string')
    .matches(/^S\d{3}$/).withMessage('serviceId must be in the format S001'),

  body('price')
    .notEmpty().withMessage('price is required')
    .isNumeric().withMessage('price must be a number'),

  body('paymentStatus')
    .notEmpty().withMessage('paymentStatus is required'),

  body('status')
    .notEmpty().withMessage('status is required')
];