import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, LogIn, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { bootstrapGodMode } from "@/lib/admin.functions";
import { buildSeo } from "@/lib/seo";
import { PasswordInput } from "@/components/ui/password-input";

const TITLE = "Restricted Access | Euro Gulf Logistics";
const DESCRIPTION = "Authorised personnel only.";

export const Route = createFileRoute("/stealth-admin-auth")({
  head: () =>
    buildSeo({
      title: TITLE,
      description: DESCRIPTION,
      canonicalPath: "/stealth-admin-auth",
      forceNoIndex: true,
    }),
  component: StealthAuthPage,
});

function StealthAuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  // Until React hydrates, a click would trigger a native form GET and reload
  // the page, which looks like a silently failed sign-in.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
    // Idempotent: provisions the God Mode account from server-side secrets once.
    void bootstrapGodMode().catch(() => undefined);
  }, []);

  const signIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setPending(false);
    if (error) {
      toast.error("Access denied", { description: error.message });
      return;
    }
    navigate({ to: "/admin" });
  };

  return (
    <section className="mx-auto flex max-w-md flex-col px-4 py-20 sm:px-6">
      <span className="flex size-12 items-center justify-center rounded bg-amber/15">
        <ShieldCheck className="size-6 text-amber" aria-hidden="true" />
      </span>
      <h1 className="mt-5 text-2xl font-black tracking-tight">Restricted access</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Authorised Euro Gulf Logistics personnel only. All sign-in attempts are logged.
      </p>

      <form onSubmit={signIn} className="mt-8 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="a-email">Work email</Label>
          <Input
            id="a-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="a-password">Password</Label>
          <PasswordInput
            id="a-password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" variant="amber" className="w-full" disabled={pending || !ready}>
          {pending ? (
            <Loader2 className="animate-spin" aria-hidden="true" />
          ) : (
            <LogIn aria-hidden="true" />
          )}
          Sign in
        </Button>
      </form>
    </section>
  );
}
