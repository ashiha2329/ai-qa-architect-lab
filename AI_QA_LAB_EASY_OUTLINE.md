# AI QA Lab — Easy Build Outline

This outline explains the lab in a simple order. Use it as a checklist. For exact file contents and detailed troubleshooting, use `RECREATE_AI_QA_LAB.md`.

## What You Are Building

```text
Write Playwright tests
        ↓
Store code in GitHub
        ↓
Jenkins detects a Git change
        ↓
Jenkins runs tests inside Docker
        ↓
Allure displays test results and history
        ↓
Playwright saves evidence when a test fails
        ↓
OpenAI analyzes the failure
        ↓
Jenkins displays the AI diagnosis
```

---

## Phase 1 — Install the Main Tools

Install:

- Git
- Node.js
- Visual Studio Code
- Docker Desktop
- A GitHub account
- An OpenAI Platform account with API credits

Verify in PowerShell:

```powershell
git --version
node --version
npm --version
docker --version
docker compose version
```

**Success checkpoint:** Every command displays a version number.

---

## Phase 2 — Create the Project

Create and enter the project folder:

```powershell
mkdir D:\ai-qa-architect-lab
cd D:\ai-qa-architect-lab
npm init -y
```

Install the main packages:

```powershell
npm install --save-dev @playwright/test @types/node allure-commandline allure-playwright
npm install allure-js-commons openai
npx playwright install chromium
```

Create these folders:

```text
pages
tests
test-data
scripts
```

**Success checkpoint:** The project contains `package.json`, `package-lock.json`, and the four folders.

---

## Phase 3 — Build the Playwright Framework

Create Page Objects:

```text
pages/LoginPage.ts
pages/ProductsPage.ts
pages/CartPage.ts
pages/CheckoutPage.ts
```

Create reusable test data:

```text
test-data/users.ts
test-data/customers.ts
```

Create tests:

```text
tests/login.spec.ts
tests/checkout.spec.ts
```

The initial suite should cover:

1. Standard user can log in.
2. Locked-out user cannot log in.
3. Standard user can complete an order.

**Success checkpoint:** Run:

```powershell
npx playwright test --project=chromium
```

Expected result:

```text
3 passed
```

---

## Phase 4 — Configure Reports and Failure Evidence

In `playwright.config.ts`, configure:

- Playwright HTML reporter
- JSON reporter
- Allure reporter
- Screenshot only on failure
- Video retained on failure
- Trace retained on failure
- Two retries in CI
- One CI worker

Key settings:

```typescript
reporter: [
  ['html'],
  ['json', { outputFile: 'test-results/results.json' }],
  ['allure-playwright'],
],

use: {
  baseURL: 'https://www.saucedemo.com',
  screenshot: 'only-on-failure',
  trace: 'retain-on-failure',
  video: 'retain-on-failure',
},
```

**Success checkpoint:** All three tests still pass after changing the configuration.

---

## Phase 5 — Put the Project in GitHub

Create a GitHub repository, then connect and push the project:

```powershell
git init
git add .
git commit -m "Create Playwright QA framework"
git branch -M main
git remote add origin YOUR-GITHUB-REPOSITORY-URL
git push -u origin main
```

Always run this before committing:

```powershell
git status
```

**Success checkpoint:** The project files appear on the GitHub repository page.

---

## Phase 6 — Run Jenkins in Docker

Create:

```text
Dockerfile.jenkins
docker-compose.yml
```

The custom Jenkins image needs:

- Jenkins
- Node.js and npm
- Git
- Linux libraries required by Playwright Chromium

Start Jenkins:

```powershell
docker compose up -d --build
docker ps
```

Open:

```text
http://localhost:8080
```

**Success checkpoint:** The Jenkins login or dashboard page opens.

---

## Phase 7 — Configure Jenkins

Install or verify these Jenkins plugins:

- Pipeline
- Git
- GitHub
- Credentials Binding
- Allure Jenkins Plugin

Configure the Allure command-line tool under:

```text
Manage Jenkins → Tools
```

Create a Pipeline job named:

```text
AI-QA-Architect-Pipeline
```

Use:

```text
Definition: Pipeline script from SCM
SCM: Git
Repository: your GitHub repository
Branch: */main
Script Path: Jenkinsfile
```

**Success checkpoint:** Jenkins can check out the repository from GitHub.

---

## Phase 8 — Create the Jenkins Pipeline

Create a `Jenkinsfile` that performs:

1. Display Node.js and npm versions.
2. Run `npm ci`.
3. Run `npx playwright install chromium`.
4. Run `npx playwright test --project=chromium`.
5. Archive Playwright and Allure artifacts.
6. Publish the Allure report.

