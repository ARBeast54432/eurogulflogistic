import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { Clock, Loader2, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { toast } from "sonner";

import { SeoJsonLd } from "@/components/site/SeoJsonLd";
import { CopyButton } from "@/components/site/CopyButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { IMAGES, LOCAL_BUSINESS_JSONLD, SITE, telHref, waHref } from "@/lib/site";
import { buildSeo } from "@/lib/seo";

const TITLE = "Contact Dispatch | Euro Gulf Logistics Sharjah";
const DESCRIPTION =
  "Reach Euro Gulf Logistics dispatch in Al Sajaa, Sharjah by phone, WhatsApp or email.";

export const Route = createFileRoute("/contact")({
  head: () =>
    buildSeo({
      title: TITLE,
      description: DESCRIPTION,
      ogImage: IMAGES.yard,
      canonicalPath: "/contact",
    }),
  component: ContactPage,
});

type FormState = { name: string; email: string; phone: string; subject: string; message: string };
const EMPTY: FormState = { name: "", email: "", phone: "", subject: "", message: "" };

function ContactPage() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [justSubmitted, setJustSubmitted] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));
  const markTouched = (key: keyof FormState) => setTouched((prev) => ({ ...prev, [key]: true }));

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("contact_messages").insert({
        full_name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        subject: form.subject.trim() || null,
        message: form.message.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setForm(EMPTY);
      setTouched({});
      setJustSubmitted(true);
      window.setTimeout(() => setJustSubmitted(false), 6000);
      toast.success("Message sent", {
        description: "Dispatch will respond during business hours.",
      });
    },
    onError: (error: Error) =>
      toast.error("We couldn't send your message", { description: error.message }),
  });

  const nameValid = form.name.trim().length > 1;
  const emailValid = /.+@.+\..+/.test(form.email);
  const messageValid = form.message.trim().length > 9;
  const valid = nameValid && emailValid && messageValid;

  return (
    <>
      <SeoJsonLd data={LOCAL_BUSINESS_JSONLD} />

      <section className="surface-navy">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <p className="label-caps text-amber">Contact</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-black tracking-tight text-navy-foreground sm:text-5xl">
            Talk to dispatch, not a call centre
          </h1>
          <p className="mt-4 max-w-2xl text-navy-muted">
            Three direct lines, WhatsApp on all of them, and a yard team that answers.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="space-y-8">
          <div className="rounded border border-border p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <Phone className="size-5 text-amber" aria-hidden="true" /> Direct lines
            </h2>
            <ul className="mt-4 space-y-3">
              {SITE.phones.map((phone) => (
                <li key={phone} className="flex items-center justify-between gap-3">
                  <a
                    href={telHref(phone)}
                    className="mono-num text-sm font-semibold hover:text-amber"
                  >
                    {phone}
                  </a>
                  <span className="flex items-center gap-3">
                    <a
                      href={waHref(phone, "Hello Euro Gulf, I need a heavy haulage quote.")}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-amber"
                    >
                      <MessageCircle className="size-4" aria-hidden="true" /> WhatsApp
                    </a>
                    <CopyButton value={phone} label="Copy number" />
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded border border-border p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <MapPin className="size-5 text-amber" aria-hidden="true" /> Yard &amp; office
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">{SITE.address}</p>
            <div className="mt-4 flex items-center gap-2">
              <a
                href={`mailto:${SITE.email}`}
                className="inline-flex items-center gap-2 text-sm font-semibold hover:text-amber"
              >
                <Mail className="size-4 text-amber" aria-hidden="true" /> {SITE.email}
              </a>
              <CopyButton value={SITE.email} label="Copy email" />
            </div>
          </div>

          <div className="rounded border border-border p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <Clock className="size-5 text-amber" aria-hidden="true" /> Operating hours
            </h2>
            <dl className="mt-4 space-y-2 text-sm">
              {SITE.hours.map((row) => (
                <div key={row.days} className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{row.days}</dt>
                  <dd className="font-semibold">{row.time}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="overflow-hidden rounded border border-border">
            <iframe
              title="Euro Gulf Logistics yard location"
              src={SITE.mapEmbed}
              loading="lazy"
              className="h-72 w-full border-0"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <form
          className="h-fit space-y-5 rounded border border-border p-6"
          onSubmit={(event) => {
            event.preventDefault();
            if (valid) mutation.mutate();
          }}
        >
          <div>
            <h2 className="text-lg font-bold">Send a message</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              For general enquiries. Need pricing? Use the quote request instead.
            </p>
          </div>

          {justSubmitted ? (
            <p className="field-success-banner">✓ Message sent — dispatch will respond soon.</p>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="c-name">Full name</Label>
              <Input
                id="c-name"
                required
                autoComplete="name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                onBlur={() => markTouched("name")}
                className={touched.name && !nameValid ? "field-error" : undefined}
                aria-invalid={touched.name && !nameValid}
              />
              {touched.name && !nameValid ? (
                <p className="field-error-text">Enter your full name.</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-phone">Phone (optional)</Label>
              <Input
                id="c-phone"
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="c-email">Work email</Label>
            <Input
              id="c-email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              onBlur={() => markTouched("email")}
              className={touched.email && !emailValid ? "field-error" : undefined}
              aria-invalid={touched.email && !emailValid}
            />
            {touched.email && !emailValid ? (
              <p className="field-error-text">Enter a valid email address.</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="c-subject">Subject (optional)</Label>
            <Input
              id="c-subject"
              value={form.subject}
              onChange={(e) => set("subject", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="c-message">Message</Label>
            <Textarea
              id="c-message"
              rows={6}
              required
              value={form.message}
              onChange={(e) => set("message", e.target.value)}
              onBlur={() => markTouched("message")}
              className={touched.message && !messageValid ? "field-error" : undefined}
              aria-invalid={touched.message && !messageValid}
            />
            {touched.message && !messageValid ? (
              <p className="field-error-text">Message should be at least 10 characters.</p>
            ) : null}
          </div>

          <Button type="submit" variant="amber" disabled={!valid || mutation.isPending}>
            {mutation.isPending ? (
              <Loader2 className="animate-spin" aria-hidden="true" />
            ) : (
              <Send aria-hidden="true" />
            )}
            Send message
          </Button>
        </form>
      </section>
    </>
  );
}
