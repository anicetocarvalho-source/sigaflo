import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface GalleryItem {
  src: string;
  alt: string;
  caption?: string;
  category?: string;
  title?: string;
}

interface ImageGalleryProps {
  items: GalleryItem[];
  /** Optional category filter — items must include `category` */
  activeCategory?: string;
  /** Optional accessible label for the gallery region */
  ariaLabel?: string;
}

export function ImageGallery({ items, activeCategory, ariaLabel = "Galeria de imagens" }: ImageGalleryProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const filtered =
    activeCategory && activeCategory !== "todos"
      ? items.filter((i) => i.category === activeCategory)
      : items;

  const close = useCallback(() => setOpenIdx(null), []);
  const next = useCallback(
    () => setOpenIdx((i) => (i === null ? i : (i + 1) % items.length)),
    [items.length]
  );
  const prev = useCallback(
    () => setOpenIdx((i) => (i === null ? i : (i - 1 + items.length) % items.length)),
    [items.length]
  );

  useEffect(() => {
    if (openIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") { e.preventDefault(); next(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIdx, next, prev]);

  const current = openIdx !== null ? items[openIdx] : null;
  const currentTitle = current ? (current.title ?? current.caption ?? current.alt) : "";

  return (
    <>
      <ul
        role="list"
        aria-label={ariaLabel}
        className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4 [&>*]:mb-4 [&>*]:break-inside-avoid"
      >
        {filtered.map((item) => {
          const idx = items.indexOf(item);
          const title = item.title ?? item.caption ?? item.alt;
          return (
            <li key={`${item.src}-${idx}`}>
              <figure className="m-0">
                <button
                  type="button"
                  onClick={() => setOpenIdx(idx)}
                  aria-label={`Ampliar imagem: ${title}`}
                  aria-haspopup="dialog"
                  className={cn(
                    "group relative block w-full overflow-hidden rounded-lg shadow-sm",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  )}
                >
                  <img
                    src={item.src}
                    alt={item.alt}
                    title={title}
                    loading="lazy"
                    decoding="async"
                    className="w-full transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100" />
                  {item.caption && (
                    <span className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 p-3 text-left text-sm font-medium text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                      {item.caption}
                    </span>
                  )}
                </button>
                {item.caption && (
                  <figcaption className="sr-only">{item.caption}</figcaption>
                )}
              </figure>
            </li>
          );
        })}
      </ul>

      <Dialog open={openIdx !== null} onOpenChange={(o) => !o && close()}>
        <DialogContent className="max-w-5xl border-0 bg-transparent p-0 shadow-none">
          {current && (
            <>
              <DialogTitle className="sr-only">{currentTitle}</DialogTitle>
              <DialogDescription className="sr-only">
                Imagem {(openIdx ?? 0) + 1} de {items.length}. Use as setas do teclado para navegar.
              </DialogDescription>
              <figure className="relative overflow-hidden rounded-lg bg-card">
                <img
                  src={current.src}
                  alt={current.alt}
                  className="max-h-[80vh] w-full object-contain"
                />
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Imagem anterior"
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <ChevronLeft className="h-6 w-6" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Próxima imagem"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <ChevronRight className="h-6 w-6" aria-hidden="true" />
                </button>
                {(current.caption || current.title) && (
                  <figcaption className="bg-card p-4 text-center text-sm text-foreground">
                    {current.caption ?? current.title}
                  </figcaption>
                )}
              </figure>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
