import { useState } from "react";
import { PageHero } from "@/components/public/PageHero";
import { SeoHead } from "@/components/public/SeoHead";
import { ImageGallery, type GalleryItem } from "@/components/public/ImageGallery";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import heroFarmer from "@/assets/portal/hero-farmer.jpg";
import gMarket from "@/assets/portal/gallery-market.jpg";
import gCooperative from "@/assets/portal/gallery-cooperative.jpg";
import gTechnician from "@/assets/portal/gallery-technician.jpg";
import gMechanization from "@/assets/portal/gallery-mechanization.jpg";
import gCoffeeDrying from "@/assets/portal/gallery-coffee-drying.jpg";
import gNursery from "@/assets/portal/gallery-nursery.jpg";
import gWomanFarmer from "@/assets/portal/gallery-woman-farmer.jpg";
import gTimber from "@/assets/portal/gallery-timber.jpg";
import sectorAgricultura from "@/assets/portal/sector-agricultura.jpg";
import sectorFlorestas from "@/assets/portal/sector-florestas.jpg";
import sectorCafe from "@/assets/portal/sector-cafe.jpg";
import sectorArroz from "@/assets/portal/sector-arroz.jpg";
import heroFields from "@/assets/portal/hero-fields.jpg";
import heroCoffee from "@/assets/portal/hero-coffee.jpg";
import heroForest from "@/assets/portal/hero-forest.jpg";
import heroRice from "@/assets/portal/hero-rice.jpg";

const items: GalleryItem[] = [
  { src: heroFields, alt: "Campos do planalto angolano ao amanhecer", caption: "Planalto central ao amanhecer", category: "agricultura" },
  { src: sectorAgricultura, alt: "Vista aérea de cooperativa", caption: "Mecanização cooperativa", category: "agricultura" },
  { src: gMarket, alt: "Mercado rural angolano", caption: "Mercados rurais", category: "comunidades" },
  { src: gCooperative, alt: "Cooperativa de agricultores", caption: "Cooperativas em acção", category: "comunidades" },
  { src: gTechnician, alt: "Técnico no campo com tablet", caption: "Extensão rural digital", category: "comunidades" },
  { src: gMechanization, alt: "Trator a lavrar", caption: "Mecanização agrícola", category: "agricultura" },
  { src: heroCoffee, alt: "Plantação de café", caption: "Café arábica de Angola", category: "cafe" },
  { src: sectorCafe, alt: "Mãos com bagas de café", caption: "Colheita manual selectiva", category: "cafe" },
  { src: gCoffeeDrying, alt: "Café em secagem tradicional", caption: "Secagem em terreiros", category: "cafe" },
  { src: heroForest, alt: "Floresta de miombo", caption: "Miombo angolano", category: "florestas" },
  { src: sectorFlorestas, alt: "Plantação de pinheiros", caption: "Reflorestamento sustentável", category: "florestas" },
  { src: gNursery, alt: "Viveiro de plantas", caption: "Viveiros do IDF", category: "florestas" },
  { src: gTimber, alt: "Camião de madeira certificada", caption: "Transporte certificado", category: "florestas" },
  { src: heroRice, alt: "Arrozal alagado", caption: "Arroz irrigado", category: "arroz" },
  { src: sectorArroz, alt: "Espigas de arroz", caption: "Arroz pronto para colher", category: "arroz" },
  { src: gWomanFarmer, alt: "Agricultora a colher", caption: "Mulheres rurais", category: "comunidades" },
  { src: heroFarmer, alt: "Agricultor angolano", caption: "Identidade do produtor", category: "comunidades" },
];

const filters = [
  { id: "todos", label: "Todos" },
  { id: "agricultura", label: "Agricultura" },
  { id: "florestas", label: "Florestas" },
  { id: "cafe", label: "Café" },
  { id: "arroz", label: "Arroz" },
  { id: "comunidades", label: "Comunidades" },
];

export default function PortalGallery() {
  const [active, setActive] = useState("todos");

  return (
    <div>
      <SeoHead
        title="Galeria SIGAFLO — Multimédia do sector agroflorestal"
        description="Imagens das paisagens, comunidades e cadeias produtivas agroflorestais de Angola: agricultura, florestas, café, arroz e comunidades rurais."
        path="/portal/galeria"
        image={heroFarmer}
        imageAlt="Galeria multimédia do SIGAFLO"
      />
      <PageHero
        image={heroFarmer}
        eyebrow="Multimédia"
        title="Galeria SIGAFLO"
        subtitle="Imagens das paisagens, comunidades e cadeias produtivas do sector agroflorestal angolano."
        breadcrumbs={[{ label: "Galeria" }]}
      />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap gap-2">
          {filters.map((f) => (
            <Button
              key={f.id}
              variant={active === f.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActive(f.id)}
              className={cn("rounded-full")}
            >
              {f.label}
            </Button>
          ))}
        </div>

        <ImageGallery items={items} activeCategory={active} />
      </section>
    </div>
  );
}
