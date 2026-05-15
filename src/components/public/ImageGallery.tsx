import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface GalleryItem {
  src: string;
  alt: string;
  caption?: string;
  category?: string;
}

interface ImageGalleryProps {
  items: GalleryItem[];
  /** Optional category filter — items must include `category` */
  activeCategory?: string;
}

export function ImageGallery({ items, activeCategory }: ImageGalleryProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const filtered =
    activeCategory && activeCategory !== "todos"
      ? items.filter((i) => i.category === activeCategory)
      : items;

  return (
    <>
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4 [&>*]:mb-4 [&>*]:break-inside-avoid">
        {filtered.map((item, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setOpenIdx(items.indexOf(item))}
            className={cn(
              "group relative block w-full overflow-hidden rounded-lg shadow-sm",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            )}
          >
            <img
              src={item.src}
              alt={item.alt}
              loading="lazy"
              decoding="async"
              className="w-full transition-transform duration-500 ease-out group-hover:scale-105"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            {item.caption && (
              <span className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 p-3 text-left text-sm font-medium text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                {item.caption}
              </span>
            )}
          </button>
        ))}
      </div>

      <Dialog open={openIdx !== null} onOpenChange={(o) => !o && setOpenIdx(null)}>
        <DialogContent className="max-w-5xl border-0 bg-transparent p-0 shadow-none">
          {openIdx !== null && (
            <figure className="overflow-hidden rounded-lg bg-card">
              <img
                src={items[openIdx].src}
                alt={items[openIdx].alt}
                className="max-h-[80vh] w-full object-contain"
              />
              {items[openIdx].caption && (
                <figcaption className="bg-card p-4 text-center text-sm text-foreground">
                  {items[openIdx].caption}
                </figcaption>
              )}
            </figure>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
