const request = require('supertest');
const app = require('../app');
const { expect } = require('chai');

describe('Auth with JWT and cookies', () => {
  it('should reject invalid email domain', async () => {
    const res = await request(app).post('/auth/login').send({
      email: 'user@other.com',
      password: 'pass'
    });
    expect(res.status).to.equal(400);
  });

  it('should login admin and access admin route', async () => {
    const res = await request(app).post('/auth/login').send({
      email: 'admin@admin.com',
      password: 'adminPass'
    });
    expect(res.status).to.equal(200);

    const cookie = res.headers['set-cookie']?.[0];
    expect(cookie).to.exist;

    const adminRes = await request(app)
      .get('/auth/admin')
      .set('Cookie', cookie);
    expect(adminRes.status).to.equal(200);
    expect(adminRes.body.message).to.equal('Welcome Admin');
  });

  it('should deny technician access to admin route', async () => {
    const res = await request(app).post('/auth/login').send({
      email: 'tech@fleet.com',
      password: 'techPass'
    });
    expect(res.status).to.equal(200);

    const cookie = res.headers['set-cookie']?.[0];
    expect(cookie).to.exist;

    const adminRes = await request(app)
      .get('/auth/admin')
      .set('Cookie', cookie);
    expect(adminRes.status).to.equal(403);
  });
});
