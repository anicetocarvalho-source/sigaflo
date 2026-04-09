import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Fingerprint } from 'lucide-react';

interface Props {
  fingerprintData?: string;
}

const FINGERS = [
  { id: 'left_5', label: 'Mínimo E', hand: 'left' },
  { id: 'left_4', label: 'Anelar E', hand: 'left' },
  { id: 'left_3', label: 'Médio E', hand: 'left' },
  { id: 'left_2', label: 'Indicador E', hand: 'left' },
  { id: 'left_1', label: 'Polegar E', hand: 'left' },
  { id: 'right_1', label: 'Polegar D', hand: 'right' },
  { id: 'right_2', label: 'Indicador D', hand: 'right' },
  { id: 'right_3', label: 'Médio D', hand: 'right' },
  { id: 'right_4', label: 'Anelar D', hand: 'right' },
  { id: 'right_5', label: 'Mínimo D', hand: 'right' },
];

export const FarmerBiometry = ({ fingerprintData }: Props) => {
  // Parse fingerprint data to determine which fingers are captured
  const capturedFingers: Set<string> = new Set();
  if (fingerprintData) {
    try {
      const parsed = JSON.parse(fingerprintData);
      if (Array.isArray(parsed)) parsed.forEach((f: string) => capturedFingers.add(f));
      else if (typeof parsed === 'object') Object.keys(parsed).forEach(k => capturedFingers.add(k));
    } catch {
      // If it's a simple string, assume some fingers are captured
      if (fingerprintData.length > 0) {
        FINGERS.forEach(f => capturedFingers.add(f.id));
      }
    }
  }

  const totalCaptured = capturedFingers.size;
  const qualityScore = totalCaptured >= 8 ? 'Excelente' : totalCaptured >= 5 ? 'Boa' : totalCaptured > 0 ? 'Parcial' : 'Pendente';
  const qualityColor = totalCaptured >= 8 ? 'bg-green-100 text-green-700' : totalCaptured >= 5 ? 'bg-yellow-100 text-yellow-700' : totalCaptured > 0 ? 'bg-orange-100 text-orange-700' : 'bg-muted text-muted-foreground';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Fingerprint className="h-5 w-5" />
            Dados Biométricos
          </span>
          <div className="flex items-center gap-2">
            <Badge className={qualityColor}>{qualityScore}</Badge>
            <span className="text-sm text-muted-foreground font-mono">{totalCaptured}/10</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-6">
          {/* Hands visual */}
          <div className="grid grid-cols-2 gap-8 w-full max-w-lg">
            {/* Left hand */}
            <div>
              <p className="text-center text-sm font-medium mb-3 text-muted-foreground">Mão Esquerda</p>
              <div className="flex justify-center gap-2">
                {FINGERS.filter(f => f.hand === 'left').map(finger => {
                  const captured = capturedFingers.has(finger.id);
                  return (
                    <div key={finger.id} className="flex flex-col items-center gap-1">
                      <div className={`w-10 h-14 rounded-t-full border-2 flex items-center justify-center transition-colors ${
                        captured 
                          ? 'bg-primary/20 border-primary' 
                          : 'bg-muted/30 border-muted-foreground/20'
                      }`}>
                        <Fingerprint className={`h-5 w-5 ${captured ? 'text-primary' : 'text-muted-foreground/30'}`} />
                      </div>
                      <span className="text-[10px] text-muted-foreground text-center leading-tight">{finger.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Right hand */}
            <div>
              <p className="text-center text-sm font-medium mb-3 text-muted-foreground">Mão Direita</p>
              <div className="flex justify-center gap-2">
                {FINGERS.filter(f => f.hand === 'right').map(finger => {
                  const captured = capturedFingers.has(finger.id);
                  return (
                    <div key={finger.id} className="flex flex-col items-center gap-1">
                      <div className={`w-10 h-14 rounded-t-full border-2 flex items-center justify-center transition-colors ${
                        captured 
                          ? 'bg-primary/20 border-primary' 
                          : 'bg-muted/30 border-muted-foreground/20'
                      }`}>
                        <Fingerprint className={`h-5 w-5 ${captured ? 'text-primary' : 'text-muted-foreground/30'}`} />
                      </div>
                      <span className="text-[10px] text-muted-foreground text-center leading-tight">{finger.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            {totalCaptured === 0 
              ? 'Nenhuma impressão digital capturada. Utilize o dispositivo biométrico para registar.' 
              : `${totalCaptured} de 10 impressões digitais capturadas.`}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
