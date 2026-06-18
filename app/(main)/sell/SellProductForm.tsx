// app/(main)/sell/SellProductForm.tsx
'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Upload, X, CheckCircle, AlertCircle, Loader2, ChevronRight, ChevronLeft } from 'lucide-react';
import { productSchema, ProductFormData } from '@/lib/validations/schemas';
import { uploadProductImage, createProduct } from '@/lib/firebase/productService';
import { useAuthStore } from '@/store/authStore';
import { PRODUCT_CATEGORIES, SERVICE_AREAS } from '@/types';
import { validateImageFile, cn } from '@/lib/utils';
import imageCompression from 'browser-image-compression';
import toast from 'react-hot-toast';

const STEPS = [
  { id: 1, title: 'Product Info', icon: '📝' },
  { id: 2, title: 'Photos',       icon: '📸' },
  { id: 3, title: 'Contact',      icon: '✅' },
];

interface UploadedImage {
  file: File; preview: string;
  url?: string; storagePath?: string;
  uploading?: boolean; progress?: number; error?: string;
}

export function SellProductForm() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [step, setStep]       = useState(1);
  const [images, setImages]   = useState<UploadedImage[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, watch, trigger, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: { negotiable: false },
  });

  const onDrop = useCallback(async (accepted: File[]) => {
    if (!user) { toast.error('Please login first'); return; }
    const toAdd = accepted.slice(0, 6 - images.length);
    const valid = toAdd.filter((f) => { const v = validateImageFile(f); if (!v.valid) toast.error(v.error ?? 'Invalid file'); return v.valid; });
    const newImgs: UploadedImage[] = valid.map((f) => ({ file: f, preview: URL.createObjectURL(f), uploading: true }));
    setImages((p) => [...p, ...newImgs]);

    for (const img of newImgs) {
      try {
        const compressed = await imageCompression(img.file, { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true });
        const uploaded   = await uploadProductImage(compressed as unknown as File, user.uid, (pct) => {
          setImages((p) => p.map((i) => i.preview === img.preview ? { ...i, progress: pct } : i));
        });
        setImages((p) => p.map((i) => i.preview === img.preview ? { ...i, uploading: false, url: uploaded.url, storagePath: uploaded.storagePath } : i));
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Upload failed';
        setImages((p) => p.map((i) => i.preview === img.preview ? { ...i, uploading: false, error: msg } : i));
        toast.error(msg);
      }
    }
  }, [images, user]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] }, maxFiles: 6, maxSize: 5 * 1024 * 1024,
  });

  const goNext = async () => {
    const fields: Record<number, (keyof ProductFormData)[]> = {
      1: ['title', 'category', 'condition', 'price', 'description'],
      2: [], 3: ['location', 'city', 'whatsappNumber'],
    };
    const valid = await trigger(fields[step]);
    if (step === 2 && images.filter((i) => !i.error).length === 0) { toast.error('Add at least one photo'); return; }
    if (valid) setStep((s) => Math.min(s + 1, 3));
  };

  const onSubmit = async (data: ProductFormData) => {
    if (!user || !isAuthenticated) { router.push('/login?redirect=/sell'); return; }
    const uploaded = images.filter((i) => i.url && i.storagePath);
    if (!uploaded.length) { toast.error('At least one photo required'); return; }
    if (images.some((i) => i.uploading)) { toast.error('Wait for uploads to finish'); return; }
    setSubmitting(true);
    try {
      const id = await createProduct({
        ...data,
        images:          uploaded.map((i) => ({ url: i.url!, storagePath: i.storagePath! })),
        sellerId:        user.uid,
        sellerName:      user.displayName ?? 'Seller',
        sellerPhoto:     user.photoURL ?? undefined,
        sellerWhatsapp:  data.whatsappNumber,
        isVerifiedSeller: user.isVerifiedSeller,
        tags: [],
      });
      toast.success("🎉 Listing submitted! We'll review it within a few hours.");
      router.push(`/products/${id}`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* Stepper */}
      <div className="flex items-center justify-between mb-8">
        {STEPS.map(({ id, title, icon }, i) => (
          <div key={id} className="flex items-center flex-1">
            <div className={cn('flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all',
              step === id ? 'bg-brand-500 text-white shadow-brand' : step > id ? 'bg-accent-500 text-white' : 'bg-surface-100 text-surface-400')}>
              <span>{step > id ? '✓' : icon}</span>
              <span className="hidden sm:block text-sm font-semibold">{title}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn('flex-1 h-0.5 mx-2 rounded-full transition-colors', step > id ? 'bg-accent-400' : 'bg-surface-200')} />
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-surface-100 shadow-card overflow-hidden">
        <AnimatePresence mode="wait">

          {/* Step 1 */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6 sm:p-8 space-y-5">
              <h2 className="font-display text-xl font-bold text-surface-900">Product Information</h2>

              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-1.5">Product Name <span className="text-red-500">*</span></label>
                <input {...register('title')} placeholder="e.g. Samsung Galaxy S21" className={cn('input-base', errors.title && 'input-error')} maxLength={100} />
                {errors.title && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.title.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-2">Category <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRODUCT_CATEGORIES.map(({ id, name, icon }) => (
                    <label key={id} className={cn('flex flex-col items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all',
                      watch('category') === id ? 'border-brand-500 bg-brand-50' : 'border-surface-200 hover:border-brand-200')}>
                      <input type="radio" value={id} {...register('category')} className="sr-only" />
                      <span className="text-2xl">{icon}</span>
                      <span className="text-xs font-medium text-center">{name}</span>
                    </label>
                  ))}
                </div>
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-2">Condition <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { v: 'like_new', l: 'Like New', e: '⭐' },
                    { v: 'good',     l: 'Good',     e: '✅' },
                    { v: 'fair',     l: 'Fair',     e: '🆗' },
                    { v: 'poor',     l: 'Poor',     e: '⚠️' },
                  ].map(({ v, l, e }) => (
                    <label key={v} className={cn('flex flex-col items-center gap-1 p-3 rounded-xl border-2 cursor-pointer transition-all',
                      watch('condition') === v ? 'border-brand-500 bg-brand-50' : 'border-surface-200 hover:border-brand-200')}>
                      <input type="radio" value={v} {...register('condition')} className="sr-only" />
                      <span className="text-2xl">{e}</span>
                      <span className="text-xs font-bold">{l}</span>
                    </label>
                  ))}
                </div>
                {errors.condition && <p className="text-red-500 text-xs mt-1">{errors.condition.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-surface-700 mb-1.5">Price (₹) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 font-semibold">₹</span>
                    <input type="number" {...register('price', { valueAsNumber: true })} placeholder="0" min={1}
                      className={cn('input-base pl-8', errors.price && 'input-error')} />
                  </div>
                  {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" {...register('negotiable')} className="w-5 h-5 rounded accent-brand-500" />
                    <div>
                      <p className="text-sm font-semibold text-surface-700">Negotiable</p>
                      <p className="text-xs text-surface-400">Allow buyers to bargain</p>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-1.5">Description <span className="text-red-500">*</span></label>
                <textarea {...register('description')} rows={4} maxLength={2000} placeholder="Describe your product: age, reason for selling, any defects…"
                  className={cn('input-base resize-none', errors.description && 'input-error')} />
                <div className="flex justify-between mt-1">
                  {errors.description ? <p className="text-red-500 text-xs">{errors.description.message}</p> : <span />}
                  <span className="text-xs text-surface-400">{watch('description')?.length ?? 0}/2000</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6 sm:p-8">
              <h2 className="font-display text-xl font-bold text-surface-900 mb-2">Product Photos</h2>
              <p className="text-sm text-surface-500 mb-6">Upload 1–6 clear photos. Good photos get 3x more inquiries!</p>

              <div {...getRootProps()} className={cn('border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all',
                isDragActive ? 'border-brand-500 bg-brand-50' : 'border-surface-300 hover:border-brand-300 hover:bg-brand-50/50')}>
                <input {...getInputProps()} />
                <Upload size={36} className="mx-auto text-surface-300 mb-3" />
                <p className="font-semibold text-surface-700 mb-1">{isDragActive ? 'Drop photos here' : 'Click to upload or drag & drop'}</p>
                <p className="text-sm text-surface-400">JPG, PNG, WEBP · Max 5MB each · Up to 6 photos</p>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-5">
                  {images.map((img, idx) => (
                    <div key={img.preview} className="relative aspect-square rounded-xl overflow-hidden bg-surface-100 border border-surface-200">
                      <Image src={img.preview} alt={`Preview ${idx + 1}`} fill className="object-cover" />
                      {img.uploading && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-1">
                          <Loader2 size={20} className="text-white animate-spin" />
                          <span className="text-white text-xs">{img.progress ?? 0}%</span>
                        </div>
                      )}
                      {img.url && !img.uploading && (
                        <div className="absolute bottom-1.5 left-1.5">
                          <CheckCircle size={16} className="text-white drop-shadow" fill="#10b981" />
                        </div>
                      )}
                      {img.error && (
                        <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center">
                          <AlertCircle size={20} className="text-white" />
                        </div>
                      )}
                      {!img.uploading && (
                        <button type="button" onClick={() => setImages((p) => p.filter((_, i) => i !== idx))}
                          className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center">
                          <X size={12} />
                        </button>
                      )}
                      {idx === 0 && (
                        <div className="absolute bottom-1.5 right-1.5 px-2 py-0.5 bg-brand-500 text-white text-[10px] font-bold rounded">COVER</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6 sm:p-8 space-y-5">
              <h2 className="font-display text-xl font-bold text-surface-900">Contact & Location</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-surface-700 mb-1.5">City <span className="text-red-500">*</span></label>
                  <select {...register('city')} className={cn('input-base', errors.city && 'input-error')}>
                    <option value="">Select city</option>
                    {SERVICE_AREAS.map(({ name }) => <option key={name} value={name}>{name}</option>)}
                  </select>
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-surface-700 mb-1.5">Area / Locality <span className="text-red-500">*</span></label>
                  <input {...register('location')} placeholder="e.g. Shillong Road, Silchar" className={cn('input-base', errors.location && 'input-error')} />
                  {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-1.5">WhatsApp Number <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 text-sm">+91</span>
                  <input type="tel" {...register('whatsappNumber')} placeholder="98765 43210"
                    className={cn('input-base pl-12', errors.whatsappNumber && 'input-error')} />
                </div>
                {errors.whatsappNumber && <p className="text-red-500 text-xs mt-1">{errors.whatsappNumber.message}</p>}
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-700">
                ⚠️ By submitting, you agree to our Terms & Conditions. Listing will be reviewed within 24 hours before going live.
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="px-6 sm:px-8 py-5 border-t border-surface-100 flex justify-between gap-3">
          {step > 1 ? (
            <button type="button" onClick={() => setStep((s) => s - 1)} className="btn-secondary">
              <ChevronLeft size={16} /> Back
            </button>
          ) : <div />}

          {step < 3 ? (
            <button type="button" onClick={goNext} className="btn-primary">
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button type="submit" disabled={submitting} className="btn-primary min-w-[160px]">
              {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting…</> : <><CheckCircle size={16} /> Submit Listing</>}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}