import { ReactNode } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { QueryState } from '@/components/ui/query-state';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ForestryModulePageProps {
  title: string;
  subtitle?: string;
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  isEmpty?: boolean;
  emptyMessage?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function ForestryModulePage({
  title,
  subtitle,
  isLoading,
  isError,
  error,
  isEmpty,
  emptyMessage = 'Sem registos.',
  actions,
  children,
}: ForestryModulePageProps) {
  return (
    <MainLayout title={title} subtitle={subtitle}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          {actions}
        </CardHeader>
        <CardContent>
          <QueryState
            isLoading={!!isLoading}
            isError={!!isError}
            error={error as Error | null}
            isEmpty={!!isEmpty}
            emptyMessage={emptyMessage}
          >
            {children}
          </QueryState>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
