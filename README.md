# forms-perf-test

A JMeter based test runner for the CDP Platform.

- [Licence](#licence)
  - [About the licence](#about-the-licence)

## Setup form (Manual)

- Create a Form with the name: jn-perf-test-v2

- Upload [./jn-perf-test-v2.json](./jn-perf-test-v2.json)

## Sign-in scenario

[scenarios/sign-in.jmx](./scenarios/sign-in.jmx) signs in through forms-runner and the OIDC provider (forms-identity-ui and forms-identity-api). Run it with `TEST_SCENARIO=sign-in`.

Each thread is one test account, `perf-<thread number>@example.forms.defra.gov.uk`. The first sign-in of a thread creates the account. The sign-ins after that are for a returning user.

The environment must have:

- `USE_SIGN_IN_FEATURE=true` on forms-runner
- `OTP_TEST_READ_SECRET` on forms-identity-api, so that the test can read the code for a test address
- `OTP_TEST_READ_SECRET` on this test suite, with the same value
- a live form with the slug `jn-perf-test-v2` (see [Setup form](#setup-form-manual))

If a run fails 5 times in a row for one address, forms-identity-api locks that address for 2 hours. To continue before then, clear the `otp-lockouts` collection of forms-identity-api in that environment.

The report has one row for each step. The row `TEST read code from forms-identity-api` is the test reading the code. It is not part of a real sign-in.

JMeter properties (`-J<name>=<value>`) and their defaults:

| Property          | Default                     | Meaning                                  |
| ----------------- | --------------------------- | ---------------------------------------- |
| `threads`         | 100                         | Number of test accounts that sign in     |
| `rampSeconds`     | 60                          | Time to start all threads                |
| `durationSeconds` | 600                         | Length of the run                        |
| `thinkTimeMs`     | 5000                        | Wait before each form is sent            |
| `formSlug`        | jn-perf-test-v2             | Form whose homepage ends the sign-in     |
| `runnerBase`      | forms-runner in `env`       | For a local run, `http://localhost:3009` |
| `identityUiBase`  | forms-identity-ui in `env`  | For a local run, `http://localhost:3011` |
| `identityApiBase` | forms-identity-api in `env` | For a local run, `http://localhost:3010` |

## Build

Test suites are built automatically by the [.github/workflows/publish.yml](.github/workflows/publish.yml) action whenever a change are committed to the `main` branch.
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
