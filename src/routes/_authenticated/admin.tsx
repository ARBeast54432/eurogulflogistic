import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Activity,
  Crown,
  Inbox,
  Loader2,
  LogOut,
  Pencil,
  Plus,
  PackageSearch,
  ScrollText,
  ShieldAlert,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/site/ConfirmDialog";
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
import { logStaffAction } from "@/lib/audit";
import {
  QUOTE_STATUSES,
  contactMessagesQueryOptions,
  quoteRequestsQueryOptions,
  servicesQueryOptions,
  type Service,
} from "@/lib/services";
import {
  createStaffAccount,
  deleteStaffAccount,
  forceResetStaffPassword,
  listAuditLogs,
  listStaffAccounts,
  setStaffActive,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Dispatch Dashboard | Euro Gulf Logistics" },
      { name: "description", content: "Internal dispatch dashboard." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

function useRoles(userId: string | undefined) {
  return useQuery({
    queryKey: ["my-roles", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId!);
      if (error) throw error;
      return (data ?? []).map((r) => r.role as string);
    },
  });
}

/** Keeps the dashboard in sync with live frontend form submissions. */
function useLiveSubmissions() {
  const queryClient = useQueryClient();
  useEffect(() => {
    const channel = supabase
      .channel("dispatch-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "quote_requests" }, () =>
        queryClient.invalidateQueries({ queryKey: ["quote_requests"] }),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "contact_messages" }, () =>
        queryClient.invalidateQueries({ queryKey: ["contact_messages"] }),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);
}

function AdminPage() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: roles, isPending: checkingRole } = useRoles(user?.id);
  useLiveSubmissions();

  const isSuperAdmin = Boolean(roles?.includes("super_admin"));
  const isAdmin = Boolean(roles?.includes("admin"));
  const hasAccess = isSuperAdmin || Boolean(roles?.some((r) => r === "admin" || r === "staff"));

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/stealth-admin-auth", replace: true });
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="label-caps text-amber">Internal</p>
          <h1 className="mt-2 flex items-center gap-2 text-2xl font-black tracking-tight sm:text-3xl">
            Dispatch dashboard
            {isSuperAdmin ? (
              <Badge variant="secondary" className="gap-1">
                <Crown className="size-3.5 text-amber" aria-hidden="true" /> God Mode
              </Badge>
            ) : null}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>
        </div>
        {/* God Mode is intentionally non-logoutable: emergency recovery port. */}
        {!isSuperAdmin && !checkingRole ? (
          <Button variant="outline" size="sm" onClick={signOut}>
            <LogOut aria-hidden="true" /> Sign out
          </Button>
        ) : null}
      </div>

      {checkingRole ? (
        <div className="mt-10 space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : !hasAccess ? (
        <div className="mt-10 rounded border border-border p-8 text-center">
          <ShieldAlert className="mx-auto size-8 text-amber" aria-hidden="true" />
          <h2 className="mt-4 text-lg font-bold">Access required</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account is signed in but has no dashboard role assigned. Ask operations to grant
            access.
          </p>
        </div>
      ) : (
        <Tabs defaultValue="overview" className="mt-8">
          <TabsList className="flex-wrap">
            <TabsTrigger value="overview">
              <Activity className="size-4" aria-hidden="true" /> Overview
            </TabsTrigger>
            <TabsTrigger value="quotes">
              <Inbox className="size-4" aria-hidden="true" /> Quote inbox
            </TabsTrigger>
            <TabsTrigger value="services">
              <PackageSearch className="size-4" aria-hidden="true" /> Services
            </TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            {isSuperAdmin || isAdmin ? (
              <TabsTrigger value="staff">
                <Users className="size-4" aria-hidden="true" /> Staff
              </TabsTrigger>
            ) : null}
            {isSuperAdmin ? (
              <TabsTrigger value="audit">
                <ScrollText className="size-4" aria-hidden="true" /> Audit logs
              </TabsTrigger>
            ) : null}
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <LiveOverview />
          </TabsContent>
          <TabsContent value="quotes" className="mt-6">
            <QuoteInbox />
          </TabsContent>
          <TabsContent value="services" className="mt-6">
            <ServicesManager canEdit={isSuperAdmin || isAdmin} />
          </TabsContent>
          <TabsContent value="messages" className="mt-6">
            <MessagesTable />
          </TabsContent>
          {isSuperAdmin || isAdmin ? (
            <TabsContent value="staff" className="mt-6">
              <StaffManagement isSuperAdmin={isSuperAdmin} />
            </TabsContent>
          ) : null}
          {isSuperAdmin ? (
            <TabsContent value="audit" className="mt-6">
              <AuditLogs />
            </TabsContent>
          ) : null}
        </Tabs>
      )}
    </section>
  );
}

