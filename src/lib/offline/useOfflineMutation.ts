import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { enqueueMutation } from './db';
import { toast } from 'sonner';

interface OfflineMutationConfig<TVars> {
  module: string;
  table: string;
  operation: 'insert' | 'update' | 'delete';
  buildPayload: (vars: TVars) => any;
  buildMatchKey?: (vars: TVars) => { column: string; value: any };
  invalidateKeys?: string[][];
  successMessage?: string;
}

export function useOfflineMutation<TVars = any>(
  config: OfflineMutationConfig<TVars>,
  options?: Omit<UseMutationOptions<any, Error, TVars>, 'mutationFn'>
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: TVars) => {
      const payload = config.buildPayload(vars);
      const matchKey = config.buildMatchKey?.(vars);

      if (!navigator.onLine) {
        await enqueueMutation({
          module: config.module,
          table: config.table,
          operation: config.operation,
          payload,
          matchKey,
          invalidateKeys: config.invalidateKeys,
        });
        toast.info('Guardado offline — será sincronizado ao restabelecer a ligação');
        return { offline: true, payload };
      }

      const tbl = (supabase as any).from(config.table);
      let result;
      if (config.operation === 'insert') {
        const { data, error } = await tbl.insert(payload).select().single();
        if (error) throw error;
        result = data;
      } else if (config.operation === 'update' && matchKey) {
        const { data, error } = await tbl.update(payload).eq(matchKey.column, matchKey.value).select().single();
        if (error) throw error;
        result = data;
      } else if (config.operation === 'delete' && matchKey) {
        const { error } = await tbl.delete().eq(matchKey.column, matchKey.value);
        if (error) throw error;
        result = { deleted: true };
      }
      return result;
    },
    onSuccess: (data, vars, ctx) => {
      config.invalidateKeys?.forEach((key) => qc.invalidateQueries({ queryKey: key }));
      if (config.successMessage && !(data && (data as any).offline)) {
        toast.success(config.successMessage);
      }
      options?.onSuccess?.(data, vars, ctx);
    },
    ...options,
  });
}
