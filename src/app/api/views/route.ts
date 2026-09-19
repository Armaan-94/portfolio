import { NextResponse } from "next/server";

export const runtime = "edge";
/** A counter is never cacheable. */
export const dynamic = "force-dynamic";

/**
 * Site visit counter, backed by Redis over HTTP.
 *
 * Spoken to with plain fetch rather than a client library. The only operations
 * needed are INCR and GET, the Upstash REST shape for both is two lines, and a
 * dependency here would be pulled into the edge bundle for no benefit.
 *
 * Both env-var spellings are accepted: Vercel's own KV integration injects
 * KV_REST_API_*, while a store connected straight from Upstash injects
 * UPSTASH_REDIS_REST_*. They are the same service and the same protocol.
 *
 * With neither configured every route below answers `configured: false` and
 * the badge renders nothing at all. That is deliberate: the counter is a
 * flourish, and a portfolio must not show a broken widget because a store was
 * never provisioned.
 */
const URL_ = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const TOKEN =
  process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

const KEY = "portfolio:views";

async function redis(command: string[]): Promise<number | null> {
  if (!URL_ || !TOKEN) return null;
  try {
    const res = await fetch(URL_, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(command),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body: unknown = await res.json();
    const result =
      body && typeof body === "object" && "result" in body
        ? (body as { result: unknown }).result
        : null;
    const n = typeof result === "string" ? Number(result) : result;
    return typeof n === "number" && Number.isFinite(n) ? n : null;
  } catch {
    // A counter is not worth surfacing an error for.
    return null;
  }
}

function payload(views: number | null) {
  return NextResponse.json(
    { configured: URL_ != null && TOKEN != null, views },
    { headers: { "Cache-Control": "no-store" } },
  );
}

/** Read without counting. Used by anything that wants the number but is not a
 *  visit, and by the badge when this session has already been counted. */
export async function GET() {
  return payload(await redis(["GET", KEY]));
}

/** Count this visit. The caller decides what a visit is; see ViewCount. */
export async function POST() {
  return payload(await redis(["INCR", KEY]));
}
