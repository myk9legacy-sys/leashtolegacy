const RECIPIENT = "shawn@leashtolegacy.org";

exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY no configurado");
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Servicio de email no configurado. Añade RESEND_API_KEY en Netlify.",
      }),
    };
  }

  let body;
  try {
    body =
      typeof event.body === "string"
        ? JSON.parse(event.body)
        : event.body;
  } catch (e) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "JSON inválido" }),
    };
  }

  const name = (body.name || "").trim();
  const email = (body.email || "").trim();
  const phone = (body.phone || "").trim();
  const message = (body.message || "").trim();

  if (!name || !email || !message) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: "Faltan nombre, email o mensaje",
      }),
    };
  }

  const subject = `Contacto Leash to Legacy: ${name}`;
  const text = [
    `Nombre: ${name}`,
    `Email: ${email}`,
    `Teléfono: ${phone || "(no indicado)"}`,
    "",
    "Mensaje:",
    message,
  ].join("\n");

  const html = `
    <p><strong>Nombre:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Teléfono:</strong> ${escapeHtml(phone || "(no indicado)")}</p>
    <p><strong>Mensaje:</strong></p>
    <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
  `;

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "Leash to Legacy <onboarding@resend.dev>",
        to: [RECIPIENT],
        reply_to: email,
        subject,
        text,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("Resend error:", res.status, err);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: err.message || "No se pudo enviar el email",
        }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: "Mensaje enviado" }),
    };
  } catch (err) {
    console.error("send-contact-email error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || "Error al enviar" }),
    };
  }
};
