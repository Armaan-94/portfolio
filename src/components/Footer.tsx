import { profile } from "@/content";
import { GitHubIcon, LinkedInIcon, LeetCodeIcon, ArrowUpIcon } from "./Icons";

export function Footer() {
  const year = 2026;
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto flex max-w-[var(--container-page)] flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div>
          <p className="font-medium text-ink">{profile.name}</p>
          <p className="mt-1 font-mono text-xs text-muted">
            © {year} · Open to software engineering roles
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={profile.links.github}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="GitHub"
            className="grid h-9 w-9 place-items-center rounded-md text-muted transition-colors hover:bg-surface hover:text-ink"
          >
            <GitHubIcon width={18} height={18} />
          </a>
          <a
            href={profile.links.linkedin}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="LinkedIn"
            className="grid h-9 w-9 place-items-center rounded-md text-muted transition-colors hover:bg-surface hover:text-ink"
          >
            <LinkedInIcon width={18} height={18} />
          </a>
          <a
            href={profile.links.leetcode}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="LeetCode"
            className="grid h-9 w-9 place-items-center rounded-md text-muted transition-colors hover:bg-surface hover:text-ink"
          >
            <LeetCodeIcon width={18} height={18} />
          </a>
          <a
            href="#hero"
            className="ml-2 inline-flex items-center gap-1.5 rounded-md border border-hairline px-3 py-1.5 text-xs font-medium text-body transition-colors hover:border-indigo hover:text-ink"
          >
            <ArrowUpIcon width={14} height={14} />
            Back to top
          </a>
        </div>
      </div>
    </footer>
  );
}
