"use client";

import { profile } from "@/content";
import { ViewCount } from "@/components/shared/ViewCount";
import { useContactForm } from "@/lib/useContactForm";

export function Comms() {
  const {
    name,
    setName,
    email,
    setEmail,
    message,
    setMessage,
    company,
    setCompany,
    status,
    errorMsg,
    errorRef,
    onSubmit,
    onMessageKeyDown,
    reset,
  } = useContactForm();

  // Underline only, no box: an input in an instrument panel is a field on a
  // form, not a rounded card. text-base below sm stops iOS zooming on focus.
  const field =
    "mt-1 w-full border-0 border-b border-[var(--wy-line-hot)] bg-transparent px-0 py-1.5 text-base tracking-[0.06em] text-[var(--wy-ink)] placeholder:text-[var(--color-faint)] focus:border-[var(--wy-ink)] focus:outline-none sm:text-sm";

  return (
    <section
      id="contact"
      className="border-b border-[var(--wy-line)]"
      style={{ scrollMarginTop: "var(--scroll-pad)" }}
    >
      <div className="flex items-baseline justify-between gap-6 border-b border-[var(--wy-line)] px-4 py-2.5 sm:px-6">
        <h2 className="wy-title">06 / Comms</h2>
        <p className="wy-micro">Transmit</p>
      </div>

      <div className="grid gap-9 px-4 py-7 sm:px-6 sm:py-9 lg:grid-cols-[1fr_420px] lg:gap-12">
        <div>
          <p className="max-w-[52ch] text-sm leading-[1.7]">
            Open to software engineering roles from 2026. The fastest way to
            reach me is email. I read everything.
          </p>

          <div className="mt-7 space-y-2">
            <a
              href={`mailto:${profile.email}`}
              className="wy-row flex items-baseline gap-3 border-b border-[var(--wy-line)] pb-1.5 text-sm"
            >
              <span className="wy-micro">Email</span>
              <span aria-hidden className="wy-leader" />
              <span className="tracking-[0.06em] uppercase">
                {profile.email}
              </span>
            </a>
            {(
              [
                ["LinkedIn", profile.links.linkedin],
                ["GitHub", profile.links.github],
                ["LeetCode", profile.links.leetcode],
              ] as const
            ).map(([label, href]) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                className="wy-row flex items-baseline gap-3 border-b border-[var(--wy-line)] pb-1.5 text-sm"
              >
                <span className="wy-micro">{label}</span>
                <span aria-hidden className="wy-leader" />
                <span className="wy-micro text-[var(--wy-ink)]">[ Open ]</span>
              </a>
            ))}
          </div>
        </div>

        <div className="border border-[var(--wy-line-hot)] p-5">
          {status === "success" ? (
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-[var(--wy-alert)]">&gt;</span> Transmit
                <span aria-hidden className="mx-2 text-[var(--wy-line-hot)]">
                  .............................
                </span>
                OK
              </p>
              <p>
                <span className="text-[var(--wy-alert)]">&gt;</span> Payload
                acknowledged
              </p>
              <button
                type="button"
                onClick={reset}
                className="wy-micro mt-4 border border-[var(--wy-line-hot)] px-3 py-2 text-[var(--wy-ink)] hover:border-[var(--wy-ink)]"
              >
                [ Send another ]
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="relative">
              <div>
                <label htmlFor="wy-name" className="wy-micro">
                  &gt; Name
                </label>
                <input
                  id="wy-name"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`${field} uppercase`}
                />
              </div>
              <div className="mt-5">
                <label htmlFor="wy-email" className="wy-micro">
                  &gt; Email
                </label>
                <input
                  id="wy-email"
                  type="email"
                  inputMode="email"
                  required
                  spellCheck={false}
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`${field} uppercase`}
                />
              </div>
              <div className="mt-5">
                <label htmlFor="wy-message" className="wy-micro">
                  &gt; Message
                </label>
                {/* Deliberately NOT uppercased. A 500 character message set in
                    shouting caps is hostile to write and hostile to read. */}
                <textarea
                  id="wy-message"
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={onMessageKeyDown}
                  className={`${field} resize-y`}
                />
              </div>

              {/* Honeypot: hidden from humans, catches bots. Never fill it. */}
              <div
                aria-hidden
                className="pointer-events-none absolute left-[-9999px] h-0 w-0 overflow-hidden"
              >
                <label>
                  Company
                  <input
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={status === "sending"}
                className="wy-micro mt-7 w-full border border-[var(--wy-line-hot)] py-3 text-[var(--wy-ink)] transition-colors hover:border-[var(--wy-ink)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "sending" ? "[ Transmitting ]" : "[ Transmit ]"}
              </button>

              {status === "error" ? (
                <p
                  ref={errorRef}
                  tabIndex={-1}
                  aria-live="polite"
                  className="mt-3 text-sm text-[var(--wy-alert)] focus:outline-none"
                >
                  {errorMsg}
                </p>
              ) : null}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

export function WeylandFooter() {
  return (
    <footer className="wy-micro grid gap-1.5 px-4 py-6 sm:px-6">
      <p>Ship syslink: active &middot; {profile.location}</p>
      <p>Availability: open to software engineering roles from 2026</p>
      <p>
        Resume{" "}
        <a
          href={profile.resume}
          download
          className="text-[var(--wy-ink)] underline-offset-4 hover:underline"
        >
          [ PDF ]
        </a>
      </p>
      <p>
        (C) {new Date().getFullYear()} A. Punia / no warranty expressed or
        implied
      </p>
      <ViewCount className="text-[var(--wy-ink)]" />
    </footer>
  );
}
