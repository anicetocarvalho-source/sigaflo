import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { formatAOA, calculateIva } from '@/lib/fiscal';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';

export interface CartItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price_aoa: number;
  iva_rate: number;
  is_exempt: boolean;
  max_stock: number;
}

interface CartPanelProps {
  items: CartItem[];
  onUpdateQty: (productId: string, qty: number) => void;
  onRemove: (productId: string) => void;
  onCheckout: () => void;
}

function CartContent({ items, onUpdateQty, onRemove, onCheckout }: CartPanelProps) {
  const subtotal = items.reduce((sum, i) => sum + i.unit_price_aoa * i.quantity, 0);
  const ivaTotal = items.reduce((sum, i) => sum + calculateIva(i.unit_price_aoa * i.quantity, i.iva_rate, i.is_exempt), 0);
  const total = subtotal + ivaTotal;

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <ShoppingBag className="h-12 w-12 mx-auto mb-2 opacity-40" />
        <p>Carrinho vazio</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map(item => (
        <div key={item.product_id} className="flex items-center gap-2 p-2 rounded-lg border bg-background">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{item.product_name}</p>
            <p className="text-xs text-muted-foreground">{formatAOA(item.unit_price_aoa)} × {item.quantity}</p>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onUpdateQty(item.product_id, item.quantity - 1)} disabled={item.quantity <= 1}>
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onUpdateQty(item.product_id, item.quantity + 1)} disabled={item.quantity >= item.max_stock}>
              <Plus className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onRemove(item.product_id)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
          <p className="text-sm font-medium w-20 text-right">{formatAOA(item.unit_price_aoa * item.quantity)}</p>
        </div>
      ))}

      <div className="border-t pt-3 space-y-1">
        <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatAOA(subtotal)}</span></div>
        <div className="flex justify-between text-sm"><span>IVA (14%)</span><span>{formatAOA(ivaTotal)}</span></div>
        <div className="flex justify-between font-bold text-lg border-t pt-2"><span>Total</span><span>{formatAOA(total)}</span></div>
      </div>

      <Button className="w-full" size="lg" onClick={onCheckout}>
        Ir para Pagamento
      </Button>
    </div>
  );
}

export function CartPanel(props: CartPanelProps) {
  const isMobile = useIsMobile();
  const totalItems = props.items.reduce((s, i) => s + i.quantity, 0);

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button className="fixed bottom-4 right-4 z-50 shadow-lg" size="lg">
            <ShoppingBag className="h-5 w-5 mr-2" />
            Carrinho
            {totalItems > 0 && <Badge className="ml-2">{totalItems}</Badge>}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh]">
          <SheetHeader>
            <SheetTitle>Carrinho ({totalItems} itens)</SheetTitle>
          </SheetHeader>
          <div className="mt-4 overflow-y-auto">
            <CartContent {...props} />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          Carrinho ({totalItems})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CartContent {...props} />
      </CardContent>
    </Card>
  );
}
