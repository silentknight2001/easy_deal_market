// functions/src/index.ts
import * as functions from 'firebase-functions';
import * as admin     from 'firebase-admin';

admin.initializeApp();

const db      = admin.firestore();
const REGION  = 'asia-south1'; // Mumbai — nearest to Assam
const TS      = admin.firestore.FieldValue.serverTimestamp;
const INC     = admin.firestore.FieldValue.increment;

// ── Helpers ───────────────────────────────────────────────────────────────────
async function getAdminUIDs(): Promise<string[]> {
  const snap = await db.collection('users').where('role','==','admin').where('status','==','active').get();
  return snap.docs.map((d) => d.id);
}

async function notifyAdmins(payload: Record<string, unknown>) {
  const uids = await getAdminUIDs();
  if (!uids.length) return;
  const batch = db.batch();
  uids.forEach((uid) => {
    batch.set(db.collection('notifications').doc(), { ...payload, userId: uid, isRead: false, createdAt: TS() });
  });
  await batch.commit();
}

// ── 1. New Product → notify admins, auto-flag if spam ─────────────────────────
export const onProductCreated = functions.region(REGION)
  .firestore.document('products/{productId}')
  .onCreate(async (snap, ctx) => {
    const p = snap.data();
    try {
      // Auto-reject if report count already high (shouldn't happen, but guard)
      if ((p.reportCount ?? 0) >= 5) {
        await snap.ref.update({ status: 'rejected', adminNote: 'Auto-rejected: high report count' });
        functions.logger.warn('Auto-rejected product', ctx.params.productId);
        return;
      }
      await notifyAdmins({
        type:  'admin_alert',
        title: '📦 New Listing Pending Approval',
        body:  `"${p.title}" by ${p.sellerName} needs review`,
        link:  '/admin/listings?status=pending',
      });
    } catch (e) { functions.logger.error('onProductCreated', e); }
  });

// ── 2. Product Sold → update seller stats ─────────────────────────────────────
export const onProductSold = functions.region(REGION)
  .firestore.document('products/{productId}')
  .onUpdate(async (change) => {
    const before = change.before.data();
    const after  = change.after.data();
    if (before.status === after.status || after.status !== 'sold') return null;
    try {
      await db.collection('users').doc(after.sellerId).update({ totalSales: INC(1) });
    } catch (e) { functions.logger.error('onProductSold', e); }
    return null;
  });

// ── 3. Report Created → auto-remove at threshold ──────────────────────────────
export const onReportCreated = functions.region(REGION)
  .firestore.document('reports/{reportId}')
  .onCreate(async (snap) => {
    const report = snap.data();
    try {
      const pRef  = db.collection('products').doc(report.productId);
      const pSnap = await pRef.get();
      if (!pSnap.exists) return;
      const p = pSnap.data()!;
      // Auto-remove after 5 verified reports
      if ((p.reportCount ?? 0) >= 5 && p.status === 'active') {
        await pRef.update({ status: 'removed', adminNote: 'Auto-removed: 5+ reports', updatedAt: TS() });
        await notifyAdmins({
          type:  'admin_alert',
          title: '🚨 Product Auto-Removed',
          body:  `"${p.title}" removed after 5+ reports`,
          link:  '/admin/reports',
        });
        functions.logger.warn('Auto-removed product', report.productId);
      }
    } catch (e) { functions.logger.error('onReportCreated', e); }
  });

// ── 4. Daily: expire listings older than 90 days ──────────────────────────────
export const expireOldListings = functions.region(REGION)
  .pubsub.schedule('0 2 * * *').timeZone('Asia/Kolkata')
  .onRun(async () => {
    try {
      const snap = await db.collection('products')
        .where('status',    '==', 'active')
        .where('expiresAt', '<',  admin.firestore.Timestamp.now())
        .limit(100).get();
      if (snap.empty) { functions.logger.info('No expired listings'); return null; }
      const batch = db.batch();
      snap.docs.forEach((d) => batch.update(d.ref, { status: 'removed', adminNote: 'Auto-expired: 90 days', updatedAt: TS() }));
      await batch.commit();
      functions.logger.info(`Expired ${snap.size} listings`);
    } catch (e) { functions.logger.error('expireOldListings', e); }
    return null;
  });

