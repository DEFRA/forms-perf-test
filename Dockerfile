FROM defradigital/cdp-perf-test-docker:latest

WORKDIR /opt/perftest

COPY . .

ENV TEST_SCENARIO test
ENV S3_ENDPOINT=https://s3.eu-west-2.amazonaws.com

ENTRYPOINT [ "./entrypoint.sh" ]

