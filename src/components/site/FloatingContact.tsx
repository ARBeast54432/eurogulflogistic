import { MessageCircle } from "lucide-react";

import { useQuote } from "@/components/site/quote-context";

/**
 * Fixed bottom-right contact button. Hidden on mobile — the existing
 * MobileStickyCTA already covers that role (full-width call/quote bar).
 */
export function FloatingContact() {
  const { openQuote } = useQuote();

  return (
    <button
      type="button"
      onClick={() => openQuote()}
      aria-label="Request a quote"
      className="fixed bottom-6 right-6 z-40 hidden items-center gap-2 rounded-full bg-amber px-5 py-3 text-sm font-bold text-amber-foreground shadow-lift transition-all hover:scale-105 hover:shadow-industrial md:inline-flex"
    >
      <MessageCircle className="size-4" aria-hidden="true" />
      Contact Us
    </button>
  );
}
