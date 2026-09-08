"use client";

import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";

export type ContactStatus = "idle" | "sending" | "success" | "error";

/**
 * The contact form's behaviour, with none of its appearance.
 *
 * Every theme renders a visually different form, but all of them speak the
 * same wire contract to /api/contact: a JSON body of { name, email, message,
 * company }, where `company` is the honeypot and must stay empty. Four
 * hand-written copies of that fetch would be four chances to break the API
 * silently, and the error-focus handling and the cmd+Enter shortcut are easy
 * to drop when transcribing. So the behaviour lives here once and each theme
 * supplies only markup.
 */
export function useContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState(""); // honeypot, must stay empty
  const [status, setStatus] = useState<ContactStatus>("idle");
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
        body: JSON.stringify({ name, email, message, company }),
      });
      const data: { error?: string } = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      // Move focus to the error so keyboard/screen-reader users land on it
      // immediately rather than having to hunt for what happened.
      requestAnimationFrame(() => errorRef.current?.focus());
    }
  }

  // cmd/ctrl+Enter submits from the textarea; a plain Enter still inserts a
  // newline, which is the native (and expected) textarea behavior.
  function onMessageKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.currentTarget.form?.requestSubmit();
    }
  }

  function reset() {
    setStatus("idle");
    setErrorMsg("");
  }

  return {
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
  };
}
