# Authorized Partner — Signup Automation

End-to-end automation of the full multi-page signup at
https://authorized-partner.vercel.app/ using Playwright + TypeScript.
The entire flow runs with no manual intervention, including reading the
email verification code automatically via the Mailosaur API.

## Prerequisites
- Node.js 18+
- A free Mailosaur account (test inbox + API key)
- ffmpeg (only to convert the demo recording to .mp4)

## Environment / Setup
- Language: TypeScript
- Framework: @playwright/test
- Browser: Chromium (bundled)
- Email read: mailosaur (API)
- Config: dotenv (.env)

Install:
    npm install
    npx playwright install
    npm i -D mailosaur dotenv

Create a .env file in the project root (git-ignored, never committed):
    MAILOSAUR_API_KEY=your_api_key
    MAILOSAUR_SERVER_ID=your_inbox_id

## How to Run
    npx playwright test --project=chromium            # headless
    npx playwright test --project=chromium --headed   # watch it run
    npx playwright show-report                         # open the HTML report

## Test Data / Accounts
- A unique user is fabricated on every run; no real personal data is used.
- The signup email is a unique Mailosaur address
  (qa<timestamp>@<serverId>.mailosaur.net) so each run is fresh and the
  verification code is readable via the Mailosaur API.
- Phone number, business registration number, and emails are randomized.
- A small tests/fixtures/sample.pdf is uploaded for the document field.
