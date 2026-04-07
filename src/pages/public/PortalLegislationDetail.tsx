import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { usePublicLegislationDetail } from "@/hooks/usePublicLegislation";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

const TYPE_LABELS: Record<string, string> = {
  decree: "Decreto", law: "Lei", notice: "Aviso", regulation: "Regulamento", resolution: "Resolução", directive: "Directiva",
};
const SECTOR_LABELS: Record<string, string> = {
  agriculture: "Agricultura", forestry: "Florestas", coffee: "Café", rice: "Arroz", general: "Geral",
};

export default function PortalLegislationDetail() {
  const { id } = useParams();
  const { data: doc, isLoading } = usePublicLegislationDetail(id);

  if (isLoading) return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Skeleton className="h-8 w-64 mb-4" />
      <Skeleton className="h-96" />
    </div>
  );

  if (!doc) return (
    <div className="max-w-4xl mx-auto px-4 py-10 text-center">
      <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
      <p className="text-lg font-semibold">Documento não encontrado</p>
      <Link to="/portal/legislacao"><Button variant="outline" className="mt-4"><ArrowLeft className="h-4 w-4 mr-2" />Voltar</Button></Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/portal/legislacao" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Voltar à Legislação
      </Link>

      <Card>
        <CardContent className="p-8">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge>{TYPE_LABELS[doc.legislation_type] || doc.legislation_type}</Badge>
            <Badge variant="outline">{SECTOR_LABELS[doc.sector] || doc.sector}</Badge>
          </div>

          <h1 className="text-2xl font-bold font-['Outfit'] mb-2">{doc.title}</h1>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
            {doc.reference_number && <span>Ref: {doc.reference_number}</span>}
            <span>Publicado em {format(new Date(doc.published_date), "d 'de' MMMM 'de' yyyy", { locale: pt })}</span>
          </div>

          {doc.summary && (
            <div className="bg-muted rounded-lg p-4 mb-6">
              <p className="text-sm font-medium mb-1">Resumo</p>
              <p className="text-sm text-muted-foreground">{doc.summary}</p>
            </div>
          )}

          {doc.content && (
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{doc.content}</div>
            </div>
          )}

          {doc.pdf_url && (
            <div className="mt-6 pt-6 border-t">
              <a href={doc.pdf_url} target="_blank" rel="noopener noreferrer">
                <Button><Download className="h-4 w-4 mr-2" /> Descarregar PDF</Button>
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
