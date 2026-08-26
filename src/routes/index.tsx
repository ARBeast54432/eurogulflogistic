import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Clock,
  Container,
  Cog,
  Link2,
  ShieldCheck,
  Truck,
  Wrench,
} from "lucide-react";

import { SeoJsonLd } from "@/components/site/SeoJsonLd";
import { StatCounters } from "@/components/site/StatCounters";
import { useQuote } from "@/components/site/quote-context";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { FAQS, IMAGES, LOCAL_BUSINESS_JSONLD, SITE, TESTIMONIALS } from "@/lib/site";

const TITLE = "Heavy Equipment Rental & Industrial Logistics | Euro Gulf Logistics";
const DESCRIPTION =
  "Cranes, trailers, container storage, rigging and machinery installation with certified crews. 24/7 dispatch from Al Sajaa, Sharjah.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:image", content: IMAGES.hero },
      { name: "twitter:image", content: IMAGES.hero },
    ],
  }),
  component: Index,
});

const CORE_SERVICES = [
  {
    icon: Truck,
    title: "Truck & Trailer Rental",
    slug: "truck-trailer-rental",
    text: "Lowbeds, flatbeds and multi-axle modular trailers with permits, escorts and route surveys handled end to end.",
    image: IMAGES.haulage,
  },
  {
    icon: Cog,
    title: "Heavy Equipment & Crane Rental",
    slug: "heavy-equipment-crane-rental",
    text: "25-ton to 500-ton crawler and all-terrain cranes with certified operators and approved lift plans.",
    image: IMAGES.rigging,
  },
  {
    icon: Container,
    title: "Container Storage & Handling",
    slug: "container-storage-handling",
    text: "Secured yard capacity, reach-stacker handling and live container tracking for port and EPC clients.",
    image: IMAGES.yard,
  },
  {
    icon: Wrench,
    title: "Heavy Machinery Dismantling",
    slug: "heavy-machinery-dismantling",
    text: "Documented teardown of production lines with every connection point tagged for clean reinstallation.",
    image: IMAGES.dismantling,
  },
  {
    icon: Link2,
    title: "Machinery Assembling & Installation",
    slug: "machinery-assembling-installation",
    text: "Precision positioning and alignment of presses, mills and process equipment to millimetre tolerance.",
    image: IMAGES.assembly,
  },
  {
    icon: ShieldCheck,
    title: "Lashing, Rigging & Loading",
    slug: "industrial-lashing-rigging-loading",
    text: "Engineered lashing and securing plans for road, rail and sea legs across 35+ countries.",
    image: IMAGES.fleet,
  },
];

const TRUST = [
  {
    icon: BadgeCheck,
    title: "Certified Crews",
    text: "Every operator, rigger and banksman holds current third-party certification.",
  },
  {
    icon: ShieldCheck,
    title: "Fully Insured",
    text: "Third-party liability and equipment coverage included on every mobilisation.",
  },
  {
    icon: Clock,
    title: "Fast Response",
    text: "Written quotes with indicative pricing and availability inside business hours.",
  },
  {
    icon: Truck,
    title: "Owned Fleet",
    text: "No brokered units our own maintained trailers, cranes and handling gear.",
  },
];

function Index() {
  const { openQuote } = useQuote();

  return (
    <>
      <SeoJsonLd data={LOCAL_BUSINESS_JSONLD} />

      {/* Hero */}
      <section className="relative isolate">
        <img
          src={IMAGES.hero}
          alt="Heavy crane lifting industrial cargo at an Euro Gulf Logistics site"
          className="absolute inset-0 size-full object-cover"
        />
        <div className="hero-overlay absolute inset-0" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <p className="label-caps text-amber">Al Sajaa, Sharjah &middot; 24/7 Dispatch</p>
            <h1 className="mt-4 text-4xl font-black leading-tight text-navy-foreground sm:text-5xl lg:text-6xl">
              {SITE.tagline}
            </h1>
            <p className="mt-6 max-w-2xl text-base text-navy-muted sm:text-lg">
              {DESCRIPTION}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button variant="amber" size="xl" onClick={() => openQuote()}>
                Request a Quote
              </Button>
              <Button variant="hero" size="xl" asChild>
                <Link to="/services">View Equipment</Link>
              </Button>
            </div>
          </motion.div>

          <StatCounters className="mt-16 border-t border-white/10 pt-10" />
        </div>
      </section>

      {/* Core services */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="label-caps text-amber">Capabilities</p>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">Core Services</h2>
          <p className="mt-4 text-muted-foreground">
            Six disciplines, one accountable crew. Every scope runs against a documented method
            statement and an approved lift plan.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CORE_SERVICES.map((service, i) => (
            <motion.article
              key={service.slug}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: (i % 3) * 0.08 }}
              className="group overflow-hidden rounded border border-border bg-card shadow-industrial transition-shadow hover:shadow-lift"
            >
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <service.icon className="size-6 text-amber" />
                <h3 className="mt-4 text-lg font-bold">{service.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{service.text}</p>
                <button
                  type="button"
                  onClick={() => openQuote(service.slug)}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-navy-soft hover:text-amber"
                >
                  Get a quote <ArrowRight className="size-4" />
                </button>
              </div>
            </motion.article>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-navy-soft hover:text-amber"
          >
            View all services <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

       

      {/* Trust grid */}
      <section className="surface-navy">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-navy-foreground sm:text-4xl">
            Why operators keep calling us back
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST.map((item) => (
              <div key={item.title} className="rounded border border-white/10 bg-white/5 p-6">
                <item.icon className="size-6 text-amber" />
                <h3 className="mt-4 font-bold text-navy-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-navy-muted">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <p className="label-caps text-amber">Field Reports</p>
        <h2 className="mt-3 text-3xl font-black sm:text-4xl">What clients say</h2>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {TESTIMONIALS.slice(0, 3).map((t) => (
            <figure key={t.name} className="rounded border border-border bg-card p-6">
              <blockquote className="text-sm leading-relaxed text-foreground">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 border-t border-border pt-4">
                <p className="font-bold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
                <p className="mt-2 text-xs text-navy-soft">{t.scope}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-secondary">
        <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black sm:text-4xl">Frequently asked questions</h2>
          <Accordion type="single" collapsible className="mt-10">
            {FAQS.map((faq) => (
              <AccordionItem key={faq.q} value={faq.q}>
                <AccordionTrigger className="text-left font-bold">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="surface-navy">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <h2 className="text-2xl font-black text-navy-foreground sm:text-3xl">
              Need equipment on site this week?
            </h2>
            <p className="mt-2 text-navy-muted">
              Send your scope and get a response within a day.
            </p>
          </div>
          <Button variant="amber" size="xl" onClick={() => openQuote()}>
            Request a Quote
          </Button>
        </div>
      </section>
    </>
  );
}
