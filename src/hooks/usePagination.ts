import { useState, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface UsePaginatedQueryOptions<T> {
  queryKey: string[];
  tableName: string;
  select?: string;
  filters?: Record<string, any>;
  initialPageSize?: number;
  initialSortBy?: string;
  initialSortOrder?: 'asc' | 'desc';
  enabled?: boolean;
}

export function usePaginatedQuery<T>({
  queryKey,
  tableName,
  select = '*',
  filters = {},
  initialPageSize = 20,
  initialSortBy = 'created_at',
  initialSortOrder = 'desc',
  enabled = true,
}: UsePaginatedQueryOptions<T>) {
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    pageSize: initialPageSize,
    sortBy: initialSortBy,
    sortOrder: initialSortOrder,
  });

  const queryClient = useQueryClient();

  // Build the query
  const query = useQuery({
    queryKey: [...queryKey, pagination, filters],
    queryFn: async (): Promise<PaginatedResult<T>> => {
      const { page, pageSize, sortBy, sortOrder } = pagination;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // Build query with filters using any to avoid type complexity
      let queryBuilder = (supabase as any)
        .from(tableName)
        .select(select, { count: 'exact' });

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '' && value !== 'all') {
          if (Array.isArray(value)) {
            queryBuilder = queryBuilder.in(key, value);
          } else if (typeof value === 'string' && value.includes('%')) {
            queryBuilder = queryBuilder.ilike(key, value);
          } else {
            queryBuilder = queryBuilder.eq(key, value);
          }
        }
      });

      // Apply sorting
      if (sortBy) {
        queryBuilder = queryBuilder.order(sortBy, { ascending: sortOrder === 'asc' });
      }

      // Apply pagination
      queryBuilder = queryBuilder.range(from, to);

      const { data, error, count } = await queryBuilder;

      if (error) throw error;

      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / pageSize);

      return {
        data: (data as T[]) || [],
        totalCount,
        totalPages,
        currentPage: page,
        pageSize,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      };
    },
    enabled,
  });

  // Navigation functions
  const goToPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const nextPage = useCallback(() => {
    setPagination(prev => ({ ...prev, page: prev.page + 1 }));
  }, []);

  const previousPage = useCallback(() => {
    setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setPagination(prev => ({ ...prev, pageSize, page: 1 }));
  }, []);

  const setSort = useCallback((sortBy: string, sortOrder: 'asc' | 'desc' = 'desc') => {
    setPagination(prev => ({ ...prev, sortBy, sortOrder, page: 1 }));
  }, []);

  const resetPagination = useCallback(() => {
    setPagination({
      page: 1,
      pageSize: initialPageSize,
      sortBy: initialSortBy,
      sortOrder: initialSortOrder,
    });
  }, [initialPageSize, initialSortBy, initialSortOrder]);

  // Prefetch next page
  const prefetchNextPage = useCallback(() => {
    if (query.data?.hasNextPage) {
      const nextPagination = { ...pagination, page: pagination.page + 1 };
      queryClient.prefetchQuery({
        queryKey: [...queryKey, nextPagination, filters],
      });
    }
  }, [query.data?.hasNextPage, pagination, queryKey, filters, queryClient]);

  return {
    ...query,
    pagination,
    goToPage,
    nextPage,
    previousPage,
    setPageSize,
    setSort,
    resetPagination,
    prefetchNextPage,
  };
}

// Generate page numbers for pagination UI
export function getPageNumbers(currentPage: number, totalPages: number, maxVisible: number = 5): (number | 'ellipsis')[] {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis')[] = [];
  const half = Math.floor(maxVisible / 2);
  
  let start = Math.max(1, currentPage - half);
  let end = Math.min(totalPages, currentPage + half);

  if (currentPage <= half) {
    end = maxVisible - 1;
  } else if (currentPage >= totalPages - half) {
    start = totalPages - maxVisible + 2;
  }

  if (start > 1) {
    pages.push(1);
    if (start > 2) pages.push('ellipsis');
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (end < totalPages) {
    if (end < totalPages - 1) pages.push('ellipsis');
    pages.push(totalPages);
  }

  return pages;
}
