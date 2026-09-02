import { LOCAL_BUSINESS_JSONLD } from "@/lib/site";

/**
 * Reusable SEO head-config builder for TanStack Start's native head() API.
 * We deliberately do NOT use react-helmet-async here: this app already
 * server-renders <head> via TanStack's HeadContent/head() mechanism, which
 * is SSR-safe out of the box. Layering react-helmet-async on top would
 * create two systems fighting over document.head.
 */

const SITE_URL =
  (typeof import.meta !== "undefined" ? import.meta.env?.["VITE_SITE_URL"] : undefined) ||
  (typeof window !== "undefined" ? window.location.origin : "https://eg-logistics.ae");

export type SeoOptions = {
  title: string;
  description: string;
  ogImage?: string;
  /** Path only, e.g. "/services". Defaults to "/" if omitted. */
  canonicalPath?: string;
  /** Force noindex regardless of hostname (e.g. thank-you, stealth admin). */
  forceNoIndex?: boolean;
  /** Include LocalBusiness JSON-LD (only needed once or twice per page). */
  includeJsonLd?: boolean;
};

function isPreviewHost() {
  // Vercel sets VERCEL_ENV ("production" | "preview" | "development") on
  // every deployment automatically, server-side. Checking this first means
  // noindex is correct in the server-rendered HTML itself — the version
  // crawlers and social-share bots actually read — not just after client
  // hydration.
  const vercelEnv = typeof process !== "undefined" ? process.env["VERCEL_ENV"] : undefined;
  if (vercelEnv) return vercelEnv !== "production";
  if (typeof window !== "undefined") return window.location.hostname.includes(".vercel.app");
  return false;
}

export function buildSeo({
  title,
  description,
  ogImage,
  canonicalPath = "/",
  forceNoIndex = false,
  includeJsonLd = false,
}: SeoOptions) {
  const cleanPath = canonicalPath.split("?")[0];
  const canonicalUrl = `${SITE_URL.replace(/\/$/, "")}${cleanPath}`;
  const noIndex = forceNoIndex || isPreviewHost();

  const meta: Array<Record<string, string>> = [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
  ];

  if (ogImage) {
    meta.push({ property: "og:image", content: ogImage });
    meta.push({ name: "twitter:image", content: ogImage });
  }

  if (noIndex) {
    meta.push({ name: "robots", content: "noindex, nofollow" });
  }

  const links = [{ rel: "canonical", href: canonicalUrl }];

  const scripts = includeJsonLd
    ? [
        {
          type: "application/ld+json",
          children: JSON.stringify(LOCAL_BUSINESS_JSONLD),
        },
      ]
    : [];

  return { meta, links, scripts };
}
