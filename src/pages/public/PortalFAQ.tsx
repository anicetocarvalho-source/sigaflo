import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const FAQ_CATEGORIES = [
  {
    title: "Sobre o SIGAFLO",
    items: [
      { q: "O que é o SIGAFLO?", a: "O SIGAFLO (Sistema Integrado de Gestão Agropecuária e Florestal) é a plataforma oficial de informação e gestão dos sectores agrícola e florestal da República de Angola, sob tutela do Ministério da Agricultura e Pescas (MINAGRIP)." },
      { q: "Quem pode utilizar o portal?", a: "O portal público está acessível a todos os cidadãos, investigadores, investidores e entidades internacionais. O acesso institucional (backoffice) é restrito a técnicos e administradores credenciados." },
      { q: "Os dados do portal são oficiais?", a: "Sim. Os dados publicados no portal são alimentados directamente pelas bases de dados oficiais do MINAGRIP, INCA, IDF e demais entidades tuteladas." },
    ],
  },
  {
    title: "Verificação de Documentos",
    items: [
      { q: "Como verifico a autenticidade de um certificado?", a: "Aceda à secção 'Verificação' no menu principal, insira o código do documento (ex: CERT-2026-000001) ou digitalize o QR Code. O sistema confirmará a autenticidade, entidade emissora, estado e validade do documento." },
      { q: "Que tipos de documentos posso verificar?", a: "Certificados agrícolas, licenças florestais e lotes de café rastreados. Cada tipo de documento tem um formato de código específico." },
      { q: "E se o código não for reconhecido?", a: "Se o código não for encontrado, pode significar que o documento não foi emitido pelo SIGAFLO ou que o código está incorrecto. Contacte a entidade emissora para esclarecimentos." },
    ],
  },
  {
    title: "Registo de Produtores",
    items: [
      { q: "Como faço para me registar como produtor?", a: "O registo de produtores é efectuado pelos técnicos extensionistas do MINAGRIP nas comunidades. Contacte a direcção provincial de agricultura da sua província para mais informações." },
      { q: "Posso consultar o meu registo online?", a: "Sim. Na secção 'Registos' do portal, pode pesquisar pelo seu número de registo ou nome para confirmar o estado da sua inscrição." },
    ],
  },
  {
    title: "Dados e Estatísticas",
    items: [
      { q: "Posso exportar os dados do portal?", a: "Sim. Na secção 'Indicadores', pode exportar os dados filtrados em formato CSV para utilização em análises externas." },
      { q: "Com que frequência os dados são actualizados?", a: "Os dados do portal reflectem as últimas actualizações registadas no sistema. As campanhas agrícolas são actualizadas semestralmente; outros dados são actualizados em tempo real." },
      { q: "Os dados incluem informação pessoal dos agricultores?", a: "Não. Todos os dados públicos são agregados. O portal nunca expõe informação pessoal identificável (PII) dos produtores registados." },
    ],
  },
];

export default function PortalFAQ() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-['Outfit'] flex items-center gap-2">
          <HelpCircle className="h-8 w-8 text-primary" />
          Perguntas Frequentes
        </h1>
        <p className="text-muted-foreground mt-1">Respostas às dúvidas mais comuns sobre o portal</p>
      </div>

      <div className="space-y-8">
        {FAQ_CATEGORIES.map((cat, ci) => (
          <div key={ci}>
            <h2 className="text-lg font-semibold mb-3">{cat.title}</h2>
            <Accordion type="single" collapsible className="space-y-2">
              {cat.items.map((item, ii) => (
                <AccordionItem key={ii} value={`${ci}-${ii}`} className="border rounded-lg px-4">
                  <AccordionTrigger className="text-sm font-medium text-left">{item.q}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>
    </div>
  );
}
