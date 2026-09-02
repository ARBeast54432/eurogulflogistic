import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

import { buildSeo } from "@/lib/seo";
import { SITE } from "@/lib/site";

const TITLE = "Privacy Policy | Euro Gulf Logistics";
const DESCRIPTION =
  "How Euro Gulf Logistics collects and protects information submitted through this website.";

export const Route = createFileRoute("/privacy-policy")({
  head: () =>
    buildSeo({
      title: TITLE,
      description: DESCRIPTION,
      canonicalPath: "/privacy-policy",
    }),
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  return (
    <>
      <section className="surface-navy">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <span className="flex size-12 items-center justify-center rounded bg-amber/15">
            <ShieldCheck className="size-6 text-amber" aria-hidden="true" />
          </span>
          <h1 className="mt-5 text-3xl font-black tracking-tight text-navy-foreground sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 max-w-2xl text-navy-muted">
            Last updated{" "}
            {new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long" })}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-neutral max-w-none rounded border border-border p-6 sm:p-10">
          <p className="text-base leading-relaxed text-foreground">
            We only collect data that is provided by the user while filling in the form to get in
            contact. This website was built utilizing AI. No data is shared with any third party;
            everything is highly secure and safely stored with us on our cloud infrastructure
            (Supabase).
          </p>

          <p className="mt-6 text-sm text-muted-foreground">
            If you have any questions about this policy or how your information is handled, contact
            us at{" "}
            <a
              href={`mailto:${SITE.email}`}
              className="font-semibold text-foreground hover:text-amber"
            >
              {SITE.email}
            </a>
            .
          </p>
        </div>
      </section>
    </>
  );
}
