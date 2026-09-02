import type { SupabaseClient } from "@supabase/supabase-js";

/** Throws unless the caller holds the super_admin (God Mode) role. */
export async function assertSuperAdmin(supabase: SupabaseClient, userId: string): Promise<void> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "super_admin")
    .maybeSingle();
  if (error) throw new Error("Role verification failed");
  if (!data) throw new Error("Forbidden");
}

/**
 * Throws unless the caller holds 'admin' or 'super_admin'. Returns the
 * caller's own highest role so handlers can apply finer-grained rules
 * (e.g. a plain admin may manage staff, but not other admins).
 */
export async function assertStaffManager(
  supabase: SupabaseClient,
  userId: string,
): Promise<"admin" | "super_admin"> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .in("role", ["admin", "super_admin"]);
  if (error) throw new Error("Role verification failed");
  const roles = (data ?? []).map((r) => r.role as string);
  if (roles.includes("super_admin")) return "super_admin";
  if (roles.includes("admin")) return "admin";
  throw new Error("Forbidden");
}

type AuditEntry = {
  actorId: string;
  actorEmail?: string | null;
  action: string;
  entity?: string | null;
  entityId?: string | null;
  details?: Record<string, unknown>;
};

export async function writeAudit(entry: AuditEntry): Promise<void> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin.from("audit_logs").insert({
    actor_id: entry.actorId,
    actor_email: entry.actorEmail ?? null,
    action: entry.action,
    entity: entry.entity ?? null,
    entity_id: entry.entityId ?? null,
    details: (entry.details ?? {}) as never,
  });
}
