import { Card, CardContent } from "@/components/ui/card";
import { Leaf, Building2, TreePine, Coffee, BarChart3, Shield, Users, Globe } from "lucide-react";

export default function PortalAbout() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-['Outfit'] mb-2">Sobre o SIGAFLO</h1>
        <p className="text-muted-foreground">Sistema Integrado de Gestão Agropecuária e Florestal</p>
      </div>

      {/* Mission */}
      <Card className="mb-8 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-primary to-accent" />
        <CardContent className="p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Leaf className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-3">Missão</h2>
              <p className="text-muted-foreground leading-relaxed">
                O SIGAFLO é a plataforma digital oficial para a gestão integrada dos sectores agropecuário e florestal 
                da República de Angola. Desenvolvido para servir instituições governamentais, técnicos de campo, 
                operadores privados e o público, o sistema centraliza informação, promove a transparência e suporta 
                a tomada de decisão baseada em dados.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Capabilities */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Capacidades</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: Users, title: "Registo Nacional de Agricultores", desc: "Cadastro completo de agricultores individuais, familiares, cooperativas e escolas de campo." },
            { icon: TreePine, title: "Gestão Florestal", desc: "Licenciamento, rastreabilidade de madeira, fiscalização e programas de reflorestamento." },
            { icon: Coffee, title: "Cadeia do Café", desc: "Semaforização de lotes, controlo de qualidade e verificação pública de exportações." },
            { icon: BarChart3, title: "Observatório Nacional", desc: "Indicadores agregados, previsões e análise de tendências para decisores." },
            { icon: Shield, title: "Risco Climático", desc: "Monitoramento de ocorrências climáticas e fitossanitárias com alertas automáticos." },
            { icon: Globe, title: "Portal Público", desc: "Acesso a indicadores agregados e verificação de autenticidade de documentos oficiais." },
          ].map((cap, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <cap.icon className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-1">{cap.title}</h3>
                <p className="text-sm text-muted-foreground">{cap.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Institutions */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Instituições Parceiras</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: "MINAGRIP", full: "Ministério da Agricultura e Pescas", desc: "Tutela governamental e coordenação estratégica." },
            { name: "INCA", full: "Instituto Nacional de Cereais", desc: "Gestão cerealífera e políticas de soberania alimentar." },
            { name: "IDF", full: "Instituto de Desenvolvimento Florestal", desc: "Gestão florestal, licenciamento e fiscalização." },
            { name: "INE", full: "Instituto Nacional de Estatística", desc: "Dados estatísticos e indicadores nacionais." },
          ].map((inst, i) => (
            <Card key={i}>
              <CardContent className="p-5 text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Building2 className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-bold text-lg">{inst.name}</h3>
                <p className="text-xs text-muted-foreground mb-2">{inst.full}</p>
                <p className="text-sm text-muted-foreground">{inst.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Contact */}
      <Card>
        <CardContent className="p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Contacto</h2>
          <p className="text-muted-foreground mb-4">
            Para questões relacionadas com a plataforma SIGAFLO, contacte as instituições responsáveis.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
            <div>
              <p className="font-semibold text-foreground">Email</p>
              <p>info@sigaflo.gov.ao</p>
            </div>
            <div className="hidden sm:block text-muted">|</div>
            <div>
              <p className="font-semibold text-foreground">Localização</p>
              <p>Luanda, Angola</p>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </>
  );
}