function LiveOverview() {
  const quotes = useQuery({ ...quoteRequestsQueryOptions(), refetchInterval: 20_000 });
  const messages = useQuery({ ...contactMessagesQueryOptions(), refetchInterval: 20_000 });

  const feed = useMemo(() => {
    const q = (quotes.data ?? []).map((row) => ({
      id: `q-${row.id}`,
      kind: "Quote request",
      name: row.customer_name,
      email: row.email,
      detail: row.service_requested,
      created_at: row.created_at,
    }));
    const m = (messages.data ?? []).map((row) => ({
      id: `m-${row.id}`,
      kind: "Message",
      name: row.full_name,
      email: row.email,
      detail: row.subject ?? "General enquiry",
      created_at: row.created_at,
    }));
    return [...q, ...m].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 25);
  }, [quotes.data, messages.data]);

  if (quotes.isPending || messages.isPending) return <Skeleton className="h-64 w-full" />;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Quote requests" value={quotes.data?.length ?? 0} />
        <StatCard
          label="New (unactioned)"
          value={(quotes.data ?? []).filter((r) => r.status === "New").length}
        />
        <StatCard label="Contact messages" value={messages.data?.length ?? 0} />
      </div>

      <div>
        <h2 className="label-caps text-amber">Live submission feed</h2>
        {feed.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No submissions yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border rounded border border-border">
            {feed.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 p-4">
                <Badge variant="secondary">{item.kind}</Badge>
                <span className="text-sm font-semibold">{item.name}</span>
                <a href={`mailto:${item.email}`} className="text-xs hover:text-amber">
                  {item.email}
                </a>
                <span className="text-xs text-muted-foreground">{item.detail}</span>
                <span className="mono-num ml-auto text-xs text-muted-foreground">
                  {new Date(item.created_at).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border border-border p-5">
      <p className="label-caps text-muted-foreground">{label}</p>
      <p className="mono-num mt-2 text-3xl font-black">{value}</p>
    </div>
  );
}

const EMPTY_SERVICE_FORM = {
  title: "",
  slug: "",
  category: "",
  description: "",
  long_description: "",
  image_url: "",
  is_available: true,
  sort_order: 0,
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function ServicesManager({ canEdit }: { canEdit: boolean }) {
  const queryClient = useQueryClient();
  const { data, isPending, isError } = useQuery(servicesQueryOptions());
  const [savingId, setSavingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState(EMPTY_SERVICE_FORM);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; title: string } | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["services"] });

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_SERVICE_FORM);
    setDialogOpen(true);
  };

  const openEdit = (service: Service) => {
    setEditing(service);
    setForm({
      title: service.title,
      slug: service.slug,
      category: service.category,
      description: service.description,
      long_description: service.long_description ?? "",
      image_url: service.image_url ?? "",
      is_available: service.is_available,
      sort_order: service.sort_order,
    });
    setDialogOpen(true);
  };

  const toggle = useMutation({
    mutationFn: async ({ id, next, title }: { id: string; next: boolean; title: string }) => {
      setSavingId(id);
      const { error } = await supabase.from("services").update({ is_available: next }).eq("id", id);
      if (error) throw error;
      await logStaffAction({
        action: next ? "service.enable" : "service.disable",
        entity: "services",
        entityId: id,
        details: { title, is_available: next },
      });
    },
    onSuccess: () => {
      invalidate();
      toast.success("Availability updated");
    },
    onError: (error: Error) => toast.error("Update failed", { description: error.message }),
    onSettled: () => setSavingId(null),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim() || slugify(form.title),
        category: form.category.trim(),
        description: form.description.trim(),
        long_description: form.long_description.trim() || null,
        image_url: form.image_url.trim() || null,
        is_available: form.is_available,
        sort_order: form.sort_order,
      };
      if (editing) {
        const { error } = await supabase.from("services").update(payload).eq("id", editing.id);
        if (error) throw error;
        await logStaffAction({
          action: "service.update",
          entity: "services",
          entityId: editing.id,
          details: { title: payload.title },
        });
      } else {
        const { error } = await supabase.from("services").insert(payload);
        if (error) throw error;
        await logStaffAction({
          action: "service.create",
          entity: "services",
          details: { title: payload.title },
        });
      }
    },
    onSuccess: () => {
      invalidate();
      setDialogOpen(false);
      toast.success(editing ? "Service updated" : "Service created");
    },
    onError: (error: Error) => toast.error("Save failed", { description: error.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("services").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_data, id) => {
      invalidate();
      const title = pendingDelete?.title;
      setPendingDelete(null);
      void logStaffAction({
        action: "service.delete",
        entity: "services",
        entityId: id,
        details: { title },
      });
      toast.success("Service deleted");
    },
    onError: (error: Error) => {
      toast.error("Delete failed", { description: error.message });
      setPendingDelete(null);
    },
  });

  if (isPending) return <Skeleton className="h-64 w-full" />;
  if (isError) return <p className="text-sm text-muted-foreground">Could not load services.</p>;

  return (
    <div className="space-y-4">
      {canEdit ? (
        <div className="flex justify-end">
          <Button variant="amber" size="sm" onClick={openCreate}>
            <Plus aria-hidden="true" /> Add service
          </Button>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Available</TableHead>
              {canEdit ? <TableHead className="text-right">Edit</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data ?? []).map((service) => (
              <TableRow key={service.id}>
                <TableCell className="font-semibold">{service.title}</TableCell>
                <TableCell className="text-muted-foreground">{service.category}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {savingId === service.id ? (
                      <Loader2
                        className="size-4 animate-spin text-muted-foreground"
                        aria-hidden="true"
                      />
                    ) : null}
                    <Switch
                      checked={service.is_available}
                      aria-label={`Toggle availability for ${service.title}`}
                      onCheckedChange={(next) =>
                        toggle.mutate({ id: service.id, next, title: service.title })
                      }
                    />
                  </div>
                </TableCell>
                {canEdit ? (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEdit(service)}>
                        <Pencil aria-hidden="true" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPendingDelete({ id: service.id, title: service.title })}
                      >
                        <Trash2 aria-hidden="true" />
                      </Button>
                    </div>
                  </TableCell>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit service" : "Add service"}</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              saveMutation.mutate();
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sv-title">Title</Label>
                <Input
                  id="sv-title"
                  required
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      title: e.target.value,
                      slug: editing ? f.slug : slugify(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sv-slug">Slug</Label>
                <Input
                  id="sv-slug"
                  required
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sv-category">Category</Label>
                <Input
                  id="sv-category"
                  required
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sv-sort">Sort order</Label>
                <Input
                  id="sv-sort"
                  type="number"
                  value={form.sort_order}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, sort_order: Number(e.target.value) || 0 }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sv-image">Image URL</Label>
              <Input
                id="sv-image"
                type="url"
                placeholder="https://…"
                value={form.image_url}
                onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sv-description">Short description</Label>
              <Textarea
                id="sv-description"
                required
                rows={2}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">Shown on the service card.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sv-long-description">Full details (optional)</Label>
              <Textarea
                id="sv-long-description"
                rows={5}
                value={form.long_description}
                onChange={(e) => setForm((f) => ({ ...f, long_description: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Shown when a visitor expands this service on the Services page.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="sv-available"
                checked={form.is_available}
                onCheckedChange={(v) => setForm((f) => ({ ...f, is_available: v }))}
              />
              <Label htmlFor="sv-available">Available now</Label>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={saveMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" variant="amber" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? (
                  <Loader2 className="animate-spin" aria-hidden="true" />
                ) : null}
                {editing ? "Save changes" : "Create service"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete service"
        description={
          pendingDelete
            ? `This permanently removes "${pendingDelete.title}" from the public services page.`
            : ""
        }
        confirmLabel="Delete service"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (pendingDelete) deleteMutation.mutate(pendingDelete.id);
        }}
      />
    </div>
  );
}

function QuoteInbox() {
  const queryClient = useQueryClient();
  const { data, isPending, isError } = useQuery(quoteRequestsQueryOptions());

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("quote_requests").update({ status }).eq("id", id);
      if (error) throw error;
      await logStaffAction({
        action: "quote.status_change",
        entity: "quote_requests",
        entityId: id,
        details: { status },
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["quote_requests"] }),
    onError: (error: Error) => toast.error("Status update failed", { description: error.message }),
  });

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    (data ?? []).forEach((row) => map.set(row.status, (map.get(row.status) ?? 0) + 1));
    return map;
  }, [data]);

  if (isPending) return <Skeleton className="h-64 w-full" />;
  if (isError) return <p className="text-sm text-muted-foreground">Could not load requests.</p>;
  if (!data?.length) return <p className="text-sm text-muted-foreground">No quote requests yet.</p>;

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
  if (!data?.length) return <p className="text-sm text-muted-foreground">No messages yet.</p>;

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
          {row.subject ? <p className="mt-2 text-sm font-semibold">{row.subject}</p> : null}
          <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{row.message}</p>
        </article>
      ))}
    </div>
  );
}

