import { NextResponse } from "next/server";

type Payload = {
  name?: unknown;
  attendance?: unknown;
  phone?: unknown;
  email?: unknown;
  dietary?: unknown;
  message?: unknown;
  company?: unknown;
};

function text(value: unknown, max = 1000) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    };
    return entities[character];
  });
}

async function sendEmail({ to, subject, html }: { to: string | string[]; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RSVP_FROM_EMAIL;

  if (!apiKey || !from) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[RSVP demo]", { to, subject, html });
      return { id: "development-demo" };
    }
    throw new Error("El envío de RSVP todavía no está configurado en Vercel.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("Resend error", response.status, detail);
    throw new Error("No se pudo enviar la confirmación. Intenta nuevamente.");
  }

  return response.json();
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Payload;

    if (text(payload.company, 120)) {
      return NextResponse.json({ ok: true, message: "Confirmación recibida." });
    }

    const name = text(payload.name, 120);
    const attendance = text(payload.attendance, 50);
    const phone = text(payload.phone, 30);
    const email = text(payload.email, 160);
    const dietary = text(payload.dietary, 500);
    const message = text(payload.message, 1000);

    if (!name || !attendance) {
      return NextResponse.json({ ok: false, message: "Completa tu nombre y confirma si asistirás." }, { status: 400 });
    }

    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ ok: false, message: "Revisa el correo electrónico." }, { status: 400 });
    }

    const recipient = process.env.RSVP_TO_EMAIL;
    if (!recipient) {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ ok: false, message: "El formulario todavía no tiene un correo receptor configurado." }, { status: 503 });
      }
    }

    const safe = {
      name: escapeHtml(name),
      attendance: escapeHtml(attendance),
      phone: escapeHtml(phone || "No proporcionado"),
      email: escapeHtml(email || "No proporcionado"),
      dietary: escapeHtml(dietary || "Ninguna indicada"),
      message: escapeHtml(message || "Sin mensaje"),
    };

    const summary = `
      <div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#201b1d">
        <p style="color:#762c47;font-weight:700;letter-spacing:.08em;text-transform:uppercase">Nueva confirmación de boda</p>
        <h1 style="font-size:34px;margin:0 0 24px">${safe.name}</h1>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:12px;border-bottom:1px solid #ddd"><strong>Asistencia</strong></td><td style="padding:12px;border-bottom:1px solid #ddd">${safe.attendance}</td></tr>
          <tr><td style="padding:12px;border-bottom:1px solid #ddd"><strong>Teléfono</strong></td><td style="padding:12px;border-bottom:1px solid #ddd">${safe.phone}</td></tr>
          <tr><td style="padding:12px;border-bottom:1px solid #ddd"><strong>Correo</strong></td><td style="padding:12px;border-bottom:1px solid #ddd">${safe.email}</td></tr>
          <tr><td style="padding:12px;border-bottom:1px solid #ddd"><strong>Alimentación</strong></td><td style="padding:12px;border-bottom:1px solid #ddd">${safe.dietary}</td></tr>
          <tr><td style="padding:12px"><strong>Mensaje</strong></td><td style="padding:12px">${safe.message}</td></tr>
        </table>
      </div>
    `;

    await sendEmail({
      to: recipient || "development@example.com",
      subject: `RSVP · ${name} · ${attendance}`,
      html: summary,
    });

    if (email) {
      await sendEmail({
        to: email,
        subject: "Recibimos tu confirmación · Israel & Liz",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#201b1d">
            <p style="color:#762c47;font-weight:700;letter-spacing:.08em;text-transform:uppercase">Israel & Liz · 20 de febrero de 2027</p>
            <h1 style="font-size:34px">Gracias, ${safe.name}.</h1>
            <p style="font-size:17px;line-height:1.6">Recibimos tu respuesta: <strong>${safe.attendance}</strong>.</p>
            <p style="font-size:17px;line-height:1.6">Gracias por tomarte un momento para confirmarnos.</p>
          </div>
        `,
      });
    }

    return NextResponse.json({ ok: true, message: "Tu confirmación quedó registrada. Gracias." });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Ocurrió un error inesperado." },
      { status: 500 },
    );
  }
}
