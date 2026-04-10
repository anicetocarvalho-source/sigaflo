import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer, CheckCircle, QrCode } from 'lucide-react';
import { formatAOA, getSystemId } from '@/lib/fiscal';

interface ReceiptModalProps {
  open: boolean;
  onClose: () => void;
  sale: any;
  invoice: any;
  farmer: any;
  walletBalance?: number;
}

export function ReceiptModal({ open, onClose, sale, invoice, farmer, walletBalance }: ReceiptModalProps) {
  const handlePrint = () => window.print();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md print:max-w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Recibo de Venda
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm" id="receipt-content">
          <div className="text-center border-b pb-3">
            <h3 className="font-bold text-lg">SIGAFLO — POS</h3>
            <p className="text-muted-foreground">Sistema de Ponto de Venda</p>
            <p className="text-xs text-muted-foreground">SystemID: {getSystemId()}</p>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between"><span className="text-muted-foreground">Factura:</span><span className="font-medium">{invoice?.invoice_number || 'N/A'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Data:</span><span>{new Date().toLocaleDateString('pt-AO')}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Agricultor:</span><span>{farmer?.name}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Nº Registo:</span><span>{farmer?.registration_number}</span></div>
            {sale?.representative_name && (
              <div className="flex justify-between"><span className="text-muted-foreground">Representante:</span><span>{sale.representative_name}</span></div>
            )}
          </div>

          <div className="border-t border-b py-3 space-y-1">
            <div className="flex justify-between font-medium"><span>Subtotal</span><span>{formatAOA(sale?.subtotal_aoa || 0)}</span></div>
            <div className="flex justify-between"><span>IVA</span><span>{formatAOA(sale?.iva_total_aoa || 0)}</span></div>
            <div className="flex justify-between font-bold text-lg"><span>Total</span><span>{formatAOA(sale?.total_aoa || 0)}</span></div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between"><span className="text-muted-foreground">Método:</span>
              <Badge variant="secondary">
                {sale?.payment_method === 'agropay' ? 'AgroPay' : sale?.payment_method === 'unitel_money' ? 'Unitel Money' : 'Diferido'}
              </Badge>
            </div>
            {walletBalance !== undefined && (
              <div className="flex justify-between"><span className="text-muted-foreground">Saldo Actual:</span><span className="font-medium">{formatAOA(walletBalance)}</span></div>
            )}
          </div>

          <div className="flex justify-center py-3">
            <div className="h-24 w-24 border-2 border-dashed rounded-lg flex items-center justify-center">
              <QrCode className="h-12 w-12 text-muted-foreground" />
            </div>
          </div>

          <div className="text-center text-xs text-muted-foreground border-t pt-2">
            <p>Hash: {sale?.hash_fiscal?.substring(0, 32) || 'N/A'}...</p>
            <p>Documento processado electronicamente</p>
          </div>
        </div>

        <div className="flex gap-2 print:hidden">
          <Button variant="outline" className="flex-1" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" /> Imprimir
          </Button>
          <Button className="flex-1" onClick={onClose}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
