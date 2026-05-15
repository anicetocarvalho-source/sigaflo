import { cn } from "@/lib/utils";
import horizontalColor from "@/assets/brand/sigaflo-horizontal-color.png";
import horizontalMono from "@/assets/brand/sigaflo-horizontal-mono.png";
import stackedColor from "@/assets/brand/sigaflo-stacked-color.png";
import stackedMono from "@/assets/brand/sigaflo-stacked-mono.png";
import mark from "@/assets/brand/sigaflo-mark.png";

export type BrandLogoVariant = "horizontal" | "stacked" | "mark";
export type BrandLogoTone = "color" | "mono";

interface BrandLogoProps {
  variant?: BrandLogoVariant;
  tone?: BrandLogoTone;
  className?: string;
  /** Override default alt for decorative or duplicated contexts. */
  alt?: string;
  priority?: boolean;
}

const SOURCES: Record<BrandLogoVariant, Record<BrandLogoTone, string>> = {
  horizontal: { color: horizontalColor, mono: horizontalMono },
  stacked: { color: stackedColor, mono: stackedMono },
  mark: { color: mark, mono: mark },
};

const DEFAULT_ALT = "SIGAFLO — Sistema Integrado de Gestão Agro-Florestal";

export function BrandLogo({
  variant = "horizontal",
  tone = "color",
  className,
  alt = DEFAULT_ALT,
  priority = false,
}: BrandLogoProps) {
  const src = SOURCES[variant][tone];
  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={cn("h-10 w-auto select-none", className)}
      draggable={false}
    />
  );
}
