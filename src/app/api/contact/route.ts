import { NextResponse } from "next/server";
import { Resend } from "resend";
import { profile } from "@/content";

/**
 * Contact form endpoint. Validates the submission server-side and sends it as a
 * real email via Resend, with the sender's address as reply-to so replies go
 * straight back to them.
 *
 * Configuration (see .env.local / README):
 *   RESEND_API_KEY   – required; from https://resend.com/api-keys
 *   CONTACT_TO_EMAIL – optional; defaults to the address in content.ts
 *
 * Until RESEND_API_KEY is set the route returns 503 with a friendly message,
 * so the UI can tell the visitor to email directly rather than failing silently.
 */

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Payload = {
  name?: string;
  email?: string;
  message?: string;
  company?: string; // honeypot — must stay empty
};

export async function POST(req: Request) {
  let data: Payload;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: real users never see or fill this. Silently accept to waste bots.
  if (data.company) return NextResponse.json({ ok: true });

  const name = (data.name ?? "").trim();
  const email = (data.email ?? "").trim();
  const message = (data.message ?? "").trim();

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Please fill in your name, email, and message." },
      { status: 400 }
    );
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "That email address doesn't look right." },
      { status: 400 }
    );
  }
  if (message.length > 5000) {
    return NextResponse.json(
      { error: "That message is a little too long." },
      { status: 400 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[contact] RESEND_API_KEY is not set — cannot send email.");
    return NextResponse.json(
      { error: "The form isn't wired up yet — please email me directly for now." },
      { status: 503 }
    );
  }

  const to = process.env.CONTACT_TO_EMAIL || profile.email;
  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      // onboarding@resend.dev works out of the box; swap for an address on your
      // own verified domain once you add one in Resend.
      from: "Portfolio <onboarding@resend.dev>",
      to,
      replyTo: email,
      subject: `Portfolio message from ${name}`,
      text: `${message}\n\n— ${name} <${email}>`,
      html: `
        <div style="font-family:ui-sans-serif,system-ui,sans-serif;line-height:1.6;color:#0d1117">
          <p style="margin:0 0 12px;white-space:pre-wrap">${escapeHtml(message)}</p>
          <hr style="border:none;border-top:1px solid #e6edf3;margin:16px 0" />
          <p style="margin:0;font-size:14px;color:#57606a">
            From <strong>${escapeHtml(name)}</strong> &lt;${escapeHtml(email)}&gt;
          </p>
        </div>`,
    });

    if (error) {
      console.error("[contact] Resend error:", error);
      return NextResponse.json(
        { error: "Couldn't send just now — please try again in a moment." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact] send failed:", err);
    return NextResponse.json(
      { error: "Couldn't send just now — please try again in a moment." },
      { status: 502 }
    );
  }
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
