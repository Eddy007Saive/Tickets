import { Resend } from "resend";
import { escapeHtml } from "@/lib/telegram";

// Transactional email via Resend. Configure with:
//   RESEND_API_KEY  — from resend.com → API Keys (re_...)
//   EMAIL_FROM      — verified sender, e.g. "Support <support@tondomaine.com>"
// If either is missing, sending is skipped (a warning is logged) so the app
// still works without email configured.

type ResolvedEmailInput = {
  to: string;
  requesterName: string;
  subject: string;
  projectName: string;
  ticketUrl: string;
};

/**
 * Notify the requester (in French) that their ticket has been resolved.
 * Never throws — on failure it logs and returns false, so a Resend outage or
 * missing config never breaks the status update.
 */
export async function sendTicketResolvedEmail(
  input: ResolvedEmailInput
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    console.warn(
      "[email] RESEND_API_KEY / EMAIL_FROM not set — skipping resolved email."
    );
    return false;
  }

  const name = escapeHtml(input.requesterName);
  const subject = escapeHtml(input.subject);
  const project = escapeHtml(input.projectName);

  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#181715;max-width:560px;margin:0 auto;line-height:1.6">
    <p>Bonjour ${name},</p>
    <p>Votre ticket a été marqué comme <strong>résolu</strong>&nbsp;:</p>
    <table style="border-collapse:collapse;margin:16px 0">
      <tr><td style="color:#6b6862;padding:2px 12px 2px 0">Projet</td><td><strong>${project}</strong></td></tr>
      <tr><td style="color:#6b6862;padding:2px 12px 2px 0">Sujet</td><td><strong>${subject}</strong></td></tr>
    </table>
    <p>Si le problème persiste, répondez simplement à cet email ou rouvrez le ticket&nbsp;:</p>
    <p><a href="${encodeURI(input.ticketUrl)}" style="color:#3a56a0">${escapeHtml(input.ticketUrl)}</a></p>
    <p style="color:#6b6862;font-size:13px;margin-top:24px">Merci,<br>L'équipe Support</p>
  </div>`;

  const text = [
    `Bonjour ${input.requesterName},`,
    ``,
    `Votre ticket a été marqué comme résolu :`,
    `  Projet : ${input.projectName}`,
    `  Sujet  : ${input.subject}`,
    ``,
    `Si le problème persiste, répondez à cet email ou rouvrez le ticket :`,
    input.ticketUrl,
    ``,
    `Merci, L'équipe Support`,
  ].join("\n");

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: input.to,
      subject: `Votre ticket est résolu — ${input.subject}`,
      html,
      text,
    });
    if (error) {
      console.error("[email] Resend returned an error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] send threw:", err);
    return false;
  }
}
