#!/bin/sh

echo "run_id: $RUN_ID in $ENVIRONMENT"
NOW=$(date +"%Y%m%d-%H%M%S")

if [ -z "${JM_HOME}" ]; then
  JM_HOME=/opt/perftest
fi

JM_SCENARIOS=${JM_HOME}/scenarios
JM_REPORTS=${JM_HOME}/reports
JM_LOGS=${JM_HOME}/logs

mkdir -p ${JM_REPORTS} ${JM_LOGS}

REPORTFILE=${NOW}-perftest-report.csv
test_exit_code=0

# Start with no results file, so that the report has only this run in it
rm -f "${REPORTFILE}"

# Run each scenario in turn, so that one scenario has the environment to
# itself while it is measured. JMeter adds the results of each run to the
# same file, so that one report covers every scenario.
for TEST_SCENARIO in ${TEST_SCENARIOS}; do
  SCENARIOFILE=${JM_SCENARIOS}/${TEST_SCENARIO}.jmx
  LOGFILE=${JM_LOGS}/perftest-${TEST_SCENARIO}.log

  JVM_ARGS="-Xmx7g" jmeter -n -t ${SCENARIOFILE} -l "${REPORTFILE}" -j ${LOGFILE} -Jenv="${ENVIRONMENT}" || test_exit_code=$?
done

JVM_ARGS="-Xmx7g" jmeter -g "${REPORTFILE}" -o ${JM_REPORTS} -j ${JM_LOGS}/perftest-report.log

# Publish the results into S3 so they can be displayed in the CDP Portal
if [ -n "$RESULTS_OUTPUT_S3_PATH" ]; then
  # Copy the CSV report file and the generated report files to the S3 bucket
   if [ -f "$JM_REPORTS/index.html" ]; then
      aws --endpoint-url=$S3_ENDPOINT s3 cp "$REPORTFILE" "$RESULTS_OUTPUT_S3_PATH/$REPORTFILE"
      aws --endpoint-url=$S3_ENDPOINT s3 cp "$JM_REPORTS" "$RESULTS_OUTPUT_S3_PATH" --recursive
      if [ $? -eq 0 ]; then
        echo "CSV report file and test results published to $RESULTS_OUTPUT_S3_PATH"
      fi
   else
      echo "$JM_REPORTS/index.html is not found"
      exit 1
   fi
else
   echo "RESULTS_OUTPUT_S3_PATH is not set"
   exit 1
fi

exit $test_exit_code