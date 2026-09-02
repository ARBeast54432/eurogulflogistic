import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Mail, MessageCircle, MessageSquareText, Phone, X } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SITE, telHref, waHref } from "@/lib/site";

export function FloatingContactButton() {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={open ? "Close contact options" : "Contact us"}
          className="fixed right-4 bottom-20 z-40 flex size-14 items-center justify-center rounded-full bg-amber text-amber-foreground shadow-lift transition-all duration-300 hover:scale-110 hover:bg-amber-bright active:scale-95 md:right-6 md:bottom-6"
        >
          {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        sideOffset={16}
        className="w-72 rounded-lg border-white/10 bg-navy p-4 text-navy-foreground shadow-lift"
      >
        <p className="label-caps text-amber">Get in touch</p>
        <p className="mt-1 text-sm text-navy-muted">
          We usually respond within minutes during business hours.
        </p>

        <div className="mt-4 flex flex-col gap-1">
          <a
            href={telHref(SITE.phones[0])}
            className="flex items-center gap-3 rounded-md px-2 py-2 text-sm font-semibold transition-colors hover:bg-white/10"
          >
            <Phone className="size-4 shrink-0 text-amber" />
            Call {SITE.phones[0]}
          </a>
          <a
            href={waHref(SITE.whatsapp[0], `Hi ${SITE.name}, I need equipment.`)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-md px-2 py-2 text-sm font-semibold transition-colors hover:bg-white/10"
          >
            <MessageSquareText className="size-4 shrink-0 text-amber" />
            WhatsApp us
          </a>
          <a
            href={`mailto:${SITE.email}`}
            className="flex items-center gap-3 rounded-md px-2 py-2 text-sm font-semibold transition-colors hover:bg-white/10"
          >
            <Mail className="size-4 shrink-0 text-amber" />
            Email us
          </a>
          <Link
            to="/contact"
            onClick={() => setOpen(false)}
            className="mt-2 flex items-center justify-center rounded-md bg-amber px-2 py-2 text-sm font-bold uppercase tracking-widest text-amber-foreground transition-colors hover:bg-amber-bright"
          >
            Send a message
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
