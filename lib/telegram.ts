// Telegram notifications via the Bot API. Configure with two env vars:
//   TELEGRAM_BOT_TOKEN  — from @BotFather (e.g. "8123456789:AAH...")
//   TELEGRAM_CHAT_ID    — target chat/group/channel id (from @userinfobot)
// If either is missing, notifications are skipped (a warning is logged) so
// the app still works locally without Telegram configured.

const API_BASE = "https://api.telegram.org";

/** Escape text for Telegram's HTML parse mode. */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Send an HTML message to the configured Telegram chat. Never throws — on
 * failure it logs and returns false, so callers (e.g. ticket creation) are
 * not broken by a Telegram outage or missing config.
 */
export async function sendTelegramMessage(html: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn(
      "[telegram] TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID not set — skipping notification."
    );
    return false;
  }

  try {
    const res = await fetch(`${API_BASE}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: html,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`[telegram] sendMessage failed (${res.status}): ${detail}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[telegram] sendMessage threw:", err);
    return false;
  }
}
