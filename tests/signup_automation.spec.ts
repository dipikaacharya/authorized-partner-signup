import { test, expect } from '@playwright/test';
import 'dotenv/config';
import { getLatestVerificationCode } from './helpers/email';

const BASE_URL = 'https://authorized-partner.vercel.app/';
const MAILOSAUR_API_KEY = process.env.MAILOSAUR_API_KEY as string;
const MAILOSAUR_SERVER_ID = process.env.MAILOSAUR_SERVER_ID as string;

// Fresh, unique identity every run. The email is a unique Mailosaur address
// on your server, so the verification code lands somewhere we can read via API.
function makeUser(serverId: string) {
  const stamp = Date.now();
  const rand = Math.floor(10000000 + Math.random() * 89999999);
  return {
    firstName: 'Dipika',
    lastName: 'Acharya',
    email: `qa${stamp}@${serverId}.mailosaur.net`,
    phone: `98${rand}`,
    password: 'VrittechQA@22',
    agencyName: 'Vrittech',
    role: 'QA',
    agencyEmail: `agency${stamp}@${serverId}.mailosaur.net`,
    website: 'www.vrittechnologies.com',
    address: 'Bhaktapur',
    businessReg: String(rand),
    focusArea: 'Undergraduate admissions in Nepal',
  };
}

test('completes the full multi-page signup with no manual intervention', async ({ page }) => {
  test.setTimeout(120_000);
  const user = makeUser(MAILOSAUR_SERVER_ID);

  // ---- Entry + Terms ----
  await page.goto(BASE_URL);
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'Sign Up' }).click();
  await page.getByRole('checkbox', { name: 'I agree to the Terms of' }).check();
  await page.getByRole('button', { name: 'Continue' }).click();

  // ---- Step 1: personal details ----
  const firstName = page.getByRole('textbox', { name: 'First Name' });
  await expect(firstName).toBeVisible();
  await firstName.fill(user.firstName);
  await page.getByRole('textbox', { name: 'Last Name' }).fill(user.lastName);
  await page.getByRole('textbox', { name: 'Email Address' }).fill(user.email);
  await page.getByRole('textbox', { name: 'Phone Number' }).fill(user.phone);
  await page.locator('input[name="password"]').fill(user.password);
  await page.locator('input[name="confirmPassword"]').fill(user.password);
  await page.getByRole('button', { name: 'Next' }).click();

  // ---- Step 2: email verification code (read from Mailosaur) ----
  const verifyButton = page.getByRole('button', { name: 'Verify Code' });
  await expect(verifyButton).toBeVisible();
  const code = await getLatestVerificationCode({
    apiKey: MAILOSAUR_API_KEY,
    serverId: MAILOSAUR_SERVER_ID,
    sentTo: user.email,
  });
  await page.getByRole('textbox').first().fill(code);
  await verifyButton.click();

  // ---- Step 3: agency details ----
  const agencyName = page.getByRole('textbox', { name: 'Name' });
  await expect(agencyName).toBeVisible();
  await agencyName.fill(user.agencyName);
  await page.getByRole('textbox', { name: 'Role in Agency' }).fill(user.role);
  await page.getByRole('textbox', { name: 'Email Address' }).fill(user.agencyEmail);
  await page.getByRole('textbox', { name: 'Website' }).fill(user.website);
  await page.getByRole('textbox', { name: 'Address', exact: true }).fill(user.address);
  await page.getByRole('combobox').click();
  await page.locator('div').filter({ hasText: /^Canada$/ }).click();
  await page.getByRole('button', { name: 'Next' }).click();

  // ---- Step 4: experience ----
  const yoe = page.getByRole('combobox', { name: 'Years of Experience' });
  await expect(yoe).toBeVisible();
  await yoe.click();
  await page.getByRole('option', { name: '5 years' }).click();
  await page.getByRole('spinbutton', { name: 'Number of Students Recruited' }).fill('150');
  await page.getByRole('textbox', { name: 'Focus Area' }).fill(user.focusArea);
  await page.getByRole('spinbutton', { name: 'Success Metrics' }).fill('80');
  await page.getByRole('checkbox', { name: 'Career Counseling' }).check();
  await page.getByRole('checkbox', { name: 'Admission Applications' }).check();
  await page.getByRole('checkbox', { name: 'Visa Processing' }).check();
  await page.getByRole('button', { name: 'Next' }).click();

  // ---- Step 5: business details + file upload ----
  const businessReg = page.getByRole('textbox', { name: 'Business Registration Number' });
  await expect(businessReg).toBeVisible();
  await businessReg.fill(user.businessReg);
  await page.getByRole('combobox', { name: 'Preferred Countries' }).click();
  await page.getByText('New Zealand').click();
  await page.keyboard.press('Escape');
  await page.getByRole('checkbox', { name: 'Universities' }).check();
  await page
    .getByRole('textbox', { name: 'Certification Details (' })
    .fill('ICEF certified education agent');
  await page
    .getByRole('button', { name: 'Choose File' })
    .first()
    .setInputFiles('tests/fixtures/sample.pdf');
  await page.getByRole('button', { name: 'Submit' }).click();

  // ---- Success ----
  await expect(page).toHaveURL(/profile|dashboard|admin/i, { timeout: 30_000 });
});