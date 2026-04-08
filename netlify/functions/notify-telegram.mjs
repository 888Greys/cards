export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Telegram not configured. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in Netlify environment variables.",
      }),
    };
  }

  try {
    const payload = JSON.parse(event.body || "{}");
    const text = String(payload.text || "").trim();

    if (!text) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing text field." }),
      };
    }

    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
        }),
      },
    );

    if (!response.ok) {
      const detail = await response.text();
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: "Telegram send failed", detail }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Unexpected error",
        detail: error instanceof Error ? error.message : String(error),
      }),
    };
  }
}
