export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-3" role="status" aria-live="polite">
      <span
        className="size-8 animate-spin rounded-full border-2 border-t-transparent"
        style={{ borderColor: 'var(--border-strong)', borderTopColor: 'var(--accent)' }}
        aria-hidden
      />
      {label && (
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {label}
        </span>
      )}
    </div>
  )
}
