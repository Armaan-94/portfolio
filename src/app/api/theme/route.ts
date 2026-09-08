import { NextResponse } from "next/server";
import { isThemeId, THEME_COOKIE } from "@/themes/registry";

export const runtime = "nodejs";

/**
 * Persists the visitor's theme choice.
 *
 * The dial also writes the cookie directly with document.cookie so the choice
 * takes effect on the navigation that immediately follows, without waiting for
 * a round trip. This route exists because Safari's Intelligent Tracking
 * Prevention caps the lifetime of any cookie written by JavaScript to seven
 * days, so a client-only write quietly forgets the theme about once a week. A
 * cookie set from a response header is not capped.
 */
export async function POST(req: Request) {
  const body: unknown = await req.json().catch(() => null);
  const theme =
    body && typeof body === "object" && "theme" in body
      ? (body as { theme: unknown }).theme
      : null;

  if (!isThemeId(theme)) {
    return NextResponse.json({ error: "Unknown theme." }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true, theme });
  res.cookies.set(THEME_COOKIE, theme, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    // Deliberately readable by script: the dial mirrors it into localStorage
    // so it can be re-asserted if the cookie is ever evicted. It holds a
    // display preference and nothing else.
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
