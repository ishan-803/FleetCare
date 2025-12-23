const express = require('express');
const { validationResult } = require('express-validator');
const router = express.Router();

const {
  specificScheduleService,
  getSchechuledServices,
  getVehicle,
  getTechnitian,
  getUnassignedServices
} = require('../controllers/schedulingController');

const { validateSchedule } = require('../validator/schedule_validator');
const { authorizeRole } = require('../middlewares/auth');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.get('/vehicle/:id', authorizeRole('admin'), getVehicle);
router.get('/available-technicians', authorizeRole('admin'), getTechnitian);

router.post(
  '/schedule',
  authorizeRole('admin'),
  validateSchedule,          
  handleValidationErrors,    
  specificScheduleService    
);

router.get('/scheduledServices', authorizeRole('admin'), getSchechuledServices);
router.get('/unassigned', authorizeRole('admin'), getUnassignedServices);

module.exports = router;
