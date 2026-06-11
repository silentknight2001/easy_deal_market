// app/loading.tsx
export default function GlobalLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-surface-100" />
          <div className="absolute inset-0 rounded-full border-4 border-t-brand-500 animate-spin" />
          <div className="absolute inset-2 rounded-full bg-brand-50 flex items-center justify-center">
            <span className="text-lg">ED</span>
          </div>
        </div>
        <p className="text-sm text-surface-400 font-medium animate-pulse">Loading Easy Deals…</p>
      </div>
    </div>
  );
}