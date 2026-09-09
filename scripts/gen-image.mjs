#!/usr/bin/env node
/**
 * Generate an image with Cloudflare Workers AI.
 *
 *   npm run gen:image -- --preset og --prompt "..." --out public/og-bg.png
 *   npm run gen:image -- --list
 *   npm run gen:image -- --preset og --prompt "..." --out x.png --dry-run
 *
 * Deliberately a script rather than an MCP server: the output is a committed
 * site asset, so the thing that produced it should be reviewable in the same
 * pull request, reproducible from a seed, and runnable by a human on the CLI
 * without any client attached.
 *
 * Credentials come from the environment or .env.local and are never printed.
 * Needs an API token with the Workers AI permission:
 *   CLOUDFLARE_ACCOUNT_ID
 *   CLOUDFLARE_API_TOKEN
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));

/* ---------------------------------------------------------------- models -- */

/**
 * A capability table rather than a list of ids, because these models differ in
 * ways the caller has to care about: only the Stable Diffusion family accepts
 * width and height, the step ceilings are different, and the step parameter is
 * not even spelled the same. Adding a model is one entry here.
 */
const MODELS = {
  sdxl: {
    id: "@cf/stabilityai/stable-diffusion-xl-base-1.0",
    steps: { field: "num_steps", max: 20, default: 20 },
    dims: true,
    extras: true,
    note: "Best quality with explicit dimensions. Slowest.",
  },
  "sdxl-lightning": {
    id: "@cf/bytedance/stable-diffusion-xl-lightning",
    steps: { field: "num_steps", max: 20, default: 8 },
    dims: true,
    extras: true,
    note: "Fast, sized output. Good default for iterating on a prompt.",
  },
  "flux-schnell": {
    id: "@cf/black-forest-labs/flux-1-schnell",
    steps: { field: "steps", max: 8, default: 4 },
    dims: false,
    extras: false,
    note: "Strongest prompt adherence, but NO width/height control.",
  },
  dreamshaper: {
    id: "@cf/lykon/dreamshaper-8-lcm",
    steps: { field: "num_steps", max: 20, default: 8 },
    dims: true,
    extras: true,
    note: "Photorealistic leaning.",
  },
};

/** Sizes tied to where the image is actually going. */
const PRESETS = {
  og: { model: "sdxl", width: 1200, height: 630, note: "Social preview card" },
  thumb: { model: "sdxl", width: 1024, height: 768, note: "Project thumbnail" },
  bg: { model: "sdxl-lightning", width: 1920, height: 1080, note: "Section background" },
  square: { model: "flux-schnell", note: "Square, no dimension control" },
};

/* ------------------------------------------------------------------ args -- */

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) {
      out._.push(a);
      continue;
    }
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) out[key] = true;
    else {
      out[key] = next;
      i++;
    }
  }
  return out;
}

/* ----------------------------------------------------------- credentials -- */

/**
 * Reads .env.local without printing any of it. Next loads that file itself, but
 * a standalone script does not, and asking someone to export shell variables
 * before running a script is how tokens end up in shell history.
 */
function loadEnvLocal() {
  const p = resolve(ROOT, ".env.local");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!m) continue;
    const [, k, raw] = m;
    if (process.env[k] !== undefined) continue; // real env wins
    process.env[k] = raw.trim().replace(/^["']|["']$/g, "");
  }
}

function credentials() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const missing = [
    !accountId && "CLOUDFLARE_ACCOUNT_ID",
    !token && "CLOUDFLARE_API_TOKEN",
  ].filter(Boolean);
  if (missing.length) {
    console.error(
      [
        `Missing ${missing.join(" and ")}.`,
        "",
        "Add them to .env.local (already git-ignored):",
        "  CLOUDFLARE_ACCOUNT_ID=...",
        "  CLOUDFLARE_API_TOKEN=...",
        "",
        "Account ID: Cloudflare dashboard, right-hand sidebar of any account page.",
        "Token:      My Profile > API Tokens > Create Token > Custom token,",
        "            with the permission  Account | Workers AI | Read.",
        "            Nothing else needs to be granted.",
      ].join("\n")
    );
    process.exit(1);
  }
  return { accountId, token };
}

/* ------------------------------------------------------------------ run --- */

