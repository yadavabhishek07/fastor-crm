require('./setup');
const request = require('supertest');
const app = require('../src/app');

describe('Enquiry CRM Workflow API (/api/enquiries)', () => {
  let counselor1Token;
  let counselor2Token;
  let counselor1Id;
  let counselor2Id;

  beforeEach(async () => {
    // Create Counselor 1
    const res1 = await request(app).post('/api/auth/register').send({
      name: 'Counselor One',
      email: 'counselor1@fastor.ai',
      password: 'password123'
    });
    counselor1Token = res1.body.token;
    counselor1Id = res1.body.employee.id;

    // Create Counselor 2
    const res2 = await request(app).post('/api/auth/register').send({
      name: 'Counselor Two',
      email: 'counselor2@fastor.ai',
      password: 'password123'
    });
    counselor2Token = res2.body.token;
    counselor2Id = res2.body.employee.id;
  });

  describe('1. Public Enquiry Submission (No Auth Required)', () => {
    it('should submit public enquiry without any authentication', async () => {
      const res = await request(app)
        .post('/api/enquiries')
        .send({
          name: 'Alice Student',
          email: 'alice@example.com',
          phone: '+91 9876543210',
          courseInterest: 'Full Stack Web Development',
          notes: 'Interested in evening batch'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.enquiry).toHaveProperty('_id');
      expect(res.body.enquiry.status).toBe('unclaimed');
      expect(res.body.enquiry.claimedBy).toBeNull();
    });

    it('should reject enquiry with invalid or missing fields', async () => {
      const res = await request(app).post('/api/enquiries').send({
        name: '',
        email: 'invalid-email',
        courseInterest: ''
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body).toHaveProperty('errors');
    });
  });

  describe('2. Fetch Unclaimed (Public) Leads', () => {
    it('should require authentication to access public enquiries list', async () => {
      const res = await request(app).get('/api/enquiries/public');
      expect(res.statusCode).toBe(401);
    });

    it('should return only unclaimed enquiries', async () => {
      // Create 2 public enquiries
      const enq1 = await request(app).post('/api/enquiries').send({
        name: 'Bob',
        email: 'bob@example.com',
        courseInterest: 'React.js Mastery'
      });
      await request(app).post('/api/enquiries').send({
        name: 'Charlie',
        email: 'charlie@example.com',
        courseInterest: 'Node.js Backend'
      });

      // Counselor 1 claims Bob
      await request(app)
        .post(`/api/enquiries/${enq1.body.enquiry._id}/claim`)
        .set('Authorization', `Bearer ${counselor1Token}`);

      // Now fetch public enquiries
      const res = await request(app)
        .get('/api/enquiries/public')
        .set('Authorization', `Bearer ${counselor2Token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.total).toBe(1);
      expect(res.body.enquiries.length).toBe(1);
      expect(res.body.enquiries[0].name).toBe('Charlie');
    });
  });

  describe('3. Claim Leads Workflow', () => {
    let leadId;

    beforeEach(async () => {
      const res = await request(app).post('/api/enquiries').send({
        name: 'David Student',
        email: 'david@example.com',
        courseInterest: 'MERN Stack'
      });
      leadId = res.body.enquiry._id;
    });

    it('should allow a counselor to claim an unclaimed lead', async () => {
      const res = await request(app)
        .post(`/api/enquiries/${leadId}/claim`)
        .set('Authorization', `Bearer ${counselor1Token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.enquiry.status).toBe('claimed');
      expect(res.body.enquiry.claimedBy._id.toString()).toBe(counselor1Id);
      expect(res.body.enquiry.claimedAt).not.toBeNull();
    });

    it('should return 409 Conflict if another counselor attempts to claim an already claimed lead', async () => {
      // Counselor 1 claims it first
      await request(app)
        .post(`/api/enquiries/${leadId}/claim`)
        .set('Authorization', `Bearer ${counselor1Token}`);

      // Counselor 2 tries to claim the same lead
      const res = await request(app)
        .post(`/api/enquiries/${leadId}/claim`)
        .set('Authorization', `Bearer ${counselor2Token}`);

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already been claimed/i);
    });

    it('should return 404 if claiming non-existent lead ID', async () => {
      const fakeId = '66d0c1e8f1a23b45c6789099';
      const res = await request(app)
        .post(`/api/enquiries/${fakeId}/claim`)
        .set('Authorization', `Bearer ${counselor1Token}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('4. Fetch Claimed Leads for Logged-In User (/api/enquiries/mine)', () => {
    it('should fetch only leads claimed by the logged in counselor', async () => {
      // Create 3 enquiries
      const e1 = await request(app).post('/api/enquiries').send({
        name: 'Lead 1',
        email: 'lead1@example.com',
        courseInterest: 'AI & ML'
      });
      const e2 = await request(app).post('/api/enquiries').send({
        name: 'Lead 2',
        email: 'lead2@example.com',
        courseInterest: 'Full Stack'
      });
      const e3 = await request(app).post('/api/enquiries').send({
        name: 'Lead 3',
        email: 'lead3@example.com',
        courseInterest: 'DevOps'
      });

      // Counselor 1 claims e1 and e2
      await request(app)
        .post(`/api/enquiries/${e1.body.enquiry._id}/claim`)
        .set('Authorization', `Bearer ${counselor1Token}`);
      await request(app)
        .post(`/api/enquiries/${e2.body.enquiry._id}/claim`)
        .set('Authorization', `Bearer ${counselor1Token}`);

      // Counselor 2 claims e3
      await request(app)
        .post(`/api/enquiries/${e3.body.enquiry._id}/claim`)
        .set('Authorization', `Bearer ${counselor2Token}`);

      // Counselor 1 requests their claimed leads
      const mineRes1 = await request(app)
        .get('/api/enquiries/mine')
        .set('Authorization', `Bearer ${counselor1Token}`);

      expect(mineRes1.statusCode).toBe(200);
      expect(mineRes1.body.total).toBe(2);
      expect(mineRes1.body.enquiries.map((e) => e.name)).toEqual(
        expect.arrayContaining(['Lead 1', 'Lead 2'])
      );

      // Counselor 2 requests their claimed leads
      const mineRes2 = await request(app)
        .get('/api/enquiries/mine')
        .set('Authorization', `Bearer ${counselor2Token}`);

      expect(mineRes2.statusCode).toBe(200);
      expect(mineRes2.body.total).toBe(1);
      expect(mineRes2.body.enquiries[0].name).toBe('Lead 3');
    });
  });
});
