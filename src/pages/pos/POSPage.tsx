import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FarmerSearch } from '@/components/pos/FarmerSearch';
import { FarmerValidation } from '@/components/pos/FarmerValidation';
import { ProductGrid } from '@/components/pos/ProductGrid';
import { CartPanel, CartItem } from '@/components/pos/CartPanel';
import { PaymentStep } from '@/components/pos/PaymentStep';
import { ReceiptModal } from '@/components/pos/ReceiptModal';
import { useCreateSale } from '@/hooks/usePOS';
import { useCreateServiceOrder } from '@/hooks/useMechanization';
import { generateFiscalHash, calculateIva, generateQRData, formatAOA } from '@/lib/fiscal';
import { CheckCircle, ShoppingCart, User, CreditCard, Receipt } from 'lucide-react';

const STEPS = [
  { label: 'Agricultor', icon: User },
  { label: 'Validação', icon: CheckCircle },
  { label: 'Produtos', icon: ShoppingCart },
  { label: 'Pagamento', icon: CreditCard },
  { label: 'Recibo', icon: Receipt },
];

export default function POSPage() {
  const [step, setStep] = useState(0);
  const [farmer, setFarmer] = useState<any>(null);
  const [representative, setRepresentative] = useState<any>(undefined);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [saleResult, setSaleResult] = useState<any>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const createSale = useCreateSale();
  const createServiceOrder = useCreateServiceOrder();

  const handleFarmerSelect = (f: any, rep?: any) => {
    setFarmer(f);
    setRepresentative(rep);
    setStep(1);
  };

  const addToCart = (product: any) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.product_id === product.id);
      if (existing) {
        return prev.map(i => i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, {
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        unit_price_aoa: product.price_aoa,
        iva_rate: product.iva_rate,
        is_exempt: product.is_exempt,
        max_stock: product.stock,
      }];
    });
  };

  const updateQty = (productId: string, qty: number) => {
    if (qty < 1) return;
    setCartItems(prev => prev.map(i => i.product_id === productId ? { ...i, quantity: qty } : i));
  };

  const removeItem = (productId: string) => {
    setCartItems(prev => prev.filter(i => i.product_id !== productId));
  };

  const subtotal = cartItems.reduce((s, i) => s + i.unit_price_aoa * i.quantity, 0);
  const ivaTotal = cartItems.reduce((s, i) => s + calculateIva(i.unit_price_aoa * i.quantity, i.iva_rate, i.is_exempt), 0);
  const total = subtotal + ivaTotal;
  const hasMechanization = cartItems.some(i => i.product_name?.toLowerCase().includes('mecanização'));

  const handlePay = async (method: string, reference?: string) => {
    const dateStr = new Date().toISOString().split('T')[0];
    const hash = await generateFiscalHash('TEMP', total, dateStr);
    const qr = generateQRData({ invoiceNumber: 'TEMP', total, date: dateStr, hash });

    const items = cartItems.map(i => ({
      product_id: i.product_id,
      product_name: i.product_name,
      quantity: i.quantity,
      unit_price_aoa: i.unit_price_aoa,
      iva_rate: i.iva_rate,
      iva_value_aoa: calculateIva(i.unit_price_aoa * i.quantity, i.iva_rate, i.is_exempt),
      subtotal_aoa: i.unit_price_aoa * i.quantity + calculateIva(i.unit_price_aoa * i.quantity, i.iva_rate, i.is_exempt),
      is_exempt: i.is_exempt,
    }));

    const result = await createSale.mutateAsync({
      farmer_id: farmer.id,
      subtotal_aoa: subtotal,
      iva_total_aoa: ivaTotal,
      total_aoa: total,
      payment_method: method,
      payment_reference: reference,
      representative_name: representative?.name,
      representative_bi: representative?.bi,
      representative_relationship: representative?.relationship,
      hash_fiscal: hash,
      hash_anterior: '0',
      qr_data: qr,
      items,
    });
    setSaleResult(result);
    setStep(4);
    setShowReceipt(true);
  };

  const reset = () => {
    setStep(0);
    setFarmer(null);
    setRepresentative(undefined);
    setCartItems([]);
    setSaleResult(null);
    setShowReceipt(false);
  };

  return (
    <MainLayout title="Ponto de Venda (POS)" subtitle="Fluxo guiado de venda com compliance fiscal AGT">
      <div className="space-y-6">
        {/* Stepper */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${i === step ? 'bg-primary text-primary-foreground' : i < step ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                <s.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`w-8 h-0.5 ${i < step ? 'bg-primary' : 'bg-muted'}`} />}
            </div>
          ))}
        </div>

        {step === 0 && <FarmerSearch onSelect={handleFarmerSelect} />}
        {step === 1 && farmer && (
          <FarmerValidation farmer={farmer} representative={representative} onContinue={() => setStep(2)} onBack={() => setStep(0)} />
        )}
        {step === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ProductGrid onAddToCart={addToCart} cartItems={cartItems} />
            </div>
            <div>
              <CartPanel items={cartItems} onUpdateQty={updateQty} onRemove={removeItem} onCheckout={() => setStep(3)} />
            </div>
          </div>
        )}
        {step === 3 && (
          <PaymentStep farmer={farmer} total={total} hasMechanization={hasMechanization} onPay={handlePay} onBack={() => setStep(2)} isProcessing={createSale.isPending} />
        )}
        {step === 4 && (
          <Card>
            <CardContent className="py-12 text-center space-y-4">
              <CheckCircle className="h-16 w-16 mx-auto text-green-600" />
              <h2 className="text-2xl font-bold">Venda Concluída!</h2>
              <p className="text-muted-foreground">Factura: {saleResult?.invoice?.invoice_number}</p>
              <div className="flex gap-2 justify-center">
                <Badge variant="secondary" className="text-sm">Total: {formatAOA(total)}</Badge>
              </div>
              <div className="flex gap-2 justify-center">
                <button onClick={() => setShowReceipt(true)} className="text-primary underline text-sm">Ver Recibo</button>
                <button onClick={reset} className="text-primary underline text-sm">Nova Venda</button>
              </div>
            </CardContent>
          </Card>
        )}

        <ReceiptModal
          open={showReceipt}
          onClose={() => setShowReceipt(false)}
          sale={saleResult?.sale}
          invoice={saleResult?.invoice}
          farmer={farmer}
        />
      </div>
    </MainLayout>
  );
}
