
const express = require('express');

const { validationResult } = require('express-validator');

const router = express.Router();

 

const {  addServiceRecord, getAllHistories, getUnpaidCompletedAssignments } = require('../controllers/historyController');

 

const { authenticate } = require('../middlewares/auth');

const { authorizeRole } = require('../middlewares/auth');

const { addServiceSchema } = require('../validator/history_validator');

 

const handleValidationErrors = (req, res, next) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {

    return res.status(400).json({ errors: errors.array() });

  }

  next();

};

 

router.post('/addService',  authenticate, authorizeRole('admin'), addServiceSchema, handleValidationErrors, addServiceRecord);

router.get('/allHistories', authenticate, authorizeRole('admin'), getAllHistories);
router.get('/unpaidAssignments', authenticate, authorizeRole('admin'), getUnpaidCompletedAssignments);

 

module.exports = router;
