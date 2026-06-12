// app/(main)/bookings/page.tsx
'use client';

import { useState } from 'react';
import Link         from 'next/link';
import Image        from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, XCircle, Package, MessageCircle } from 'lucide-react';
import { useBuyerBookings, useSellerBookings, useUpdateBookingStatus } from '@/hooks/useBookings';
import { useAuthStore } from '@/store/authStore';
import { formatPrice, timeAgo, buildWhatsAppUrl, cn } from '@/lib/utils';
import type { Booking } from '@/types';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending:   { label: 'Pending',   color: 'badge-yellow',  icon: Clock         },
  accepted:  { label: 'Accepted',  color: 'badge-green',   icon: CheckCircle   },
  rejected:  { label: 'Rejected',  color: 'badge-red',     icon: XCircle       },
  completed: { label: 'Completed', color: 'badge-brand',   icon: CheckCircle   },
  cancelled: { label: 'Cancelled', color: 'badge-surface', icon: XCircle       },
};

function BookingCard({ booking, role }: { booking: Booking; role: 'buyer' | 'seller' }) {
  const { mutate: updateStatus, isPending } = useUpdateBookingStatus();
  const statusCfg  = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.pending;
  const StatusIcon = statusCfg.icon;

  const whatsappUrl = buildWhatsAppUrl(
    role === 'buyer' ? (booking as unknown as Record<string,string>).sellerWhatsapp ?? '' : booking.buyerWhatsapp,
    `Hi! Regarding your listing "${booking.productTitle}" on Easy Deals LMG.`
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-surface-100 shadow-card overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-100 flex-shrink-0">
            {booking.productImage ? (
              <Image src={booking.productImage} alt={booking.productTitle} width={64} height={64} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <Link href={`/products/${booking.productId}`} className="font-semibold text-surface-900 hover:text-brand-600 transition-colors line-clamp-1">
                  {booking.productTitle}
                </Link>
                <p className="font-display text-lg font-bold text-brand-600 mt-0.5">{formatPrice(booking.productPrice)}</p>
              </div>
              <span className={cn('badge flex-shrink-0 flex items-center gap-1', statusCfg.color)}>
                <StatusIcon size={10} />{statusCfg.label}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-surface-500">
              <span>{role === 'buyer' ? `Seller: ${booking.sellerName}` : `Buyer: ${booking.buyerName}`}</span>
              <span>·</span>
              <span>{timeAgo(booking.createdAt)}</span>
            </div>
            {booking.message && (
              <p className="text-xs text-surface-600 bg-surface-50 rounded-xl px-3 py-2 mt-3 border border-surface-100">
                💬 &quot;{booking.message}&quot;
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-surface-50">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 bg-[#25D366] text-white rounded-xl text-xs font-semibold hover:bg-[#20b558] transition-colors">
            <MessageCircle size={12} /> WhatsApp
          </a>
          {role === 'seller' && booking.status === 'pending' && (
            <>
              <button onClick={() => updateStatus({ bookingId: booking.id, status: 'accepted' })} disabled={isPending}
                className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 border border-green-200 rounded-xl text-xs font-semibold hover:bg-green-100 transition-colors disabled:opacity-50">
                <CheckCircle size={12} /> Accept
              </button>
              <button onClick={() => { const r = window.prompt('Reason for declining:') ?? ''; updateStatus({ bookingId: booking.id, status: 'rejected', reason: r }); }} disabled={isPending}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-50">
                <XCircle size={12} /> Decline
              </button>
            </>
          )}
          {role === 'seller' && booking.status === 'accepted' && (
            <button onClick={() => { if (window.confirm('Mark as completed?')) updateStatus({ bookingId: booking.id, status: 'completed' }); }} disabled={isPending}
              className="flex items-center gap-1.5 px-3 py-2 bg-brand-50 text-brand-700 border border-brand-200 rounded-xl text-xs font-semibold hover:bg-brand-100 transition-colors disabled:opacity-50">
              <Package size={12} /> Mark Completed
            </button>
          )}
          {role === 'buyer' && (booking.status === 'pending' || booking.status === 'accepted') && (
            <button onClick={() => { if (window.confirm('Cancel this booking?')) updateStatus({ bookingId: booking.id, status: 'cancelled', reason: 'Cancelled by buyer' }); }} disabled={isPending}
              className="flex items-center gap-1.5 px-3 py-2 bg-surface-100 text-surface-600 rounded-xl text-xs font-semibold hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50 ml-auto">
              <XCircle size={12} /> Cancel
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function BookingsPage() {
  const { isAuthenticated }  = useAuthStore();
  const [tab, setTab]        = useState<'buying' | 'selling'>('buying');
  const { data: buyerBookings,  isLoading: buyerLoading  } = useBuyerBookings();
  const { data: sellerBookings, isLoading: sellerLoading } = useSellerBookings();

  if (!isAuthenticated) {
    return (
      <div className="section-container py-20 text-center">
        <p className="text-surface-500 mb-4">Please log in to view your bookings.</p>
        <Link href="/login?redirect=/bookings" className="btn-primary">Login</Link>
      </div>
    );
  }

  const bookings = tab === 'buying' ? buyerBookings ?? [] : sellerBookings ?? [];
  const loading  = tab === 'buying' ? buyerLoading       : sellerLoading;

  return (
    <div className="py-10">
      <div className="section-container max-w-3xl">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-surface-900">My Bookings</h1>
          <p className="text-surface-500 mt-1">Track all your buying and selling inquiries</p>
        </div>

        <div className="flex gap-1 bg-surface-100 rounded-xl p-1 mb-6 w-fit">
          {(['buying', 'selling'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={cn('px-5 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all',
                tab === t ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500 hover:text-surface-700')}>
              {t === 'buying' ? `Buying (${buyerBookings?.length ?? 0})` : `Selling (${sellerBookings?.length ?? 0})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-36 skeleton rounded-2xl" />)}</div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 bg-surface-50 rounded-2xl border border-surface-100">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="font-display text-xl font-bold text-surface-900 mb-2">No {tab === 'buying' ? 'buying' : 'selling'} bookings yet</h3>
            <p className="text-surface-500 mb-6">{tab === 'buying' ? 'Browse products and send inquiries.' : 'List products to receive inquiries.'}</p>
            <Link href={tab === 'buying' ? '/products' : '/sell'} className="btn-primary">
              {tab === 'buying' ? 'Browse Products' : 'Sell a Product'}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {bookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} role={tab === 'buying' ? 'buyer' : 'seller'} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}