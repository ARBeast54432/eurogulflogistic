import { createFileRoute } from "@tanstack/react-router";
import { ClipboardCheck, Gauge, Globe2, HardHat, Route as RouteIcon, Warehouse } from "lucide-react";

import { StatCounters } from "@/components/site/StatCounters";
import { IMAGES } from "@/lib/site";

const TITLE = "About Euro Gulf Logistics | Heavy Lift Specialists";
const DESCRIPTION =
  "A decade of heavy haulage, crane hire and industrial installation across 35+ countries, run by certified operators out of Al Sajaa, Sharjah.";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:image", content: IMAGES.yard },
      { name: "twitter:image", content: IMAGES.yard },
    ],
  }),
  component: AboutPage,
});

const CAPABILITIES = [
  {
    icon: HardHat,
    title: "Certified Lift Engineering",
    text: "In-house rigging engineers produce lift plans, ground bearing calculations and appointed-person sign-off before a single sling is rigged.",
  },
  {
    icon: RouteIcon,
    title: "Route Surveys & Permits",
    text: "Abnormal load routing, escort coordination and permit filing across road, rail and sea legs.",
  },
  {
    icon: Warehouse,
    title: "Secured Yard Capacity",
    text: "Fenced, monitored yard in Al Sajaa with reach-stacker handling and live container tracking.",
  },
  {
    icon: ClipboardCheck,
    title: "Documented Method Statements",
    text: "Every dismantling and installation scope ships with tagged connection records and a written method statement.",
  },
  {
    icon: Globe2,
    title: "Cross-Border Coordination",
    text: "Multi-modal moves with lashing plans, customs documentation and destination handling in 35+ countries.",
  },
  {
    icon: Gauge,
    title: "Maintained Owned Fleet",
    text: "Trailers, cranes and handling gear on a scheduled maintenance programme with priority replacement units.",
  },
];

function AboutPage() {
  return (
    <>
      <section className="surface-navy">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="label-caps text-amber">Since 2015</p>
            <h1 className="mt-3 text-4xl font-black text-navy-foreground sm:text-5xl">
              Heavy work, handled by people who own the risk
            </h1>
            <p className="mt-6 text-navy-muted">
              Euro Gulf Logistics started with two lowbeds and a single crane serving fabrication
              yards in Sharjah. Ten years on we run an owned fleet of multi-axle trailers, crawler
              and all-terrain cranes, and a rigging division that moves production lines without
              extending anyone&rsquo;s downtime budget.
            </p>
            <p className="mt-4 text-navy-muted">
              We do not broker your cargo to a stranger. The supervisor who walks your site is the
              same person accountable when the unit lands. That is the whole model, and it is why
              plant, port and EPC clients keep us on contract hire.
            </p>
          </div>
          <img
            src={IMAGES.fleet}
            alt="Euro Gulf Logistics trailer and crane fleet lined up at the Al Sajaa yard"
            loading="lazy"
            className="aspect-[4/3] w-full rounded object-cover shadow-lift"
          />
        </div>
        <div className="mx-auto max-w-7xl border-t border-white/10 px-4 py-14 sm:px-6 lg:px-8">
          <StatCounters />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <p className="label-caps text-amber">What we bring on site</p>
        <h2 className="mt-3 text-3xl font-black sm:text-4xl">Capabilities</h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map((item) => (
            <div
              key={item.title}
              className="rounded border border-border bg-card p-6 shadow-industrial"
            >
              <item.icon className="size-6 text-amber" />
              <h3 className="mt-4 font-bold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
