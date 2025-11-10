const request = require('supertest');
const chai = require('chai');
const fs = require('fs');
const path = require('path');
const app = require('../app');
const { expect } = chai;

const BASE = '/api/history';

const vehiclePath = path.join(__dirname, '../data/vehicle.json');
const technicianPath = path.join(__dirname, '../data/technicians.json');
const servicePath = path.join(__dirname, '../data/services.json');
const historyPath = path.join(__dirname, '../data/serviceHistory.json');

console.log('Running service history tests...');

// Mock data
const VEHICLE = {
  vehicleId: "V001", 
  type: 'Car',
  make: 'Hyundai',
  model: 'i20',
  year: 2023,
  VIN: 'ABC123XYZ'
};

const TECHNICIAN = {
  technicianId: 'T001',
  name: 'Ravi'
};

const SERVICE = {
  serviceId: "S001", 
  vehicleId: "V001", 
  technicianId: 'T001',
  technicianName: 'Ravi',
  serviceType: 'Oil Change',
  DueServiceDate: '2025-12-01'
};

const VALID_RECORD = {
  serviceId: "S001", 
  price: 1500,
  paymentStatus: 'Paid',
  status: 'Completed'
};

describe('Service History API', () => {
  beforeEach(() => {
    fs.writeFileSync(vehiclePath, JSON.stringify([VEHICLE], null, 2));
    fs.writeFileSync(technicianPath, JSON.stringify([TECHNICIAN], null, 2));
    fs.writeFileSync(servicePath, JSON.stringify([SERVICE], null, 2));
    fs.writeFileSync(historyPath, JSON.stringify([], null, 2));
  });

  // Test Case 1: Validate missing required fields
  it('should return 400 if required fields are missing', async () => {
    const res = await request(app).post(`${BASE}/addService`).send({}); 
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('error');
    expect(res.body.error).to.equal('Missing required fields');
  });

  // Test Case 2: Successful service record creation
  it('should add a new service record (Happy Path)', async () => {
    const res = await request(app).post(`${BASE}/addService`).send(VALID_RECORD); 
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('message', 'Service Record added successfully');
  });

  // Test Case 3: Prevent duplicate service record
  it('should return 400 if record already exists', async () => {
    await request(app).post(`${BASE}/addService`).send(VALID_RECORD);
    const res = await request(app).post(`${BASE}/addService`).send(VALID_RECORD); 
    expect(res.status).to.equal(400); 
    expect(res.body).to.have.property('error', 'Service record already exists for this vehicle and technician');
  });

  // Test Case 4: Retrieve service history by vehicleId
  it('should return service history for a valid vehicleId', async () => {
    const historyRecord = {
      serviceId: "S001", 
      vehicleId: "V001", 
      technicianId: 'T001',
      serviceType: 'Oil Change',
      DueServiceDate: '2025-12-01',
      PaymentStatus: 'Completed',
      cost: 1500,
      paymentStatus: 'Paid'
    };
    fs.writeFileSync(historyPath, JSON.stringify([historyRecord], null, 2));

    const res = await request(app).get(`${BASE}/serviceHistory/V001`); 
    expect(res.status).to.equal(200);
    expect(res.body.vechicleData).to.be.an('array').with.lengthOf(1);
    expect(res.body.vechicleData[0].vehicleId).to.equal("V001"); 
  });
});