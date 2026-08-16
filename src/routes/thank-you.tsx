import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Clock, FileText, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SITE, telHref } from "@/lib/site";

const TITLE = "Request Received | IronBridge Logistics";
const DESCRIPTION =
  "Your heavy haulage quote request has reached IronBridge dispatch. Expect a written response within 15 minutes during business hours.";

export const Route = createFileRoute("/thank-you")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: ThankYouPage,
});

const NEXT_STEPS = [
  {
    icon: FileText,
    title: "Dispatch review",
    text: "A coordinator checks equipment availability and scope against your site details.",
  },
  {
    icon: Clock,
    title: "Written response in 15 minutes",
    text: "You receive indicative pricing, unit availability and any survey requirements.",
  },
  {
    icon: Phone,
    title: "Mobilisation planning",
    text: "We lock permits, escorts and the lift plan, then confirm your delivery window.",
  },
];

function ThankYouPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-amber/15">
          <CheckCircle2 className="size-8 text-amber" aria-hidden="true" />
        </span>
        <h1 className="mt-6 text-3xl font-black tracking-tight sm:text-4xl">
          Request received
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Your request is with dispatch now. If it&rsquo;s urgent, call the line below and
          quote your company name &mdash; we&rsquo;ll pull the request up immediately.
        </p>
        <a
          href={telHref(SITE.phones[0])}
          className="mono-num mt-4 text-lg font-bold text-amber"
        >
          {SITE.phones[0]}
        </a>
      </div>

      <ol className="mt-12 space-y-4">
        {NEXT_STEPS.map((step, index) => (
          <li key={step.title} className="flex gap-4 rounded border border-border p-5">
            <span className="mono-num flex size-9 shrink-0 items-center justify-center rounded bg-secondary text-sm font-bold">
              {index + 1}
            </span>
            <div>
              <h2 className="flex items-center gap-2 text-sm font-bold">
                <step.icon className="size-4 text-amber" aria-hidden="true" />
                {step.title}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Button asChild variant="amber">
          <Link to="/services">Browse equipment</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/">Back to home</Link>
        </Button>
      </div>
    </section>
  );
}
