import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Printer, X } from 'lucide-react';
import type { ForestImportLicense } from '@/hooks/useForestImportLicenses';

const categoryLabels: Record<string, string> = {
  madeira: 'Madeira', sementes: 'Sementes', mudas: 'Mudas / Plantas',
  fertilizantes: 'Fertilizantes', pesticidas: 'Pesticidas',
  equipamento: 'Equipamento', racao: 'Ração', outro: 'Outro',
};

interface Props {
  open: boolean;
  onClose: () => void;
  license: ForestImportLicense | null;
}

export function ImportLicensePrintView({ open, onClose, license }: Props) {
  if (!license) return null;

  const handlePrint = () => window.print();

  const personLabel = license.person_type === 'singular' ? 'Senhor(a)' : 'Empresa';
  const docLabel = license.person_type === 'singular' ? 'BI' : 'NIF';
  const issueDate = license.issue_date
    ? format(new Date(license.issue_date), "dd 'de' MMMM 'de' yyyy", { locale: pt })
    : 'N/A';
  const proformaDate = license.proforma_invoice_date
    ? format(new Date(license.proforma_invoice_date), 'dd/MM/yy', { locale: pt })
    : 'N/A';

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto p-0">
        {/* Toolbar (no print) */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-4 py-2 print:hidden">
          <h2 className="text-sm font-semibold">Pré-visualização — Autorização de Importação</h2>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" /> Imprimir / PDF
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Document */}
        <div id="import-license-print" className="bg-white text-black p-12 font-serif leading-relaxed">
          {/* Header */}
          <div className="text-center space-y-1 mb-6">
            <p className="text-sm font-semibold uppercase tracking-wide">República de Angola</p>
            <p className="text-sm">Ministério da Agricultura e Pescas</p>
            <p className="text-sm">Instituto de Desenvolvimento Florestal</p>
            <p className="text-sm italic">Gabinete do Director Geral</p>
            <div className="mx-auto mt-2 h-0.5 w-32 bg-black" />
          </div>

          {/* Authorization number */}
          <h1 className="text-center text-lg font-bold tracking-wider my-6">
            AUTORIZAÇÃO Nº: {license.license_number}
          </h1>

          {/* Body */}
          <p className="text-justify text-sm mb-4">
            Por esta Direcção Geral do Instituto de Desenvolvimento Florestal (IDF) faz-se constar
            às autoridades a quem o conhecimento desta competir que, {license.person_type === 'singular' ? 'o(a)' : 'a'}{' '}
            <strong>{personLabel}</strong>:
          </p>

          <div className="ml-8 space-y-1 text-sm mb-4">
            <p><strong>NOME:</strong> {license.importer_name?.toUpperCase()}</p>
            <p><strong>{docLabel}:</strong> {license.document_number}</p>
            {license.address && <p><strong>ENDEREÇO:</strong> {license.address}</p>}
            {license.phone && <p><strong>CONTACTO:</strong> {license.phone}</p>}
          </div>

          <p className="text-sm mb-3">está autorizad{license.person_type === 'singular' ? 'o(a)' : 'a'} a desalfandegar:</p>

          {/* Goods table */}
          <table className="w-full border-collapse text-xs mb-6">
            <thead>
              <tr className="border-y border-black bg-gray-100">
                <th className="border-r border-black px-2 py-2 text-left">Mercadoria</th>
                <th className="border-r border-black px-2 py-2 text-left">Quantidade</th>
                <th className="border-r border-black px-2 py-2 text-left">Valor</th>
                <th className="border-r border-black px-2 py-2 text-left">Moeda</th>
                <th className="px-2 py-2 text-left">Origem</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-black">
                <td className="border-r border-black px-2 py-2">
                  {categoryLabels[license.product_category]} — {license.product_description}
                </td>
                <td className="border-r border-black px-2 py-2">
                  {Number(license.quantity).toLocaleString()} {license.unit}
                </td>
                <td className="border-r border-black px-2 py-2">
                  {license.cif_value ? Number(license.cif_value).toLocaleString() : '—'}
                </td>
                <td className="border-r border-black px-2 py-2">{license.currency || '—'}</td>
                <td className="px-2 py-2">{license.origin_country?.toUpperCase()}</td>
              </tr>
            </tbody>
          </table>

          <div className="text-sm space-y-1 mb-4">
            <p><strong>Provenientes de:</strong> {license.origin_country}</p>
            {license.entry_point && <p><strong>Posto / Porto de Entrada:</strong> {license.entry_point}</p>}
            <p><strong>Nº FACTURA PROFORMA:</strong> {license.proforma_invoice_number || 'N/A'}</p>
            <p><strong>DATA FACTURA PROFORMA:</strong> {proformaDate}</p>
          </div>

          <p className="text-xs italic mb-6">
            * Este documento é apenas válido para a importação dos bens inscritos nas facturas indicadas.
          </p>

          <p className="text-sm text-justify mb-3">
            O portador deverá cumprir com os preceitos técnicos estabelecidos no{' '}
            <strong>{license.legal_reference || 'RF. 153 do Decreto Presidencial nº 171/18 do Regulamento Florestal e Fauna Selvagem'}</strong>.
          </p>

          <p className="text-sm text-justify mb-4">
            Para que não haja impedimento mandei passar a presente autorização que vai por mim assinada e autenticada.
          </p>

          {license.requires_phytosanitary_cert && (
            <p className="text-sm font-semibold mb-6">
              OBS: O produto deve fazer-se acompanhar do Certificado Fitossanitário da origem.
            </p>
          )}

          {license.notes && (
            <p className="text-sm text-justify mb-6 italic">{license.notes}</p>
          )}

          {/* Signature block */}
          <div className="mt-12 text-center text-sm space-y-2">
            <p className="font-semibold uppercase">
              Direcção Geral do Instituto de Desenvolvimento Florestal
            </p>
            <p>EM {(license.issued_location || 'LUANDA').toUpperCase()}, aos {issueDate}</p>
            <div className="mt-10">
              <div className="mx-auto h-px w-64 bg-black" />
              <p className="mt-2 font-semibold">Aprovado pelo Director Geral</p>
              <p className="text-xs italic mt-1">
                (Documento assinado electronicamente e emitido por SEPE.gov.ao)
              </p>
            </div>
          </div>
        </div>

        <style>{`
          @media print {
            body * { visibility: hidden; }
            #import-license-print, #import-license-print * { visibility: visible; }
            #import-license-print { position: absolute; left: 0; top: 0; width: 100%; padding: 2cm; }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
