"use client";

import { profile } from "@/content";
import { useContactForm } from "@/lib/useContactForm";
import { BentoCard, Keycap } from "./BentoCard";

export function StudioContact() {
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

  // text-base below sm is not decoration: an input under 16px makes iOS Safari
  // zoom the whole page on focus.
  const field =
    "mt-1.5 w-full rounded-xl border-[1.5px] border-[var(--card-edge)] bg-white px-3.5 py-2.5 text-base text-[var(--st-ink)] placeholder:text-[#9aa0b4] focus:border-[var(--st-ink)] focus:outline-none sm:text-sm";

  return (
    <BentoCard
      id="contact"
      hue="pink"
      label="06 / Contact"
      sticker="✉"
      className="lg:col-span-12"
    >
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <h2 className="text-[clamp(1.75rem,3.2vw,2.5rem)] leading-[1.1] font-extrabold tracking-[-0.015em]">
            Let us build something that runs.
          </h2>
          <p className="mt-4 max-w-[38ch] text-[1.0625rem] leading-[1.65]">
            Open to software engineering roles from 2026. The fastest way to
            reach me is email. I read everything.
          </p>

          <a
            href={`mailto:${profile.email}`}
            className="mt-6 inline-block text-lg font-bold underline decoration-[var(--card-edge)] decoration-2 underline-offset-4"
          >
            {profile.email}
          </a>

          <div className="mt-6 flex flex-wrap gap-2">
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
                className="st-key"
              >
                {label} ↗
              </a>
            ))}
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="rounded-2xl border-[1.5px] border-[var(--card-edge)] bg-white p-5 sm:p-6">
            {status === "success" ? (
              <div>
                <p className="text-2xl font-extrabold">Sent.</p>
                <p className="mt-2 text-[1.0625rem] leading-[1.65]">
                  Thanks for reaching out. It landed in my inbox and I will get
                  back to you soon.
                </p>
                <button type="button" onClick={reset} className="st-key mt-5">
                  Send another
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="relative">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="st-name" className="st-label">
                      Name
                    </label>
                    <input
                      id="st-name"
                      required
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={field}
                    />
                  </div>
                  <div>
                    <label htmlFor="st-email" className="st-label">
                      Email
                    </label>
                    <input
                      id="st-email"
                      type="email"
                      inputMode="email"
                      required
                      spellCheck={false}
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={field}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label htmlFor="st-message" className="st-label">
                    Message
                  </label>
                  <textarea
                    id="st-message"
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={onMessageKeyDown}
                    placeholder="Tell me what you are building"
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
                  className="mt-5 inline-flex rounded-full bg-[var(--st-ink)] px-6 py-3 text-sm font-bold text-[var(--st-paper)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {status === "sending" ? "Sending" : "Send message"}
                </button>

                {status === "error" ? (
                  <p
                    ref={errorRef}
                    tabIndex={-1}
                    aria-live="polite"
                    className="mt-3 text-sm text-[var(--color-danger)] focus:outline-none"
                  >
                    {errorMsg}
                  </p>
                ) : null}
              </form>
            )}
          </div>
        </div>
      </div>
    </BentoCard>
  );
}

export function StudioFooter() {
  return (
    <footer className="mx-auto flex max-w-[var(--container-page)] flex-wrap items-center justify-between gap-4 px-5 py-10 text-sm text-[var(--st-ink-2)] sm:px-8">
      <p className="font-bold text-[var(--st-ink)]">{profile.name}</p>
      <p>
        © {new Date().getFullYear()} · Open to software engineering roles
      </p>
      <a href="#hero" className="st-key">
        Back to top ↑
      </a>
    </footer>
  );
}

export { Keycap };