function StaffManagement({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const queryClient = useQueryClient();
  const list = useServerFn(listStaffAccounts);
  const create = useServerFn(createStaffAccount);
  const reset = useServerFn(forceResetStaffPassword);
  const setActive = useServerFn(setStaffActive);
  const remove = useServerFn(deleteStaffAccount);

  const staff = useQuery({ queryKey: ["staff-accounts"], queryFn: () => list() });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["staff-accounts"] });

  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
    jobTitle: "",
    role: "staff" as "staff" | "admin",
  });
  const [pendingDelete, setPendingDelete] = useState<{ userId: string; email: string } | null>(
    null,
  );

  const createMutation = useMutation({
    mutationFn: () => create({ data: form }),
    onSuccess: () => {
      toast.success("Staff account created");
      setForm({ email: "", password: "", fullName: "", jobTitle: "", role: "staff" });
      refresh();
    },
    onError: (error: Error) => toast.error("Create failed", { description: error.message }),
  });

  const resetMutation = useMutation({
    mutationFn: (vars: { userId: string; newPassword: string }) => reset({ data: vars }),
    onSuccess: () => toast.success("Password overridden"),
    onError: (error: Error) => toast.error("Reset failed", { description: error.message }),
  });

  const activeMutation = useMutation({
    mutationFn: (vars: { userId: string; isActive: boolean }) => setActive({ data: vars }),
    onSuccess: () => {
      refresh();
      toast.success("Account updated");
    },
    onError: (error: Error) => toast.error("Update failed", { description: error.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: (vars: { userId: string }) => remove({ data: vars }),
    onSuccess: () => {
      refresh();
      setPendingDelete(null);
      toast.success("Account deleted");
    },
    onError: (error: Error) => {
      toast.error("Delete failed", { description: error.message });
      setPendingDelete(null);
    },
  });

  return (
    <div className="space-y-8">
      <form
        className="grid gap-4 rounded border border-border p-5 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          createMutation.mutate();
        }}
      >
        <div className="sm:col-span-2">
          <h2 className="text-sm font-bold">Create employee account</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Passwords are stored hashed and cannot be read back by anyone — use the override action
            to issue a new one.
            {!isSuperAdmin ? " Admins can create Staff accounts only." : ""}
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="s-email">Work email</Label>
          <Input
            id="s-email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="s-password">Temporary password</Label>
          <Input
            id="s-password"
            type="text"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="s-name">Full name</Label>
          <Input
            id="s-name"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="s-title">Job title</Label>
          <Input
            id="s-title"
            value={form.jobTitle}
            onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Role</Label>
          <Select
            value={form.role}
            onValueChange={(role) => setForm({ ...form, role: role as "staff" | "admin" })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="staff">Staff</SelectItem>
              {isSuperAdmin ? <SelectItem value="admin">Admin</SelectItem> : null}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button
            type="submit"
            variant="amber"
            className="w-full"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? (
              <Loader2 className="animate-spin" aria-hidden="true" />
            ) : (
              <UserPlus aria-hidden="true" />
            )}
            Create account
          </Button>
        </div>
      </form>

      {staff.isPending ? (
        <Skeleton className="h-48 w-full" />
      ) : staff.isError ? (
        <p className="text-sm text-muted-foreground">Could not load staff accounts.</p>
      ) : (
        <div className="overflow-x-auto rounded border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Emergency actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(staff.data ?? []).map((row) => {
                const isGod = row.roles.includes("super_admin");
                const isOtherAdmin = row.roles.includes("admin");
                // A plain admin cannot touch super_admin or other admin accounts —
                // only Super Admin can manage those. Enforced server-side too.
                const restricted = !isSuperAdmin && (isGod || isOtherAdmin);
                return (
                  <TableRow key={row.user_id}>
                    <TableCell>
                      <span className="block font-semibold">{row.full_name ?? row.email}</span>
                      <span className="text-xs text-muted-foreground">{row.email}</span>
                    </TableCell>
                    <TableCell className="text-xs">{row.roles.join(", ") || "—"}</TableCell>
                    <TableCell>
                      <Switch
                        checked={row.is_active}
                        disabled={isGod || restricted}
                        aria-label={`Toggle access for ${row.email}`}
                        onCheckedChange={(isActive) =>
                          activeMutation.mutate({ userId: row.user_id, isActive })
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isGod || restricted || !isSuperAdmin}
                          title={
                            !isSuperAdmin ? "Only Super Admin can override passwords" : undefined
                          }
                          onClick={() => {
                            const newPassword = window.prompt(
                              `New password for ${row.email} (min 8 characters)`,
                            );
                            if (newPassword)
                              resetMutation.mutate({ userId: row.user_id, newPassword });
                          }}
                        >
                          Override password
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isGod || restricted}
                          onClick={() =>
                            setPendingDelete({ userId: row.user_id, email: row.email })
                          }
                        >
                          <Trash2 aria-hidden="true" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete employee account"
        description={
          pendingDelete
            ? `This permanently deletes ${pendingDelete.email} and cannot be undone.`
            : ""
        }
        confirmLabel="Delete account"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (pendingDelete) deleteMutation.mutate({ userId: pendingDelete.userId });
        }}
      />
    </div>
  );
}

function AuditLogs() {
  const fetchLogs = useServerFn(listAuditLogs);
  const { data, isPending, isError } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: () => fetchLogs(),
    refetchInterval: 30_000,
  });

  if (isPending) return <Skeleton className="h-64 w-full" />;
  if (isError) return <p className="text-sm text-muted-foreground">Could not load audit logs.</p>;
  if (!data?.length) return <p className="text-sm text-muted-foreground">No activity yet.</p>;

  return (
    <div className="overflow-x-auto rounded border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Employee</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Entity</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="mono-num whitespace-nowrap text-xs text-muted-foreground">
                {new Date(row.created_at).toLocaleString()}
              </TableCell>
              <TableCell className="text-xs">{row.actor_email ?? row.actor_id}</TableCell>
              <TableCell className="text-xs font-semibold">{row.action}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{row.entity ?? "—"}</TableCell>
              <TableCell className="max-w-[280px] truncate text-xs text-muted-foreground">
                {JSON.stringify(row.details)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
