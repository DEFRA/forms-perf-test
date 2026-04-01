# K6 Report Generation Guide

This guide explains how to generate and view performance test reports similar to JMeter.

## Quick Start - Generate HTML Report

### Option 1: Built-in K6 Web Report (Easiest)

```bash
# Generate HTML report while running test
k6 run scenarios/K6/load.js --out web

# Or use npm script
npm run test:report
```

This creates an interactive HTML report in the browser at `http://localhost:5665` (opens automatically) and saves to `reports/load-test-report.html`.

### Option 2: Using Run Script

```bash
# Make script executable
chmod +x run-test.sh

# Run with report generation
./run-test.sh load --report
./run-test.sh smoke --report
./run-test.sh stress --report
```

### Option 3: Manual JSON → HTML Conversion

```bash
# Generate JSON results
k6 run scenarios/K6/load.js -o results.json

# Convert to HTML (requires Node.js)
node scripts/generate-report.js results.json
node scripts/generate-report.js results.json my-custom-report.html
```

## Report Types

### 1. Web Visualization Report (Recommended)
**Command:**
```bash
k6 run scenarios/K6/load.js --out web
```

**Features:**
- Real-time test progress visualization
- Interactive charts and metrics
- Live VU (Virtual User) count
- Request timeline
- Error details
- Automatic browser launch
- HTML file saved for later review

**Browser Dashboard Includes:**
- Overall test progress
- Request status codes distribution
- Error rates and types
- Response time graphs
- VU ramp-up visualization
- Real-time metrics updates

### 2. HTML Static Report
**Command:**
```bash
k6 run scenarios/K6/load.js --out html=reports/my-report.html
```

**Features:**
- Standalone HTML file (no browser needed)
- Similar to JMeter report format
- Charts and statistics
- All metrics included
- Shareable/archivable

### 3. JSON Results Export
**Command:**
```bash
k6 run scenarios/K6/load.js -o results.json
```

**Use for:**
- Further analysis
- Custom post-processing
- Integration with other tools
- Metrics tracking over time

### 4. Summary Output
**Command:**
```bash
k6 run scenarios/K6/load.js
```

**Output in terminal:**
- Pass/fail summary
- Request metrics
- Performance thresholds status
- Error summary

## Report Structure & Metrics

All reports include:

### Summary Statistics
- **Minimum Response Time** - Fastest single request
- **Maximum Response Time** - Slowest single request
- **Average Response Time** - Mean of all requests
- **Median (P50)** - Middle value (50th percentile)
- **P95** - 95% of requests complete within this time
- **P99** - 99% of requests complete within this time

### Performance Analysis
- Response time distribution chart
- Request count by status code
- Error breakdown
- Request throughput (requests/sec)
- Data transfer rate

### Groups & Categories
- Results breakdown by test group
- Individual request metrics
- Check results (assertions)
- Failure details

## Comparing Reports (Multiple Test Runs)

### Run Multiple Tests and Generate Reports

```bash
# Smoke test
./run-test.sh smoke --report

# Load test
./run-test.sh load --report

# Stress test
./run-test.sh stress --report

# Compare reports in reports/ directory
ls -la reports/
```

### View Generated Reports

```bash
# List all reports
open reports/

# Or manually
# smoke-test-report.html
# load-test-report.html
# stress-test-report.html
```

## Advanced Report Options

### Include Response Bodies in Report
```bash
k6 run scenarios/K6/load.js --include-response-body --out web
```

### Export to Multiple Formats
```bash
k6 run scenarios/K6/load.js \
  --out web \
  --out html=reports/test-report.html \
  -o results.json
```

### Custom Report with Data Analysis

```bash
# Export results and convert
k6 run scenarios/K6/load.js -o results.json
node scripts/generate-report.js results.json reports/analysis.html
```

## Interpreting Report Metrics

### Response Times
- **P95 < 1000ms** ✓ Excellent
- **P95 1000-2000ms** ⚠ Acceptable
- **P95 > 2000ms** ✗ Needs optimization

### Error Rate
- **< 1%** ✓ Excellent
- **1-5%** ⚠ Needs investigation
- **> 5%** ✗ Critical issues

### Throughput (requests/sec)
- Higher values = better performance
- Should be consistent throughout test
- Check if throughput drops under sustained load

## Saving Reports for Archive

```bash
# Create timestamped backup
mkdir -p test-archives
cp reports/load-test-report.html test-archives/load-$(date +%Y%m%d-%H%M%S).html

# Or permanently
cp reports/*.html test-archives/
```

## Sharing Reports

Generated HTML reports are standalone files:
- **Share via email** - Just attach the .html file
- **Upload to server** - Host on web server
- **Version control** - Commit to git for history
- **Archive** - Keep for comparison over time

## Example Workflow

```bash
# 1. Run smoke test to validate setup
./run-test.sh smoke --report

# 2. Run load test during normal usage
./run-test.sh load --report

# 3. Run stress test to find limits
./run-test.sh stress --report

# 4. Archive all reports with timestamp
cd reports
tar -czf ../test-results-$(date +%Y%m%d).tar.gz *.html
```

## Troubleshooting

### Report not generating
```bash
# Ensure reports directory exists
mkdir -p reports

# Try explicit output path
k6 run scenarios/K6/load.js --out html=reports/test-report.html
```

### Browser not opening automatically
```bash
# Use --out web and manually open URL shown in console
# Or use the saved HTML file directly
open reports/load-test-report.html
```

### Large report files
- Results are split automatically for large test runs
- Check `reports/` directory for all generated files
- Compress before sharing: `zip -r report.zip reports/`

## Comparing with JMeter

### JMeter Features → K6 Equivalents

| JMeter | K6 |
|--------|-----|
| Summary Report | `--out web` HTML report |
| Response Times | P50, P95, P99 percentiles |
| Throughput | `iter.rate()` and `req_duration` metrics |
| Error Summary | Error rate and breakdown |
| Graph Results | Built-in charts in web report |
| View Results Tree | Check results in HTML report |
| Aggregate Report | Console output or HTML file |

### Key Differences

- **Real-time monitoring** - K6 shows live progress in browser
- **Better charts** - Interactive visualization vs static JMeter graphs
- **Easy sharing** - Single HTML file vs multiple JMeter files
- **Flexible output** - Multiple export formats available
- **Scalability** - K6 designed for cloud testing at scale

## Next Steps

1. **Run your first test** - `./run-test.sh smoke --report`
2. **View the report** - Open generated HTML file
3. **Analyze results** - Compare metrics against thresholds
4. **Archive reports** - Keep for historical comparison
5. **Optimize** - Based on P95/P99 findings
