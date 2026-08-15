import { FileText, Phone } from "lucide-react";

import { useQuote } from "@/components/site/quote-context";
import { SITE, telHref } from "@/lib/site";

export function MobileStickyCTA() {
  const { openQuote } = useQuote();

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-2 border-t border-white/10 md:hidden">
      <a
        href={telHref(SITE.phones[0])}
        className="flex items-center justify-center gap-2 bg-navy py-4 text-sm font-bold uppercase tracking-widest text-navy-foreground"
      >
        <Phone className="size-4 text-amber" />
        Call Now
      </a>
      <button
        type="button"
        onClick={() => openQuote()}
        className="flex items-center justify-center gap-2 bg-amber py-4 text-sm font-bold uppercase tracking-widest text-amber-foreground"
      >
        <FileText className="size-4" />
        Get Quote
      </button>
    </div>
  );
}
