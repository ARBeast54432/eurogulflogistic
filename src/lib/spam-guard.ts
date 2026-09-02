import { useRef, useState } from "react";

/**
 * Lightweight, no-dependency spam guard for public forms (contact, quote
 * request). Combines two well-established, low-friction techniques:
 *
 * 1. Honeypot field — a decoy input that's invisible to real users (off
 *    screen, not display:none, since some bots skip display:none fields)
 *    but present in the DOM, which naive form-filling bots tend to fill in.
 *    Any value in it means it wasn't a human.
 * 2. Minimum time-on-page — real people take at least a couple of seconds
 *    to read and fill a form. A submission faster than that is almost
 *    always a script that loaded the page and posted immediately.
 *
 * On a detected bot, callers should show the SAME success state a real user
 * would see (see isSpam() usage in contact.tsx / QuoteFormDialog.tsx) rather
 * than an error — never reveal to the bot that it was caught.
 */

const MIN_SUBMIT_MS = 2500;

export function useSpamGuard() {
  const mountedAt = useRef(Date.now());
  const [honeypot, setHoneypot] = useState("");

  const reset = () => {
    mountedAt.current = Date.now();
    setHoneypot("");
  };

  const isSpam = () => {
    if (honeypot.trim().length > 0) return true;
    if (Date.now() - mountedAt.current < MIN_SUBMIT_MS) return true;
    return false;
  };

  return { honeypot, setHoneypot, isSpam, reset };
}

/** Shared props for the hidden decoy input — spread onto an <input>. */
export const honeypotFieldProps = {
  name: "company_website",
  tabIndex: -1,
  autoComplete: "off",
  "aria-hidden": true as const,
  className: "absolute left-[-9999px] top-auto h-px w-px overflow-hidden opacity-0",
};
