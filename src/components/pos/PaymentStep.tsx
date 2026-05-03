import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Wallet, Smartphone, Clock, Lock, AlertTriangle } from 'lucide-react';
import { formatAOA, hashPin } from '@/lib/fiscal';
import { useFarmerWallet } from '@/hooks/usePOS';
import { supabase } from '@/integrations/supabase/client';

interface PaymentStepProps {
  farmer: any;
  total: number;
  hasMechanization: boolean;
  onPay: (method: string, reference?: string) => void;
  onBack: () => void;
  isProcessing: boolean;
}

export function PaymentStep({ farmer, total, hasMechanization, onPay, onBack, isProcessing }: PaymentStepProps) {
  const [method, setMethod] = useState<string>(hasMechanization ? 'deferred' : 'agropay');
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [selectedPhone, setSelectedPhone] = useState('principal');
  const { data: wallet } = useFarmerWallet(farmer?.id);

  const handlePay = async () => {
    if (method === 'agropay') {
      if (!pin || pin.length !== 4) {
        setPinError('PIN deve ter 4 dígitos');
        return;
      }
      if (wallet?.id) {
        const hashed = await hashPin(pin);
        const { data: valid, error } = await supabase.rpc('verify_farmer_wallet_pin', {
          _wallet_id: wallet.id,
          _pin_hash: hashed,
        });
        if (error || !valid) {
          setPinError('PIN inválido');
          return;
        }
      }
      if (wallet && wallet.balance_aoa < total) {
        setPinError('Saldo insuficiente');
        return;
      }
      onPay('agropay', `AGROPAY-${Date.now()}`);
    } else if (method === 'unitel_money') {
      onPay('unitel_money', `UM-${selectedPhone}-${Date.now()}`);
    } else {
      onPay('deferred');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Método de Pagamento</CardTitle>
        <p className="text-2xl font-bold">{formatAOA(total)}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup value={method} onValueChange={setMethod} className="space-y-3">
          <div className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer ${method === 'agropay' ? 'border-primary bg-primary/5' : ''}`}>
            <RadioGroupItem value="agropay" id="agropay" />
            <Label htmlFor="agropay" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                <span className="font-medium">AgroPay</span>
                {wallet && <Badge variant="secondary">Saldo: {formatAOA(wallet.balance_aoa)}</Badge>}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Débito na carteira digital</p>
            </Label>
          </div>
          <div className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer ${method === 'unitel_money' ? 'border-primary bg-primary/5' : ''}`}>
            <RadioGroupItem value="unitel_money" id="unitel_money" />
            <Label htmlFor="unitel_money" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-orange-500" />
                <span className="font-medium">Unitel Money</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Pagamento móvel</p>
            </Label>
          </div>
          {hasMechanization && (
            <div className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer ${method === 'deferred' ? 'border-primary bg-primary/5' : ''}`}>
              <RadioGroupItem value="deferred" id="deferred" />
              <Label htmlFor="deferred" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-500" />
                  <span className="font-medium">Pagamento Diferido</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Mecanização — aguarda validação satélite</p>
              </Label>
            </div>
          )}
        </RadioGroup>

        {method === 'agropay' && (
          <div className="space-y-3 p-4 rounded-lg bg-muted/50 border">
            <Label className="flex items-center gap-2"><Lock className="h-4 w-4" /> PIN de Segurança (4 dígitos)</Label>
            <Input type="password" maxLength={4} value={pin} onChange={e => { setPin(e.target.value.replace(/\D/g, '')); setPinError(''); }} placeholder="••••" className="text-center text-2xl tracking-widest max-w-[200px]" />
            {pinError && <p className="text-sm text-destructive">{pinError}</p>}
          </div>
        )}

        {method === 'unitel_money' && (
          <div className="space-y-3 p-4 rounded-lg bg-muted/50 border">
            <Label>Seleccione o telefone</Label>
            <RadioGroup value={selectedPhone} onValueChange={setSelectedPhone}>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="principal" id="phone-main" />
                <Label htmlFor="phone-main">Principal: {farmer.phone || 'N/A'}</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="alternativo" id="phone-alt" />
                <Label htmlFor="phone-alt">Alternativo: {farmer.phone_alt || 'N/A'}</Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {method === 'deferred' && (
          <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
            <p className="text-sm text-amber-800">⏳ Pagamento pendente — aguarda validação satélite. O registo será criado sem débito imediato.</p>
          </div>
        )}

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onBack}>Voltar</Button>
          <Button onClick={handlePay} disabled={isProcessing} size="lg">
            {isProcessing ? 'A processar...' : method === 'deferred' ? 'Registar Pedido' : 'Confirmar Pagamento'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
