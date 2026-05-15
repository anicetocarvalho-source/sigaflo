import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Mail, MapPin, Building2 } from "lucide-react";

const INSTITUTIONS = [
  {
    name: "MINAGRIP",
    full: "Ministério da Agricultura e Pescas",
    description: "Entidade tutelar responsável pelas políticas agrícolas e pesqueiras de Angola.",
    phone: "+244 222 321 000",
    email: "info@minagrip.gov.ao",
    address: "Luanda, Angola",
  },
  {
    name: "INCA",
    full: "Instituto Nacional do Café de Angola",
    description: "Regulação e promoção da cadeia de valor do café angolano.",
    phone: "+244 222 334 000",
    email: "info@inca.gov.ao",
    address: "Luanda, Angola",
  },
  {
    name: "IDF",
    full: "Instituto de Desenvolvimento Florestal",
    description: "Gestão e preservação dos recursos florestais e faunísticos nacionais.",
    phone: "+244 222 327 000",
    email: "info@idf.gov.ao",
    address: "Luanda, Angola",
  },
  {
    name: "INCER",
    full: "Instituto Nacional de Cereais",
    description: "Regulação e desenvolvimento do sector cerealífero, incluindo arroz e milho.",
    phone: "+244 222 339 000",
    email: "info@incer.gov.ao",
    address: "Luanda, Angola",
  },
];

export default function PortalContacts() {
  return (
    <>
      <PageHero
        image={heroImage}
        eyebrow="Institucional"
        title="Contactos Institucionais"
        subtitle="Entidades do sector agroflorestal angolano"
        breadcrumbs={[{ label: "Contactos" }]}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {INSTITUTIONS.map((inst) => (
          <Card key={inst.name} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{inst.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">{inst.full}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{inst.description}</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{inst.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{inst.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{inst.address}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      </div>
    </>
  );
}
