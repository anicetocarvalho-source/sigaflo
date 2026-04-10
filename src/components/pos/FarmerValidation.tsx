import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, XCircle, User } from 'lucide-react';

interface FarmerValidationProps {
  farmer: any;
  representative?: { name: string; bi: string; relationship: string };
  onContinue: () => void;
  onBack: () => void;
}

export function FarmerValidation({ farmer, representative, onContinue, onBack }: FarmerValidationProps) {
  const isValid = farmer.status === 'active';
  const isSuspended = farmer.status === 'suspended';

  return (
    <Card className={!isValid ? 'opacity-60 grayscale' : ''}>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className={`h-16 w-16 rounded-full flex items-center justify-center ${isValid ? 'bg-green-100' : 'bg-red-100'}`}>
            <User className={`h-8 w-8 ${isValid ? 'text-green-600' : 'text-red-600'}`} />
          </div>
          <div>
            <h3 className="text-xl font-semibold">{farmer.name}</h3>
            <p className="text-muted-foreground">{farmer.registration_number}</p>
          </div>
          <div className="ml-auto">
            {isValid ? (
              <span className="flex items-center gap-1 text-green-600 font-medium">
                <CheckCircle className="h-5 w-5" /> Perfil Válido
              </span>
            ) : isSuspended ? (
              <span className="flex items-center gap-1 text-red-600 font-medium">
                <XCircle className="h-5 w-5" /> Perfil Suspenso
              </span>
            ) : (
              <span className="flex items-center gap-1 text-yellow-600 font-medium">
                <AlertTriangle className="h-5 w-5" /> Perfil em Rascunho
              </span>
            )}
          </div>
        </div>

        {representative && (
          <div className="p-3 bg-muted/50 rounded-lg border">
            <p className="text-sm font-medium">Representante: {representative.name}</p>
            <p className="text-sm text-muted-foreground">BI: {representative.bi} • {representative.relationship}</p>
          </div>
        )}

        {!isValid && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive font-medium">
              {isSuspended 
                ? 'Este agricultor está suspenso. Não é possível realizar vendas.' 
                : 'Este perfil está em rascunho. O agricultor deve ser validado antes de comprar.'}
            </p>
          </div>
        )}

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onBack}>Voltar</Button>
          <Button onClick={onContinue} disabled={!isValid}>Continuar</Button>
        </div>
      </CardContent>
    </Card>
  );
}
