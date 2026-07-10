import { Resend } from 'resend';
import { env } from './env.js';

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!env.RESEND_API_KEY) {
    throw new Error(
      '[shared-backend] RESEND_API_KEY is not set — cannot send email.'
    );
  }
  if (!_resend) _resend = new Resend(env.RESEND_API_KEY);
  return _resend;
}

export interface DownloadEmailParams {
  to: string;
  /** Branded from-address, e.g. 'Grandfield Money <orders@grandfieldmoney.com>' */
  from: string;
  brand: string;
  productName: string;
  downloadUrl: string;
}

/**
 * Sends the order-confirmation email carrying the download link.
 * NOTE: requires the sending domain to be verified in Resend (SPF/DKIM),
 * otherwise Resend rejects the send.
 */
export async function sendDownloadEmail(params: DownloadEmailParams) {
  const { to, from, brand, productName, downloadUrl } = params;

  const { data, error } = await getResend().emails.send({
    from,
    to,
    subject: `Your ${brand} download: ${productName}`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; color: #0f172a;">
        <h1 style="font-size: 20px;">Thanks for your purchase!</h1>
        <p>Your download for <strong>${productName}</strong> is ready.</p>
        <p style="margin: 28px 0;">
          <a href="${downloadUrl}"
             style="background:#0f172a;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;">
            Download your file
          </a>
        </p>
        <p style="font-size: 13px; color:#64748b;">
          If the button doesn't work, copy this link:<br>${downloadUrl}
        </p>
        <p style="font-size: 13px; color:#64748b;">
          Lost this link later? You can have it re-sent from our website.
        </p>
        <p style="font-size: 13px; color:#94a3b8;">— ${brand}</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`[shared-backend] Resend send failed: ${error.message}`);
  }
  return data;
}
