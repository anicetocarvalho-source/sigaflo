import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Printer, User, Fingerprint, Phone, Calendar, MapPin } from 'lucide-react';
import type { Farmer } from '@/hooks/useFarmers';

interface FarmerCardProps {
  farmer: Farmer;
  onPrint?: () => void;
  showActions?: boolean;
}

const formatBI = (bi?: string | null): string => {
  if (!bi) return '—';
  const digits = bi.replace(/\s/g, '');
  return digits.replace(/(.{4})/g, '$1 ').trim();
};

const getInitials = (name: string): string => {
  const parts = name.split(' ').filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (parts[0]?.[0] || '?').toUpperCase();
};

const farmerTypeLabels: Record<string, string> = {
  individual: 'Pequeno Agricultor',
  family: 'Agricultura Familiar',
  cooperative: 'Cooperativa',
  field_school: 'Escola de Campo',
  company: 'Empresa',
};

export const FarmerCard = ({ farmer, onPrint, showActions = true }: FarmerCardProps) => {
  const [flipped, setFlipped] = useState(false);

  const qrPayload = JSON.stringify({
    plataforma: 'ONAPA',
    id: farmer.id,
    nome: farmer.name,
    bi: farmer.bi_nif || '',
    provincia: farmer.provinces?.name || '',
    municipio: farmer.municipalities?.name || '',
  });

  const hasBiometry = !!(farmer as any).fingerprint_data;

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
          <title>Cartão do Agricultor - ${farmer.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; display: flex; gap: 20px; }
            .card { width: 85.6mm; height: 53.98mm; border-radius: 10px; overflow: hidden; position: relative; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
            .front { background: linear-gradient(135deg, #166534 0%, #15803d 50%, #22c55e 100%); color: white; padding: 10px 14px; }
            .back { background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%); color: #1a1a1a; padding: 12px 14px; }
            .header-line { font-size: 7px; opacity: 0.8; text-transform: uppercase; letter-spacing: 0.5px; }
            .ministry { font-size: 8px; font-weight: 600; margin: 1px 0; }
            .onapa { font-size: 9px; font-weight: 700; letter-spacing: 1px; }
            .photo { width: 55px; height: 68px; border-radius: 6px; border: 2px solid rgba(255,255,255,0.4); overflow: hidden; background: rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; }
            .photo img { width: 100%; height: 100%; object-fit: cover; }
            .name { font-size: 13px; font-weight: 700; margin-bottom: 2px; }
            .bi { font-size: 11px; font-family: monospace; letter-spacing: 1.5px; opacity: 0.9; }
            .detail { font-size: 8px; opacity: 0.8; margin-top: 2px; }
            .reg { font-size: 9px; font-family: monospace; margin-top: 4px; }
            .badge { display: inline-block; background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 4px; font-size: 7px; }
            .bio-badge { display: inline-flex; align-items: center; gap: 3px; font-size: 7px; padding: 2px 6px; border-radius: 4px; }
            .bio-ok { background: rgba(255,255,255,0.25); }
            .bio-pending { background: rgba(255,200,0,0.3); }
            .back-label { font-size: 8px; color: #666; margin-bottom: 1px; }
            .back-value { font-size: 10px; font-weight: 600; margin-bottom: 6px; }
            .qr-section { position: absolute; bottom: 10px; right: 10px; }
            .back-footer { position: absolute; bottom: 6px; left: 14px; right: 80px; font-size: 7px; color: #888; }
          </style>
        </head>
        <body>
          <div class="card front">
            <div style="margin-bottom: 6px;">
              <div class="header-line">República de Angola</div>
              <div class="ministry">Ministério da Agricultura e Pescas</div>
              <div class="onapa">ONAPA</div>
            </div>
            <div style="display: flex; gap: 10px;">
              <div class="photo">
                ${farmer.photo_url ? `<img src="${farmer.photo_url}" />` : `<span style="font-size:22px; color: rgba(255,255,255,0.5);">👤</span>`}
              </div>
              <div style="flex: 1;">
                <div class="name">${farmer.name}</div>
                <div class="bi">${formatBI(farmer.bi_nif)}</div>
                <div class="detail">${farmer.provinces?.name || ''}, ${farmer.municipalities?.name || ''}</div>
                <div class="reg">Nº ${farmer.registration_number || '—'}</div>
                <div style="margin-top: 4px; display: flex; gap: 4px; flex-wrap: wrap;">
                  <span class="badge">${farmerTypeLabels[farmer.farmer_type] || farmer.farmer_type}</span>
                  <span class="bio-badge ${hasBiometry ? 'bio-ok' : 'bio-pending'}">${hasBiometry ? '✅ Biometria' : '⏳ Biometria'}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="card back" style="position: relative;">
            <div style="display: flex; gap: 16px;">
              <div style="flex: 1;">
                <div class="back-label">BI / NIF</div>
                <div class="back-value">${formatBI(farmer.bi_nif)}</div>
                <div class="back-label">Telefone</div>
                <div class="back-value">${farmer.phone || '—'}</div>
                <div class="back-label">Província / Município</div>
                <div class="back-value">${farmer.provinces?.name || '—'} / ${farmer.municipalities?.name || '—'}</div>
                <div class="back-label">Área Total</div>
                <div class="back-value">${farmer.total_area_ha ? farmer.total_area_ha.toFixed(1) + ' ha' : '—'}</div>
              </div>
            </div>
            <div class="qr-section">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=70x70&data=${encodeURIComponent(qrPayload)}" width="70" height="70" />
            </div>
            <div class="back-footer">Válido enquanto o registo estiver activo · ONAPA</div>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 500);
    }
  };

  return (
    <div className="space-y-4">
      {/* 3D Flip Card */}
      <div
        className="cursor-pointer mx-auto"
        style={{ perspective: '1000px', width: '380px', height: '240px' }}
        onClick={() => setFlipped(!flipped)}
        title="Clique para virar o cartão"
      >
        <div
          className="relative w-full h-full transition-transform duration-700"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* FRONT */}
          <div
            className="absolute inset-0 rounded-xl overflow-hidden shadow-lg"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="w-full h-full bg-gradient-to-br from-green-800 via-green-700 to-green-500 text-white p-4 flex flex-col">
              {/* Header */}
              <div className="mb-3">
                <p className="text-[9px] uppercase tracking-wider opacity-70">República de Angola</p>
                <p className="text-[10px] font-semibold">Ministério da Agricultura e Pescas</p>
                <p className="text-xs font-bold tracking-widest">ONAPA</p>
              </div>

              {/* Body */}
              <div className="flex gap-3 flex-1">
                {/* Photo */}
                <div className="w-16 h-20 rounded-lg border-2 border-white/30 overflow-hidden bg-white/10 flex items-center justify-center flex-shrink-0">
                  {farmer.photo_url ? (
                    <img src={farmer.photo_url} alt={farmer.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-green-600 text-white text-lg font-bold">
                      {getInitials(farmer.name)}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{farmer.name}</p>
                  <p className="text-xs font-mono tracking-widest opacity-90 mt-0.5">{formatBI(farmer.bi_nif)}</p>
                  <p className="text-[9px] opacity-70 mt-1 flex items-center gap-1">
                    <MapPin className="h-2.5 w-2.5" />
                    {farmer.provinces?.name || '—'}, {farmer.municipalities?.name || '—'}
                  </p>
                  <p className="text-[10px] font-mono mt-1 opacity-80">Nº {farmer.registration_number || '—'}</p>

                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    <span className="text-[8px] bg-white/20 px-1.5 py-0.5 rounded">
                      {farmerTypeLabels[farmer.farmer_type] || farmer.farmer_type}
                    </span>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded flex items-center gap-0.5 ${hasBiometry ? 'bg-white/25' : 'bg-yellow-400/30'}`}>
                      <Fingerprint className="h-2 w-2" />
                      {hasBiometry ? 'Verificado' : 'Pendente'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Overlay if not issued */}
              {farmer.status !== 'approved' && farmer.status !== 'issued' && (
                <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                  <Badge variant="secondary" className="text-sm px-3 py-1.5">Aguardando Validação</Badge>
                </div>
              )}
            </div>
          </div>

          {/* BACK */}
          <div
            className="absolute inset-0 rounded-xl overflow-hidden shadow-lg"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div className="w-full h-full bg-gradient-to-br from-green-50 via-green-100 to-green-50 p-4 flex">
              {/* Info columns */}
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wide">BI / NIF</p>
                  <p className="text-xs font-semibold font-mono">{formatBI(farmer.bi_nif)}</p>
                </div>
                <div>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Telefone</p>
                  <p className="text-xs font-semibold flex items-center gap-1">
                    <Phone className="h-2.5 w-2.5" />
                    {farmer.phone || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Província / Município</p>
                  <p className="text-xs font-semibold">{farmer.provinces?.name || '—'} / {farmer.municipalities?.name || '—'}</p>
                </div>
                <div>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Área Total</p>
                  <p className="text-xs font-semibold">{farmer.total_area_ha ? `${farmer.total_area_ha.toFixed(1)} ha` : '—'}</p>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center justify-center ml-3">
                <QRCodeSVG
                  value={qrPayload}
                  size={90}
                  level="M"
                  bgColor="transparent"
                />
                <p className="text-[7px] text-muted-foreground mt-1">Verificar</p>
              </div>

              {/* Footer */}
              <p className="absolute bottom-2 left-4 right-4 text-[7px] text-muted-foreground">
                Válido enquanto o registo estiver activo · ONAPA · Sistema Nacional de Registo Agroflorestal
              </p>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-center text-muted-foreground">Clique no cartão para virar</p>

      {/* Action buttons */}
      {showActions && (
        <div className="flex gap-2 justify-center">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          <Button variant="default" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      )}
    </div>
  );
};
