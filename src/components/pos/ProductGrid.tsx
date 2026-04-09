import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Package, Search } from 'lucide-react';
import { usePOSProducts } from '@/hooks/usePOS';
import { formatAOA } from '@/lib/fiscal';

interface ProductGridProps {
  onAddToCart: (product: any) => void;
  cartItems: any[];
}

export function ProductGrid({ onAddToCart, cartItems }: ProductGridProps) {
  const { data: products, isLoading } = usePOSProducts();
  const [filter, setFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const categories = [...new Set(products?.map(p => p.category) || [])];
  
  const filtered = products?.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(filter.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }) || [];

  const getCartQty = (productId: string) => cartItems.find(i => i.product_id === productId)?.quantity || 0;

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">A carregar produtos...</div>;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Pesquisar produtos..." value={filter} onChange={e => setFilter(e.target.value)} />
        </div>
        <div className="flex gap-1 flex-wrap">
          <Badge variant={categoryFilter === 'all' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setCategoryFilter('all')}>Todos</Badge>
          {categories.map(cat => (
            <Badge key={cat} variant={categoryFilter === cat ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setCategoryFilter(cat)}>
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-2 opacity-40" />
          <p>Nenhum produto encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(product => {
            const inCart = getCartQty(product.id);
            return (
              <Card key={product.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{product.name}</h4>
                      <Badge variant="secondary" className="text-xs mt-1">{product.category}</Badge>
                    </div>
                    {inCart > 0 && (
                      <Badge className="bg-primary">{inCart} no carrinho</Badge>
                    )}
                  </div>
                  <div className="flex items-end justify-between mt-3">
                    <div>
                      <p className="text-lg font-bold">{formatAOA(product.price_aoa)}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.is_exempt ? 'Isento IVA' : `IVA ${product.iva_rate}%`} • {product.unit} • Stock: {product.stock}
                      </p>
                    </div>
                    <Button size="sm" onClick={() => onAddToCart(product)} disabled={product.stock <= inCart}>
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
