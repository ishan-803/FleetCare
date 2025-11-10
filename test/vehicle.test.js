const request = require('supertest');
const chai = require('chai');
const app = require('../app');
const fs = require('fs');
const path = require('path');
const { expect } = chai;

const vehicleFilePath = path.join(__dirname, '../data/vehicle.json');

console.log("Running vehicle tests...");

const VALID_VEHICLE = {
  type: 'Car',
  make: 'Hyundai',
  model: 'i20',
  year: 2023,
  VIN: 'ABC123XYZ',
  LastServiceDate: '10/10/2023'
};

const INVALID_BRAND = {
  type: 'Car',
  make: 'UnknownBrand',
  model: 'i20',
  year: 2023,
  VIN: 'ABC123XYZ',
  LastServiceDate: '10/10/2023'
};

const INVALID_TYPE = {
  type: 'Bike',
  make: 'Hyundai',
  model: 'i20',
  year: 2023,
  VIN: 'ABC123XYZ',
  LastServiceDate: '10/10/2023'
};

const FUTURE_DATE = {
  type: 'Car',
  make: 'Hyundai',
  model: 'i20',
  year: 2023,
  VIN: 'ABC123XYZ',
  LastServiceDate: '10/10/2099'
};

describe('POST /api/vehicles', () => {
  beforeEach(() => {
    fs.writeFileSync(vehicleFilePath, JSON.stringify([], null, 2));
  });

  it('should create vehicle with valid data', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .send(VALID_VEHICLE);

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('vehicleId');
    expect(res.body.vehicleId).to.match(/^V\d{3}$/); 
  });

  it('should fail if brand is not supported', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .send(INVALID_BRAND);

    expect(res.status).to.equal(400);
    expect(res.body.errors[0].msg).to.equal('Unsupported brand');
  });

  it('should fail if vehicle type is invalid', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .send(INVALID_TYPE);

    expect(res.status).to.equal(400);
    expect(res.body.errors[0].msg).to.equal('Invalid vehicle type');
  });

  it('should fail if last service date is in future', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .send(FUTURE_DATE);
    
    expect(res.status).to.equal(400);

    expect(res.body.message).to.equal('Invalid or future last service date');
  });
});

describe('GET /api/vehicles', () => {
  it('should return all vehicles', async () => {
    fs.writeFileSync(vehicleFilePath, JSON.stringify([{
      vehicleId: "V001",
      type: 'Car',
      make: 'Hyundai',
      model: 'i20',
      year: 2023,
      VIN: 'ABC123XYZ',
      LastServiceDate: '10/10/2023'
    }], null, 2));

    const res = await request(app).get('/api/vehicles'); 
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array').with.lengthOf(1);
  });
});