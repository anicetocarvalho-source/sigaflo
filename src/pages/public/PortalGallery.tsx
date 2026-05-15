import { useState } from "react";
import { PageHero } from "@/components/public/PageHero";
import { SeoHead } from "@/components/public/SeoHead";
import { ImageGallery } from "@/components/public/ImageGallery";
import { buildCategorizedGallery, type CategoryLabels } from "@/components/public/galleryUtils";
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

const categoryLabels: CategoryLabels = {
  agricultura: "Agricultura",
  florestas: "Florestas",
  cafe: "Café",
  arroz: "Arroz",
  comunidades: "Comunidades",
};

const items = buildCategorizedGallery(categoryLabels, [
  { src: heroFields, subject: "Campos do planalto ao amanhecer", caption: "Planalto central ao amanhecer", category: "agricultura" },
  { src: sectorAgricultura, subject: "Vista aérea de cooperativa agrícola", caption: "Mecanização cooperativa", category: "agricultura" },
  { src: gMechanization, subject: "Trator a lavrar terra", caption: "Lavoura mecanizada", category: "agricultura" },
  { src: gMarket, subject: "Mercado rural angolano", caption: "Mercados rurais", category: "comunidades" },
  { src: gCooperative, subject: "Cooperativa de agricultores", caption: "Cooperativas em acção", category: "comunidades" },
  { src: gTechnician, subject: "Técnico de extensão com tablet", caption: "Extensão rural digital", category: "comunidades" },
  { src: gWomanFarmer, subject: "Agricultora durante a colheita", caption: "Mulheres rurais", category: "comunidades" },
  { src: heroFarmer, subject: "Retrato de agricultor angolano", caption: "Identidade do produtor", category: "comunidades" },
  { src: heroCoffee, subject: "Plantação de café em encosta", caption: "Café arábica de Angola", category: "cafe" },
  { src: sectorCafe, subject: "Mãos com bagas de café maduras", caption: "Colheita manual selectiva", category: "cafe" },
  { src: gCoffeeDrying, subject: "Café em secagem em terreiro", caption: "Secagem em terreiros", category: "cafe" },
  { src: heroForest, subject: "Floresta de miombo nativa", caption: "Miombo angolano", category: "florestas" },
  { src: sectorFlorestas, subject: "Plantação industrial de pinheiros", caption: "Reflorestamento sustentável", category: "florestas" },
  { src: gNursery, subject: "Viveiro de mudas florestais", caption: "Viveiros do IDF", category: "florestas" },
  { src: gTimber, subject: "Camião com madeira certificada", caption: "Transporte certificado", category: "florestas" },
  { src: heroRice, subject: "Arrozal alagado em produção", caption: "Arroz irrigado", category: "arroz" },
  { src: sectorArroz, subject: "Espigas de arroz prontas", caption: "Arroz pronto para colher", category: "arroz" },
]);

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
