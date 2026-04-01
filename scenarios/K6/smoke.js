/**
 * Smoke Test - Single user, single journey
 *
 * Usage: k6 run scenarios/K6/smoke.js
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { auth } from './modules/auth.js';
import { requests } from './modules/requests.js';
import { data } from './modules/data.js';

const BASE_URL = __ENV.BASE_URL || 'https://forms-runner.perf-test.cdp-int.defra.cloud';
const FORM_ID = 'jn-perf-test';
const LONG_DELAY = parseInt(__ENV.LONG_DELAY || '5000');

export const options = {
  vus: 1,
  iterations: 1,
  thresholds: {
    'http_req_duration': ['p(95)<1000'],
    'http_req_failed': ['rate<0.1'],
  },
};

export default function () {
  group('Form Submission Flow', () => {
    const sessionData = auth.getAuthToken(BASE_URL, FORM_ID);
    if (!sessionData || !sessionData.crumb) {
      console.error('Failed to extract authentication token');
      return;
    }

    // Page 1
    requests.submitFormPage(BASE_URL, FORM_ID, 'whats-the-boat-owners-name', { textField: 'bob' }, sessionData.crumb);
    sleep(LONG_DELAY / 1000);

    // Page 2
    const addressData = data.getAddressData();
    requests.submitFormPage(BASE_URL, FORM_ID, 'whats-the-boat-owners-address', { tqBsut__addressLine1: addressData.line1, tqBsut__addressLine2: addressData.line2, tqBsut__town: addressData.town, tqBsut__postcode: addressData.postcode, tqBsut__county: addressData.county, tqBsut__uprn: '123' }, sessionData.crumb);
  });
}
