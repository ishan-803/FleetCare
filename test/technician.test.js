const request = require('supertest');
const chai = require('chai');
const app = require('../app');
const fs = require('fs').promises; 
const path = require('path');
const { expect } = chai;

const dataPath = path.join(__dirname, '../data');
const assignmentsPath = path.join(dataPath, 'assignments.json');
const servicesPath = path.join(dataPath, 'services.json');
const techniciansPath = path.join(dataPath, 'technicians.json');

console.log("Running technician tests...");

const MOCK_TECHNICIANS = [
  { "technicianId": "T001", "name": "Ravi" },
  { "technicianId": "T002", "name": "Priya" }
];

const MOCK_SERVICES = [
  { "serviceId": "S001", "technicianId": "T001", "serviceType": "Oil Change" }, 
  { "serviceId": "S002", "technicianId": "T002", "serviceType": "Brake Repair" }, 
  { "serviceId": "S003", "technicianId": "T001", "serviceType": "Battery Test" } 
];

const MOCK_ASSIGNMENTS = [
  { "assignmentId": "A001", "serviceId": "S001", "technicianId": "T001", "status": "Assigned" }, 
  { "assignmentId": "A002", "serviceId": "S003", "technicianId": "T001", "status": "Completed" } 
];

describe('Technician API', () => {

  beforeEach(async () => {
    try {
      await fs.writeFile(assignmentsPath, JSON.stringify(MOCK_ASSIGNMENTS, null, 2));
      await fs.writeFile(servicesPath, JSON.stringify(MOCK_SERVICES, null, 2));
      await fs.writeFile(techniciansPath, JSON.stringify(MOCK_TECHNICIANS, null, 2));
    } catch (err) {
      console.error("Error resetting test data:", err);
    }
  });

  describe('GET /api/technician/assignments', () => {
    it('should return a list of all assignments with technician names', async () => {
      const res = await request(app).get('/api/technician/assignments');
      
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array').with.lengthOf(MOCK_ASSIGNMENTS.length);
      expect(res.body[0].technicianName).to.equal('Ravi'); 
      expect(res.body[0].assignmentId).to.equal('A001');
    });
  });

  describe('GET /api/technician/unassigned-services', () => {
    it('should return only services that are not in assignments.json', async () => {
      const res = await request(app).get('/api/technician/unassigned-services');
      
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      expect(res.body.length).to.equal(1); 
      expect(res.body[0].serviceId).to.equal("S002");
    });
  });

  describe('POST /api/technician/assignments', () => {
    const VALID_ASSIGNMENT = {
      "serviceId": "S002", 
      "technicianId": "T002"
    };

    const ALREADY_ASSIGNED = {
      "serviceId": "S001", 
      "technicianId": "T001"
    };

    const SERVICE_NOT_FOUND = {
      "serviceId": "S999", 
      "technicianId": "T001"
    };

    const MISSING_DATA = {
      "serviceId": "S002" 
    };

    it('should create a new assignment with valid data', async () => {
      const res = await request(app)
        .post('/api/technician/assignments')
        .send(VALID_ASSIGNMENT);
      
      expect(res.status).to.equal(200); 
      expect(res.body).to.have.property('assignmentId');
      expect(res.body.assignmentId).to.match(/^A\d{3}$/); 
      expect(res.body).to.have.property('status', 'Assigned');
     });

     it('should return 400 if service is already assigned', async () => {
       const res = await request(app)
         .post('/api/technician/assignments')
         .send(ALREADY_ASSIGNED);
       
       expect(res.status).to.equal(400);
       expect(res.body.message).to.equal('This service has already been assigned.');
     });

     it('should return 400 if service schedule not found', async () => {
       const res = await request(app)
         .post('/api/technician/assignments')
         .send(SERVICE_NOT_FOUND);
       
       expect(res.status).to.equal(400); 
       expect(res.body.message).to.equal('Corresponding service schedule not found.');
     });

    it('should return 400 if technicianId is missing', async () => {
      const res = await request(app)
        .post('/api/technician/assignments')
        .send(MISSING_DATA);
      
      expect(res.status).to.equal(400);
      expect(res.body.message).to.equal('Service ID and Technician ID are required.');
    });
  });

  describe('PATCH /api/technician/assignments/:id/status', () => {
    const VALID_STATUS = {
      "status": "Work In Progress"
    };

    const INVALID_STATUS = {
      "status": "On Lunch"
    };

    it('should update the status of an existing assignment', async () => {
      const res = await request(app)
        .patch('/api/technician/assignments/A001/status') 
        .send(VALID_STATUS);
      
      expect(res.status).to.equal(200);
      expect(res.body.status).to.equal('Work In Progress');
    });

    it('should return 400 for a non-existent assignment ID', async () => {
      const res = await request(app)
        .patch('/api/technician/assignments/A999/status') 
        .send(VALID_STATUS);
      
      expect(res.status).to.equal(400);
      expect(res.body.message).to.equal('Assignment not found.');
    });

    it('should return 400 for an invalid status value', async () => {
      const res = await request(app)
        .patch('/api/technician/assignments/A001/status') 
        .send(INVALID_STATUS);
      
      expect(res.status).to.equal(400);
      expect(res.body.message).to.equal('Invalid or missing status.');
    });
  });

});