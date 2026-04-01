#!/usr/bin/env node

/**
 * K6 Test Report Generator
 * Converts K6 JSON results into a detailed HTML report similar to JMeter
 *
 * Usage: node generate-report.js <json-file> [output-file]
 */

const fs = require('fs');
const path = require('path');

function generateReport(jsonFilePath, outputPath = 'reports/k6-report.html') {
  // Read JSON results
  let data;
  try {
    const jsonContent = fs.readFileSync(jsonFilePath, 'utf-8');
    data = JSON.parse(jsonContent);
  } catch (error) {
    console.error(`Error reading or parsing file: ${error.message}`);
    process.exit(1);
  }

  // Create reports directory if it doesn't exist
  const reportsDir = path.dirname(outputPath);
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  // Calculate statistics
  const stats = calculateStats(data);

  // Generate HTML
  const html = generateHTML(stats, data);

  // Write report
  fs.writeFileSync(outputPath, html, 'utf-8');
  console.log(`✓ Report generated: ${outputPath}`);
}

function calculateStats(data) {
  const metrics = data.metrics || {};
  const groups = data.groups || [];

  // Extract timing data
  const durations = [];
  const errors = [];
  let totalRequests = 0;
  let failedRequests = 0;

  Object.values(metrics).forEach((metric) => {
    if (metric.values && Array.isArray(metric.values)) {
      metric.values.forEach((val) => {
        if (typeof val === 'number') durations.push(val);
      });
    }
  });

  // Sort and calculate percentiles
  durations.sort((a, b) => a - b);

  const stats = {
    totalRequests: durations.length,
    minTime: Math.min(...durations) || 0,
    maxTime: Math.max(...durations) || 0,
    avgTime: durations.reduce((a, b) => a + b, 0) / durations.length || 0,
    p50: percentile(durations, 50),
    p95: percentile(durations, 95),
    p99: percentile(durations, 99),
    errorRate: 0,
    throughput: 0,
    timestamp: new Date().toLocaleString(),
    metrics: metrics,
    groups: groups,
  };

  return stats;
}

function percentile(arr, p) {
  if (arr.length === 0) return 0;
  const index = Math.ceil((arr.length * p) / 100) - 1;
  return arr[Math.max(0, index)];
}

