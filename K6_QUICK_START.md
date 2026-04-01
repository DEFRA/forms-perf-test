# K6 Performance Test - Quick Start Guide

## Prerequisites

1. **Install K6**: https://k6.io/docs/get-started/installation/
   ```bash
   # macOS
   brew install k6

   # Linux
   sudo apt-get install k6

   # Windows (Chocolatey)
   choco install k6
   ```

2. **Verify Installation**:
   ```bash
   k6 version
   ```

## Quick Start

### 1. Run a Quick Smoke Test (30 seconds)
```bash
cd /Users/jigneshnayi/Defra/forms-perf-test
k6 run scenarios/K6/smoke.js
```

### 2. Run Full Load Test (14 minutes)
```bash
k6 run scenarios/K6/load.js
```

### 3. Generate HTML Report (Like JMeter)
```bash
# Smoke test with report
./run-test.sh smoke --report

# Load test with report
./run-test.sh load --report

# Or manually
k6 run scenarios/K6/load.js --out web
```

The report opens automatically in your browser and includes:
- Response time percentiles (p50, p95, p99)
- Interactive performance charts
- Request breakdown by group
- Error analysis
- Standalone HTML file saved to `reports/`

### 4. Run Against Different Environment
```bash
k6 run -e BASE_URL=https://forms-runner.dev.cdp-int.defra.cloud scenarios/K6/load.js
```

## Common Commands

| Task | Command |
|------|---------|
| Smoke test (1 VU, 30s) | `k6 run scenarios/K6/smoke.js` |
| Load test (100 VUs, 14 min) | `k6 run scenarios/K6/load.js` |
| Stress test (up to 300 VUs) | `k6 run scenarios/K6/stress.js` |
| Soak test (50 VUs, 30 min) | `k6 run scenarios/K6/soak.js` |
| **Generate HTML report** | **`k6 run scenarios/K6/load.js --out web`** |
| Save report to file | `k6 run scenarios/K6/load.js --out html=reports/test.html` |
| JSON export | `k6 run scenarios/K6/load.js -o results.json` |
| Using helper script | `./run-test.sh load --report` |
| Custom environment | `k6 run -e BASE_URL=https://... scenarios/K6/load.js` |
| Custom delay between requests | `k6 run -e LONG_DELAY=3000 scenarios/K6/load.js` |
| Using npm scripts | `npm run test:smoke\|test:load\|test:stress\|test:soak` |
| Cloud testing (Grafana) | `k6 cloud scenarios/K6/load.js` |

## Understanding the Output

When you run a test, K6 outputs:
- **HTTP Requests**: Count and timing of each request
- **Performance Metrics**: Response times, throughput
- **Checks**: Pass/fail assertions (e.g., "status is 200")
- **Summary**: Overall test results and statistics

Example output section:
```
checks............................: 95.5% 1273 ✓  57  ✗
http_req_duration.................
  avg: 456ms, p(95): 890ms, p(99): 1200ms
http_req_failed....................: 4.5%
```

## Test Architecture

```
scenarios/K6/
├── index.js              # Main test entry point (default)
├── load.js               # Load test (100 VUs, 14 min)
├── smoke.js              # Smoke test (1 VU, 30s)
├── stress.js             # Stress test (up to 300 VUs)
├── soak.js               # Soak test (50 VUs, 30 min)
└── modules/
    ├── auth.js           # Authentication & session handling
    ├── requests.js       # HTTP request wrappers
    └── data.js           # Test data generators
```

## Key Components

### Authentication (auth.js)
- **Login Flow**: Same as JMeter test - extracts CSRF token (crumb)
- **Credentials**: Uses form-based authentication
- **Session Handling**: Automatic cookie management

### Test Flow
1. Initial page load to extract authentication token
2. 14-page form submission with variations
3. File upload simulation
4. Final status page verification

### Performance Checks
Each request is validated for:
- Correct HTTP status code (200, 303, etc.)
- Expected response content
- Response time metrics

## Customizing the Test

### Change Load Profile
Edit `scenarios/K6/load.js` (or any test file) and modify the `stages`:
```javascript
stages: [
  { duration: '2m', target: 50 },   // Ramp to 50 VUs
  { duration: '5m', target: 50 },   // Hold for 5 min
  { duration: '2m', target: 0 },    // Ramp down
],
```

### Add New Form Field
1. Edit `scenarios/K6/load.js` (or smoke.js, stress.js, soak.js)
2. Find the appropriate `group()` for the form page
3. Add the field to the `formData` object:
```javascript
const formData = {
  existingField: 'value',
  newField: 'value',  // Add here
};
```

### Modify Test Data
Edit `scenarios/K6/modules/data.js` to change:
- Standard addresses
- Phone numbers
- Email addresses
- Random data patterns

## Troubleshooting

### Test Fails with "Failed to extract authentication token"
- Verify the BASE_URL is correct
- Check if the form page is accessible
- Confirm CSRF protection is enabled on the form

### High Error Rate
- Check network connectivity to the server
- Verify the server is not overloaded
- Review error messages in the output

### Slow Response Times
- Increase `LONG_DELAY` between requests
- Reduce number of VUs
- Check server and network capacity

## Next Steps

1. **Run a smoke test** to verify setup
2. **Review the output** to understand metrics
3. **Customize test data** as needed
4. **Run full load test** against your environment
5. **Analyze results** to identify performance bottlenecks

## Documentation

- K6 Official Docs: https://k6.io/docs/
- K6 API: https://k6.io/docs/javascript-api/
- Performance Testing Guide: https://k6.io/docs/test-types/
