const { check, sleep } = require('k6');
const http = require('k6/http');

// Load test configuration
export const options = {
  stages: [
    { duration: '2m', target: 10 }, // Ramp up to 10 users
    { duration: '5m', target: 10 }, // Stay at 10 users
    { duration: '2m', target: 20 }, // Ramp up to 20 users
    { duration: '5m', target: 20 }, // Stay at 20 users
    { duration: '2m', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should complete within 500ms
    http_req_failed: ['rate<0.02'],   // Error rate should be less than 2%
  },
};

export default function () {
  // Test homepage
  const homeResponse = http.get('https://your-app.vercel.app');
  
  check(homeResponse, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage loads within 2s': (r) => r.timings.duration < 2000,
    'homepage contains expected content': (r) => r.body.includes('Hello World'),
  });

  // Test API endpoints (if you have any)
  // const apiResponse = http.get('https://your-app.vercel.app/api/health');
  // check(apiResponse, {
  //   'API status is 200': (r) => r.status === 200,
  //   'API response time < 500ms': (r) => r.timings.duration < 500,
  // });

  sleep(1);
}

// Setup function runs once per VU at the beginning of the test
export function setup() {
  console.log('Starting load test...');
  return { timestamp: Date.now() };
}

// Teardown function runs once after the test
export function teardown(data) {
  const duration = Date.now() - data.timestamp;
  console.log(`Load test completed in ${duration}ms`);
}