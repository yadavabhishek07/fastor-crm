require('./setup');
const request = require('supertest');
const app = require('../src/app');

describe('Authentication API (/api/auth)', () => {
  const counselorData = {
    name: 'Sarah Connor',
    email: 'sarah@fastor.ai',
    password: 'password123'
  };

  describe('POST /api/auth/register', () => {
    it('should register a new employee successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(counselorData);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('token');
      expect(res.body.employee).toHaveProperty('id');
      expect(res.body.employee.email).toBe(counselorData.email);
      expect(res.body.employee).not.toHaveProperty('password');
    });

    it('should reject registration with duplicate email', async () => {
      await request(app).post('/api/auth/register').send(counselorData);

      const res = await request(app)
        .post('/api/auth/register')
        .send(counselorData);

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already registered/i);
    });

    it('should fail validation when fields are missing or invalid', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: '',
          email: 'not-an-email',
          password: '123'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(counselorData);
    });

    it('should log in existing employee and return token', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: counselorData.email,
        password: counselorData.password
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('token');
      expect(res.body.employee.email).toBe(counselorData.email);
    });

    it('should reject login with wrong password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: counselorData.email,
        password: 'wrongpassword'
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid email or password/i);
    });

    it('should reject login for non-existent email', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'unknown@fastor.ai',
        password: 'password123'
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should fetch profile when valid Bearer token provided', async () => {
      const regRes = await request(app)
        .post('/api/auth/register')
        .send(counselorData);
      const token = regRes.body.token;

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.employee.email).toBe(counselorData.email);
    });

    it('should return 401 Unauthorized when token is missing', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