function generateHTML(stats, rawData) {
  const chartDataJson = JSON.stringify({
    labels: ['Min', 'p50', 'p95', 'p99', 'Max'],
    data: [
      stats.minTime.toFixed(0),
      stats.p50.toFixed(0),
      stats.p95.toFixed(0),
      stats.p99.toFixed(0),
      stats.maxTime.toFixed(0),
    ],
  });

  const groupsHtml = (stats.groups || [])
    .map(
      (group) => `
    <tr>
      <td>${group.name}</td>
      <td>${group.checks?.length || 0}</td>
      <td>${group.children?.length || 0}</td>
    </tr>
  `
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>K6 Performance Test Report</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #f5f5f5;
      color: #333;
      line-height: 1.6;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 20px;
      border-radius: 8px;
      margin-bottom: 30px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    header h1 {
      font-size: 2.5em;
      margin-bottom: 10px;
    }

    header p {
      opacity: 0.9;
      font-size: 1.1em;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .summary-card {
      background: white;
      padding: 25px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      border-left: 4px solid #667eea;
    }

    .summary-card.error {
      border-left-color: #e74c3c;
    }

    .summary-card.success {
      border-left-color: #27ae60;
    }

    .summary-card.warning {
      border-left-color: #f39c12;
    }

    .summary-card h3 {
      font-size: 0.9em;
      text-transform: uppercase;
      color: #666;
      margin-bottom: 10px;
      font-weight: 600;
      letter-spacing: 1px;
    }

    .summary-card .value {
      font-size: 2em;
      font-weight: 700;
      color: #333;
    }

    .summary-card .unit {
      font-size: 0.9em;
      color: #999;
      margin-left: 5px;
    }

    section {
      background: white;
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 30px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    section h2 {
      font-size: 1.8em;
      margin-bottom: 20px;
      color: #333;
      border-bottom: 3px solid #667eea;
      padding-bottom: 10px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }

    thead {
      background: #f8f9fa;
    }

    th {
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #333;
      border-bottom: 2px solid #dee2e6;
    }

    td {
      padding: 12px;
      border-bottom: 1px solid #dee2e6;
    }

    tr:hover {
      background: #f8f9fa;
    }

    .chart-container {
      position: relative;
      height: 400px;
      margin: 30px 0;
    }

    .footer {
      text-align: center;
      color: #999;
      padding: 20px;
      font-size: 0.9em;
    }

    .metric-row {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 20px;
    }

    .metric-item {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 6px;
      border-left: 3px solid #667eea;
    }

    .metric-item label {
      display: block;
      font-size: 0.85em;
      color: #666;
      margin-bottom: 5px;
      font-weight: 600;
    }

    .metric-item .value {
      font-size: 1.5em;
      font-weight: 700;
      color: #333;
    }

    .status-pass {
      color: #27ae60;
      font-weight: 600;
    }

    .status-fail {
      color: #e74c3c;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>K6 Performance Test Report</h1>
      <p>Generated on ${stats.timestamp}</p>
    </header>

    <div class="summary-grid">
      <div class="summary-card success">
        <h3>Total Requests</h3>
        <div class="value">${stats.totalRequests.toLocaleString()}</div>
      </div>
      <div class="summary-card">
        <h3>Average Response Time</h3>
        <div class="value">${stats.avgTime.toFixed(0)}<span class="unit">ms</span></div>
      </div>
      <div class="summary-card warning">
        <h3>95th Percentile</h3>
        <div class="value">${stats.p95.toFixed(0)}<span class="unit">ms</span></div>
      </div>
      <div class="summary-card">
        <h3>99th Percentile</h3>
        <div class="value">${stats.p99.toFixed(0)}<span class="unit">ms</span></div>
      </div>
    </div>

    <section>
      <h2>Response Time Distribution</h2>
      <div class="metric-row">
        <div class="metric-item">
          <label>Minimum Response Time</label>
          <div class="value">${stats.minTime.toFixed(0)} ms</div>
        </div>
        <div class="metric-item">
          <label>Maximum Response Time</label>
          <div class="value">${stats.maxTime.toFixed(0)} ms</div>
        </div>
        <div class="metric-item">
          <label>50th Percentile (Median)</label>
          <div class="value">${stats.p50.toFixed(0)} ms</div>
        </div>
        <div class="metric-item">
          <label>Average Response Time</label>
          <div class="value">${stats.avgTime.toFixed(0)} ms</div>
        </div>
      </div>

      <div class="chart-container">
        <canvas id="responseTimeChart"></canvas>
      </div>
    </section>

    ${groupsHtml
      ? `
    <section>
      <h2>Test Groups</h2>
      <table>
        <thead>
          <tr>
            <th>Group Name</th>
            <th>Checks</th>
            <th>Children</th>
          </tr>
        </thead>
        <tbody>
          ${groupsHtml}
        </tbody>
      </table>
    </section>
    `
      : ''
    }

    <section>
      <h2>Test Configuration</h2>
      <div class="metric-row">
        <div class="metric-item">
          <label>Test Type</label>
          <div class="value">Load Test</div>
        </div>
        <div class="metric-item">
          <label>Report Format</label>
          <div class="value">K6 HTML Report</div>
        </div>
      </div>
    </section>

    <div class="footer">
      <p>K6 Performance Test Report | Generated by forms-perf-test suite</p>
    </div>
  </div>

  <script>
    const chartData = ${chartDataJson};
    const ctx = document.getElementById('responseTimeChart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: 'Response Time (ms)',
            data: chartData.data,
            backgroundColor: ['#27ae60', '#3498db', '#f39c12', '#e74c3c', '#9b59b6'],
            borderRadius: 6,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
          title: {
            display: true,
            text: 'Request Duration by Percentile',
            font: { size: 16, weight: 'bold' },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Time (ms)',
            },
          },
        },
      },
    });
  </script>
</body>
</html>
  `;
}

// Run if executed directly
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: node generate-report.js <json-file> [output-file]');
    process.exit(1);
  }
  generateReport(args[0], args[1]);
}

module.exports = { generateReport };
