import * as React from "react";
import { Check, Copy } from "lucide-react";

import { cn } from "@/lib/utils";

export function CopyButton({
  value,
  className,
  label = "Copy",
}: {
  value: string;
  className?: string;
  label?: string;
}) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unavailable (older browser / insecure context) — fail silently.
    }
  };

  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        onClick={handleCopy}
        aria-label={`${label}: ${value}`}
        className={cn(
          "inline-flex size-6 items-center justify-center rounded text-current opacity-70 transition-all hover:opacity-100 hover:scale-110",
          className,
        )}
      >
        {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
      </button>
      {copied ? (
        <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-foreground px-2 py-1 text-xs font-medium text-background shadow-industrial animate-in fade-in zoom-in-95">
          Copied!
        </span>
      ) : null}
    </span>
  );
}
