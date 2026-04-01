# npm Scripts Quick Reference

All available npm scripts for running tests and generating reports.

## Test Execution Scripts

```bash
# Run smoke test (1 VU, 30s)
npm run test:smoke

# Run load test (100 VUs, 14 min)
npm run test:load

# Run stress test (up to 300 VUs)
npm run test:stress

# Run soak test (50 VUs, 30 min)
npm run test:soak

# Default test (runs load test)
npm test

# Run dev environment test
npm run test:dev

# Run in Grafana Cloud
npm run test:cloud

# Run all tests sequentially (smoke → load → stress)
npm run test:all
```

## Report Generation Scripts

### HTML Reports (Saved to reports/ directory)

```bash
# Generate smoke test report
npm run report:smoke
# → reports/smoke-report.html

# Generate load test report
npm run report:load
# → reports/load-report.html

# Generate stress test report
npm run report:stress
# → reports/stress-report.html

# Generate soak test report
npm run report:soak
# → reports/soak-report.html

# Generate dev environment report (with custom BASE_URL)
npm run dev:report
# → reports/dev-report.html
```

### Web Dashboard Report (Opens in Browser)

```bash
# Run load test with live web dashboard
npm run report:web
# Automatically opens http://localhost:5665 in your browser
```

### Data Export

```bash
# Export test results as JSON
npm run report:export
# → results.json
```

## Common Workflows

### Quick Validation
```bash
# Smoke test to verify setup
npm run test:smoke
```

### Full Performance Testing with Report
```bash
# Run load test and generate HTML report
npm run report:load

# View report
open reports/load-report.html
```

### Monitor in Real-time
```bash
# Watch test progress in browser dashboard
npm run report:web
```

### Test All Scenarios and Generate Reports
```bash
# Run all test types with reports
npm run test:all
```

### Development Environment Testing
```bash
# Test against dev with HTML report
npm run dev:report

# View dev report
open reports/dev-report.html
```

### Compare Multiple Runs
```bash
# Run smoke, load, and stress tests
npm run report:smoke
npm run report:load
npm run report:stress

# All reports saved in reports/ directory
ls -la reports/
```

## Report Locations

All generated reports are saved to:
```
reports/
├── smoke-report.html
├── load-report.html
├── stress-report.html
├── soak-report.html
├── dev-report.html
└── results.json
```

## Viewing Reports

### Local Files
```bash
# Open any report with default browser
open reports/load-report.html

# Or directly with browser
open -a "Google Chrome" reports/load-report.html
```

### Server Viewing
```bash
# Simple HTTP server to view reports
python3 -m http.server 8000 --directory reports/
# Then visit: http://localhost:8000
```

## Advanced Usage

### Custom Environment with Report
```bash
# Run test against custom BASE_URL
k6 run -e BASE_URL=https://custom-domain.com scenarios/K6/load.js --out html=reports/custom.html

# Or create a new npm script in package.json for frequent use
```

### Combining Outputs
```bash
# Generate both HTML and JSON
k6 run scenarios/K6/load.js \
  --out html=reports/test.html \
  -o results.json
```

### Archiving Results
```bash
# Create timestamped backup
cp reports/ reports-backup-$(date +%Y%m%d-%H%M%S)

# Or compress for sharing
tar -czf test-results.tar.gz reports/
```

## Script Cheat Sheet

| Need | Command |
|------|---------|
| Quick smoke test | `npm run test:smoke` |
| Full load test | `npm run test:load` |
| Generate HTML report | `npm run report:load` |
| Live browser dashboard | `npm run report:web` |
| Export data | `npm run report:export` |
| Dev environment report | `npm run dev:report` |
| All test types | `npm run test:all` |
| Default (load test) | `npm test` |

## Continuous Integration / CI/CD

For automation, use:

```bash
# In CI pipelines
npm run test:load --production

# Export results for analysis
npm run report:export

# Generate report
npm run report:load
```

## Tips

- ✅ Use `npm run test:*` for quick validation without reports
- ✅ Use `npm run report:*` for detailed HTML reports
- ✅ Use `npm run report:web` to monitor in real-time
- ✅ Keep reports directory in .gitignore for dev, but add CI results to version control
- ✅ Generate reports for comparison over time
- ✅ Archive old reports for historical analysis
