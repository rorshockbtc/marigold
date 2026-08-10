import { test, expect } from '@playwright/test';

test.describe('Security & API Hardening Checks', () => {
  
  test('Relay GET endpoint should reject unauthenticated requests', async ({ request }) => {
    // Attempt to read data without auth
    const response = await request.get('/api/relay?groupId=demo123');
    expect(response.status()).toBe(401);
  });

  test('Relay POST endpoint should reject unauthenticated requests', async ({ request }) => {
    // Attempt to post data without auth
    const response = await request.post('/api/relay', {
      data: {
        groupId: 'demo123',
        blob: { id: 'test', ciphertext: 'test' }
      }
    });
    expect(response.status()).toBe(401);
  });
  
});
