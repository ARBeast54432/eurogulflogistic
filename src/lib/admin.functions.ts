import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertStaffManager, assertSuperAdmin, writeAudit } from "@/lib/admin.server";

/**
 * Idempotent bootstrap of the God Mode account from environment variables.
 * Credentials never appear in code — they are read from server-side secrets.
 * Safe to call publicly: it only ever creates the single super admin when
 * none exists, and returns no data.
 */
export const bootstrapGodMode = createServerFn({ method: "POST" }).handler(async () => {
  const email = process.env["GOD_MODE_EMAIL"];
  const password = process.env["GOD_MODE_PASSWORD"];
  if (!email || !password) return { ok: false as const };

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: existing } = await supabaseAdmin
    .from("user_roles")
    .select("user_id")
    .eq("role", "super_admin")
    .limit(1);
  if (existing && existing.length > 0) return { ok: true as const };

  let userId: string | null = null;
  const created = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: "Super Admin" },
  });
  if (created.data.user) {
    userId = created.data.user.id;
  } else {
    const { data: list } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    userId = list?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())?.id ?? null;
    if (userId) await supabaseAdmin.auth.admin.updateUserById(userId, { password });
  }
  if (!userId) return { ok: false as const };

  await supabaseAdmin
    .from("user_roles")
    .upsert({ user_id: userId, role: "super_admin" }, { onConflict: "user_id,role" });
  await supabaseAdmin
    .from("staff_accounts")
    .upsert(
      { user_id: userId, email, full_name: "Super Admin", job_title: "God Mode", is_active: true },
      { onConflict: "user_id" },
    );
  return { ok: true as const };
});

export const listStaffAccounts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaffManager(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: staff }, { data: roles }] = await Promise.all([
      supabaseAdmin.from("staff_accounts").select("*").order("created_at", { ascending: true }),
      supabaseAdmin.from("user_roles").select("user_id, role"),
    ]);
    return (staff ?? []).map((row) => ({
      ...row,
      roles: (roles ?? []).filter((r) => r.user_id === row.user_id).map((r) => r.role as string),
    }));
  });

export const createStaffAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      email: string;
      password: string;
      fullName?: string;
      jobTitle?: string;
      role: "staff" | "admin";
    }) => {
      if (!input.email.includes("@")) throw new Error("Valid email required");
      if (input.password.length < 8) throw new Error("Password must be at least 8 characters");
      if (input.role !== "staff" && input.role !== "admin") throw new Error("Invalid role");
      return input;
    },
  )
  .handler(async ({ data, context }) => {
    const callerRole = await assertStaffManager(context.supabase, context.userId);
    if (callerRole === "admin" && data.role === "admin") {
      throw new Error("Only Super Admin can create Admin accounts");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const created = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.fullName ?? null },
    });
    if (created.error || !created.data.user) {
      throw new Error(created.error?.message ?? "Could not create account");
    }
    const userId = created.data.user.id;

    await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: data.role });
    await supabaseAdmin.from("staff_accounts").insert({
      user_id: userId,
      email: data.email,
      full_name: data.fullName ?? null,
      job_title: data.jobTitle ?? null,
      is_active: true,
    });
    await writeAudit({
      actorId: context.userId,
      actorEmail: (context.claims as { email?: string } | null)?.email ?? null,
      action: "staff.create",
      entity: "staff_accounts",
      entityId: userId,
      details: { email: data.email, role: data.role },
    });
    return { userId };
  });

export const forceResetStaffPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string; newPassword: string }) => {
    if (input.newPassword.length < 8) throw new Error("Password must be at least 8 characters");
    return input;
  })
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.supabase, context.userId);
    if (data.userId === context.userId) {
      throw new Error("Use account settings to change your own password");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, {
      password: data.newPassword,
    });
    if (error) throw new Error(error.message);
    await writeAudit({
      actorId: context.userId,
      actorEmail: (context.claims as { email?: string } | null)?.email ?? null,
      action: "staff.force_password_reset",
      entity: "staff_accounts",
      entityId: data.userId,
    });
    return { ok: true as const };
  });

export const setStaffActive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string; isActive: boolean }) => input)
  .handler(async ({ data, context }) => {
    const callerRole = await assertStaffManager(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (callerRole === "admin") {
      const { data: target } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", data.userId);
      if ((target ?? []).some((r) => r.role === "admin" || r.role === "super_admin")) {
        throw new Error("Only Super Admin can manage Admin accounts");
      }
    }
    await supabaseAdmin
      .from("staff_accounts")
      .update({ is_active: data.isActive })
      .eq("user_id", data.userId);
    await supabaseAdmin.auth.admin.updateUserById(data.userId, {
      ban_duration: data.isActive ? "none" : "876000h",
    });
    await writeAudit({
      actorId: context.userId,
      action: data.isActive ? "staff.enable" : "staff.disable",
      entity: "staff_accounts",
      entityId: data.userId,
    });
    return { ok: true as const };
  });

export const deleteStaffAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string }) => input)
  .handler(async ({ data, context }) => {
    const callerRole = await assertStaffManager(context.supabase, context.userId);
    if (data.userId === context.userId) throw new Error("You cannot delete your own account");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: target } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", data.userId);
    if ((target ?? []).some((r) => r.role === "super_admin")) {
      throw new Error("The God Mode account cannot be deleted");
    }
    if (callerRole === "admin" && (target ?? []).some((r) => r.role === "admin")) {
      throw new Error("Only Super Admin can remove Admin accounts");
    }

    await supabaseAdmin.from("staff_accounts").delete().eq("user_id", data.userId);
    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId);
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
    await writeAudit({
      actorId: context.userId,
      action: "staff.delete",
      entity: "staff_accounts",
      entityId: data.userId,
    });
    return { ok: true as const };
  });

export const listAuditLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return data ?? [];
  });
