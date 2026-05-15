import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface PageHeroProps {
  image: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /** Breadcrumb items (excluding "Início") */
  breadcrumbs?: { label: string; href?: string }[];
  children?: ReactNode;
}

export function PageHero({ image, eyebrow, title, subtitle, breadcrumbs = [], children }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-primary">
      <div className="relative h-[42vh] min-h-[320px] max-h-[460px]">
        <img
          src={image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/60 to-primary/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-10 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav aria-label="Navegação" className="mb-3 flex items-center gap-1 text-xs text-primary-foreground/85">
            <Link to="/portal" className="hover:underline">Início</Link>
            {breadcrumbs.map((b, i) => (
              <span key={i} className="flex items-center gap-1">
                <ChevronRight className="h-3 w-3" />
                {b.href ? (
                  <Link to={b.href} className="hover:underline">{b.label}</Link>
                ) : (
                  <span className="text-primary-foreground">{b.label}</span>
                )}
              </span>
            ))}
          </nav>

          {eyebrow && (
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent">
              {eyebrow}
            </p>
          )}
          <h1 className="font-['Outfit'] text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground drop-shadow-md">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-3 max-w-2xl text-base sm:text-lg text-primary-foreground/90">
              {subtitle}
            </p>
          )}
          {children && <div className="mt-4">{children}</div>}
        </div>
      </div>
    </section>
  );
}
