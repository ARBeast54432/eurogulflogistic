import { supabase } from "@/integrations/supabase/client";

/**
 * Client-side audit trail writer. RLS only accepts rows whose actor_id equals
 * the signed-in user, so entries can never be forged for another employee.
 */
export async function logStaffAction(input: {
  action: string;
  entity?: string;
  entityId?: string;
  details?: Record<string, unknown>;
}): Promise<void> {
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return;
  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    actor_email: user.email ?? null,
    action: input.action,
    entity: input.entity ?? null,
    entity_id: input.entityId ?? null,
    details: (input.details ?? {}) as never,
  });
}
