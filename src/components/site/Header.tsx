import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, Phone, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useQuote } from "@/components/site/quote-context";
import { SITE, telHref } from "@/lib/site";
import logo from "@/assets/euro-gulf-logo.png";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const { openQuote } = useQuote();

  return (
    <header className="sticky top-0 z-40 surface-navy border-b border-white/10">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <img
            src={logo}
            alt={`${SITE.name} logo`}
            width={32}
            height={32}
            className="size-8 rounded object-contain"
          />
          <span className="text-base font-bold tracking-tight text-navy-foreground">
            {SITE.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "text-amber" }}
              className="rounded px-3 py-2 text-sm font-semibold text-navy-muted transition-colors hover:text-navy-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href={telHref(SITE.phones[0])}
            className="mono-num flex items-center gap-2 text-sm font-semibold text-navy-foreground"
          >
            <Phone className="size-4 text-amber" />
            {SITE.phones[0]}
          </a>
          <Button variant="amber" size="sm" onClick={() => openQuote()}>
            Get a Quote
          </Button>
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex size-10 items-center justify-center rounded text-navy-foreground md:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-white/10 bg-navy-soft md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-3">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{ className: "text-amber" }}
                className="py-3 text-sm font-semibold text-navy-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
