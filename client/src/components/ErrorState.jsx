import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-ink-100 bg-white px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <AlertTriangle size={22} />
      </span>
      <h2 className="text-lg font-bold text-ink-900">{title}</h2>
      {message && <p className="max-w-sm text-sm text-ink-500">{message}</p>}
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-secondary mt-2">
          <RotateCcw size={16} />
          Try again
        </button>
      )}
    </div>
  );
}