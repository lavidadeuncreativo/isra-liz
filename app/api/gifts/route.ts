import { NextResponse } from "next/server";

type Payload = {
  amount?: unknown;
  name?: unknown;
  phone?: unknown;
  email?: unknown;
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
      console.info("[Gift demo]", { to, subject, html });
      return { id: "development-demo" };
    }
    throw new Error("El envio de regalos todavia no esta configurado en Vercel.");
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
    throw new Error("No se pudo registrar tu detalle. Intenta nuevamente.");
  }

  return response.json();
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Payload;

    if (text(payload.company, 120)) {
      return NextResponse.json({ ok: true, message: "Mensaje recibido." });
    }

    const amount = text(payload.amount, 40);
    const name = text(payload.name, 120);
    const phone = text(payload.phone, 30);
    const email = text(payload.email, 160);
    const message = text(payload.message, 500);

    if (!name || !amount) {
      return NextResponse.json({ ok: false, message: "Comparte tu nombre y el monto elegido." }, { status: 400 });
    }

    if (!phone && !email) {
      return NextResponse.json({ ok: false, message: "Dejanos al menos un telefono o correo para poder contactarte." }, { status: 400 });
    }

    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ ok: false, message: "Revisa el correo electronico." }, { status: 400 });
    }

    const recipient = process.env.RSVP_TO_EMAIL;
    if (!recipient) {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ ok: false, message: "El correo receptor de regalos todavia no esta configurado." }, { status: 503 });
      }
    }

    const safe = {
      amount: escapeHtml(amount),
      name: escapeHtml(name),
      phone: escapeHtml(phone || "No proporcionado"),
      email: escapeHtml(email || "No proporcionado"),
      message: escapeHtml(message || "Sin mensaje"),
    };

    await sendEmail({
      to: recipient || "development@example.com",
      subject: `Regalo · ${name} · ${amount}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#201b1d">
          <p style="color:#762c47;font-weight:700;letter-spacing:.08em;text-transform:uppercase">Nuevo detalle para Isra&Liz</p>
          <h1 style="font-size:34px;margin:0 0 24px">${safe.name}</h1>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:12px;border-bottom:1px solid #ddd"><strong>Monto</strong></td><td style="padding:12px;border-bottom:1px solid #ddd">${safe.amount}</td></tr>
            <tr><td style="padding:12px;border-bottom:1px solid #ddd"><strong>Telefono</strong></td><td style="padding:12px;border-bottom:1px solid #ddd">${safe.phone}</td></tr>
            <tr><td style="padding:12px;border-bottom:1px solid #ddd"><strong>Correo</strong></td><td style="padding:12px;border-bottom:1px solid #ddd">${safe.email}</td></tr>
            <tr><td style="padding:12px"><strong>Mensaje</strong></td><td style="padding:12px">${safe.message}</td></tr>
          </table>
        </div>
      `,
    });

    if (email) {
      await sendEmail({
        to: email,
        subject: "Gracias por tu detalle · Isra&Liz",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#201b1d">
            <p style="color:#762c47;font-weight:700;letter-spacing:.08em;text-transform:uppercase">Isra&Liz · 20 de febrero de 2027</p>
            <h1 style="font-size:34px">Gracias, ${safe.name}.</h1>
            <p style="font-size:17px;line-height:1.6">Recibimos tu eleccion de regalo por <strong>${safe.amount}</strong>.</p>
            <p style="font-size:17px;line-height:1.6">Muy pronto te compartiremos la informacion para hacerlo. Gracias por ese detalle tan bonito.</p>
          </div>
        `,
      });
    }

    return NextResponse.json({ ok: true, message: "Recibimos tu mensaje. Muy pronto te compartiremos la informacion para hacerlo." });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : "Ocurrio un error inesperado." },
      { status: 500 },
    );
  }
}
