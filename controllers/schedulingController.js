const Vehicle = require("../models/Vehicle");
const Technician = require("../models/TechnicianRegister");
const Service = require("../models/Service");
const History = require("../models/History");

// GET /api/scheduling/vehicle/:id
exports.getVehicle = async (req, res, next) => {
  try {
    const vin = req.params.id;
    const vehicle = await Vehicle.findOne({ VIN: vin }).lean();

    if (!vehicle) {
      const err = new Error("Vehicle not found");
      err.statusCode = 400;
      return next(err);
    }

    res.json({ vehicle });
  } catch (err) {
    next(err);
  }
};

// GET /api/scheduling/available-technicians
exports.getTechnitian = async (req, res, next) => {
  try {
    const curr_day = new Date()
      .toLocaleString("en-US", { weekday: "long" })
      .toLowerCase();

    const { serviceType } = req.query;
    const query = { availability: curr_day };
    if (serviceType) query.skills = serviceType;

    const technicians = await Technician.find(query).lean();
        
    const filtered = await Promise.all(
      technicians.map(async (tech) => {
        const activeService = await Service.findOne({
          technicianId: tech._id,
          status: { $ne: "Completed" },
          "payment.paymentStatus": { $ne: "Paid" },
        });
        return activeService ? null : tech;
      })
    );

    res.json({
      technician: filtered.filter(Boolean).map((tech) => ({
        _id: tech._id,
        name: `${tech.firstName} ${tech.lastName}`.trim(),
        skills: tech.skills,
        availability: tech.availability,
      })),
    });
  } catch (err) {
    next(err);
  }
};

exports.specificScheduleService = async (req, res, next) => {
  try {
    const {
      vehicleVIN,
      vehicleId,
      serviceType,
      dueServiceDate,
      technicianId,
    } = req.body;

    const vin = vehicleVIN || vehicleId;
    if (!vin) {
      return res.status(400).json({ message: "vehicleVIN or vehicleId is required" });
    }

    const vehicle = vehicleVIN
      ? await Vehicle.findOne({ VIN: vehicleVIN })
      : await Vehicle.findById(vehicleId);

    if (!vehicle) {
      return res.status(400).json({ message: "Vehicle not found" });
    }

    let svcType = serviceType;
    const existingUnassigned = await Service.findOne({
      vehicleVIN: vehicle.VIN,
      status: "Unassigned",
    }).sort({ createdAt: -1 });

    if (!svcType && existingUnassigned) svcType = existingUnassigned.serviceType;
    if (!svcType) {
      return res.status(400).json({ message: "serviceType is required" });
    }

    const validateTechnician = async (techId, svcType, excludeServiceId = null) => {
      const tech = await Technician.findById(techId).lean();
      if (!tech) return res.status(400).json({ message: "Technician not found" });

      const hasSkill =
        Array.isArray(tech.skills) &&
        tech.skills.some((s) => String(s).toLowerCase() === String(svcType).toLowerCase());
      if (!hasSkill) return res.status(400).json({ message: "Technician does not have the required skill" });

      const weekdayNames = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
      const todayDay = weekdayNames[new Date().getDay()];
      const availabilityArray = Array.isArray(tech.availability)
        ? tech.availability.map((d) => String(d).toLowerCase())
        : [String(tech.availability || "").toLowerCase()];
      if (!availabilityArray.includes(todayDay)) {
        return res.status(400).json({ message: `Technician is not available today (${todayDay})` });
      }

      const busy = await Service.findOne({
        technicianId: techId,
        status: { $ne: "Completed" },
        ...(excludeServiceId ? { _id: { $ne: excludeServiceId } } : {}),
      });
      if (busy) return res.status(400).json({ message: "Technician already has an active assignment" });

      return {
        id: techId,
        name: `${tech.firstName || ""} ${tech.lastName || ""}`.trim(),
      };
    };

    
    if (existingUnassigned) {
      if (technicianId) {
        const techInfo = await validateTechnician(technicianId, svcType, existingUnassigned._id);
        if (!techInfo) return; 
        existingUnassigned.technicianId = techInfo.id;
        existingUnassigned.technicianName = techInfo.name;
      }

      existingUnassigned.serviceType = svcType;
      existingUnassigned.dueServiceDate = dueServiceDate || existingUnassigned.dueServiceDate;
      await existingUnassigned.save();

      return res.status(200).json({
        message: "Service updated",
        serviceId: existingUnassigned._id,
      });
    }

   return res.status(400).json({ message: "No unassigned service found for this vehicle" });
     } catch (err) {
    next(err);
  }
};



// GET /api/scheduling/scheduledServices
exports.getSchechuledServices = async (req, res, next) => {
  try {
    const services = await Service.find().lean();
    res.json({ scheduled_services: services });
  } catch (err) {
    next(err);
  }
};

// GET api/scheduling/unassigned
exports.getUnassignedServices = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      const err = new Error("Access denied. Admins only.");
      err.statusCode = 400;
      return next(err);
    }

    const unassignedServices = await Service.find({
      technicianId: null,
      technicianName: null,
    }).lean();

    const enriched = await Promise.all(
      unassignedServices.map(async (svc) => {
        const vehicle = await Vehicle.findOne({ VIN: svc.vehicleVIN }).lean();
        return {
          ...svc,
          vehicleType: vehicle?.type || "",
          vehicleMake: vehicle?.make || "",
          vehicleModel: vehicle?.model || "",
          vehicleYear: vehicle?.year || null,
          lastServiceDate: vehicle?.lastServiceDate || null,
        };
      })
    );

    res.json({ unassigned_services: enriched });
  } catch (err) {
    next(err);
  }
};
