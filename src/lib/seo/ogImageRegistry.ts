// Centralized Open Graph image resolution per route.
//
// Strategy:
//   1. Sector portal pages already pass static hero images directly to <SeoHead>.
//   2. For pages without a curated static image (news/legislation detail,
//      generic info pages), we generate a branded SVG via the `og-image`
//      edge function on demand.
//   3. As a last-resort fallback, the global /og-image.png in <SeoHead> is used.

import heroFields from "@/assets/portal/hero-fields.jpg";
import heroForest from "@/assets/portal/hero-forest.jpg";
import heroCoffee from "@/assets/portal/hero-coffee.jpg";
import heroRice from "@/assets/portal/hero-rice.jpg";
import sectorAgri from "@/assets/portal/sector-agricultura.jpg";
import sectorFor from "@/assets/portal/sector-florestas.jpg";
import sectorCof from "@/assets/portal/sector-cafe.jpg";
import sectorRice from "@/assets/portal/sector-arroz.jpg";
import aboutMin from "@/assets/portal/about-ministry.jpg";

export type OgSector = "agriculture" | "forestry" | "coffee" | "rice" | "general";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

/** Build a dynamic OG image URL pointing at the og-image edge function. */
export function buildDynamicOgImage(opts: {
  title: string;
  subtitle?: string;
  sector?: OgSector;
}): string {
  const params = new URLSearchParams();
  params.set("title", opts.title);
  if (opts.subtitle) params.set("subtitle", opts.subtitle);
  params.set("sector", opts.sector ?? "general");
  return `${SUPABASE_URL}/functions/v1/og-image?${params.toString()}`;
}

/** Pre-curated static images per known portal route. */
export const ROUTE_OG_IMAGES: Record<string, string> = {
  "/portal": heroFields,
  "/portal/agricultura": sectorAgri,
  "/portal/florestas": sectorFor,
  "/portal/cafe": sectorCof,
  "/portal/arroz": sectorRice,
  "/portal/sobre": aboutMin,
  "/portal/contactos": aboutMin,
  "/portal/faq": heroFields,
  "/portal/indicadores": sectorAgri,
  "/portal/mapa": sectorAgri,
  "/portal/noticias": heroForest,
  "/portal/legislacao": aboutMin,
  "/portal/registo-publico": heroCoffee,
  "/portal/galeria": heroRice,
};

export function resolveStaticOgImage(pathname: string): string | undefined {
  // Exact match first, then prefix match (e.g. /portal/noticias/123)
  if (ROUTE_OG_IMAGES[pathname]) return ROUTE_OG_IMAGES[pathname];
  const match = Object.keys(ROUTE_OG_IMAGES)
    .filter((p) => pathname.startsWith(p + "/"))
    .sort((a, b) => b.length - a.length)[0];
  return match ? ROUTE_OG_IMAGES[match] : undefined;
}

/** Infer a sector key from a portal pathname (best-effort). */
export function inferSectorFromPath(pathname: string): OgSector {
  if (pathname.includes("/florestas") || pathname.includes("/forestry")) return "forestry";
  if (pathname.includes("/cafe") || pathname.includes("/coffee")) return "coffee";
  if (pathname.includes("/arroz") || pathname.includes("/rice")) return "rice";
  if (pathname.includes("/agricultura") || pathname.includes("/agriculture")) return "agriculture";
  return "general";
}
