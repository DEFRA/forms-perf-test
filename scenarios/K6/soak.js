/**
 * Soak Test - Long duration at moderate load (50 VUs, 30 minutes)
 *
 * Usage: k6 run scenarios/K6/soak.js
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
  vus: 50,
  duration: '30m',
  thresholds: {
    'http_req_duration': ['p(95)<1000', 'p(99)<2000'],
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

    group('Page 1: Owner Name', () => {
      requests.submitFormPage(BASE_URL, FORM_ID, 'whats-the-boat-owners-name', { textField: 'bob' }, sessionData.crumb);
      sleep(LONG_DELAY / 1000);
    });

    group('Page 2: Owner Address', () => {
      const addressData = data.getAddressData();
      requests.submitFormPage(BASE_URL, FORM_ID, 'whats-the-boat-owners-address', { tqBsut__addressLine1: addressData.line1, tqBsut__addressLine2: addressData.line2, tqBsut__town: addressData.town, tqBsut__postcode: addressData.postcode, tqBsut__county: addressData.county, tqBsut__uprn: '123' }, sessionData.crumb);
      sleep(LONG_DELAY / 1000);
    });

    group('File Upload', () => {
      requests.uploadFile(BASE_URL, FORM_ID, sessionData.crumb);
      sleep(LONG_DELAY / 1000);
    });

    group('Page 4: Email Address', () => {
      requests.submitFormPage(BASE_URL, FORM_ID, 'whats-the-boat-owners-email-address', { ZhyvQf: 'me@info.uk' }, sessionData.crumb);
      sleep(LONG_DELAY / 1000);
    });

    group('Page 5: Phone Number', () => {
      requests.submitFormPage(BASE_URL, FORM_ID, 'whats-the-boat-owners-phone-number', { zlmXyr: '12345' }, sessionData.crumb);
      sleep(LONG_DELAY / 1000);
    });

    group('Summary and Submit', () => {
      requests.submitFormPage(BASE_URL, FORM_ID, 'summary', { userConfirmationEmailAddress: 'abc@gmail.com', action: 'send' }, sessionData.crumb);
    });
  });
}
