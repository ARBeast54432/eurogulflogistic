import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Service = Tables<"services">;
export type QuoteRequest = Tables<"quote_requests">;
export type ContactMessage = Tables<"contact_messages">;

export const QUOTE_STATUSES = ["New", "In Progress", "Completed"] as const;

export async function fetchServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export const servicesQueryOptions = () =>
  queryOptions({
    queryKey: ["services"],
    queryFn: fetchServices,
    staleTime: 15_000,
  });

export async function fetchQuoteRequests(): Promise<QuoteRequest[]> {
  const { data, error } = await supabase
    .from("quote_requests")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export const quoteRequestsQueryOptions = () =>
  queryOptions({ queryKey: ["quote_requests"], queryFn: fetchQuoteRequests });

export async function fetchContactMessages(): Promise<ContactMessage[]> {
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export const contactMessagesQueryOptions = () =>
  queryOptions({ queryKey: ["contact_messages"], queryFn: fetchContactMessages });

export const SERVICE_ICON_KEY: Record<string, string> = {
  rental: "truck",
  storage: "container",
  dismantling: "wrench",
  assembly: "cog",
  rigging: "link",
};
