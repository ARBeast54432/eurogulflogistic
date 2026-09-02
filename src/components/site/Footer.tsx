import { useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { SITE, telHref, waHref } from "@/lib/site";
import { CopyButton } from "@/components/site/CopyButton";
import logo from "@/assets/euro-gulf-logo.png";

export function Footer() {
  const navigate = useNavigate();
  const taps = useRef<number[]>([]);

  // Stealth entry point: 5 rapid taps on the copyright line. No visible
  // affordance, not tabbable, not discoverable by scrapers.
  const handleStealthTap = () => {
    const now = Date.now();
    taps.current = [...taps.current, now].filter((t) => now - t < 2000);
    if (taps.current.length >= 5) {
      taps.current = [];
      navigate({ to: "/stealth-admin-auth" });
    }
  };

  return (
    <footer className="surface-navy border-t border-white/10">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2">
            <img
              src={logo}
              alt={`${SITE.name} logo`}
              width={32}
              height={32}
              className="size-8 rounded object-contain"
            />
            <span className="font-bold text-navy-foreground">{SITE.name}</span>
          </div>
          <p className="mt-4 text-sm text-navy-muted">{SITE.tagline}</p>
        </div>

        <div>
          <h2 className="label-caps text-amber">Location</h2>
          <p className="mt-4 flex gap-2 text-sm text-navy-muted">
            <MapPin className="mt-0.5 size-4 shrink-0 text-amber" />
            <span>{SITE.address}</span>
          </p>
          <a
            href={`mailto:${SITE.email}`}
            className="mt-4 flex items-center gap-2 text-sm text-navy-muted hover:text-navy-foreground"
          >
            <Mail className="size-4 shrink-0 text-amber" />
            {SITE.email}
          </a>
          <CopyButton value={SITE.email} label="Copy email" className="mt-2 text-navy-muted" />
        </div>

        <div>
          <h2 className="label-caps text-amber">Dispatch</h2>
          <ul className="mt-4 space-y-3">
            {SITE.phones.map((phone) => (
              <li key={phone} className="flex items-center gap-3">
                <a
                  href={telHref(phone)}
                  className="mono-num flex items-center gap-2 text-sm text-navy-muted hover:text-navy-foreground"
                >
                  <Phone className="size-4 shrink-0 text-amber" />
                  {phone}
                </a>
                <a
                  href={waHref(phone, `Hi ${SITE.name}, I need equipment.`)}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`WhatsApp ${phone}`}
                  className="text-navy-muted hover:text-amber"
                >
                  <MessageCircle className="size-4" />
                </a>
                <CopyButton value={phone} label="Copy number" className="text-navy-muted" />
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="label-caps text-amber">Operating Hours</h2>
          <ul className="mt-4 space-y-3">
            {SITE.hours.map((h) => (
              <li key={h.days} className="flex gap-2 text-sm text-navy-muted">
                <Clock className="mt-0.5 size-4 shrink-0 text-amber" />
                <span>
                  <span className="block font-semibold text-navy-foreground">{h.days}</span>
                  <span className="mono-num">{h.time}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-xs text-navy-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p onClick={handleStealthTap} className="select-none">
            &copy; {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <nav className="flex gap-4">
            <Link to="/services" className="hover:text-navy-foreground">
              Services
            </Link>
            <Link to="/about" className="hover:text-navy-foreground">
              About
            </Link>
            <Link to="/contact" className="hover:text-navy-foreground">
              Contact
            </Link>
            <Link to="/privacy-policy" className="hover:text-navy-foreground">
              Privacy Policy
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
