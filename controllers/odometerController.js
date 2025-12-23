const Vehicle = require("../models/Vehicle");
const Service = require("../models/Service");

const pad = (num) => String(num).padStart(3, "0");

// POST /api/vehicles/new/odometer
exports.addOdometerReading = async (req, res, next) => {
  try {
    const { mileage, serviceType } = req.body;
    const vin = req.params.id;

    if (typeof mileage !== "number") {
      return res.status(400).json({ message: "mileage must be a number" });
    }

    const vehicle = await Vehicle.findOne({ VIN: vin });
    if (!vehicle) {
      return res.status(400).json({ message: "Vehicle VIN does not exist." });
    }

    const now = new Date();
    let latest = null;
if (vehicle.odometerReadings && vehicle.odometerReadings.length > 0) {
  latest = vehicle.odometerReadings.reduce((a, b) =>
    new Date(a.date) > new Date(b.date) ? a : b
  );
}


    if (latest) {
      if (mileage <= latest.mileage) {
        return res.status(400).json({ message: "Mileage must be greater than the last recorded value." });
      }
      if (now < new Date(latest.date)) {
        return res.status(400).json({ message: "Request can't be processed right now." });
      }
    }

    const increment = vehicle.type?.toLowerCase() === "truck" ? 20000 : 10000;
    const computedNextServiceMileage = mileage + increment;

    const existingUnpaidService = await Service.findOne({
      vehicleVIN: vin,
      status: { $ne: "Completed" },
      $or: [
        { "payment.paymentStatus": { $exists: false } },
        { "payment.paymentStatus": { $ne: "Paid" } },
      ],
    });
    if (existingUnpaidService) {
      return res.status(400).json({
        message: "Existing unpaid service present; cannot add odometer reading until service is paid or completed",
        serviceId: existingUnpaidService._id,
      });
    }

    const nextIndex = (vehicle.odometerReadings?.length || 0) + 1;
    const newReadingId = "R" + pad(nextIndex);
    const newReading = { readingId: newReadingId, mileage, date: now };

const hasNextServiceMileage = Boolean(vehicle.nextServiceMileage);

    if (!hasNextServiceMileage && mileage <= 0) {
      return res.status(400).json({ message: "Invalid mileage for initial reading" });
    }
    if (hasNextServiceMileage && mileage < vehicle.nextServiceMileage) {
      return res.status(400).json({ message: "Mileage is less than nextServiceMileage; reading not added until due" });
    }
    if (!serviceType || !String(serviceType).trim()) {
      return res.status(400).json({
        message: `serviceType is required when ${hasNextServiceMileage ? "mileage meets or exceeds nextServiceMileage" : "creating an initial service"}`
      });
    }

    // Create service
    const svcType = String(serviceType).trim();
    const svc = new Service({
      vehicleVIN: vin,
      serviceType: svcType,
      status: "Unassigned",
      createdAt: now,
      readingId: newReading.readingId,
    });
    const createdService = await svc.save();

    // Update vehicle
    vehicle.odometerReadings = vehicle.odometerReadings || [];
    vehicle.odometerReadings.push(newReading);
    vehicle.nextServiceMileage = computedNextServiceMileage;
    await vehicle.save();

    res.status(200).json({
      reading: newReading,
      nextServiceMileage: vehicle.nextServiceMileage,
      serviceId: createdService._id,
    });
  } catch (err) {
    next(err);
  }
};


// GET /api/vehicles/new/odometer
exports.getodometerReading = async (req, res, next) => {
  try {
    const vin = req.params.id;

    const vehicle = await Vehicle.findOne({ VIN: vin }).lean();

    if (!vehicle) {
      const err = new Error("Vehicle not found.");
      err.statusCode = 400;
      return next(err);
    }

    const readings = vehicle.odometerReadings || [];

    res.status(200).json(readings);
  } catch (err) {
    next(err);
  }
};
