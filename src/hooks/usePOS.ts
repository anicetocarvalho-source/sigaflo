import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function usePOSProducts() {
  return useQuery({
    queryKey: ['pos-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pos_products')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function usePOSSales() {
  return useQuery({
    queryKey: ['pos-sales'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pos_sales')
        .select('*, farmers(name, registration_number)')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sale: {
      farmer_id: string;
      subtotal_aoa: number;
      iva_total_aoa: number;
      total_aoa: number;
      payment_method: string;
      payment_reference?: string;
      representative_name?: string;
      representative_bi?: string;
      representative_relationship?: string;
      hash_fiscal?: string;
      hash_anterior?: string;
      qr_data?: string;
      items: Array<{
        product_id: string;
        product_name: string;
        quantity: number;
        unit_price_aoa: number;
        iva_rate: number;
        iva_value_aoa: number;
        subtotal_aoa: number;
        is_exempt: boolean;
      }>;
    }) => {
      const { items, ...saleData } = sale;
      const { data: user } = await supabase.auth.getUser();
      
      const { data: saleRecord, error: saleError } = await supabase
        .from('pos_sales')
        .insert({ ...saleData, operator_id: user.user?.id } as any)
        .select()
        .single();
      if (saleError) throw saleError;

      const saleItems = items.map(item => ({
        ...item,
        sale_id: saleRecord.id,
      }));
      const { error: itemsError } = await supabase
        .from('pos_sale_items')
        .insert(saleItems as any);
      if (itemsError) throw itemsError;

      // Create invoice
      const { data: invoice, error: invError } = await supabase
        .from('invoices')
        .insert({
          invoice_number: '',
          series_code: 'FR',
          sale_id: saleRecord.id,
          farmer_id: sale.farmer_id,
          operator_id: user.user?.id,
          subtotal_aoa: sale.subtotal_aoa,
          iva_total_aoa: sale.iva_total_aoa,
          total_aoa: sale.total_aoa,
          hash_fiscal: sale.hash_fiscal,
          hash_anterior: sale.hash_anterior,
          qr_data: sale.qr_data,
        } as any)
        .select()
        .single();
      if (invError) throw invError;

      return { sale: saleRecord, invoice };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos-sales'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Venda registada com sucesso');
    },
    onError: (err: any) => toast.error(err.message || 'Erro ao registar venda'),
  });
}

export function useInvoices() {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*, farmers(name)')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data;
    },
  });
}

export function useSubsidizedPurchases() {
  return useQuery({
    queryKey: ['subsidized-purchases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subsidized_purchases')
        .select('*, farmers(name, registration_number)')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data;
    },
  });
}

export function useCreatePurchase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (purchase: any) => {
      const { data, error } = await supabase
        .from('subsidized_purchases')
        .insert(purchase)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subsidized-purchases'] });
      toast.success('Compra registada com sucesso');
    },
    onError: (err: any) => toast.error(err.message || 'Erro ao registar compra'),
  });
}

export function useApprovePurchase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, rejection_reason }: { id: string; status: string; rejection_reason?: string }) => {
      const { data: user } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('subsidized_purchases')
        .update({
          status,
          approved_by: user.user?.id,
          approved_at: new Date().toISOString(),
          rejection_reason,
        } as any)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subsidized-purchases'] });
      toast.success('Estado da compra actualizado');
    },
    onError: (err: any) => toast.error(err.message),
  });
}

export function usePurchasePackages() {
  return useQuery({
    queryKey: ['purchase-packages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_packages')
        .select('*, farmers(name), provinces(name), municipalities(name), purchase_package_items(*)')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data;
    },
  });
}

export function useCreatePackage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (pkg: { package: any; items: any[] }) => {
      const { data: user } = await supabase.auth.getUser();
      const { data: pkgRecord, error: pkgError } = await supabase
        .from('purchase_packages')
        .insert({ ...pkg.package, created_by: user.user?.id } as any)
        .select()
        .single();
      if (pkgError) throw pkgError;

      if (pkg.items.length > 0) {
        const items = pkg.items.map(i => ({ ...i, package_id: pkgRecord.id }));
        const { error: itemsError } = await supabase
          .from('purchase_package_items')
          .insert(items as any);
        if (itemsError) throw itemsError;
      }
      return pkgRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-packages'] });
      toast.success('Pacote criado com sucesso');
    },
    onError: (err: any) => toast.error(err.message),
  });
}

export function useFarmerWallet(farmerId?: string) {
  return useQuery({
    queryKey: ['farmer-wallet', farmerId],
    queryFn: async () => {
      if (!farmerId) return null;
      const { data, error } = await supabase
        .from('farmer_wallets')
        .select('*')
        .eq('farmer_id', farmerId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!farmerId,
  });
}

export function usePaymentGateways() {
  return useQuery({
    queryKey: ['payment-gateways'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_gateway_config')
        .select('*')
        .order('provider');
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateGateway() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase
        .from('payment_gateway_config')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-gateways'] });
      toast.success('Gateway actualizado');
    },
    onError: (err: any) => toast.error(err.message),
  });
}
