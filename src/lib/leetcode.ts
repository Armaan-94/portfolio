import { leetcode } from "@/content";
import snapshot from "@/data/leetcode.json";

/**
 * LeetCode activity for the coding section.
 *
 * The data is fetched on GitHub's runners by `scripts/fetch-leetcode.mjs`
 * (see `.github/workflows/leetcode.yml`) and committed to
 * `src/data/leetcode.json`. This module reads that committed snapshot — there
 * is NO network call at request time, so a serverless host's IP can never be
 * blocked and the section renders instantly. The daily job refreshes the file
 * (and the deploy) only when the underlying data actually changes.
 *
 * The heat grid is computed here from the stored calendar relative to "now", so
 * it stays aligned to the current week between refreshes. If the snapshot is
 * ever missing or empty, it falls back to an illustrative grid plus the known
 * figures in `content.ts`, so the section can never break.
 */

const WEEKS = 53;
const DAYS = 7;
const TOTAL = WEEKS * DAYS;

export type LeetCodeData = {
  solved: number;
  easy: number;
  medium: number;
  hard: number;
  activeDays: number;
  streak: number;
  submissionsPastYear: number;
  /** WEEKS*DAYS heat levels (0..4), column-major, row 0 = Sunday. */
  cells: number[];
  source: "live" | "fallback";
};

type LeetCodeSnapshot = {
  solved: number;
  easy: number;
  medium: number;
  hard: number;
  activeDays: number;
  streak: number;
  calendar: Record<string, number>;
};

// GitHub-style buckets: map a day's submission count to a heat level.
function levelFor(count: number): number {
  if (count <= 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 9) return 3;
  return 4;
}

// LeetCode's calendar is { unixSeconds: count }. Turn it into a 53x7 grid that
// ends on the current week (row 0 = Sunday, column-major), plus a past-year sum.
function gridFromCalendar(calendar: Record<string, number>) {
  const byDay = new Map<string, number>();
  for (const [ts, count] of Object.entries(calendar)) {
    const key = new Date(Number(ts) * 1000).toISOString().slice(0, 10);
    byDay.set(key, (byDay.get(key) ?? 0) + count);
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  // Start on the Sunday (WEEKS-1) weeks before this week's Sunday.
  const start = new Date(today);
  start.setUTCDate(today.getUTCDate() - today.getUTCDay() - (WEEKS - 1) * DAYS);

  const yearAgo = new Date(today);
  yearAgo.setUTCDate(today.getUTCDate() - 365);

  const cells = new Array<number>(TOTAL).fill(0);
  let submissionsPastYear = 0;
  const cursor = new Date(start);
  for (let i = 0; i < TOTAL; i++) {
    const key = cursor.toISOString().slice(0, 10);
    const count = byDay.get(key) ?? 0;
    cells[i] = levelFor(count);
    if (cursor >= yearAgo && cursor <= today) submissionsPastYear += count;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return { cells, submissionsPastYear };
}

// Deterministic illustrative grid — only used when the snapshot is unusable.
function fallbackGrid(): number[] {
  let seed = 20260724;
  const rand = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const cells: number[] = [];
  for (let i = 0; i < TOTAL; i++) {
    const r = rand();
    let level = 0;
    if (r > 0.53) {
      if (r > 0.96) level = 4;
      else if (r > 0.88) level = 3;
      else if (r > 0.72) level = 2;
      else level = 1;
    }
    cells.push(level);
  }
  return cells;
}

function fallback(): LeetCodeData {
  return {
    solved: leetcode.solved,
    easy: leetcode.easy,
    medium: leetcode.medium,
    hard: leetcode.hard,
    activeDays: leetcode.activeDays,
    streak: 0,
    submissionsPastYear: leetcode.submissionsPastYear,
    cells: fallbackGrid(),
    source: "fallback",
  };
}

export function getLeetCodeData(): LeetCodeData {
  const snap = snapshot as LeetCodeSnapshot;
  if (!snap?.calendar || Object.keys(snap.calendar).length === 0) {
    return fallback();
  }

  const { cells, submissionsPastYear } = gridFromCalendar(snap.calendar);
  return {
    solved: snap.solved,
    easy: snap.easy,
    medium: snap.medium,
    hard: snap.hard,
    activeDays: snap.activeDays,
    streak: snap.streak,
    submissionsPastYear,
    cells,
    source: "live",
  };
}
