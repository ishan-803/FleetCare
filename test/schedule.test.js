const request = require('supertest');
const chai = require('chai');
const app = require('../app');
const fs = require('fs');
const path = require('path');
const { expect } = chai;

const BASE = '/api/scheduling';

const vehicleFilePath = path.join(__dirname, '../data/vehicle.json');
const technicianFilePath = path.join(__dirname, '../data/technicians.json');
const odometerFilePath = path.join(__dirname, '../data/odometer.json');
const serviceFilePath = path.join(__dirname, '../data/services.json');

console.log('Running schedule tests...');

const VEHICLE = {
  vehicleId: "V001", 
  type: 'Car',
  make: 'Hyundai',
  model: 'i20',
  year: 2023,
  VIN: 'ABC123XYZ',
  LastServiceDate: '10/10/2023'
};

const TECHNICIAN = {
  technicianId: "T001", 
  name: 'John Doe',
  availability: new Date().toLocaleString('en-US', { weekday: 'long' }).toLowerCase()
};

const ODOMETER = {
  vehicleId: "V001",
  readings: [
    { mileage: 10000, date: '01/01/2023' },
    { mileage: 15000, date: '01/06/2023' }
  ]
};

const VALID_SCHEDULE = {
  vehicleId: "V001", 
  technicianId: "T001",
  dueServiceDate: '2025-12-01',
  serviceType: 'General Maintenance'
};

const INVALID_SCHEDULE = {
  vehicleId: "V999", 
  technicianId: "T888", 
  dueServiceDate: '2025-12-01'
};

const PAST_DATE_SCHEDULE = {
  vehicleId: "V001", 
  technicianId: "T001", 
  dueServiceDate: '2020-01-01'
};

describe('POST /schedule', () => {
  beforeEach(() => {
    fs.writeFileSync(vehicleFilePath, JSON.stringify([VEHICLE], null, 2));
    fs.writeFileSync(technicianFilePath, JSON.stringify([TECHNICIAN], null, 2));
    fs.writeFileSync(odometerFilePath, JSON.stringify([ODOMETER], null, 2));
    fs.writeFileSync(serviceFilePath, JSON.stringify([], null, 2));
  });

  it('should schedule service with valid data', async () => {
    const res = await request(app)
      .post(`${BASE}/schedule`)
      .send(VALID_SCHEDULE);

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('message', 'Service scheduled successfully');
    expect(res.body).to.have.property('serviceId');
    expect(res.body.serviceId).to.match(/^S\d{3}$/); 
  });

  it('should fail if dueServiceDate is in the past', async () => {
    const res = await request(app)
      .post(`${BASE}/schedule`)
      .send(PAST_DATE_SCHEDULE);

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('error', 'Due service date must be in the future');
  });

  it('should fail with invalid vehicle or technician ID', async () => {
    const res = await request(app)
      .post(`${BASE}/schedule`)
      .send(INVALID_SCHEDULE);

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('error', 'Invalid vehicle ID or Invalid Technician ID');
  });
});

describe('GET /scheduledServices', () => {
  it('should return all scheduled services', async () => {
    fs.writeFileSync(serviceFilePath, JSON.stringify([{
      serviceId: "S001", 
      vehicleId: "V001",
      technicianId: "T001", 
      technicianName: 'John Doe',
      serviceType: 'General Maintenance',
      type: 'Car',
      make: 'Hyundai',
      model: 'i20',
      year: 2023,
      VIN: 'ABC123XYZ',
      Next_mileage: 25000,
      DueServiceDate: '2025-12-01',
      NextServiceDate: '2026-04-10'
    }], null, 2));

    const res = await request(app).get(`${BASE}/scheduledServices`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('scheduled_services');
    expect(res.body.scheduled_services).to.be.an('array').with.lengthOf(1);
  });
});

describe('GET /vehicle/:id', () => {
  it('should fetch vehicle by ID', async () => {
    const res = await request(app).get(`${BASE}/vehicle/V001`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('vehicle');
    expect(res.body.vehicle).to.be.an('array').with.lengthOf(1);
  });
});

describe('GET /technician', () => {
  it('should fetch available technicians', async () => {
    const res = await request(app).get(`${BASE}/technician`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('technician');
    expect(res.body.technician).to.be.an('array').with.lengthOf(1);
  });
});