function usage() {
  const models = Object.entries(MODELS)
    .map(([k, m]) => `    ${k.padEnd(16)} ${m.dims ? "sized  " : "square "} ${m.note}`)
    .join("\n");
  const presets = Object.entries(PRESETS)
    .map(
      ([k, p]) =>
        `    ${k.padEnd(16)} ${p.width ? `${p.width}x${p.height}`.padEnd(10) : "model default".padEnd(10)} ${p.note}`
    )
    .join("\n");
  console.log(
    [
      "Generate an image with Cloudflare Workers AI.",
      "",
      "  npm run gen:image -- --prompt <text> --out <path> [options]",
      "",
      "Options:",
      "  --prompt <text>     what to draw (required)",
      "  --out <path>        where to write it (required)",
      "  --preset <name>     size and model for a known use",
      "  --model <name>      override the preset's model",
      "  --width --height    override the preset's size (sized models only)",
      "  --steps <n>         more steps, slower, usually better",
      "  --seed <n>          reproducible output",
      "  --negative <text>   what to avoid (sized models only)",
      "  --guidance <n>      prompt adherence, default 7.5 (sized models only)",
      "  --dry-run           validate everything without calling the API",
      "  --list              print models and presets",
      "",
      "Presets:",
      presets,
      "",
      "Models:",
      models,
    ].join("\n")
  );
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.list || args.help || args.h) {
    usage();
    return;
  }

  const preset = args.preset ? PRESETS[args.preset] : null;
  if (args.preset && !preset) {
    console.error(
      `Unknown preset "${args.preset}". Known: ${Object.keys(PRESETS).join(", ")}`
    );
    process.exit(1);
  }

  const modelKey = args.model ?? preset?.model ?? "sdxl-lightning";
  const model = MODELS[modelKey];
  if (!model) {
    console.error(
      `Unknown model "${modelKey}". Known: ${Object.keys(MODELS).join(", ")}`
    );
    process.exit(1);
  }

  const prompt = typeof args.prompt === "string" ? args.prompt : null;
  const out = typeof args.out === "string" ? args.out : null;
  if (!prompt || !out) {
    usage();
    console.error("\n--prompt and --out are both required.");
    process.exit(1);
  }

  const width = Number(args.width ?? preset?.width ?? 1024);
  const height = Number(args.height ?? preset?.height ?? 1024);

  // Fail loudly rather than silently producing a square when a 1200x630 card
  // was asked for.
  if (!model.dims && (args.width || args.height || preset?.width)) {
    console.error(
      `Model "${modelKey}" does not accept width or height, so it cannot produce ` +
        `${width}x${height}. Use a sized model (${Object.entries(MODELS)
          .filter(([, m]) => m.dims)
          .map(([k]) => k)
          .join(", ")}) or drop the size.`
    );
    process.exit(1);
  }

  const steps = Math.min(
    Number(args.steps ?? model.steps.default),
    model.steps.max
  );
  if (args.steps && Number(args.steps) > model.steps.max) {
    console.warn(
      `  note: ${modelKey} caps steps at ${model.steps.max}, using that instead of ${args.steps}.`
    );
  }

  const body = { prompt, [model.steps.field]: steps };
  if (model.dims) {
    body.width = width;
    body.height = height;
  }
  if (model.extras) {
    if (args.negative) body.negative_prompt = String(args.negative);
    if (args.guidance) body.guidance = Number(args.guidance);
  }
  if (args.seed) body.seed = Number(args.seed);

  const outPath = resolve(ROOT, out);
  console.log(`  model   ${modelKey}  (${model.id})`);
  console.log(`  size    ${model.dims ? `${width}x${height}` : "model default"}`);
  console.log(`  steps   ${steps}`);
  if (body.seed !== undefined) console.log(`  seed    ${body.seed}`);
  console.log(`  out     ${out}`);

  if (args["dry-run"]) {
    loadEnvLocal();
    const ok = Boolean(
      process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_API_TOKEN
    );
    console.log(`\n  dry run. credentials ${ok ? "present" : "MISSING"}. nothing was sent.`);
    if (!ok) process.exit(1);
    return;
  }

  loadEnvLocal();
  const { accountId, token } = credentials();

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model.id}`;
  const started = Date.now();
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    let hint = "";
    if (res.status === 401 || res.status === 403) {
      hint =
        "\n  The token is present but rejected. It needs Account | Workers AI | Read,\n" +
        "  and it must belong to the same account as CLOUDFLARE_ACCOUNT_ID.";
    } else if (res.status === 404) {
      hint = `\n  Model ${model.id} was not found. It may have been renamed or retired.`;
    } else if (res.status === 429) {
      hint = "\n  Rate limited or out of Workers AI quota for the day.";
    }
    console.error(`\nWorkers AI returned ${res.status}.${hint}\n  ${detail.slice(0, 500)}`);
    process.exit(1);
  }

  // The families disagree on response shape: Flux answers with JSON carrying a
  // base64 string, Stable Diffusion streams raw image bytes. Branch on what the
  // server actually said rather than on which model was asked for, so a model
  // changing its mind does not silently write a corrupt file.
  const contentType = res.headers.get("content-type") ?? "";
  let bytes;
  if (contentType.includes("application/json")) {
    const json = await res.json();
    const b64 = json?.result?.image ?? json?.image;
    if (!b64) {
      console.error(
        `\nJSON response contained no image field.\n  ${JSON.stringify(json).slice(0, 400)}`
      );
      process.exit(1);
    }
    bytes = Buffer.from(b64, "base64");
  } else {
    bytes = Buffer.from(await res.arrayBuffer());
  }

  if (bytes.length < 1024) {
    console.error(`\nResponse was only ${bytes.length} bytes, which is not an image.`);
    process.exit(1);
  }

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, bytes);

  let dims = "";
  try {
    const sharp = (await import("sharp")).default;
    const m = await sharp(outPath).metadata();
    dims = `  ${m.width}x${m.height} ${m.format}`;
  } catch {
    // sharp is a convenience here, not a requirement.
  }

  console.log(
    `\n  wrote ${out}  ${(bytes.length / 1024).toFixed(0)} KB${dims}  in ${(
      (Date.now() - started) / 1000
    ).toFixed(1)}s`
  );
}

main().catch((err) => {
  console.error(err?.message ?? err);
  process.exit(1);
});
