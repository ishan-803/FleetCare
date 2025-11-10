const request = require("supertest");
const chai = require("chai");
const app = require("../app");
const fs = require("fs");
const path = require("path");
const { expect } = chai;

const DATA_PATH = path.join(__dirname, "..", "data", "technicians.json");

const SAMPLE_TECHNICIAN = {
  firstName: "John",
  lastName: "Doe",
  skill: "Engine Repair",
  availability: "Monday",
  email: "john.doe@example.com",
  password: "ValidPass123",
};

describe("Technicians API", () => {
  beforeEach(() => {
    fs.writeFileSync(DATA_PATH, "[]", "utf8");
  });

  describe("POST /api/register", () => {
    it("should create technician with valid firstName", async () => {
      const payload = { ...SAMPLE_TECHNICIAN };
      const res = await request(app)
        .post("/api/register") 
        .send(payload)
        .set("Accept", "application/json");

      expect(res.status).to.equal(200); 
      expect(res.body.name).to.include(payload.firstName);
    });

    it("should create technician with valid lastName", async () => {
      const payload = { ...SAMPLE_TECHNICIAN };
      const res = await request(app)
        .post("/api/register") 
        .send(payload)
        .set("Accept", "application/json");

      expect(res.status).to.equal(200); 
      expect(res.body.name).to.include(payload.lastName);
    });

    it("should create technician with valid skill", async () => {
      const payload = { ...SAMPLE_TECHNICIAN };
      const res = await request(app)
        .post("/api/register") 
        .send(payload)
        .set("Accept", "application/json");

      expect(res.status).to.equal(200); 
      expect(res.body.expertise).to.equal(payload.skill);
    });

    it("should create technician with valid availability", async () => {
      const payload = { ...SAMPLE_TECHNICIAN };
      const res = await request(app)
        .post("/api/register") 
        .send(payload)
        .set("Accept", "application/json");

      expect(res.status).to.equal(200); 
      expect(res.body.availability).to.equal(payload.availability);
    });

    it("should create technician with valid email", async () => {
      const payload = { ...SAMPLE_TECHNICIAN };
      const res = await request(app)
        .post("/api/register") 
        .send(payload)
        .set("Accept", "application/json");

      expect(res.status).to.equal(200); 
      expect(res.body.email).to.equal(payload.email);
    });

    it("should create technician with valid password", async () => {
      const payload = { ...SAMPLE_TECHNICIAN };
      const res = await request(app)
        .post("/api/register") 
        .send(payload)
        .set("Accept", "application/json");

      expect(res.status).to.equal(200); 
      expect(res.body).to.not.have.property("password");
    });
  });
});