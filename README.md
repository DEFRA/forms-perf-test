# forms-perf-test

Performance test suite for the CDP Platform using K6 load testing framework.

**Migrated from:** JMeter to K6 for better maintainability and modern load testing capabilities.

- [Setup](#setup)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Configuration](#configuration)
- [Licence](#licence)
  - [About the licence](#about-the-licence)

## Setup

### Prerequisites

- Install K6: https://k6.io/docs/get-started/installation/
- Create a Form with the name: `jn-perf-test`
- Upload [./jn-perf-test.json](./jn-perf-test.json)

## Running Tests

### Local Testing

Run the default test suite with standard load profile (100 VUs ramping over 1 minute, 10 minute sustain):

```bash
k6 run scenarios/K6/index.js
```

### Generate HTML Report (Like JMeter)

Generate an interactive HTML report similar to JMeter's Summary Report:

```bash
# Option 1: web report (opens in browser automatically)
k6 run scenarios/K6/load.js --out web

# Option 2: save to HTML file
k6 run scenarios/K6/load.js --out html=reports/my-report.html

# Option 3: use helper script
./run-test.sh load --report
```

The generated report includes:
- Response time distribution (min, max, avg, p95, p99)
- Interactive charts similar to JMeter
- Request metrics and performance statistics
- Shareable standalone HTML file

📊 **See [REPORT_GENERATION.md](./REPORT_GENERATION.md) for detailed reporting guide**

### With Custom Environment

Specify a different base URL:

```bash
k6 run scenarios/K6/index.js -e BASE_URL=https://forms-runner.dev.cdp-int.defra.cloud
```

### Custom Load Profile

Override the delay between requests (milliseconds):

```bash
k6 run scenarios/K6/index.js -e LONG_DELAY=3000
```

### Cloud Testing (Grafana Cloud)

```bash
k6 cloud scenarios/K6/index.js
```

### Using Different Test Scenarios

Separate test files are provided for different load profiles:

```bash
# Smoke test (quick validation with 1 VU for 30s)
k6 run scenarios/K6/smoke.js

# Load test (realistic sustained load - 100 VUs, 14 min)
k6 run scenarios/K6/load.js

# Stress test (push system to limits with up to 300 VUs)
k6 run scenarios/K6/stress.js

# Soak test (long duration at moderate load - 50 VUs, 30 min)
k6 run scenarios/K6/soak.js
```

Or use npm scripts for convenience:

```bash
npm run test:smoke
npm run test:load
npm run test:stress
npm run test:soak
```

**Generate HTML Reports with npm:**

```bash
npm run report:smoke    # Smoke test + HTML report
npm run report:load     # Load test + HTML report (recommended)
npm run report:stress   # Stress test + HTML report
npm run report:soak     # Soak test + HTML report
npm run report:web      # Load test + live web dashboard (opens browser)
npm run report:export   # Export test results as JSON
npm run dev:report      # Dev environment + HTML report
```

📋 **See [NPM_SCRIPTS.md](./NPM_SCRIPTS.md) for complete npm script reference**

### Test Report Output

Generate a detailed HTML report:

```bash
k6 run --out web scenarios/K6/index.js
```

## Test Structure

The test is organized into modular components for easy maintenance:

### Main Test Files

#### `scenarios/K6/index.js` - Default Test
- Production-ready load test configuration
- 100 VUs with 1-min ramp up, 10-min sustain, 1-min ramp down
- Best for: Regular performance testing

#### `scenarios/K6/load.js` - Load Test Scenario
- Realistic sustained load profile
- 100 VUs over 14 minutes total
- Run with: `k6 run scenarios/K6/load.js`

#### `scenarios/K6/smoke.js` - Smoke Test Scenario
- Quick validation with minimal VUs
- 1 VU for 30 seconds
- Run with: `k6 run scenarios/K6/smoke.js`

#### `scenarios/K6/stress.js` - Stress Test Scenario
- Push system to breaking point
- Ramps up to 300 VUs
- Run with: `k6 run scenarios/K6/stress.js`

#### `scenarios/K6/soak.js` - Soak Test Scenario
- Long-duration test for stability
- 50 VUs for 30 minutes
- Run with: `k6 run scenarios/K6/soak.js`

### Modules

#### `modules/auth.js`
Handles authentication and session management:
- Extracts CSRF token (crumb) from initial form request
- Manages HTTP headers for authenticated requests
- **Preserves the login logic from the original JMeter test unchanged**

#### `modules/requests.js`
Wrapper functions for HTTP operations:
- `submitFormPage()` - POST form data with crumb token
- `uploadFile()` - Handles file upload operations
- `getFormPage()` - GET requests for form pages

#### `modules/data.js`
Test data management:
- `getAddressData()` - Standard address for testing
- `getDateData()` - Date fields for form submission
- `generateRandomEmail()` - Dynamic email generation
- `generateRandomBoatName()` - Random boat names for variation

### Form Flow

The test simulates a complete form submission journey through 14 pages:
1. Owner name
2. Owner address
3. Proof of address (file upload)
4. Email address
5. Phone number
6. Boat name
7. Boat type
8. Entry date
9. Boat length
10. Mooring
11. Insurance status
12. Insurance company
13. Insurer address
14. Insurance expiration date + final submission

Each page submission is wrapped in a `group()` for clear metrics reporting.

## Configuration

### Load Scenarios

The default test profile in `index.js` uses:

```
- 0-1 min: Ramp from 0 to 100 VUs
- 1-11 min: Sustain at 100 VUs
- 11-12 min: Ramp down to 0 VUs
```

### Performance Thresholds

- **95th percentile response time**: < 1 second
- **99th percentile response time**: < 2 seconds
- **Error rate**: < 10%

### Custom Configuration

Edit `scenarios/K6/index.js` to modify:
- `BASE_URL` - Target environment
- `stages` - Load ramping profile
- `thresholds` - Performance targets
- `LONG_DELAY` - Wait time between form pages (in ms)

## Build

Test suites are built automatically by the [.github/workflows/publish.yml](.github/workflows/publish.yml) action whenever a change is committed to the `main` branch.
A successful build results in a Docker container that is capable of running your tests on the CDP Platform and publishing the results to the CDP Portal.

## Run

The performance test suites are designed to be run from the CDP Portal.
The CDP Platform runs test suites in much the same way it runs any other service, it takes a docker image and runs it as an ECS task, automatically provisioning infrastructure as required.

## Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government licence v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable
information providers in the public sector to license the use and re-use of their information under a common open
licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.

## Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government licence v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable
information providers in the public sector to license the use and re-use of their information under a common open
licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.
