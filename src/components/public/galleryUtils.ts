import type { GalleryItem } from "./ImageGallery";

/**
 * Input for sector gallery items — short, sector-agnostic descriptors.
 * The sector context is added automatically to guarantee unique titles
 * and captions across the portal (avoids duplicate-content SEO issues
 * when the same image is reused on multiple sector pages).
 */
export interface SectorGalleryInput {
  src: string;
  /** Short subject (e.g. "Cooperativa", "Mecanização"). Sector is appended. */
  subject: string;
  /** Short descriptive caption (e.g. "Cooperativas locais"). Sector is appended. */
  caption: string;
  category?: string;
}

const seenGlobalKeys = new Set<string>();

/**
 * Build gallery items for a sector page with guaranteed-unique alt/caption/title.
 *
 * Rules enforced:
 *  - alt:     "{subject} — {sector} (Angola)"   → unique, descriptive, SEO-friendly
 *  - caption: "{caption} · {sector}"            → unique per page and across pages
 *  - title:   same as caption                   → consistent tooltip + a11y label
 *  - In dev, warns if duplicate alt/caption appear within the same gallery
 *    or across galleries already built in this session.
 */
export function buildSectorGallery(
  sector: string,
  items: SectorGalleryInput[]
): GalleryItem[] {
  const localAlt = new Set<string>();
  const localCaption = new Set<string>();

  return items.map((it) => {
    const alt = `${it.subject} — ${sector} (Angola)`;
    const caption = `${it.caption} · ${sector}`;

    if (import.meta.env.DEV) {
      if (localAlt.has(alt)) {
        console.warn(`[ImageGallery] Duplicate alt within "${sector}" gallery:`, alt);
      }
      if (localCaption.has(caption)) {
        console.warn(`[ImageGallery] Duplicate caption within "${sector}" gallery:`, caption);
      }
      const globalKey = `${sector}|${alt}|${caption}`;
      if (seenGlobalKeys.has(globalKey)) {
        console.warn(`[ImageGallery] Duplicate item registered globally:`, globalKey);
      }
      seenGlobalKeys.add(globalKey);
      localAlt.add(alt);
      localCaption.add(caption);
    }

    return {
      src: it.src,
      alt,
      caption,
      title: caption,
      category: it.category,
    };
  });
}