// ── 5. Weekly: placeholder for orphaned image cleanup ─────────────────────────
export const cleanupOrphanedImages = functions.region(REGION)
  .pubsub.schedule('0 3 * * 0').timeZone('Asia/Kolkata')
  .onRun(async () => {
    // Production: cross-reference Storage bucket files vs active product storagePaths
    functions.logger.info('cleanupOrphanedImages: run started');
    return null;
  });

// ── 6. User Deleted → clean up all user data ──────────────────────────────────
export const onUserDeleted = functions.region(REGION)
  .auth.user().onDelete(async (user) => {
    const uid = user.uid;
    try {
      const batch = db.batch();
      // Remove active listings
      const products = await db.collection('products').where('sellerId','==',uid).where('status','==','active').get();
      products.docs.forEach((d) => batch.update(d.ref, { status: 'removed', adminNote: 'Seller deleted account' }));
      // Delete notifications (max 100 per batch)
      const notifs = await db.collection('notifications').where('userId','==',uid).limit(100).get();
      notifs.docs.forEach((d) => batch.delete(d.ref));
      // Delete user document
      batch.delete(db.collection('users').doc(uid));
      await batch.commit();
      functions.logger.info('Cleaned up deleted user', uid);
    } catch (e) { functions.logger.error('onUserDeleted', e); }
  });

// ── 7. Booking Created → FCM push to seller ───────────────────────────────────
export const onBookingCreated = functions.region(REGION)
  .firestore.document('bookings/{bookingId}')
  .onCreate(async (snap) => {
    const b = snap.data();
    try {
      const sellerSnap = await db.collection('users').doc(b.sellerId).get();
      const tokens: string[] = sellerSnap.data()?.fcmTokens ?? [];
      if (!tokens.length) return;
      await admin.messaging().sendEachForMulticast({
        tokens,
        notification: { title: '📩 New Buyer Inquiry!', body: `${b.buyerName} is interested in "${b.productTitle}"` },
        data:         { bookingId: snap.id, type: 'booking_received' },
        android:      { priority: 'high' },
        apns:         { payload: { aps: { badge: 1, sound: 'default' } } },
      });
    } catch (e) { functions.logger.error('onBookingCreated FCM', e); }
  });

// ── 8. Callable: get platform stats (admin only) ──────────────────────────────
export const getPlatformStats = functions.region(REGION)
  .https.onCall(async (_data, ctx) => {
    if (!ctx.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');
    const caller = await db.collection('users').doc(ctx.auth.uid).get();
    if (caller.data()?.role !== 'admin') throw new functions.https.HttpsError('permission-denied', 'Admin only');
    const [users, active, sold, pending, reports] = await Promise.all([
      db.collection('users').count().get(),
      db.collection('products').where('status','==','active').count().get(),
      db.collection('products').where('status','==','sold').count().get(),
      db.collection('products').where('status','==','pending').count().get(),
      db.collection('reports').where('status','==','pending').count().get(),
    ]);
    return {
      totalUsers:      users.data().count,
      activeListings:  active.data().count,
      soldProducts:    sold.data().count,
      pendingApprovals:pending.data().count,
      openReports:     reports.data().count,
      timestamp:       admin.firestore.Timestamp.now(),
    };
  });

// ── 9. HTTP: health check ─────────────────────────────────────────────────────
export const healthCheck = functions.region(REGION)
  .https.onRequest((req, res) => {
    // Only GET allowed
    if (req.method !== 'GET') { res.status(405).json({ error: 'Method not allowed' }); return; }
    res.status(200).json({ status: 'ok', service: 'Easy Deals LMG', region: REGION, ts: new Date().toISOString() });
  });