import { useEffect, useState } from "react";
import { Cookie, X } from "lucide-react";

import { Button } from "@/components/ui/button";

const STORAGE_KEY = "eg-cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) setVisible(true);
    } catch {
      // localStorage unavailable (privacy mode, etc.) — show the banner once per session.
      setVisible(true);
    }
  }, []);

  const dismiss = (value: "accepted" | "dismissed") => {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // ignore write failures, banner will just reappear next visit
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie notice"
      className="fixed inset-x-0 bottom-0 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300 md:bottom-4 md:left-4 md:right-auto md:max-w-md"
    >
      <div className="surface-navy flex flex-col gap-3 border-t border-white/10 p-4 shadow-lift sm:flex-row sm:items-center md:rounded-lg md:border">
        <Cookie className="hidden size-6 shrink-0 text-amber sm:block" />
        <p className="flex-1 text-sm text-navy-muted">
          We use cookies to improve your experience on our site. By continuing to browse, you agree
          to our use of cookies. See our{" "}
          <a href="/privacy-policy" className="font-semibold text-amber hover:underline">
            Privacy Policy
          </a>{" "}
          for details.
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="amber" size="sm" onClick={() => dismiss("accepted")}>
            Accept
          </Button>
          <button
            type="button"
            aria-label="Dismiss cookie notice"
            onClick={() => dismiss("dismissed")}
            className="inline-flex size-8 items-center justify-center rounded text-navy-muted transition-colors hover:bg-white/10 hover:text-navy-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
