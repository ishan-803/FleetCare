const request = require('supertest');
const chai = require('chai');
const fs = require('fs').promises;
const path = require('path');
const app = require('../app');
const { expect } = chai;

const odometerFilePath = path.join(__dirname, '../data/odometer.json');
const vehicleFilePath = path.join(__dirname, '../data/vehicle.json'); 

const VEHICLE_ID = "V001"; 
const BASE_READING = {
  readingId: "R001", 
  mileage: 1260,
  timestamp: '2025-10-25T12:24:20.008Z'
};

const MOCK_VEHICLE = {
  "vehicleId": "V001",
  "type": "Car",
  "make": "Hyundai",
  "model": "i20",
  "year": 2023,
  "VIN": "ABC123XYZ",
  "LastServiceDate": "10/10/2023"
};

const VALID_READING = { mileage: 1300 };
const LOWER_MILEAGE = { mileage: 1200 };
const NEGATIVE_MILEAGE = { mileage: -50 };
const INVALID_ID = 'abc';

describe('POST /api/vehicles/:id/odometer', () => {
  beforeEach(async () => {
    const initialData = [
      {
        vehicleId: VEHICLE_ID,
        readings: [BASE_READING]
      }
    ];
    await fs.writeFile(odometerFilePath, JSON.stringify(initialData, null, 2));
    await fs.writeFile(vehicleFilePath, JSON.stringify([MOCK_VEHICLE], null, 2));
  });

  it('should add a valid odometer reading', async () => {
    const res = await request(app)
      .post(`/api/vehicles/${VEHICLE_ID}/odometer`)
      .send(VALID_READING);

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('readingId');
    expect(res.body.readingId).to.match(/^R\d{3}$/); 
    expect(res.body.mileage).to.equal(1300);
  });

  it('should fail if mileage is lower than last recorded', async () => {
    const res = await request(app)
      .post(`/api/vehicles/${VEHICLE_ID}/odometer`)
      .send(LOWER_MILEAGE);

    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal('Mileage must be greater than the last recorded value.');
  });

  it('should fail if mileage is negative', async () => {
    const res = await request(app)
      .post(`/api/vehicles/${VEHICLE_ID}/odometer`)
      .send(NEGATIVE_MILEAGE);

    expect(res.status).to.equal(400);
    const errorMsg = res.body.errors?.[0]?.msg || res.body.message;
    expect(errorMsg).to.match(/must be a positive number|Mileage must be greater than/);
  });

  it('should fail if vehicle ID format is invalid', async () => {
    const res = await request(app)
      .post(`/api/vehicles/${INVALID_ID}/odometer`)
      .send(VALID_READING);

    expect(res.status).to.equal(400);
    const errorMsg = res.body.errors[0].msg; 
    expect(errorMsg).to.equal('Vehicle ID must be in the format V001'); 
  });
});

describe('GET /api/vehicles/:id/odometer', () => {
  beforeEach(async () => {
    const initialData = [
      {
        vehicleId: VEHICLE_ID,
        readings: [BASE_READING]
      }
    ];
    await fs.writeFile(odometerFilePath, JSON.stringify(initialData, null, 2));
  });

  it('should return odometer readings for a valid vehicle', async () => {
    const res = await request(app).get(`/api/vehicles/${VEHICLE_ID}/odometer`);
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array').with.lengthOf(1);
    expect(res.body[0].vehicleId).to.equal(VEHICLE_ID);
  });

  it('should return 400 if no readings exist for vehicle', async () => {
    const res = await request(app).get(`/api/vehicles/V999/odometer`);
    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal('No entries available for this vehicle.');
  });
});