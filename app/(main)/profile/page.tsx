// app/(main)/profile/page.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link  from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { User, Package, Star, ShieldCheck, Edit3, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { fetchSellerProducts } from '@/lib/firebase/productService';
import { logOut } from '@/lib/firebase/authService';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductCardSkeleton } from '@/components/products/ProductCardSkeleton';
import { formatDate, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'listings' | 'settings'>('listings');

  const { data: listings, isLoading } = useQuery({
    queryKey: ['my-listings', user?.uid],
    queryFn:  () => fetchSellerProducts(user!.uid),
    enabled:  !!user?.uid,
  });

  const handleLogout = async () => {
    await logOut();
    clearAuth();
    toast.success('Logged out successfully');
    router.push('/');
  };

  if (!user) return (
    <div className="section-container py-20 text-center">
      <p className="text-surface-500 mb-4">Please log in to view your profile.</p>
      <Link href="/login" className="btn-primary">Login</Link>
    </div>
  );

  return (
    <div className="py-10">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-[300px,1fr] gap-8">

          {/* Profile card */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-surface-100 shadow-card p-6 text-center">
              <div className="relative w-20 h-20 mx-auto mb-4">
                {user.photoURL ? (
                  <Image src={user.photoURL} alt={user.displayName ?? ''} width={80} height={80}
                    className="rounded-full object-cover ring-4 ring-brand-100" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-display font-bold text-3xl">
                    {user.displayName?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                )}
                {user.isVerifiedSeller && (
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-accent-500 rounded-full flex items-center justify-center border-2 border-white">
                    <ShieldCheck size={14} className="text-white" />
                  </div>
                )}
              </div>

              <h1 className="font-display text-xl font-bold text-surface-900">{user.displayName}</h1>
              <p className="text-sm text-surface-500 mt-0.5">{user.email}</p>
              <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
                <span className={cn('badge capitalize', user.role === 'admin' ? 'badge-red' : user.role === 'seller' ? 'badge-brand' : 'badge-green')}>
                  {user.role}
                </span>
                {user.isVerifiedSeller && (
                  <span className="badge badge-green flex items-center gap-1">
                    <ShieldCheck size={10} /> Verified
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-surface-100">
                {[
                  { label: 'Listings', value: user.totalListings, icon: Package },
                  { label: 'Sold',     value: user.totalSales,    icon: ShieldCheck },
                  { label: 'Rating',   value: user.rating > 0 ? user.rating.toFixed(1) : '—', icon: Star },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="text-center">
                    <Icon size={14} className="text-surface-400 mx-auto mb-1" />
                    <p className="font-display font-bold text-surface-900">{value}</p>
                    <p className="text-xs text-surface-400">{label}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-surface-400 mt-4">
                Member since {user.createdAt ? formatDate(user.createdAt) : '—'}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-surface-100 shadow-card overflow-hidden">
              <button onClick={() => setActiveTab('settings')}
                className="flex items-center gap-3 w-full px-5 py-3.5 text-sm font-medium text-surface-700 hover:bg-surface-50 border-b border-surface-50 transition-colors">
                <Edit3 size={15} className="text-surface-400" /> Edit Profile
              </button>
              <button onClick={handleLogout}
                className="flex items-center gap-3 w-full px-5 py-3.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                <LogOut size={15} className="text-red-500" /> Logout
              </button>
            </div>
          </div>

          {/* Main content */}
          <div>
            <div className="flex gap-1 bg-surface-100 rounded-xl p-1 mb-6 w-fit">
              {(['listings', 'settings'] as const).map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={cn('px-5 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all',
                    activeTab === tab ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500 hover:text-surface-700')}>
                  {tab === 'listings' ? `My Listings (${listings?.length ?? 0})` : 'Settings'}
                </button>
              ))}
            </div>

            {activeTab === 'listings' && (
              isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
                </div>
              ) : listings?.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-surface-100">
                  <Package size={40} className="text-surface-300 mx-auto mb-3" />
                  <h3 className="font-display text-lg font-bold text-surface-900 mb-2">No listings yet</h3>
                  <p className="text-surface-500 mb-5">Start selling your unused products today!</p>
                  <Link href="/sell" className="btn-primary">List Your First Product</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {listings?.map((product) => <ProductCard key={product.id} product={product} />)}
                </div>
              )
            )}

            {activeTab === 'settings' && (
              <div className="bg-white rounded-2xl border border-surface-100 shadow-card p-6 max-w-md">
                <h2 className="font-display text-lg font-bold text-surface-900 mb-6">Account Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-surface-700 mb-1.5">Display Name</label>
                    <input defaultValue={user.displayName ?? ''} className="input-base" placeholder="Your name" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-surface-700 mb-1.5">WhatsApp Number</label>
                    <input defaultValue={user.whatsappNumber ?? ''} className="input-base" placeholder="+91 98765 43210" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-surface-700 mb-1.5">Location</label>
                    <input defaultValue={user.location ?? ''} className="input-base" placeholder="Your city" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-surface-700 mb-1.5">Bio</label>
                    <textarea defaultValue={user.bio ?? ''} rows={3} className="input-base resize-none" placeholder="Tell buyers about yourself…" />
                  </div>
                  <button className="btn-primary" onClick={() => toast.success('Profile updated!')}>
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}