export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "GiftCardsHub";

  if (!apiKey || !senderEmail) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Brevo is not configured. Set BREVO_API_KEY and BREVO_SENDER_EMAIL.",
      }),
    };
  }

  try {
    const payload = JSON.parse(event.body || "{}");
    const toEmail = String(payload.toEmail || "").trim();
    const toName = String(payload.toName || "").trim();
    const subject = String(payload.subject || "").trim() || "GiftCardsHub notification";
    const htmlContent = String(payload.htmlContent || "").trim();

    if (!toEmail || !htmlContent) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing toEmail or htmlContent." }),
      };
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: { email: senderEmail, name: senderName },
        to: [{ email: toEmail, name: toName || undefined }],
        subject,
        htmlContent,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: "Brevo send failed", detail: errorText }),
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
        error: "Unexpected error sending email",
        detail: error instanceof Error ? error.message : String(error),
      }),
    };
  }
}
