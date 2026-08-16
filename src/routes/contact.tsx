import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { Clock, Loader2, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { toast } from "sonner";

import { SeoJsonLd } from "@/components/site/SeoJsonLd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { IMAGES, LOCAL_BUSINESS_JSONLD, SITE, telHref, waHref } from "@/lib/site";

const TITLE = "Contact Dispatch | IronBridge Logistics Sharjah";
const DESCRIPTION =
  "Reach IronBridge Logistics dispatch in Al Sajaa, Sharjah by phone, WhatsApp or email. Written response within 15 minutes during business hours.";

export const Route = createFileRoute("/contact")({
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
  component: ContactPage,
});

type FormState = { name: string; email: string; phone: string; subject: string; message: string };
const EMPTY: FormState = { name: "", email: "", phone: "", subject: "", message: "" };

function ContactPage() {
  const [form, setForm] = useState<FormState>(EMPTY);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

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
      toast.success("Message sent", {
        description: "Dispatch will respond within 15 minutes during business hours.",
      });
    },
    onError: (error: Error) =>
      toast.error("We couldn't send your message", { description: error.message }),
  });

  const valid =
    form.name.trim().length > 1 &&
    /.+@.+\..+/.test(form.email) &&
    form.message.trim().length > 9;

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
            Written response within 15 minutes during business hours.
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
                  <a
                    href={waHref(phone, "Hello IronBridge, I need a heavy haulage quote.")}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-amber"
                  >
                    <MessageCircle className="size-4" aria-hidden="true" /> WhatsApp
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded border border-border p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <MapPin className="size-5 text-amber" aria-hidden="true" /> Yard &amp; office
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">{SITE.address}</p>
            <a
              href={`mailto:${SITE.email}`}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold hover:text-amber"
            >
              <Mail className="size-4 text-amber" aria-hidden="true" /> {SITE.email}
            </a>
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
              title="IronBridge Logistics yard location"
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="c-name">Full name</Label>
              <Input
                id="c-name"
                required
                autoComplete="name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
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
            />
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
            />
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
