import { Helmet } from "react-helmet-async";

export interface SeoHeadProps {
  title: string;
  description: string;
  /** Path-relative URL for canonical (e.g. "/portal/agricultura"). */
  path: string;
  /** Imported asset URL (image src). Will be resolved to absolute. */
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
}

const SITE = "https://sigaflo.lovable.app";
const SITE_NAME = "SIGAFLO — Portal Público";

function absolutize(url?: string) {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  // Vite asset imports start with "/"; prepend origin.
  try {
    return new URL(url, SITE).toString();
  } catch {
    return undefined;
  }
}

export function SeoHead({ title, description, path, image, imageAlt, type = "website" }: SeoHeadProps) {
  const url = `${SITE}${path.startsWith("/") ? path : `/${path}`}`;
  const ogImage = absolutize(image);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:locale" content="pt_AO" />
      {ogImage && <meta property="og:image" content={ogImage} />}
      {ogImage && <meta property="og:image:width" content="1200" />}
      {ogImage && <meta property="og:image:height" content="630" />}
      {ogImage && imageAlt && <meta property="og:image:alt" content={imageAlt} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content={ogImage ? "summary_large_image" : "summary"} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      {ogImage && imageAlt && <meta name="twitter:image:alt" content={imageAlt} />}
    </Helmet>
  );
}
