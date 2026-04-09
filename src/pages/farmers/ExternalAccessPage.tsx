import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Share2, QrCode, ExternalLink, Check } from 'lucide-react';
import { toast } from 'sonner';

const ExternalAccessPage = () => {
  const [copied, setCopied] = useState(false);
  const registrationUrl = `${window.location.origin}/cadastro-campo`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(registrationUrl);
    setCopied(true);
    toast.success('Link copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SIGAFLO — Registo de Agricultor',
          text: 'Aceda a este link para registar um agricultor no sistema SIGAFLO',
          url: registrationUrl,
        });
      } catch {
        // User cancelled
      }
    } else {
      handleCopy();
    }
  };

  return (
    <MainLayout title="Acesso Externo" subtitle="Partilhar link de cadastro de campo">
      <div className="max-w-xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              Link de Registo Externo
            </CardTitle>
            <CardDescription>
              Partilhe este link com técnicos de campo para que possam registar agricultores remotamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-2">
              <Input value={registrationUrl} readOnly className="font-mono text-sm" />
              <Button variant="outline" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-col items-center gap-4 py-6">
              <p className="text-sm text-muted-foreground">Digitalize o QR Code com o dispositivo</p>
              <div className="p-4 bg-background border rounded-lg">
                <QRCodeSVG value={registrationUrl} size={200} />
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline">Nota</Badge>
              <span>O técnico precisa de autenticação para submeter o registo.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ExternalAccessPage;
