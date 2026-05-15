import { ReactNode } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ContentCarouselProps {
  children: ReactNode[];
  /** Tailwind basis classes for each item — defaults to 1/2/3 columns */
  itemClassName?: string;
  showArrows?: boolean;
}

export function ContentCarousel({
  children,
  itemClassName = "basis-full sm:basis-1/2 lg:basis-1/3",
  showArrows = true,
}: ContentCarouselProps) {
  return (
    <Carousel opts={{ align: "start", loop: false }} className="w-full">
      <CarouselContent className="-ml-4">
        {children.map((node, i) => (
          <CarouselItem key={i} className={`pl-4 ${itemClassName}`}>
            {node}
          </CarouselItem>
        ))}
      </CarouselContent>
      {showArrows && (
        <>
          <CarouselPrevious className="hidden md:flex -left-4" />
          <CarouselNext className="hidden md:flex -right-4" />
        </>
      )}
    </Carousel>
  );
}
