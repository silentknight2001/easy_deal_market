// app/(main)/products/ProductsClient.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, LayoutGrid, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchProducts, searchProducts } from '@/lib/firebase/productService';
import { ProductCard }         from '@/components/products/ProductCard';
import { ProductCardSkeleton } from '@/components/products/ProductCardSkeleton';
import { ProductFilters }      from '@/components/products/ProductFilters';
import { useDebounce }         from '@/hooks/useDebounce';
import { sanitizeSearchQuery, cn } from '@/lib/utils';
import type { ProductFilters as FilterType } from '@/types';

interface Props { searchParams: Record<string, string | undefined> }

export function ProductsClient({ searchParams }: Props) {
  const router        = useRouter();
  const [viewMode,    setViewMode]    = useState<'grid' | 'list'>('grid');
  const [localSearch, setLocalSearch] = useState(searchParams.q ?? '');
  const debounced     = useDebounce(localSearch, 400);
  const page          = Number(searchParams.page ?? 1);

  const filters: FilterType = {
    category:  searchParams.category  as FilterType['category'],
    condition: searchParams.condition as FilterType['condition'],
    city:      searchParams.city,
    minPrice:  searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
    maxPrice:  searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
    sortBy:    searchParams.sortBy    as FilterType['sortBy'],
    page, limit: 12,
  };

  useEffect(() => {
    const params = new URLSearchParams(searchParams as Record<string, string>);
    if (debounced) params.set('q', debounced); else params.delete('q');
    params.delete('page');
    router.replace(`/products?${params.toString()}`, { scroll: false });
  }, [debounced]); // eslint-disable-line

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['products', filters, debounced],
    queryFn:  async () => {
      if (debounced) {
        const items = await searchProducts(sanitizeSearchQuery(debounced), 24);
        return { items, total: items.length, page: 1, limit: 24, hasMore: false };
      }
      return fetchProducts(filters);
    },
    placeholderData: (p) => p,
  });

  const changePage = useCallback((p: number) => {
    const params = new URLSearchParams(searchParams as Record<string, string>);
    params.set('page', String(p));
    router.push(`/products?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [router, searchParams]);

  const totalPages = data ? Math.ceil(data.total / 12) : 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-surface-900 mb-2">
          {searchParams.category ? `${searchParams.category.replace('_', ' ')} for Sale` : 'Browse All Products'}
          {searchParams.city && ` in ${searchParams.city}`}
        </h1>
        {data && <p className="text-surface-500 text-sm">{data.total.toLocaleString()} products found{searchParams.q && ` for "${searchParams.q}"`}</p>}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none" />
        <input type="search" value={localSearch} onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search products in Assam…" className="input-base pl-11 pr-10" aria-label="Search products" />
        {localSearch && (
          <button onClick={() => setLocalSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-700">
            <X size={16} />
          </button>
        )}
      </div>

      <div className="flex gap-6">
        <ProductFilters />

        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-end gap-2 mb-5">
            {isFetching && !isLoading && <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />}
            {(['grid', 'list'] as const).map((mode) => (
              <button key={mode} onClick={() => setViewMode(mode)} aria-pressed={viewMode === mode}
                className={cn('p-2 rounded-lg transition-colors', viewMode === mode ? 'bg-brand-50 text-brand-600' : 'text-surface-400 hover:bg-surface-50')}>
                {mode === 'grid' ? <LayoutGrid size={16} /> : <List size={16} />}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div key="skeleton" className={cn('grid gap-5', viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1')}>
                {Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)}
              </motion.div>
            ) : data?.items.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                <p className="text-5xl mb-4">🔍</p>
                <h3 className="font-display text-xl font-bold text-surface-900 mb-2">No products found</h3>
                <p className="text-surface-500 mb-6">Try different filters or search terms</p>
                <button onClick={() => router.push('/products')} className="btn-primary">Clear Filters</button>
              </motion.div>
            ) : (
              <motion.div key="products" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className={cn('grid gap-5', viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1')}>
                {data?.items.map((product, i) => (
                  <motion.div key={product.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <ProductCard product={product} priority={i < 4} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button onClick={() => changePage(page - 1)} disabled={page <= 1}
                className="btn-secondary px-3 py-2 disabled:opacity-40"><ChevronLeft size={16} /></button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => changePage(p)} aria-current={p === page ? 'page' : undefined}
                  className={cn('w-10 h-10 rounded-xl text-sm font-medium transition-all',
                    p === page ? 'bg-brand-500 text-white shadow-brand' : 'bg-white border border-surface-200 text-surface-700 hover:border-brand-300')}>
                  {p}
                </button>
              ))}
              <button onClick={() => changePage(page + 1)} disabled={page >= totalPages}
                className="btn-secondary px-3 py-2 disabled:opacity-40"><ChevronRight size={16} /></button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}