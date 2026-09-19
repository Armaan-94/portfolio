import { profile } from "@/content";
import { ViewCount } from "@/components/shared/ViewCount";

/** A colophon, which is what the back of a printed piece actually carries. */
export function RetroFooter() {
  return (
    <footer className="border-t-2 border-[var(--rt-cream)] bg-[var(--rt-char)] text-[var(--rt-cream)]">
      <div className="mx-auto flex max-w-[var(--container-page)] flex-wrap items-center justify-between gap-5 px-5 py-9 sm:px-8">
        <p className="rt-display text-[1.5rem]">
          {profile.name}
        </p>
        <p className="rt-caption text-[var(--rt-cream-2)]">
          &copy; {new Date().getFullYear()} &middot; Open to software
          engineering roles
        </p>
        <ViewCount className="rt-caption text-[var(--rt-brick-txt)]" />
        <a
          href="#hero"
          className="rt-rule-link rt-caption pb-0.5 text-[var(--rt-cream)]"
        >
          Back to top &uarr;
        </a>
      </div>
    </footer>
  );
}
