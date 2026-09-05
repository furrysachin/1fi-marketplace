export default function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-ink-200 bg-white px-6 py-16 text-center">
      {Icon && (
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-50 text-ink-500">
          <Icon size={26} />
        </span>
      )}
      <h2 className="text-lg font-bold text-ink-900">{title}</h2>
      {subtitle && <p className="max-w-sm text-sm leading-relaxed text-ink-500">{subtitle}</p>}
      {action}
    </div>
  );
}