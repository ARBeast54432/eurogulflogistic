import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

import { useQuote } from "@/components/site/quote-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { servicesQueryOptions } from "@/lib/services";
import { IMAGES } from "@/lib/site";

const TITLE = "Equipment & Services Directory | IronBridge Logistics";
const DESCRIPTION =
  "Live availability for crane hire, trailer rental, container storage, dismantling, installation and rigging. Book available units or join the waitlist.";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:image", content: IMAGES.fleet },
      { name: "twitter:image", content: IMAGES.fleet },
    ],
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
              <article
                key={service.id}
                className="flex flex-col overflow-hidden rounded border border-border bg-card shadow-industrial"
              >
                <div className="aspect-[16/10] overflow-hidden bg-secondary">
                  {service.image_url ? (
                    <img
                      src={service.image_url}
                      alt={service.title}
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  ) : null}
                </div>
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
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">
                    {service.description}
                  </p>
                  <Button
                    variant={service.is_available ? "amber" : "outline"}
                    className="mt-6 w-full"
                    onClick={() => openQuote(service.slug)}
                  >
                    {service.is_available ? "Request This Unit" : "Join Waitlist"}
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
