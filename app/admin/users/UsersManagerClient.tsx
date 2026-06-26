// app/admin/users/UsersManagerClient.tsx
'use client';

import { useState }  from 'react';
import Image         from 'next/image';
import { motion }    from 'framer-motion';
import { Shield, Ban, UserX, UserCheck, Search, ShieldCheck, Star, Package } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { formatDate, cn } from '@/lib/utils';

interface User {
  uid:              string;
  email:            string | null;
  displayName:      string | null;
  photoURL:         string | null;
  role:             string;
  status:           string;
  isVerifiedSeller: boolean;
  totalListings:    number;
  totalSales:       number;
  rating:           number;
  createdAt:        { seconds?: number } | null;
}

const VALID_ACTIONS = ['ban', 'suspend', 'restore', 'verify_seller'] as const;
type Action = typeof VALID_ACTIONS[number];

const ROLE_COLORS: Record<string, string> = {
  admin:  'badge-red',
  seller: 'badge-brand',
  buyer:  'badge-green',
};
const STATUS_COLORS: Record<string, string> = {
  active:    'badge-green',
  suspended: 'badge-yellow',
  banned:    'badge-red',
  pending_verification: 'badge-surface',
};

export function UsersManagerClient({ users: initial }: { users: User[] }) {
  const [users,      setUsers]      = useState(initial);
  const [search,     setSearch]     = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading,    setLoading]    = useState<string | null>(null);

  const filtered = users.filter((u) => {
    const matchSearch = !search ||
      (u.email?.toLowerCase().includes(search.toLowerCase())) ||
      (u.displayName?.toLowerCase().includes(search.toLowerCase()));
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const doAction = async (uid: string, action: Action, reason?: string) => {
    // Guard: only valid actions allowed
    if (!VALID_ACTIONS.includes(action)) return;
    // Sanitize reason
    const safeReason = reason?.replace(/<[^>]*>/g, '').trim().slice(0, 500);
    setLoading(uid + action);
    try {
      await axios.patch('/api/admin/users', { uid, action, reason: safeReason });
      setUsers((p) => p.map((u) => {
        if (u.uid !== uid) return u;
        if (action === 'ban')           return { ...u, status: 'banned' };
        if (action === 'suspend')       return { ...u, status: 'suspended' };
        if (action === 'restore')       return { ...u, status: 'active' };
        if (action === 'verify_seller') return { ...u, isVerifiedSeller: true };
        return u;
      }));
      toast.success(`User ${action.replace('_', ' ')}d`);
    } catch { toast.error('Action failed'); }
    finally { setLoading(null); }
  };

  const summaryCards = [
    { label: 'Total',     value: users.length,                                 icon: Shield,     color: 'bg-blue-50   text-blue-600'  },
    { label: 'Sellers',   value: users.filter((u) => u.role === 'seller').length, icon: Package,  color: 'bg-brand-50  text-brand-600' },
    { label: 'Verified',  value: users.filter((u) => u.isVerifiedSeller).length,  icon: ShieldCheck, color: 'bg-green-50 text-green-600' },
    { label: 'Suspended', value: users.filter((u) => u.status !== 'active').length, icon: UserX,   color: 'bg-red-50    text-red-600'   },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-surface-900">Users</h1>
        <p className="text-surface-500 text-sm mt-0.5">{filtered.length} of {users.length} users</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-surface-100 p-4 shadow-card flex items-center gap-3">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', color)}>
              <Icon size={16} />
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-surface-900">{value}</p>
              <p className="text-xs text-surface-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" />
          <input type="search" placeholder="Search by name or email…" value={search}
            onChange={(e) => setSearch(e.target.value.replace(/<[^>]*>/g, '').slice(0, 200))}
            className="input-base pl-10 text-sm" />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
          className="input-base text-sm w-36">
          <option value="all">All Roles</option>
          <option value="buyer">Buyers</option>
          <option value="seller">Sellers</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-surface-100 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-surface-100 bg-surface-50">
                {['User','Role','Status','Listings','Sales','Rating','Joined','Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-16 text-surface-400 font-medium">No users found</td></tr>
              ) : filtered.map((user) => (
                <motion.tr key={user.uid} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="border-b border-surface-50 hover:bg-surface-50 transition-colors">

                  {/* User */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {user.photoURL ? (
                        <Image src={user.photoURL} alt={user.displayName ?? ''} width={36} height={36}
                          className="w-9 h-9 rounded-full object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm">
                          {user.displayName?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? '?'}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold text-surface-900">{user.displayName ?? 'Anonymous'}</p>
                          {user.isVerifiedSeller && <ShieldCheck size={13} className="text-accent-500" />}
                        </div>
                        <p className="text-xs text-surface-400 truncate max-w-[160px]">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-4 py-3">
                    <span className={cn('badge capitalize', ROLE_COLORS[user.role] ?? 'badge-surface')}>{user.role}</span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span className={cn('badge capitalize', STATUS_COLORS[user.status] ?? 'badge-surface')}>
                      {user.status?.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-sm text-surface-700">{user.totalListings}</td>
                  <td className="px-4 py-3 text-sm text-surface-700">{user.totalSales}</td>

                  {/* Rating */}
                  <td className="px-4 py-3">
                    {user.rating > 0 ? (
                      <span className="flex items-center gap-1 text-sm text-surface-700">
                        <Star size={12} className="text-yellow-400 fill-yellow-400" />
                        {user.rating.toFixed(1)}
                      </span>
                    ) : <span className="text-sm text-surface-400">—</span>}
                  </td>

                  {/* Joined */}
                  <td className="px-4 py-3 text-xs text-surface-400 whitespace-nowrap">
                    {user.createdAt?.seconds
                      ? formatDate({ toDate: () => new Date(user.createdAt!.seconds! * 1000) })
                      : '—'}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {!user.isVerifiedSeller && user.role === 'seller' && (
                        <button onClick={() => doAction(user.uid, 'verify_seller')} disabled={!!loading}
                          title="Verify Seller"
                          className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 transition-colors disabled:opacity-50">
                          <ShieldCheck size={13} />
                        </button>
                      )}
                      {user.status === 'active' && user.role !== 'admin' && (
                        <>
                          <button onClick={() => { const r = window.prompt('Suspension reason:'); if (r !== null) doAction(user.uid, 'suspend', r); }}
                            disabled={!!loading} title="Suspend"
                            className="p-1.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 border border-yellow-200 transition-colors disabled:opacity-50">
                            <UserX size={13} />
                          </button>
                          <button onClick={() => { if (window.confirm('Ban this user permanently?')) doAction(user.uid, 'ban'); }}
                            disabled={!!loading} title="Ban"
                            className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-50">
                            <Ban size={13} />
                          </button>
                        </>
                      )}
                      {(user.status === 'banned' || user.status === 'suspended') && (
                        <button onClick={() => doAction(user.uid, 'restore')} disabled={!!loading} title="Restore"
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 transition-colors disabled:opacity-50">
                          <UserCheck size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}