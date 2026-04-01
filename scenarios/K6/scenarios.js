/**
 * K6 Test Scenarios - Different load profiles for various testing needs
 *
 * Usage:
 *   k6 run -s smoke scenarios/K6/scenarios.js
 *   k6 run -s load scenarios/K6/scenarios.js
 *   k6 run -s stress scenarios/K6/scenarios.js
 *   k6 run -s soak scenarios/K6/scenarios.js
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { auth } from './modules/auth.js';
import { requests } from './modules/requests.js';
import { data } from './modules/data.js';

const BASE_URL = __ENV.BASE_URL || 'https://forms-runner.perf-test.cdp-int.defra.cloud';
const FORM_ID = 'jn-perf-test';
const LONG_DELAY = parseInt(__ENV.LONG_DELAY || '5000');

// Define multiple scenarios with different load profiles
export const options = {
  scenarios: {
    // Smoke test - Quick validation with minimal load
    smoke: {
      executor: 'constant-vus',
      vus: 1,
      duration: '30s',
    },

    // Load test - Realistic sustained load
    load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 100 },
        { duration: '10m', target: 100 },
        { duration: '2m', target: 0 },
      ],
      gracefulRampDown: '30s',
    },

    // Stress test - Push system to limits
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 200 },
        { duration: '5m', target: 200 },
        { duration: '2m', target: 300 },
        { duration: '5m', target: 300 },
        { duration: '2m', target: 0 },
      ],
      gracefulRampDown: '30s',
    },

    // Soak test - Long duration at moderate load
    soak: {
      executor: 'constant-vus',
      vus: 50,
      duration: '30m',
    },
  },

  thresholds: {
    'http_req_duration': ['p(95)<1000', 'p(99)<2000'],
    'http_req_failed': ['rate<0.1'],
  },
};

// Main test function (same as index.js)
export default function () {
  group('Form Submission Flow', () => {
    const sessionData = auth.getAuthToken(BASE_URL, FORM_ID);

    if (!sessionData || !sessionData.crumb) {
      console.error('Failed to extract authentication token');
      return;
    }

    group('Page 1: Owner Name', () => {
      const response = requests.submitFormPage(
        BASE_URL,
        FORM_ID,
        'whats-the-boat-owners-name',
        { textField: 'bob' },
        sessionData.crumb
      );

      check(response, {
        'Owner name submission status is 200': (r) => r.status === 200,
      });
      sleep(LONG_DELAY / 1000);
    });

    group('Page 2: Owner Address', () => {
      const addressData = data.getAddressData();
      const formData = {
        tqBsut__addressLine1: addressData.line1,
        tqBsut__addressLine2: addressData.line2,
        tqBsut__town: addressData.town,
        tqBsut__postcode: addressData.postcode,
        tqBsut__county: addressData.county,
        tqBsut__uprn: '123',
      };

      const response = requests.submitFormPage(
        BASE_URL,
        FORM_ID,
        'whats-the-boat-owners-address',
        formData,
        sessionData.crumb
      );

      check(response, {
        'Address submission status is 200': (r) => r.status === 200,
      });
      sleep(LONG_DELAY / 1000);
    });

    group('Page 3: Proof of Address', () => {
      const response = http.get(`${BASE_URL}/form/${FORM_ID}/proof-of-address`, {
        headers: auth.getHeaders(),
      });

      check(response, {
        'Proof of address page status is 200': (r) => r.status === 200,
      });
      sleep(LONG_DELAY / 1000);
    });

    group('File Upload', () => {
      const uploadResponse = requests.uploadFile(
        BASE_URL,
        FORM_ID,
        sessionData.crumb
      );

      check(uploadResponse, {
        'File upload status is 200': (r) => r.status === 200,
      });
      sleep(LONG_DELAY / 1000);
    });

    group('Page 4: Email Address', () => {
      const response = requests.submitFormPage(
        BASE_URL,
        FORM_ID,
        'whats-the-boat-owners-email-address',
        { ZhyvQf: 'me@info.uk' },
        sessionData.crumb
      );

      check(response, {
        'Email submission status is 200': (r) => r.status === 200,
      });
      sleep(LONG_DELAY / 1000);
    });

    group('Page 5: Phone Number', () => {
      const response = requests.submitFormPage(
        BASE_URL,
        FORM_ID,
        'whats-the-boat-owners-phone-number',
        { zlmXyr: '12345' },
        sessionData.crumb
      );

      check(response, {
        'Phone submission status is 200': (r) => r.status === 200,
      });
      sleep(LONG_DELAY / 1000);
    });

    group('Page 6: Boat Name', () => {
      const response = requests.submitFormPage(
        BASE_URL,
        FORM_ID,
        'whats-the-boats-name',
        { pzCarF: 'myBoat' },
        sessionData.crumb
      );

      check(response, {
        'Boat name submission status is 200': (r) => r.status === 200,
      });
      sleep(LONG_DELAY / 1000);
    });

    group('Page 7: Boat Type', () => {
      const response = requests.submitFormPage(
        BASE_URL,
        FORM_ID,
        'what-type-of-boat-are-you-registering',
        { zOKCBX: 'Commercial vessel' },
        sessionData.crumb
      );

      check(response, {
        'Boat type submission status is 200': (r) => r.status === 200,
      });
      sleep(LONG_DELAY / 1000);
    });

    group('Page 8: Entry Date', () => {
      const dateData = data.getDateData();
      const response = requests.submitFormPage(
        BASE_URL,
        FORM_ID,
        'when-is-the-boat-going-to-enter-rye-harbour',
        {
          'LFiWon__day': dateData.day,
          'LFiWon__month': dateData.month,
          'LFiWon__year': dateData.year,
        },
        sessionData.crumb
      );

      check(response, {
        'Entry date submission status is 200': (r) => r.status === 200,
      });
      sleep(LONG_DELAY / 1000);
    });

    group('Page 9: Boat Length', () => {
      const response = requests.submitFormPage(
        BASE_URL,
        FORM_ID,
        'how-long-is-the-boat-in-metres',
        { kRQwWs: '55' },
        sessionData.crumb
      );

      check(response, {
        'Boat length submission status is 200': (r) => r.status === 200,
      });
      sleep(LONG_DELAY / 1000);
    });

    group('Page 10: Mooring', () => {
      const response = requests.submitFormPage(
        BASE_URL,
        FORM_ID,
        'mooring',
        { theoPm: 'bfgb' },
        sessionData.crumb
      );

      check(response, {
        'Mooring submission status is 200': (r) => r.status === 200,
      });
      sleep(LONG_DELAY / 1000);
    });

    group('Page 11: Insurance Status', () => {
      const response = requests.submitFormPage(
        BASE_URL,
        FORM_ID,
        'is-the-boat-insured',
        { tMsgnG: 'true' },
        sessionData.crumb
      );

      check(response, {
        'Insurance status submission status is 200': (r) => r.status === 200,
      });
      sleep(LONG_DELAY / 1000);
    });

    group('Page 12: Insurance Company', () => {
      const response = requests.submitFormPage(
        BASE_URL,
        FORM_ID,
        'what-company-insures-the-boat',
        { WqIeiY: 'Direct Insurance' },
        sessionData.crumb
      );

      check(response, {
        'Insurance company submission status is 200': (r) => r.status === 200,
      });
      sleep(LONG_DELAY / 1000);
    });

    group('Page 13: Insurer Address', () => {
      const insurerAddress = data.getInsurerAddressData();
      const response = requests.submitFormPage(
        BASE_URL,
        FORM_ID,
        'whats-the-insurers-address',
        insurerAddress,
        sessionData.crumb
      );

      check(response, {
        'Insurer address submission status is 200': (r) => r.status === 200,
      });
      sleep(LONG_DELAY / 1000);
    });

    group('Page 14: Insurance Expiration', () => {
      const expirationDate = data.getExpirationDateData();
      const response = requests.submitFormPage(
        BASE_URL,
        FORM_ID,
        'insurance-policy-expiration',
        expirationDate,
        sessionData.crumb
      );

      check(response, {
        'Expiration date submission status is 200': (r) => r.status === 200,
      });
      sleep(LONG_DELAY / 1000);
    });

    group('Summary and Submit', () => {
      const response = requests.submitFormPage(
        BASE_URL,
        FORM_ID,
        'summary',
        {
          userConfirmationEmailAddress: 'abc@gmail.com',
          action: 'send',
        },
        sessionData.crumb
      );

      check(response, {
        'Final submission status is 303': (r) => r.status === 303,
        'Redirect location contains status': (r) =>
          r.headers['Location']?.includes('status') || false,
      });
      sleep(LONG_DELAY / 1000);
    });

    group('Status Page', () => {
      const response = http.get(`${BASE_URL}/form/${FORM_ID}/status`, {
        headers: auth.getHeaders(),
      });

      check(response, {
        'Status page contains submitted': (r) => r.body?.includes('submitted'),
      });
    });
  });
}
