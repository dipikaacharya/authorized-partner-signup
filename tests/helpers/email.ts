import Mailosaur from 'mailosaur';

interface Opts {
  apiKey: string;
  serverId: string;
  sentTo: string;      // the exact address the signup code was sent to
  timeoutMs?: number;
}

/**
 * Waits for the verification email to arrive in the Mailosaur inbox and
 * returns the 6-digit code. Mailosaur auto-detects codes; we fall back to
 * a regex on the body just in case.
 */
export async function getLatestVerificationCode(opts: Opts): Promise<string> {
  const client = new Mailosaur(opts.apiKey);

  const message = await client.messages.get(
    opts.serverId,
    { sentTo: opts.sentTo },
    { timeout: opts.timeoutMs ?? 60000 }
  );

  // Mailosaur's built-in code detection:
  const detected =
    (message.text && message.text.codes && message.text.codes[0]?.value) ||
    (message.html && message.html.codes && message.html.codes[0]?.value);
  if (detected) return detected;

  // Fallback: find any 6-digit number in the email body.
  const body = `${message.subject || ''} ${message.text?.body || ''} ${message.html?.body || ''}`;
  const m = body.match(/\b(\d{6})\b/);
  if (m) return m[1];

  throw new Error('No verification code found in the Mailosaur email.');
}