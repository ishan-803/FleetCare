const { checkSchema, param } = require("express-validator");

const createAssignmentValidator = checkSchema({
  serviceId: {
    in: ["body"],
    exists: {
      errorMessage: "Service ID is required.",
    },
    isString: { 
      errorMessage: "Service ID must be a string.",
    },
    matches: { 
      options: [/^S\d{3}$/],
      errorMessage: "Service ID must be in the format S001"
    }
  },
  technicianId: {
    in: ["body"],
    exists: {
      errorMessage: "Technician ID is required.",
    },
    isString: {
      errorMessage: "Technician ID must be a string.",
    },
    matches: { 
      options: [/^T\d{3}$/],
      errorMessage: "Technician ID must be in the format T001"
    }
  },
});

const updateStatusValidator = [
  param("id")
    .notEmpty()
    .withMessage("Assignment ID parameter in the URL is required.")
    .isString().withMessage('Assignment ID must be a string') 
    .matches(/^A\d{3}$/).withMessage('Assignment ID must be in the format A001'),
  ...checkSchema({
    status: {
      in: ["body"],
      exists: {
        errorMessage: "Status is required in the request body.",
      },
      isIn: {
        options: [["Assigned", "Work In Progress", "Completed"]],
        errorMessage:
          "Status must be one of: Assigned, Work In Progress, Completed.",
      },
    },
  }),
];

module.exports = {
  createAssignmentValidator,
  updateStatusValidator,
};