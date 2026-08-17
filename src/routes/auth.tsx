import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, LogIn, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

const TITLE = "Staff Sign In | Euro Gulf Logistics";
const DESCRIPTION = "Internal sign in for Euro Gulf Logistics dispatch and yard staff.";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  const signIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setPending(false);
    if (error) {
      toast.error("Sign in failed", { description: error.message });
      return;
    }
    navigate({ to: "/admin" });
  };

  return (
    <section className="mx-auto flex max-w-md flex-col px-4 py-20 sm:px-6">
      <span className="flex size-12 items-center justify-center rounded bg-amber/15">
        <ShieldCheck className="size-6 text-amber" aria-hidden="true" />
      </span>
      <h1 className="mt-5 text-2xl font-black tracking-tight">Staff sign in</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Dispatch and yard staff only. Accounts are provisioned by operations.
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
          <Input
            id="a-password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" variant="amber" className="w-full" disabled={pending}>
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
