FROM defradigital/cdp-perf-test-docker:latest

WORKDIR /opt/perftest

COPY . .

ENV TEST_SCENARIO test

ENTRYPOINT [ "./entrypoint.sh" ]

