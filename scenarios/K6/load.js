/**
 * Load Test - Realistic sustained load (100 VUs)
 *
 * Usage: k6 run scenarios/K6/load.js
 * With HTML report: k6 run scenarios/K6/load.js --out web
 * With JSON report: k6 run scenarios/K6/load.js -o results.json
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
  scenarios: {
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
  },
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
      const response = requests.submitFormPage(BASE_URL, FORM_ID, 'whats-the-boat-owners-name', { textField: 'bob' }, sessionData.crumb);
      check(response, { 'Owner name submission status is 200': (r) => r.status === 200 });
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
      const response = requests.submitFormPage(BASE_URL, FORM_ID, 'whats-the-boat-owners-address', formData, sessionData.crumb);
      check(response, { 'Address submission status is 200': (r) => r.status === 200 });
      sleep(LONG_DELAY / 1000);
    });

    group('Page 3: Proof of Address', () => {
      const response = http.get(`${BASE_URL}/form/${FORM_ID}/proof-of-address`, { headers: auth.getHeaders() });
      check(response, { 'Proof of address page status is 200': (r) => r.status === 200 });
      sleep(LONG_DELAY / 1000);
    });

    group('File Upload', () => {
      const uploadResponse = requests.uploadFile(BASE_URL, FORM_ID, sessionData.crumb);
      check(uploadResponse, { 'File upload status is 200': (r) => r.status === 200 });
      sleep(LONG_DELAY / 1000);
    });

    group('Page 4: Email Address', () => {
      const response = requests.submitFormPage(BASE_URL, FORM_ID, 'whats-the-boat-owners-email-address', { ZhyvQf: 'me@info.uk' }, sessionData.crumb);
      check(response, { 'Email submission status is 200': (r) => r.status === 200 });
      sleep(LONG_DELAY / 1000);
    });

    group('Page 5: Phone Number', () => {
      const response = requests.submitFormPage(BASE_URL, FORM_ID, 'whats-the-boat-owners-phone-number', { zlmXyr: '12345' }, sessionData.crumb);
      check(response, { 'Phone submission status is 200': (r) => r.status === 200 });
      sleep(LONG_DELAY / 1000);
    });

    group('Page 6: Boat Name', () => {
      const response = requests.submitFormPage(BASE_URL, FORM_ID, 'whats-the-boats-name', { pzCarF: 'myBoat' }, sessionData.crumb);
      check(response, { 'Boat name submission status is 200': (r) => r.status === 200 });
      sleep(LONG_DELAY / 1000);
    });

    group('Page 7: Boat Type', () => {
      const response = requests.submitFormPage(BASE_URL, FORM_ID, 'what-type-of-boat-are-you-registering', { zOKCBX: 'Commercial vessel' }, sessionData.crumb);
      check(response, { 'Boat type submission status is 200': (r) => r.status === 200 });
      sleep(LONG_DELAY / 1000);
    });

    group('Page 8: Entry Date', () => {
      const dateData = data.getDateData();
      const response = requests.submitFormPage(BASE_URL, FORM_ID, 'when-is-the-boat-going-to-enter-rye-harbour', { 'LFiWon__day': dateData.day, 'LFiWon__month': dateData.month, 'LFiWon__year': dateData.year }, sessionData.crumb);
      check(response, { 'Entry date submission status is 200': (r) => r.status === 200 });
      sleep(LONG_DELAY / 1000);
    });

    group('Page 9: Boat Length', () => {
      const response = requests.submitFormPage(BASE_URL, FORM_ID, 'how-long-is-the-boat-in-metres', { kRQwWs: '55' }, sessionData.crumb);
      check(response, { 'Boat length submission status is 200': (r) => r.status === 200 });
      sleep(LONG_DELAY / 1000);
    });

    group('Page 10: Mooring', () => {
      const response = requests.submitFormPage(BASE_URL, FORM_ID, 'mooring', { theoPm: 'bfgb' }, sessionData.crumb);
      check(response, { 'Mooring submission status is 200': (r) => r.status === 200 });
      sleep(LONG_DELAY / 1000);
    });

    group('Page 11: Insurance Status', () => {
      const response = requests.submitFormPage(BASE_URL, FORM_ID, 'is-the-boat-insured', { tMsgnG: 'true' }, sessionData.crumb);
      check(response, { 'Insurance status submission status is 200': (r) => r.status === 200 });
      sleep(LONG_DELAY / 1000);
    });

    group('Page 12: Insurance Company', () => {
      const response = requests.submitFormPage(BASE_URL, FORM_ID, 'what-company-insures-the-boat', { WqIeiY: 'Direct Insurance' }, sessionData.crumb);
      check(response, { 'Insurance company submission status is 200': (r) => r.status === 200 });
      sleep(LONG_DELAY / 1000);
    });

    group('Page 13: Insurer Address', () => {
      const insurerAddress = data.getInsurerAddressData();
      const response = requests.submitFormPage(BASE_URL, FORM_ID, 'whats-the-insurers-address', insurerAddress, sessionData.crumb);
      check(response, { 'Insurer address submission status is 200': (r) => r.status === 200 });
      sleep(LONG_DELAY / 1000);
    });

    group('Page 14: Insurance Expiration', () => {
      const expirationDate = data.getExpirationDateData();
      const response = requests.submitFormPage(BASE_URL, FORM_ID, 'insurance-policy-expiration', expirationDate, sessionData.crumb);
      check(response, { 'Expiration date submission status is 200': (r) => r.status === 200 });
      sleep(LONG_DELAY / 1000);
    });

    group('Summary and Submit', () => {
      const response = requests.submitFormPage(BASE_URL, FORM_ID, 'summary', { userConfirmationEmailAddress: 'abc@gmail.com', action: 'send' }, sessionData.crumb);
      check(response, { 'Final submission status is 303': (r) => r.status === 303, 'Redirect location contains status': (r) => r.headers['Location']?.includes('status') || false });
      sleep(LONG_DELAY / 1000);
    });

    group('Status Page', () => {
      const response = http.get(`${BASE_URL}/form/${FORM_ID}/status`, { headers: auth.getHeaders() });
      check(response, { 'Status page contains submitted': (r) => r.body?.includes('submitted') });
    });
  });
}

// Custom summary handler for HTML and console reports
export function handleSummary(data) {
  console.log('='.repeat(60));
  console.log('K6 Test Summary');
  console.log('='.repeat(60));

  return {
    'reports/load-test-report.html': htmlReportHandler(data),
    stdout: textSummaryHandler(data),
  };
}

function htmlReportHandler(data) {
  const metrics = data.metrics || {};
  const httpDuration = metrics['http_req_duration']?.values || [];
  const httpFailed = metrics['http_req_failed']?.value || 0;

  const durations = Object.values(metrics)
    .filter((m) => m.type === 'Trend')
    .flatMap((m) => m.values)
    .filter((v) => typeof v === 'number');

  const sorted = [...durations].sort((a, b) => a - b);
  const stats = {
    min: Math.min(...sorted),
    max: Math.max(...sorted),
    avg: durations.reduce((a, b) => a + b, 0) / durations.length,
    p50: sorted[Math.floor(sorted.length * 0.5)],
    p95: sorted[Math.floor(sorted.length * 0.95)],
    p99: sorted[Math.floor(sorted.length * 0.99)],
  };

  return htmlTemplate(stats, data);
}

function textSummaryHandler(data) {
  const metrics = data.metrics || {};
  let summary = '';

  summary += '\n' + '─'.repeat(60) + '\n';
  summary += 'Performance Test Results\n';
  summary += '─'.repeat(60) + '\n\n';

  Object.entries(metrics).forEach(([key, metric]) => {
    if (metric.values && typeof metric.values === 'object') {
      summary += `${key}:\n`;
      Object.entries(metric.values).forEach(([k, v]) => {
        summary += `  ${k}: ${v}\n`;
      });
      summary += '\n';
    }
  });

  summary += '─'.repeat(60) + '\n';
  return summary;
}

function htmlTemplate(stats, data) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>K6 Load Test Report</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #333;
      line-height: 1.6;
      padding: 20px;
    }
    .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); overflow: hidden; }
    header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; }
    header h1 { font-size: 2.5em; margin-bottom: 10px; }
    header p { opacity: 0.9; }
    .content { padding: 40px; }
    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px; }
    .metric-card {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #667eea;
      text-align: center;
    }
    .metric-card h3 { font-size: 0.9em; text-transform: uppercase; color: #666; margin-bottom: 10px; }
    .metric-card .value { font-size: 2em; font-weight: 700; color: #333; }
    .chart-container { position: relative; height: 400px; margin-bottom: 40px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    thead { background: #f8f9fa; }
    th { padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #dee2e6; }
    td { padding: 12px; border-bottom: 1px solid #dee2e6; }
    tr:hover { background: #f8f9fa; }
    section { margin-bottom: 30px; }
    section h2 { font-size: 1.5em; margin-bottom: 20px; border-bottom: 3px solid #667eea; padding-bottom: 10px; }
    footer { text-align: center; padding: 20px; background: #f8f9fa; color: #999; border-top: 1px solid #dee2e6; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>K6 Load Test Report</h1>
      <p>Generated: ${new Date().toLocaleString()}</p>
    </header>
    <div class="content">
      <section>
        <h2>Performance Metrics</h2>
        <div class="metrics-grid">
          <div class="metric-card">
            <h3>Min Response</h3>
            <div class="value">${stats.min.toFixed(0)}<span style="font-size: 0.5em;">ms</span></div>
          </div>
          <div class="metric-card">
            <h3>Avg Response</h3>
            <div class="value">${stats.avg.toFixed(0)}<span style="font-size: 0.5em;">ms</span></div>
          </div>
          <div class="metric-card">
            <h3>P95 Response</h3>
            <div class="value">${stats.p95.toFixed(0)}<span style="font-size: 0.5em;">ms</span></div>
          </div>
          <div class="metric-card">
            <h3>Max Response</h3>
            <div class="value">${stats.max.toFixed(0)}<span style="font-size: 0.5em;">ms</span></div>
          </div>
        </div>
      </section>

      <section>
        <h2>Response Time Distribution</h2>
        <div class="chart-container">
          <canvas id="responseChart"></canvas>
        </div>
      </section>

      <section>
        <h2>Test Details</h2>
        <table>
          <tr><td>Minimum Response Time</td><td>${stats.min.toFixed(2)} ms</td></tr>
          <tr><td>Maximum Response Time</td><td>${stats.max.toFixed(2)} ms</td></tr>
          <tr><td>Average Response Time</td><td>${stats.avg.toFixed(2)} ms</td></tr>
          <tr><td>Median (P50)</td><td>${stats.p50.toFixed(2)} ms</td></tr>
          <tr><td>95th Percentile (P95)</td><td>${stats.p95.toFixed(2)} ms</td></tr>
          <tr><td>99th Percentile (P99)</td><td>${stats.p99.toFixed(2)} ms</td></tr>
        </table>
      </section>
    </div>
    <footer>
      <p>K6 Performance Test Report | forms-perf-test suite</p>
    </footer>
  </div>

  <script>
    const ctx = document.getElementById('responseChart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Min', 'P50', 'P95', 'P99', 'Max'],
        datasets: [{
          label: 'Response Time (ms)',
          data: [${stats.min.toFixed(0)}, ${stats.p50.toFixed(0)}, ${stats.p95.toFixed(0)}, ${stats.p99.toFixed(0)}, ${stats.max.toFixed(0)}],
          backgroundColor: ['#27ae60', '#3498db', '#f39c12', '#e74c3c', '#9b59b6'],
          borderRadius: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: { beginAtZero: true, title: { display: true, text: 'Time (ms)' } },
        },
      },
    });
  </script>
</body>
</html>
  `;
}

