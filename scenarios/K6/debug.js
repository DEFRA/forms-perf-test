/**
 * Debug script to test authentication and token extraction
 *
 * Usage: k6 run scenarios/K6/debug.js
 */

import http from 'k6/http';
import { sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'https://forms-runner.perf-test.cdp-int.defra.cloud';
const FORM_ID = 'jn-perf-test';

export const options = {
  vus: 1,
  duration: '10s',
  // No thresholds for debug script
};

export default function () {
  console.log('='.repeat(80));
  console.log('DEBUG: Authentication Token Extraction Test');
  console.log('='.repeat(80));
  console.log(`BASE_URL: ${BASE_URL}`);
  console.log(`FORM_ID: ${FORM_ID}`);

  // Test 1: Get initial form page
  console.log('\n[TEST 1] Fetching initial form page...');
  const formPath = `/${FORM_ID}`;
  const url = `${BASE_URL}${formPath}`;
  console.log(`URL: ${url}`);

  const response = http.get(url, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    redirects: 0,
  });

  console.log(`Status: ${response.status}`);
  console.log(`Status Text: ${response.status_text}`);

  // Log headers
  console.log('\n[HEADERS]');
  Object.entries(response.headers).forEach(([key, value]) => {
    if (key.toLowerCase() === 'set-cookie') {
      console.log(`${key}: ${value}`);
    }
  });

  // Check for Set-Cookie
  const setCookie = response.headers['Set-Cookie'];
  console.log(`\nSet-Cookie header found: ${!!setCookie}`);
  if (setCookie) {
    console.log(`Set-Cookie type: ${typeof setCookie}`);
    console.log(`Set-Cookie value: ${JSON.stringify(setCookie)}`);
  }

  // Log response body (first 2000 chars)
  console.log('\n[RESPONSE BODY - First 2000 characters]');
  if (response.body) {
    const bodyPreview = response.body.substring(0, 2000);
    console.log(bodyPreview);
    console.log(`\n[Body length: ${response.body.length} characters]`);

    // Try to find crumb in body
    console.log('\n[SEARCHING FOR CRUMB IN BODY]');
    const crumbPatterns = [
      /name=["']crumb["']\s+value=["']([^"']+)["']/,
      /crumb["\']?\s*[:=]\s*["\']([^"']+)["']/,
      /<input[^>]*name=["']crumb["'][^>]*value=["']([^"']+)["']/,
      /crumb=([^&\s"';]+)/,
    ];

    crumbPatterns.forEach((pattern, idx) => {
      const match = response.body.match(pattern);
      if (match) {
        console.log(`Pattern ${idx}: FOUND - ${match[1]}`);
      }
    });
  } else {
    console.log('No response body');
  }

  // Try with redirects allowed
  console.log('\n' + '='.repeat(80));
  console.log('[TEST 2] Fetching with redirects allowed...');
  const response2 = http.get(url, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    redirects: 5,
  });

  console.log(`Status: ${response2.status}`);
  console.log(`Status Text: ${response2.status_text}`);

  const setCookie2 = response2.headers['Set-Cookie'];
  console.log(`Set-Cookie header found: ${!!setCookie2}`);
  if (setCookie2) {
    console.log(`Set-Cookie: ${JSON.stringify(setCookie2)}`);
  }

  console.log('\n' + '='.repeat(80));
  console.log('DEBUG TEST COMPLETE');
  console.log('='.repeat(80));

  sleep(1);
}
