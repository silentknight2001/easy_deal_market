// app/(main)/wishlist/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Trash2 } from 'lucide-react';
import { useWishlistStore } from '@/store/appStore';
import { useAuthStore }     from '@/store/authStore';
import { fetchProduct }     from '@/lib/firebase/productService';
import { ProductCard }         from '@/components/products/ProductCard';
import { ProductCardSkeleton } from '@/components/products/ProductCardSkeleton';
import type { Product } from '@/types';

export default function WishlistPage() {
  const router              = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { items, clearAll } = useWishlistStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login?redirect=/wishlist'); return; }
    if (items.length === 0) { setLoading(false); return; }
    Promise.all(items.map((id) => fetchProduct(id)))
      .then((r) => setProducts(r.filter(Boolean) as Product[]))
      .finally(() => setLoading(false));
  }, [items, isAuthenticated, router]);

  return (
    <div className="py-10">
      <div className="section-container">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-surface-900 flex items-center gap-3">
              <Heart size={28} className="text-red-500 fill-red-500" /> My Wishlist
            </h1>
            <p className="text-surface-500 mt-1">{items.length} saved {items.length === 1 ? 'product' : 'products'}</p>
          </div>
          {items.length > 0 && (
            <button onClick={() => { if (window.confirm('Clear your entire wishlist?')) clearAll(); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors">
              <Trash2 size={14} /> Clear All
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 bg-surface-50 rounded-2xl border border-surface-100">
            <div className="text-6xl mb-5">💔</div>
            <h2 className="font-display text-2xl font-bold text-surface-900 mb-3">Your wishlist is empty</h2>
            <p className="text-surface-500 mb-8 max-w-sm mx-auto">
              Save products you love by clicking the heart icon on any listing.
            </p>
            <a href="/products" className="btn-primary">Browse Products</a>
          </div>
        ) : (
          <AnimatePresence>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {products.map((product, i) => (
                <motion.div key={product.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05 }}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}