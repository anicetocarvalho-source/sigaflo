import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Printer, User } from 'lucide-react';
import type { Farmer } from '@/hooks/useFarmers';

interface FarmerCardProps {
  farmer: Farmer;
  onPrint?: () => void;
}

export const FarmerCard = ({ farmer, onPrint }: FarmerCardProps) => {
  const farmerTypeLabels: Record<string, string> = {
    individual: 'Pequeno Agricultor',
    family: 'Agricultura Familiar',
    cooperative: 'Cooperativa',
    field_school: 'Escola de Campo',
    company: 'Empresa',
  };

  const verificationUrl = `${window.location.origin}/verificar/agricultor/${farmer.id}`;

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const handleDownload = () => {
    // Create a printable version
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Cartão do Agricultor - ${farmer.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .card { 
              width: 85.6mm; 
              height: 53.98mm; 
              border: 2px solid #16a34a; 
              border-radius: 8px;
              padding: 12px;
              background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
              position: relative;
            }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
            .logo { font-weight: bold; font-size: 12px; color: #16a34a; }
            .title { font-size: 10px; color: #666; }
            .content { display: flex; gap: 12px; }
            .photo { width: 60px; height: 75px; border: 1px solid #ccc; border-radius: 4px; background: #f5f5f5; display: flex; align-items: center; justify-content: center; }
            .photo img { width: 100%; height: 100%; object-fit: cover; border-radius: 4px; }
            .info { flex: 1; }
            .name { font-weight: bold; font-size: 14px; margin-bottom: 4px; }
            .detail { font-size: 10px; color: #333; margin-bottom: 2px; }
            .badge { display: inline-block; background: #16a34a; color: white; font-size: 8px; padding: 2px 6px; border-radius: 4px; }
            .qr { position: absolute; bottom: 12px; right: 12px; }
            .footer { position: absolute; bottom: 8px; left: 12px; font-size: 8px; color: #666; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <div>
                <div class="logo">MINAGRIP</div>
                <div class="title">Cartão do Agricultor</div>
              </div>
              <span class="badge">${farmerTypeLabels[farmer.farmer_type]}</span>
            </div>
            <div class="content">
              <div class="photo">
                ${(farmer as any).photo_url 
                  ? `<img src="${(farmer as any).photo_url}" alt="Foto" />` 
                  : '<span style="font-size: 24px; color: #ccc;">👤</span>'
                }
              </div>
              <div class="info">
                <div class="name">${farmer.name}</div>
                <div class="detail"><strong>Nº:</strong> ${farmer.registration_number || 'N/A'}</div>
                <div class="detail"><strong>BI/NIF:</strong> ${farmer.bi_nif || 'N/A'}</div>
                <div class="detail"><strong>Província:</strong> ${farmer.provinces?.name || 'N/A'}</div>
                <div class="detail"><strong>Município:</strong> ${farmer.municipalities?.name || 'N/A'}</div>
              </div>
            </div>
            <div class="footer">Válido enquanto o registo estiver activo</div>
            <div class="qr">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=50x50&data=${encodeURIComponent(verificationUrl)}" width="50" height="50" />
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
    <Card className="overflow-hidden max-w-md border-2 border-green-600">
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-sm">MINAGRIP</h3>
            <p className="text-xs opacity-90">República de Angola</p>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white text-xs">
            {farmerTypeLabels[farmer.farmer_type]}
          </Badge>
        </div>
        <p className="text-xs mt-1 font-medium">Cartão do Agricultor</p>
      </div>
      
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="w-20 h-24 rounded border bg-muted flex items-center justify-center overflow-hidden">
            {(farmer as any).photo_url ? (
              <img 
                src={(farmer as any).photo_url} 
                alt="Foto" 
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="h-10 w-10 text-muted-foreground" />
            )}
          </div>
          
          <div className="flex-1 space-y-1">
            <h4 className="font-bold text-base">{farmer.name}</h4>
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Nº Registo:</span> {farmer.registration_number || 'Pendente'}
            </p>
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">BI/NIF:</span> {farmer.bi_nif || 'N/A'}
            </p>
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Província:</span> {farmer.provinces?.name || 'N/A'}
            </p>
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Município:</span> {farmer.municipalities?.name || 'N/A'}
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
