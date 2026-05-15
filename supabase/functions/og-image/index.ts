// Dynamic Open Graph image generator (SVG 1200x630).
// Returned as image/svg+xml — supported by Google, Twitter, Slack, Discord.
// For Facebook/LinkedIn (which only honor PNG/JPEG), pages should keep a
// static fallback in the page <SeoHead image="..." />.
//
// Usage:
//   GET /functions/v1/og-image?title=...&subtitle=...&sector=agriculture|forestry|coffee|rice|general
//
// No auth required (public endpoint).

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
};

type SectorKey = "agriculture" | "forestry" | "coffee" | "rice" | "general";

const SECTOR_THEME: Record<SectorKey, { bg: string; accent: string; label: string }> = {
  agriculture: { bg: "#14532d", accent: "#84cc16", label: "Agricultura" },
  forestry:    { bg: "#064e3b", accent: "#34d399", label: "Florestas" },
  coffee:      { bg: "#451a03", accent: "#f59e0b", label: "Café" },
  rice:        { bg: "#78350f", accent: "#fde047", label: "Arroz" },
  general:     { bg: "#0f766e", accent: "#5eead4", label: "SIGAFLO" },
};

function escapeXml(s: string): string {
  return s.replace(/[<>&"']/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" }[c]!),
  );
}

// crude word-wrap for SVG <text> — splits to lines of ~maxChars
function wrap(text: string, maxChars: number, maxLines: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length <= maxChars) {
      cur = (cur ? cur + " " : "") + w;
    } else {
      if (cur) lines.push(cur);
      cur = w;
      if (lines.length === maxLines - 1) break;
    }
  }
  if (cur && lines.length < maxLines) lines.push(cur);
  // Truncate last line with ellipsis if more words remain
  const used = lines.join(" ").split(/\s+/).length;
  if (used < words.length && lines.length) {
    lines[lines.length - 1] = lines[lines.length - 1].replace(/\s*\S*$/, "") + "…";
  }
  return lines;
}

function renderSvg({ title, subtitle, sector }: { title: string; subtitle: string; sector: SectorKey }): string {
  const t = SECTOR_THEME[sector] ?? SECTOR_THEME.general;
  const titleLines = wrap(title || "SIGAFLO", 28, 3);
  const titleStartY = 280 - (titleLines.length - 1) * 40;

  const titleTspans = titleLines
    .map((l, i) => `<tspan x="80" dy="${i === 0 ? 0 : 80}">${escapeXml(l)}</tspan>`)
    .join("");

  const subLines = subtitle ? wrap(subtitle, 60, 2) : [];
  const subTspans = subLines
    .map((l, i) => `<tspan x="80" dy="${i === 0 ? 0 : 36}">${escapeXml(l)}</tspan>`)
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${t.bg}"/>
      <stop offset="100%" stop-color="#0a0a0a"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${t.accent}" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="${t.accent}" stop-opacity="0.4"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <!-- decorative diagonal accent -->
  <path d="M 0 540 L 1200 380 L 1200 630 L 0 630 Z" fill="${t.accent}" fill-opacity="0.12"/>
  <rect x="0" y="0" width="12" height="630" fill="url(#accent)"/>

  <!-- Sector label -->
  <text x="80" y="120" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
        font-size="22" font-weight="600" fill="${t.accent}" letter-spacing="6">
    ${escapeXml(t.label.toUpperCase())}
  </text>

  <!-- Title -->
  <text x="80" y="${titleStartY}" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
        font-size="68" font-weight="800" fill="#ffffff" letter-spacing="-1.5">
    ${titleTspans}
  </text>

  <!-- Subtitle -->
  ${subLines.length ? `<text x="80" y="${titleStartY + titleLines.length * 80 + 30}"
        font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
        font-size="28" font-weight="400" fill="#e2e8f0" opacity="0.9">
    ${subTspans}
  </text>` : ""}

  <!-- Footer brand -->
  <line x1="80" y1="540" x2="1120" y2="540" stroke="#ffffff" stroke-opacity="0.18" stroke-width="1"/>
  <text x="80" y="585" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
        font-size="26" font-weight="700" fill="#ffffff">SIGAFLO</text>
  <text x="80" y="612" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
        font-size="16" font-weight="400" fill="#cbd5e1">
    Sistema Integrado de Gestão Agro-Florestal · República de Angola
  </text>
  <text x="1120" y="612" text-anchor="end"
        font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
        font-size="16" fill="#cbd5e1">sigaflo.lovable.app</text>
</svg>`;
}

Deno.serve((req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const url = new URL(req.url);
  const title = (url.searchParams.get("title") || "SIGAFLO").slice(0, 200);
  const subtitle = (url.searchParams.get("subtitle") || "").slice(0, 240);
  const sectorRaw = (url.searchParams.get("sector") || "general").toLowerCase();
  const sector: SectorKey = (["agriculture", "forestry", "coffee", "rice", "general"].includes(sectorRaw)
    ? sectorRaw
    : "general") as SectorKey;

  const svg = renderSvg({ title, subtitle, sector });

  return new Response(svg, {
    headers: {
      ...corsHeaders,
      "Content-Type": "image/svg+xml; charset=utf-8",
      // Long cache: same query → same image
      "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable",
    },
  });
});
