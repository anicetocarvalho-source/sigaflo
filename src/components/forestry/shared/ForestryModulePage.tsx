import { ReactNode } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { QueryError, QueryEmpty, QueryTableSkeleton } from '@/components/ui/query-state';
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
  emptyMessage = 'Sem registos para mostrar.',
  actions,
  children,
}: ForestryModulePageProps) {
  return (
    <MainLayout title={title} subtitle={subtitle}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="text-base">{title}</CardTitle>
          {actions}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <QueryTableSkeleton rows={6} cols={5} />
          ) : isError ? (
            <QueryError error={error as Error} />
          ) : isEmpty ? (
            <QueryEmpty title="Sem dados" description={emptyMessage} />
          ) : (
            children
          )}
        </CardContent>
      </Card>
    </MainLayout>
  );
}
