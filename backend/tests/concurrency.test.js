require('./setup');
const request = require('supertest');
const app = require('../src/app');

describe('Concurrency & Race Condition Handling', () => {
  it('should allow only ONE counselor to claim a lead when multiple counselors claim simultaneously', async () => {
    // 1. Create a prospective student enquiry
    const enquiryRes = await request(app).post('/api/enquiries').send({
      name: 'High Priority Prospect',
      email: 'priority@example.com',
      courseInterest: 'Advanced System Design'
    });
    const leadId = enquiryRes.body.enquiry._id;

    // 2. Register 5 different counselors
    const counselorTokens = [];
    for (let i = 1; i <= 5; i++) {
      const counselor = await request(app).post('/api/auth/register').send({
        name: `Counselor ${i}`,
        email: `counselor_${i}_${Date.now()}@fastor.ai`,
        password: 'password123'
      });
      counselorTokens.push(counselor.body.token);
    }

    // 3. Fire simultaneous claim requests at the exact same millisecond
    const claimPromises = counselorTokens.map((token) =>
      request(app)
        .post(`/api/enquiries/${leadId}/claim`)
        .set('Authorization', `Bearer ${token}`)
    );

    const responses = await Promise.all(claimPromises);

    // 4. Verify that exactly ONE succeeded with 200, and all others received 409 Conflict
    const successResponses = responses.filter((r) => r.statusCode === 200);
    const conflictResponses = responses.filter((r) => r.statusCode === 409);

    expect(successResponses.length).toBe(1);
    expect(conflictResponses.length).toBe(4);

    expect(successResponses[0].body.success).toBe(true);
    expect(successResponses[0].body.enquiry.status).toBe('claimed');

    conflictResponses.forEach((res) => {
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already been claimed/i);
    });

    // 5. Verify database state
    const publicLeadsRes = await request(app)
      .get('/api/enquiries/public')
      .set('Authorization', `Bearer ${counselorTokens[0]}`);

    expect(publicLeadsRes.body.total).toBe(0);
  });
});
