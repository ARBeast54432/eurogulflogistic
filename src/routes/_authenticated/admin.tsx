import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Inbox, Loader2, LogOut, PackageSearch, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import {
  QUOTE_STATUSES,
  contactMessagesQueryOptions,
  quoteRequestsQueryOptions,
  servicesQueryOptions,
} from "@/lib/services";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Dispatch Dashboard | IronBridge Logistics" },
      { name: "description", content: "Internal dispatch dashboard." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

function useIsAdmin(userId: string | undefined) {
  return useQuery({
    queryKey: ["is-admin", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: userId!,
        _role: "admin",
      });
      if (error) throw error;
      return Boolean(data);
    },
  });
}

function AdminPage() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: isAdmin, isPending: checkingRole } = useIsAdmin(user?.id);

  const signOut = async () => {
    await supabase.auth.signOut();
    queryClient.clear();
    navigate({ to: "/auth" });
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="label-caps text-amber">Internal</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
            Dispatch dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>
        </div>
        <Button variant="outline" size="sm" onClick={signOut}>
          <LogOut aria-hidden="true" /> Sign out
        </Button>
      </div>

      {checkingRole ? (
        <div className="mt-10 space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : !isAdmin ? (
        <div className="mt-10 rounded border border-border p-8 text-center">
          <ShieldAlert className="mx-auto size-8 text-amber" aria-hidden="true" />
          <h2 className="mt-4 text-lg font-bold">Admin access required</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account is signed in but has no admin role assigned. Ask operations to
            grant access.
          </p>
        </div>
      ) : (
        <Tabs defaultValue="quotes" className="mt-8">
          <TabsList>
            <TabsTrigger value="quotes">
              <Inbox className="size-4" aria-hidden="true" /> Quote inbox
            </TabsTrigger>
            <TabsTrigger value="services">
              <PackageSearch className="size-4" aria-hidden="true" /> Availability
            </TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="quotes" className="mt-6">
            <QuoteInbox />
          </TabsContent>
          <TabsContent value="services" className="mt-6">
            <ServicesToggleTable />
          </TabsContent>
          <TabsContent value="messages" className="mt-6">
            <MessagesTable />
          </TabsContent>
        </Tabs>
      )}
    </section>
  );
}

function ServicesToggleTable() {
  const queryClient = useQueryClient();
  const { data, isPending, isError } = useQuery(servicesQueryOptions());
  const [savingId, setSavingId] = useState<string | null>(null);

  const toggle = useMutation({
    mutationFn: async ({ id, next }: { id: string; next: boolean }) => {
      setSavingId(id);
      const { error } = await supabase
        .from("services")
        .update({ is_available: next })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success("Availability updated");
    },
    onError: (error: Error) =>
      toast.error("Update failed", { description: error.message }),
    onSettled: () => setSavingId(null),
  });

  if (isPending) return <Skeleton className="h-64 w-full" />;
  if (isError) return <p className="text-sm text-muted-foreground">Could not load services.</p>;

  return (
    <div className="rounded border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Service</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Available</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(data ?? []).map((service) => (
            <TableRow key={service.id}>
              <TableCell className="font-semibold">{service.title}</TableCell>
              <TableCell className="text-muted-foreground">{service.slug}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  {savingId === service.id ? (
                    <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden="true" />
                  ) : null}
                  <Switch
                    checked={service.is_available}
                    aria-label={`Toggle availability for ${service.title}`}
                    onCheckedChange={(next) =>
                      toggle.mutate({ id: service.id, next })
                    }
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function QuoteInbox() {
  const queryClient = useQueryClient();
  const { data, isPending, isError } = useQuery(quoteRequestsQueryOptions());

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("quote_requests")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["quote_requests"] }),
    onError: (error: Error) =>
      toast.error("Status update failed", { description: error.message }),
  });

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    (data ?? []).forEach((row) => map.set(row.status, (map.get(row.status) ?? 0) + 1));
    return map;
  }, [data]);

  if (isPending) return <Skeleton className="h-64 w-full" />;
  if (isError) return <p className="text-sm text-muted-foreground">Could not load requests.</p>;
  if (!data?.length)
    return <p className="text-sm text-muted-foreground">No quote requests yet.</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {QUOTE_STATUSES.map((status) => (
          <Badge key={status} variant="secondary">
            {status}: <span className="mono-num ml-1">{counts.get(status) ?? 0}</span>
          </Badge>
        ))}
      </div>
      <div className="overflow-x-auto rounded border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Received</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="mono-num whitespace-nowrap text-xs text-muted-foreground">
                  {new Date(row.created_at).toLocaleString()}
                </TableCell>
                <TableCell className="font-semibold">{row.customer_name}</TableCell>
                <TableCell>{row.service_requested}</TableCell>
                <TableCell className="text-muted-foreground">
                  {row.project_location ?? "—"}
                </TableCell>
                <TableCell className="text-xs">
                  <a href={`mailto:${row.email}`} className="block hover:text-amber">
                    {row.email}
                  </a>
                  <a href={`tel:${row.phone}`} className="mono-num block hover:text-amber">
                    {row.phone}
                  </a>
                </TableCell>
                <TableCell>
                  <Select
                    value={row.status}
                    onValueChange={(status) => setStatus.mutate({ id: row.id, status })}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {QUOTE_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function MessagesTable() {
  const { data, isPending, isError } = useQuery(contactMessagesQueryOptions());

  if (isPending) return <Skeleton className="h-64 w-full" />;
  if (isError) return <p className="text-sm text-muted-foreground">Could not load messages.</p>;
  if (!data?.length)
    return <p className="text-sm text-muted-foreground">No messages yet.</p>;

  return (
    <div className="space-y-3">
      {data.map((row) => (
        <article key={row.id} className="rounded border border-border p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold">
              {row.full_name}{" "}
              <span className="font-normal text-muted-foreground">&middot; {row.email}</span>
            </h3>
            <span className="mono-num text-xs text-muted-foreground">
              {new Date(row.created_at).toLocaleString()}
            </span>
          </div>
          {row.subject ? (
            <p className="mt-2 text-sm font-semibold">{row.subject}</p>
          ) : null}
          <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
            {row.message}
          </p>
        </article>
      ))}
    </div>
  );
}
