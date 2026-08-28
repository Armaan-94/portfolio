"use client";

import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { profile } from "@/content";
import { Reveal } from "./Reveal";
import {
  MailIcon,
  GitHubIcon,
  LinkedInIcon,
  LeetCodeIcon,
  ArrowRightIcon,
  SpinnerIcon,
} from "./Icons";

type Status = "idle" | "sending" | "success" | "error";

export function Contact() {
  const [name, setName] = useState("");
  const [from, setFrom] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState(""); // honeypot — must stay empty
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const errorRef = useRef<HTMLParagraphElement>(null);

  // Real submission: POST to the /api/contact route, which sends the email
  // server-side via Resend. Reflect actual sending / success / error state.
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: from, message, company }),
      });
      const data: { error?: string } = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setStatus("success");
      setName("");
      setFrom("");
      setMessage("");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      // Move focus to the error so keyboard/screen-reader users land on it
      // immediately rather than having to hunt for what happened.
      requestAnimationFrame(() => errorRef.current?.focus());
    }
  }

  // ⌘/⌃+Enter submits from the textarea; a plain Enter still inserts a
  // newline, which is the native (and expected) textarea behavior.
  function onMessageKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <section
      id="contact"
      className="relative z-10 mx-auto w-full max-w-[var(--container-page)] scroll-mt-24 px-6 py-20 sm:px-8 sm:py-28"
    >
      <Reveal>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs tracking-[0.2em] text-cyan uppercase">
            06 / Contact
          </span>
          <span className="h-px flex-1 bg-hairline" aria-hidden />
        </div>
      </Reveal>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
        {/* Left: pitch + links */}
        <div className="lg:col-span-5">
          <Reveal>
            <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Let us build something that runs.
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mt-4 text-base leading-relaxed text-body">
              Open to software engineering roles from 2026. The fastest way to
              reach me is email. I read everything.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <a
              href={`mailto:${profile.email}`}
              className="mt-6 inline-flex items-center gap-2.5 rounded-lg border border-hairline bg-surface-2/50 px-4 py-3 text-base text-ink transition-colors hover:border-indigo"
            >
              <MailIcon width={18} height={18} className="text-cyan" />
              {profile.email}
            </a>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-4 flex items-center gap-2">
              <SocialLink
                href={profile.links.github}
                label="GitHub"
                icon={<GitHubIcon width={18} height={18} />}
              />
              <SocialLink
                href={profile.links.linkedin}
                label="LinkedIn"
                icon={<LinkedInIcon width={18} height={18} />}
              />
              <SocialLink
                href={profile.links.leetcode}
                label="LeetCode"
                icon={<LeetCodeIcon width={18} height={18} />}
              />
            </div>
          </Reveal>
        </div>

        {/* Right: form */}
        <div className="lg:col-span-7">
          <Reveal delay={0.1}>
            {status === "success" ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-hairline bg-gradient-to-b from-surface to-surface-2 p-8 text-center">
                <div className="grid h-12 w-12 place-items-center rounded-full border border-indigo/40 bg-indigo/10 text-cyan">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="m5 13 4 4L19 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-ink">Message sent</h3>
                <p className="mt-2 max-w-sm text-sm text-muted">
                  Thanks for reaching out — it landed in my inbox and I&rsquo;ll get
                  back to you soon.
                </p>
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="mt-5 text-sm font-medium text-indigo transition-colors hover:text-cyan"
                >
                  Send another
                </button>
              </div>
            ) : (
              <form
                onSubmit={onSubmit}
                noValidate
                className="rounded-2xl border border-hairline bg-gradient-to-b from-surface to-surface-2 p-6 sm:p-8"
              >
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field
                    id="name"
                    label="Name"
                    value={name}
                    onChange={setName}
                    autoComplete="name"
                    required
                  />
                  <Field
                    id="email"
                    label="Email"
                    type="email"
                    value={from}
                    onChange={setFrom}
                    autoComplete="email"
                    spellCheck={false}
                    required
                  />
                </div>
                <div className="mt-5">
                  <label
                    htmlFor="message"
                    className="font-mono text-xs tracking-wide text-muted uppercase"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={onMessageKeyDown}
                    className="mt-2 w-full resize-y rounded-lg border border-hairline bg-base/60 px-3.5 py-2.5 text-base text-ink placeholder:text-faint focus:border-indigo focus:outline-none sm:text-sm"
                    placeholder="Tell me what you’re building…"
                  />
                </div>

                {/* Honeypot: hidden from humans, catches bots. Never fill it. */}
                <div aria-hidden className="pointer-events-none absolute left-[-9999px] h-0 w-0 overflow-hidden">
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
                  className="group mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo px-5 py-3 text-sm font-semibold text-base transition-transform hover:-translate-y-0.5 hover:bg-violet disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {status === "sending" ? (
                    <SpinnerIcon width={16} height={16} />
                  ) : null}
                  Send message
                  {status !== "sending" ? (
                    <ArrowRightIcon
                      width={18}
                      height={18}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  ) : null}
                </button>

                {status === "error" ? (
                  <p
                    ref={errorRef}
                    tabIndex={-1}
                    aria-live="polite"
                    className="mt-3 text-[13px] text-[#fca5a5] focus:outline-none"
                  >
                    {errorMsg}
                  </p>
                ) : (
                  <p className="mt-3 font-mono text-[11px] text-faint">
                    Sends straight to my inbox. Your details aren&rsquo;t stored.
                  </p>
                )}
              </form>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  required,
  autoComplete,
  spellCheck,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  spellCheck?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="font-mono text-xs tracking-wide text-muted uppercase"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        inputMode={type === "email" ? "email" : undefined}
        required={required}
        autoComplete={autoComplete}
        spellCheck={spellCheck}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-lg border border-hairline bg-base/60 px-3.5 py-2.5 text-base text-ink placeholder:text-faint focus:border-indigo focus:outline-none sm:text-sm"
      />
    </div>
  );
}

function SocialLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={label}
      className="grid h-11 w-11 place-items-center rounded-lg border border-hairline text-muted transition-colors hover:border-indigo hover:text-ink"
    >
      {icon}
    </a>
  );
}
