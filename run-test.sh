#!/bin/bash

# K6 Test Runner with Report Generation
# Usage: ./run-test.sh [smoke|load|stress|soak] [--report] [--cloud]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEST_TYPE="${1:-load}"
GENERATE_REPORT="${2:-}"
USE_CLOUD="${3:-}"

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${BLUE}K6 Performance Test Runner${NC}"
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo ""

# Validate test type
if [[ ! "$TEST_TYPE" =~ ^(smoke|load|stress|soak)$ ]]; then
  echo "Error: Invalid test type. Use: smoke, load, stress, or soak"
  exit 1
fi

TEST_FILE="scenarios/K6/${TEST_TYPE}.js"

if [ ! -f "$TEST_FILE" ]; then
  echo "Error: Test file not found: $TEST_FILE"
  exit 1
fi

echo -e "${GREEN}Running ${TEST_TYPE} test...${NC}"
echo "Test file: $TEST_FILE"
echo ""

# Create reports directory
mkdir -p reports

# Run test with appropriate options
if [[ "$USE_CLOUD" == "--cloud" ]]; then
  echo "Running test in Grafana Cloud..."
  k6 cloud "$TEST_FILE"
elif [[ "$GENERATE_REPORT" == "--report" ]]; then
  echo "Running test and generating HTML report..."
  k6 run "$TEST_FILE" --out html=reports/${TEST_TYPE}-report.html
else
  echo "Running test..."
  k6 run "$TEST_FILE"
fi

echo ""
echo -e "${GREEN}✓ Test completed!${NC}"

# Display report location if generated
if [[ "$GENERATE_REPORT" == "--report" ]]; then
  REPORT_FILE="reports/${TEST_TYPE}-report.html"
  if [ -f "$REPORT_FILE" ]; then
    echo -e "${GREEN}Report saved: $REPORT_FILE${NC}"
    echo "Open the report in your browser to view detailed results"
  fi
fi

echo ""
