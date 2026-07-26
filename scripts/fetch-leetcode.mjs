// Fetches live LeetCode stats + submission calendar and writes them to
// src/data/leetcode.json.
//
// Run daily by .github/workflows/leetcode.yml on GitHub's runners — LeetCode
// does not block those the way it can block a serverless host's datacenter IPs.
// The workflow commits the output ONLY when the data actually changes, so no
// empty/padding commits are ever produced.
//
// Usage: node scripts/fetch-leetcode.mjs

import { writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const USERNAME = "Armaan0904";
const ENDPOINT = "https://leetcode.com/graphql";
const OUT = new URL("../src/data/leetcode.json", import.meta.url);

const QUERY = `
query getProfile($username: String!) {
  matchedUser(username: $username) {
    submitStatsGlobal { acSubmissionNum { difficulty count } }
    userCalendar { streak totalActiveDays submissionCalendar }
  }
}`;

async function main() {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Referer: "https://leetcode.com",
      "User-Agent": "Mozilla/5.0 (compatible; portfolio-stats/1.0)",
    },
    body: JSON.stringify({ query: QUERY, variables: { username: USERNAME } }),
  });
  if (!res.ok) throw new Error(`LeetCode responded ${res.status}`);

  const json = await res.json();
  const user = json?.data?.matchedUser;
  if (!user) throw new Error(`LeetCode: user "${USERNAME}" not found`);

  const ac = user.submitStatsGlobal?.acSubmissionNum ?? [];
  const count = (difficulty) =>
    ac.find((x) => x.difficulty === difficulty)?.count ?? 0;
  const calendar = JSON.parse(user.userCalendar?.submissionCalendar || "{}");

  // Sort calendar keys numerically so the committed file diffs cleanly day to
  // day (LeetCode does not guarantee key order).
  const sortedCalendar = {};
  for (const key of Object.keys(calendar)
    .map(Number)
    .sort((a, b) => a - b)) {
    sortedCalendar[key] = calendar[key];
  }

  // Deliberately no timestamp field: the file changes only when the underlying
  // LeetCode data changes, so the daily job commits only on real change.
  const data = {
    solved: count("All"),
    easy: count("Easy"),
    medium: count("Medium"),
    hard: count("Hard"),
    activeDays: user.userCalendar?.totalActiveDays ?? 0,
    streak: user.userCalendar?.streak ?? 0,
    calendar: sortedCalendar,
  };

  await mkdir(dirname(fileURLToPath(OUT)), { recursive: true });
  await writeFile(OUT, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log(
    `Wrote ${Object.keys(sortedCalendar).length} active days · ${data.solved} solved · ${data.streak}-day streak`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
