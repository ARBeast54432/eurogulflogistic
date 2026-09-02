import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Cookie } from "lucide-react";

import { Button } from "@/components/ui/button";

const STORAGE_KEY = "egl-cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      // localStorage unavailable — skip the banner rather than crash.
    }
  }, []);

  const dismiss = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "dismissed");
    } catch {
      // ignore
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 surface-navy px-4 py-4 shadow-lift sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-2 text-sm text-navy-muted">
          <Cookie className="mt-0.5 size-4 shrink-0 text-amber" aria-hidden="true" />
          <span>
            We use minimal cookies to keep this site running smoothly. See our{" "}
            <Link to="/privacy-policy" className="underline hover:text-navy-foreground">
              Privacy Policy
            </Link>{" "}
            for details.
          </span>
        </p>
        <Button variant="amber" size="sm" onClick={dismiss} className="shrink-0">
          Got it
        </Button>
      </div>
    </div>
  );
}
