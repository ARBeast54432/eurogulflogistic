import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Check, Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { servicesQueryOptions } from "@/lib/services";
import { SITE_TYPES } from "@/lib/site";
import { honeypotFieldProps, useSpamGuard } from "@/lib/spam-guard";
import { cn } from "@/lib/utils";

type FormState = {
  service: string;
  location: string;
  siteType: string;
  name: string;
  email: string;
  phone: string;
  details: string;
};

const EMPTY: FormState = {
  service: "",
  location: "",
  siteType: "",
  name: "",
  email: "",
  phone: "",
  details: "",
};

const STEPS = ["Service", "Location", "Contact", "Review"];

export function QuoteFormDialog({
  open,
  onOpenChange,
  presetService,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  presetService?: string | null;
}) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(EMPTY);
  const { data: services } = useQuery(servicesQueryOptions());
  const { honeypot, setHoneypot, isSpam, reset: resetSpamGuard } = useSpamGuard();

  useEffect(() => {
    if (open) {
      setStep(presetService ? 1 : 0);
      setForm({ ...EMPTY, service: presetService ?? "" });
      resetSpamGuard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, presetService]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const mutation = useMutation({
    mutationFn: async () => {
      if (isSpam()) return; // silently no-op — see spam-guard.ts for why
      const { error } = await supabase.from("quote_requests").insert({
        customer_name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        service_requested: form.service,
        project_location: form.location.trim() || null,
        site_type: form.siteType || null,
        project_details: form.details.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      onOpenChange(false);
      navigate({ to: "/thank-you" });
    },
    onError: (error: Error) =>
      toast.error("We couldn't submit your request", { description: error.message }),
  });

  const canContinue = () => {
    if (step === 0) return form.service !== "";
    if (step === 1) return form.location.trim().length > 1;
    if (step === 2)
      return (
        form.name.trim().length > 1 &&
        /.+@.+\..+/.test(form.email) &&
        form.phone.trim().length > 5
      );
    return true;
  };

  const selectedTitle =
    services?.find((s) => s.slug === form.service)?.title ?? form.service;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] gap-0 overflow-y-auto p-0 sm:max-w-2xl">
        <DialogHeader className="surface-navy space-y-3 p-6 text-left">
          <DialogTitle className="text-2xl font-extrabold text-navy-foreground">
            Request a Quote
          </DialogTitle>
          <DialogDescription className="text-navy-muted">
            Written response from dispatch personally 
          </DialogDescription>
          <ol className="flex items-center gap-2 pt-2" aria-label="Form progress">
            {STEPS.map((label, index) => (
              <li key={label} className="flex flex-1 items-center gap-2">
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                    index < step && "border-amber bg-amber text-amber-foreground",
                    index === step &&
                      "border-amber bg-amber/15 text-amber ring-2 ring-amber/40",
                    index > step && "border-white/25 text-navy-muted",
                  )}
                  aria-current={index === step ? "step" : undefined}
                >
                  {index < step ? <Check className="h-3.5 w-3.5" /> : index + 1}
                </span>
                <span className="hidden text-[11px] font-bold uppercase tracking-wider text-navy-muted sm:inline">
                  {label}
                </span>
                {index < STEPS.length - 1 && (
                  <span
                    className={cn(
                      "h-px flex-1",
                      index < step ? "bg-amber" : "bg-white/20",
                    )}
                  />
                )}
              </li>
            ))}
          </ol>
        </DialogHeader>

        <div className="space-y-5 p-6">
          {/* Honeypot — invisible to real users, catches naive form-filling bots */}
          <input
            {...honeypotFieldProps}
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />

          {step === 0 && (
            <fieldset className="space-y-3">
              <legend className="label-caps mb-3 text-muted-foreground">
                Select the service you need
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {(services ?? []).map((service) => (
                  <label
                    key={service.id}
                    className={cn(
                      "cursor-pointer rounded border p-4 transition-colors",
                      form.service === service.slug
                        ? "border-amber bg-amber/10"
                        : "border-border hover:border-amber/60",
                    )}
                  >
                    <input
                      type="radio"
                      name="service"
                      value={service.slug}
                      checked={form.service === service.slug}
                      onChange={() => set("service", service.slug)}
                      className="sr-only"
                    />
                    <span className="block text-sm font-bold">{service.title}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {service.is_available ? "Available now" : "Waitlist — fully booked"}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="q-location">Project location</Label>
                <Input
                  id="q-location"
                  placeholder="City, port or site address"
                  value={form.location}
                  onChange={(e) => set("location", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="q-site-type">Site type (optional)</Label>
                <Select
                  value={form.siteType}
                  onValueChange={(value) => set("siteType", value)}
                >
                  <SelectTrigger id="q-site-type">
                    <SelectValue placeholder="Select site type" />
                  </SelectTrigger>
                  <SelectContent>
                    {SITE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="q-name">Full name</Label>
                  <Input
                    id="q-name"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    autoComplete="name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="q-phone">Phone</Label>
                  <Input
                    id="q-phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    autoComplete="tel"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="q-email">Work email</Label>
                <Input
                  id="q-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="q-details">Project details</Label>
                <Textarea
                  id="q-details"
                  rows={4}
                  placeholder="Scope, load weights, timeline, access constraints…"
                  value={form.details}
                  onChange={(e) => set("details", e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <dl className="divide-y divide-border rounded border border-border">
              {[
                ["Service", selectedTitle],
                ["Location", form.location],
                ["Site type", form.siteType || "—"],
                ["Name", form.name],
                ["Email", form.email],
                ["Phone", form.phone],
                ["Details", form.details || "—"],
              ].map(([label, value]) => (
                <div key={label} className="grid gap-1 p-4 sm:grid-cols-3">
                  <dt className="label-caps text-muted-foreground">{label}</dt>
                  <dd className="text-sm sm:col-span-2">{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border p-6">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0 || mutation.isPending}
          >
            <ArrowLeft aria-hidden="true" /> Back
          </Button>
          {step < 3 ? (
            <Button
              type="button"
              variant="amber"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canContinue()}
            >
              Continue <ArrowRight aria-hidden="true" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="amber"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : (
                <Send aria-hidden="true" />
              )}
              Submit request
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
