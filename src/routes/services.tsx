import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";

import { useQuote } from "@/components/site/quote-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { servicesQueryOptions, type Service } from "@/lib/services";
import { IMAGES } from "@/lib/site";
import { buildSeo } from "@/lib/seo";

const TITLE = "Equipment & Services Directory | Euro Gulf Logistics";
const DESCRIPTION =
  "Live availability for crane hire, trailer rental, container storage, dismantling, installation and rigging. Book available units or join the waitlist.";

export const Route = createFileRoute("/services")({
  head: () =>
    buildSeo({
      title: TITLE,
      description: DESCRIPTION,
      ogImage: IMAGES.fleet,
      canonicalPath: "/services",
      includeJsonLd: true,
    }),
  component: ServicesPage,
  errorComponent: ServicesError,
  notFoundComponent: () => <ServicesError />,
});

function ServicesError() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <AlertTriangle className="mx-auto size-10 text-amber" />
      <h1 className="mt-4 text-2xl font-black">Equipment list unavailable</h1>
      <p className="mt-2 text-muted-foreground">
        We couldn&rsquo;t load live availability. Call dispatch and we&rsquo;ll confirm units
        manually.
      </p>
    </div>
  );
}

function ServicesPage() {
  const { openQuote } = useQuote();
  const { data, isPending, isError } = useQuery(servicesQueryOptions());
  const [expanded, setExpanded] = useState<Service | null>(null);

  // Lock body scroll and allow Escape to close while the detail card is open.
  useEffect(() => {
    if (!expanded) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [expanded]);

  return (
    <>
      <section className="surface-navy">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="label-caps text-amber">Fleet &amp; Capabilities</p>
          <h1 className="mt-3 text-4xl font-black text-navy-foreground sm:text-5xl">
            Equipment &amp; Services
          </h1>
          <p className="mt-4 max-w-2xl text-navy-muted">{DESCRIPTION}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {isError ? (
          <ServicesError />
        ) : isPending ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded border border-border bg-card">
                <Skeleton className="aspect-[16/10] w-full rounded-none" />
                <div className="space-y-3 p-6">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data?.map((service) => (
              <motion.article
                key={service.id}
                layoutId={`service-card-${service.id}`}
                className="flex flex-col overflow-hidden rounded border border-border bg-card shadow-industrial"
              >
                <motion.div
                  layoutId={`service-image-${service.id}`}
                  className="aspect-[16/10] overflow-hidden bg-secondary"
                >
                  {service.image_url ? (
                    <img
                      src={service.image_url}
                      alt={service.title}
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  ) : null}
                </motion.div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center justify-between gap-2">
                    <span className="label-caps text-navy-soft">{service.category}</span>
                    {service.is_available ? (
                      <Badge className="gap-1 bg-success text-success-foreground hover:bg-success">
                        <CheckCircle2 className="size-3" /> Available Now
                      </Badge>
                    ) : (
                      <Badge className="gap-1 bg-danger text-danger-foreground hover:bg-danger">
                        <XCircle className="size-3" /> Fully Booked
                      </Badge>
                    )}
                  </div>
                  <h2 className="mt-3 text-lg font-bold">{service.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{service.description}</p>

                  <button
                    type="button"
                    onClick={() => setExpanded(service)}
                    className="mt-3 inline-flex w-fit items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber hover:text-amber/80"
                  >
                    <Info className="size-3.5" aria-hidden="true" />
                    More Info
                  </button>

                  <div className="flex-1" />
                  <Button
                    variant={service.is_available ? "amber" : "outline"}
                    className="mt-6 w-full"
                    onClick={() => openQuote(service.slug)}
                  >
                    {service.is_available ? "Request This Unit" : "Join Waitlist"}
                  </Button>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </section>

      <AnimatePresence>
        {expanded ? (
          <motion.div
            key="service-detail-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={() => setExpanded(null)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="service-detail-title"
          >
            <motion.div
              layoutId={`service-card-${expanded.id}`}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded border border-border bg-card shadow-industrial"
            >
              <button
                type="button"
                onClick={() => setExpanded(null)}
                aria-label="Close details"
                className="absolute right-4 top-4 z-10 flex size-9 items-center justify-center rounded-full bg-navy/80 text-navy-foreground backdrop-blur transition-colors hover:bg-navy"
              >
                <X className="size-4" />
              </button>

              <motion.div
                layoutId={`service-image-${expanded.id}`}
                className="aspect-[16/9] shrink-0 overflow-hidden bg-secondary"
              >
                {expanded.image_url ? (
                  <img
                    src={expanded.image_url}
                    alt={expanded.title}
                    className="size-full object-cover"
                  />
                ) : null}
              </motion.div>

              <div className="overflow-y-auto p-6 sm:p-8">
                <div className="flex items-center justify-between gap-2">
                  <span className="label-caps text-navy-soft">{expanded.category}</span>
                  {expanded.is_available ? (
                    <Badge className="gap-1 bg-success text-success-foreground hover:bg-success">
                      <CheckCircle2 className="size-3" /> Available Now
                    </Badge>
                  ) : (
                    <Badge className="gap-1 bg-danger text-danger-foreground hover:bg-danger">
                      <XCircle className="size-3" /> Fully Booked
                    </Badge>
                  )}
                </div>
                <h2 id="service-detail-title" className="mt-3 text-2xl font-black sm:text-3xl">
                  {expanded.title}
                </h2>
                <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {expanded.long_description || expanded.description}
                </p>

                <Button
                  variant={expanded.is_available ? "amber" : "outline"}
                  className="mt-8 w-full sm:w-auto"
                  onClick={() => {
                    const slug = expanded.slug;
                    setExpanded(null);
                    openQuote(slug);
                  }}
                >
                  {expanded.is_available ? "Request This Unit" : "Join Waitlist"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