Important:

```text
Use: npx playwright install chromium
Do not use: npx playwright install --with-deps chromium
```

The Docker image already contains the Linux dependencies. Trying to install them during a Jenkins build can cause a root-password failure.

**Success checkpoint:** Jenkins reports:

```text
3 passed
Allure report was successfully generated
Finished: SUCCESS
```

---

## Phase 9 — Enable Automatic Jenkins Builds

Open the Jenkins job configuration:

```text
Configure → Build Triggers → Poll SCM
```

Use this schedule:

```text
H/5 * * * *
```

Jenkins will check GitHub approximately every five minutes and run only when it detects a new commit.

Test it by pushing a small change without clicking **Build Now**.

**Success checkpoint:** Console Output begins with:

```text
Started by an SCM change
```

---

## Phase 10 — Verify Allure and Artifacts

Open a successful Jenkins build and check:

```text
Allure Report
Status → Build Artifacts
```

You should find:

```text
allure-results
playwright-report
test-results
allure-report.zip
allure-summary.json
```

Allure should display:

- Three tests
- Passing percentage
- Individual suites and tests
- Chromium project
- Test duration
- Checkout metadata
- Historical trend graph

**Success checkpoint:** The Allure dashboard opens and shows all three tests.

---

## Phase 11 — Prove Failure Evidence Works

Temporarily change the final checkout expectation to incorrect text.

Correct:

```typescript
.toHaveText('Thank you for your order!');
```

Temporary incorrect value:

```typescript
.toHaveText('Order completed successfully!');
```

Commit and push the controlled failure.

Expected result:

```text
1 failed
2 passed
Finished: FAILURE
```

Open the failed build artifacts. Each failed attempt should contain:

```text
test-failed-1.png
video.webm
trace.zip
error-context.md
```

Open a downloaded trace:

```powershell
npx playwright show-trace "$env:USERPROFILE\Downloads\trace.zip"
```

**Success checkpoint:** Trace Viewer shows the test actions, page state, locator, expected text, and received text.

Restore the correct assertion immediately after the experiment.

---

## Phase 12 — Add OpenAI Failure Analysis

Create an OpenAI API key and make sure the API account has credits.

In Jenkins, create a **Secret text** credential:

```text
ID: openai-api-key
```

Never place the key in GitHub, the Jenkinsfile, a test file, or Console Output.

Create:

```text
scripts/ai-failure-analyzer.js
```

The analyzer should:

1. Read `test-results/results.json`.
2. Stop without calling OpenAI when no failures exist.
3. Extract failure details when tests fail.
4. Send structured failure evidence to OpenAI.
5. Ask for root cause, classification, and recommended action.
6. Write `ai-analysis/failure-analysis.md`.

Update the Jenkins `post` block to:

- Bind `openai-api-key` temporarily to `OPENAI_API_KEY`.
- Run the analyzer.
- Print the Markdown report in Console Output.
- Archive the AI report.
- Continue publishing Allure and other artifacts.

**Passing-build checkpoint:** 

```text
3 passed
No failures detected. OpenAI API was not called.
Finished: SUCCESS
```

**Failing-build checkpoint:**

```text
1 failed
2 passed
Masking supported pattern matches of $OPENAI_API_KEY
AI analysis created: ai-analysis/failure-analysis.md
=== AI Failure Analysis ===
[AI diagnosis]
Finished: FAILURE
```

The build must remain failed when a test fails. AI explains the result; it does not override the quality gate.

---

## Phase 13 — Perform the Final Health Check

Confirm all of these:

- [ ] Latest GitHub commit contains the correct checkout assertion.
- [ ] Jenkins checks out the latest commit.
- [ ] Three Playwright tests pass.
- [ ] Jenkins finishes successfully.
- [ ] Allure publishes and retains history.
- [ ] Reports and artifacts are archived.
- [ ] Failure screenshots, videos, and traces were verified.
- [ ] The OpenAI key is masked.
- [ ] A controlled failure produced a correct AI diagnosis.
- [ ] A passing run skipped the OpenAI request.

---

## Completed Lab in One Sentence

> A GitHub change automatically triggers a Dockerized Jenkins pipeline that runs Playwright tests, publishes Allure reports, preserves failure evidence, and uses OpenAI to classify failures and recommend the next action.

## Use the Two Guides Together

- `AI_QA_LAB_EASY_OUTLINE.md` — quick, easy-to-follow build order
- `RECREATE_AI_QA_LAB.md` — exact files, detailed commands, explanations, and troubleshooting

