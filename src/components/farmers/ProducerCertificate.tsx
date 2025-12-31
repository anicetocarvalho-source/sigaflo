import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Printer, Building2, Award } from 'lucide-react';
import type { Farmer } from '@/hooks/useFarmers';

interface ProducerCertificateProps {
  farmer: Farmer;
  onPrint?: () => void;
}

export const ProducerCertificate = ({ farmer, onPrint }: ProducerCertificateProps) => {
  const verificationUrl = `${window.location.origin}/verificar/produtor/${farmer.id}`;
  const issueDate = farmer.card_generated_at 
    ? new Date(farmer.card_generated_at).toLocaleDateString('pt-AO')
    : new Date().toLocaleDateString('pt-AO');

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const handleDownload = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Certificado de Produtor - ${farmer.name}</title>
          <style>
            @page { size: A4; margin: 20mm; }
            body { 
              font-family: 'Times New Roman', serif; 
              margin: 0; 
              padding: 40px; 
              background: white;
            }
            .certificate { 
              border: 3px double #1e3a5f;
              padding: 40px;
              min-height: 80vh;
              position: relative;
              background: linear-gradient(135deg, #fafbfc 0%, #f0f4f8 100%);
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px;
              border-bottom: 2px solid #1e3a5f;
              padding-bottom: 20px;
            }
            .coat-of-arms { font-size: 48px; margin-bottom: 10px; }
            .ministry { 
              font-size: 14px; 
              color: #1e3a5f; 
              text-transform: uppercase;
              letter-spacing: 2px;
            }
            .title { 
              font-size: 28px; 
              font-weight: bold; 
              color: #1e3a5f;
              margin: 20px 0;
              text-transform: uppercase;
              letter-spacing: 3px;
            }
            .subtitle { font-size: 14px; color: #666; }
            .certificate-number { 
              font-family: monospace;
              font-size: 12px;
              color: #666;
              margin-top: 10px;
            }
            .content { 
              margin: 30px 0; 
              text-align: center;
              line-height: 1.8;
            }
            .company-name { 
              font-size: 24px; 
              font-weight: bold; 
              color: #1e3a5f;
              margin: 20px 0;
            }
            .details { 
              margin: 30px auto; 
              max-width: 400px;
              text-align: left;
              background: white;
              padding: 20px;
              border: 1px solid #ddd;
              border-radius: 4px;
            }
            .detail-row { 
              display: flex; 
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px dotted #ddd;
            }
            .detail-row:last-child { border-bottom: none; }
            .detail-label { font-weight: bold; color: #666; }
            .detail-value { color: #333; }
            .footer { 
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
            }
            .signature { 
              text-align: center;
              width: 200px;
            }
            .signature-line { 
              border-top: 1px solid #333;
              margin-top: 60px;
              padding-top: 8px;
              font-size: 12px;
            }
            .qr-section { text-align: center; }
            .qr-label { font-size: 10px; color: #666; margin-top: 4px; }
            .validity { 
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="certificate">
            <div class="header">
              <div class="coat-of-arms">🏛️</div>
              <div class="ministry">República de Angola</div>
              <div class="ministry">Ministério da Agricultura e Pescas</div>
              <div class="title">Certificado de Produtor Registado</div>
              <div class="subtitle">Certifica-se que a entidade abaixo identificada está devidamente registada</div>
              <div class="certificate-number">Nº ${farmer.registration_number || farmer.card_number || 'PENDENTE'}</div>
            </div>
            
            <div class="content">
              <p>O Ministério da Agricultura e Pescas certifica que:</p>
              <div class="company-name">${farmer.name}</div>
              ${farmer.trade_name ? `<p><em>"${farmer.trade_name}"</em></p>` : ''}
              <p>está registada como <strong>Produtor Agrícola</strong> no Sistema Integrado de Gestão Agrícola.</p>
            </div>
            
            <div class="details">
              <div class="detail-row">
                <span class="detail-label">NIF:</span>
                <span class="detail-value">${farmer.bi_nif || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Província:</span>
                <span class="detail-value">${farmer.provinces?.name || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Município:</span>
                <span class="detail-value">${farmer.municipalities?.name || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Área Produtiva:</span>
                <span class="detail-value">${farmer.cultivated_area_ha?.toFixed(2) || '—'} ha</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Data de Emissão:</span>
                <span class="detail-value">${issueDate}</span>
              </div>
            </div>
            
            <div class="footer">
              <div class="signature">
                <div class="signature-line">Director Provincial</div>
              </div>
              <div class="qr-section">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(verificationUrl)}" width="80" height="80" />
                <div class="qr-label">Verificar autenticidade</div>
              </div>
              <div class="signature">
                <div class="signature-line">Secretário de Estado</div>
              </div>
            </div>
            
            <div class="validity">
              Este certificado é válido enquanto o registo estiver activo no sistema.
            </div>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <Card className="overflow-hidden max-w-lg border-2 border-blue-800">
      <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm">REPÚBLICA DE ANGOLA</h3>
              <p className="text-xs opacity-90">Ministério da Agricultura e Pescas</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white text-xs">
            Produtor Registado
          </Badge>
        </div>
        <div className="mt-3 pt-2 border-t border-white/20">
          <p className="text-xs font-medium uppercase tracking-wider">Certificado de Produtor</p>
        </div>
      </div>
      
      <CardContent className="p-4 bg-gradient-to-b from-slate-50 to-white">
        <div className="flex gap-4">
          <div className="w-16 h-16 rounded-lg border bg-blue-100 flex items-center justify-center">
            <Building2 className="h-8 w-8 text-blue-800" />
          </div>
          
          <div className="flex-1 space-y-1">
            <h4 className="font-bold text-base">{farmer.name}</h4>
            {farmer.trade_name && (
              <p className="text-xs text-muted-foreground italic">"{farmer.trade_name}"</p>
            )}
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Nº Registo:</span> {farmer.registration_number || 'Pendente'}
            </p>
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">NIF:</span> {farmer.bi_nif || 'N/A'}
            </p>
          </div>
          
          <div className="flex flex-col items-center">
            <QRCodeSVG 
              value={verificationUrl} 
              size={64}
              level="M"
            />
            <p className="text-[8px] text-muted-foreground mt-1">Verificar</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t text-xs">
          <div>
            <span className="text-muted-foreground">Província:</span>
            <span className="ml-1 font-medium">{farmer.provinces?.name || 'N/A'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Município:</span>
            <span className="ml-1 font-medium">{farmer.municipalities?.name || 'N/A'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Área Produtiva:</span>
            <span className="ml-1 font-medium">{farmer.cultivated_area_ha?.toFixed(2) || '—'} ha</span>
          </div>
          <div>
            <span className="text-muted-foreground">Emissão:</span>
            <span className="ml-1 font-medium">{issueDate}</span>
          </div>
        </div>
        
        <div className="flex gap-2 mt-4 pt-3 border-t">
          <Button variant="outline" size="sm" className="flex-1" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          <Button variant="default" size="sm" className="flex-1" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
