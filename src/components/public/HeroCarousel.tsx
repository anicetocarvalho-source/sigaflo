import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface HeroSlide {
  image: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  /** Optional secondary content rendered below the CTA (e.g. a search bar) */
  children?: React.ReactNode;
}

interface HeroCarouselProps {
  slides: HeroSlide[];
  intervalMs?: number;
}

export function HeroCarousel({ slides, intervalMs = 5500 }: HeroCarouselProps) {
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start" },
    reduced ? [] : [Autoplay({ delay: intervalMs, stopOnInteraction: false, stopOnMouseEnter: true })]
  );

  const [selected, setSelected] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  return (
    <section
      className="relative overflow-hidden bg-primary"
      aria-roledescription="carousel"
      aria-label="Destaques do Portal"
    >
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {slides.map((slide, i) => (
            <div
              key={i}
              className="relative min-w-0 flex-[0_0_100%] h-[68vh] min-h-[520px] max-h-[760px]"
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} de ${slides.length}`}
            >
              <img
                src={slide.image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
              />
              {/* Overlay gradients for legibility */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/55 to-primary/20" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

              <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl text-primary-foreground animate-fade-in">
                  {slide.eyebrow && (
                    <Badge className="mb-4 bg-accent text-accent-foreground hover:bg-accent border-0">
                      {slide.eyebrow}
                    </Badge>
                  )}
                  <h2 className="font-['Outfit'] text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight drop-shadow-md">
                    {slide.title}
                  </h2>
                  {slide.subtitle && (
                    <p className="mt-4 text-base sm:text-lg lg:text-xl text-primary-foreground/90 max-w-xl">
                      {slide.subtitle}
                    </p>
                  )}
                  {slide.ctaLabel && slide.ctaHref && (
                    <div className="mt-6">
                      <Button asChild size="lg" variant="secondary" className="h-12 px-6">
                        <Link to={slide.ctaHref}>
                          {slide.ctaLabel}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  )}
                  {slide.children && <div className="mt-6">{slide.children}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Arrows */}
      <button
        type="button"
        onClick={() => emblaApi?.scrollPrev()}
        aria-label="Slide anterior"
        className="absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full bg-background/20 p-2 text-primary-foreground backdrop-blur transition hover:bg-background/40 md:flex"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        type="button"
        onClick={() => emblaApi?.scrollNext()}
        aria-label="Próximo slide"
        className="absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full bg-background/20 p-2 text-primary-foreground backdrop-blur transition hover:bg-background/40 md:flex"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {scrollSnaps.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => emblaApi?.scrollTo(i)}
            aria-label={`Ir para o slide ${i + 1}`}
            className={cn(
              "h-2 rounded-full transition-all",
              selected === i ? "w-8 bg-primary-foreground" : "w-2 bg-primary-foreground/50 hover:bg-primary-foreground/80"
            )}
          />
        ))}
      </div>
    </section>
  );
}
