"use client";

import { profile } from "@/content";
import { useContactForm } from "@/lib/useContactForm";

/**
 * Contact as the poster's back page: the only large brick area on the site,
 * held back until the end so it lands as a crescendo.
 *
 * The form sits on a cream card rather than directly on the brick. That is
 * both the right print gesture and the fix for a real contrast problem: cream
 * on brick measures 3.52:1, which is fine for the display heading above and
 * fails outright for input labels, help text and error messages. On cream,
 * charcoal measures 10.75:1 and everything is legible at any size.
 */

/* Brick reads at only 3.60:1 on cream, so the error state uses a darker red
   mixed for this specific ground: 5.24:1. */
const ERROR_INK = "#8c2a22";

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

  const field =
    "mt-1.5 w-full rounded-none border-0 border-b-2 border-[var(--rt-char)] bg-transparent px-0 py-2 text-base text-[var(--rt-char)] placeholder:text-[#6f6454] focus:border-[#8c2a22] focus:outline-none sm:text-sm";
  const label = "rt-caption text-[#4a4237]";

  return (
    <section
      id="contact"
      className="bg-[var(--rt-brick)]"
      style={{ scrollMarginTop: "var(--scroll-pad)" }}
    >
      <div className="rt-halftone">
        <div className="mx-auto grid max-w-[var(--container-page)] gap-10 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-12 lg:gap-14">
          <div className="rt-on-brick lg:col-span-5">
            <h2 className="rt-display text-[clamp(2.5rem,6vw,5.5rem)] text-[var(--rt-cream)]">
              Let us build
              <br />
              something
              <br />
              that runs.
            </h2>

            <p className="rt-lede mt-7 max-w-[36ch] text-[1.15rem] leading-[1.55]">
              Open to software engineering roles from 2026. The fastest way to
              reach me is email. I read everything.
            </p>

            <a
              href={`mailto:${profile.email}`}
              className="rt-display mt-8 inline-block border-b-[3px] border-current pb-1 text-[clamp(1.1rem,2vw,1.6rem)]"
            >
              {profile.email}
            </a>

            <ul className="rt-caption mt-8 flex flex-wrap gap-x-7 gap-y-3">
              {(
                [
                  ["LinkedIn", profile.links.linkedin],
                  ["GitHub", profile.links.github],
                  ["LeetCode", profile.links.leetcode],
                ] as const
              ).map(([labelText, href]) => (
                <li key={labelText}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="border-b border-current/60 pb-0.5 hover:border-current"
                  >
                    {labelText} &#8599;
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-[20px] bg-[var(--rt-paper)] p-6 sm:p-9">
              {status === "success" ? (
                <div>
                  <p className="rt-display text-[2rem] text-[var(--rt-char)]">
                    Sent.
                  </p>
                  <p className="mt-3 text-[1.0625rem] leading-[1.65] text-[var(--rt-char)]">
                    Thanks for reaching out. It landed in my inbox and I will
                    get back to you soon.
                  </p>
                  <button
                    type="button"
                    onClick={reset}
                    className="rt-display mt-6 border-b-[3px] border-[var(--rt-brick)] pb-0.5 text-[1.25rem] text-[var(--rt-char)]"
                  >
                    Send another
                  </button>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="relative">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="rt-name" className={label}>
                        Name
                      </label>
                      <input
                        id="rt-name"
                        required
                        autoComplete="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={field}
                      />
                    </div>
                    <div>
                      <label htmlFor="rt-email" className={label}>
                        Email
                      </label>
                      <input
                        id="rt-email"
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

                  <div className="mt-6">
                    <label htmlFor="rt-message" className={label}>
                      Message
                    </label>
                    <textarea
                      id="rt-message"
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
                    className="rt-display mt-8 rounded-full bg-[var(--rt-char)] px-7 py-3 text-[1.25rem] text-[var(--rt-cream)] transition-opacity disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {status === "sending" ? "Sending" : "Send it \u2197"}
                  </button>

                  {status === "error" ? (
                    <p
                      ref={errorRef}
                      tabIndex={-1}
                      aria-live="polite"
                      className="mt-4 text-sm focus:outline-none"
                      style={{ color: ERROR_INK }}
                    >
                      {errorMsg}
                    </p>
                  ) : null}
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
