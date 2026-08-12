import type { ReactNode } from 'react'

type Tone = 'error' | 'info' | 'success' | 'warning'

const TONES: Record<Tone, { bg: string; fg: string; border: string }> = {
  error: { bg: 'var(--danger-soft)', fg: 'var(--danger)', border: '#e8c4c4' },
  info: { bg: 'var(--surface-alt)', fg: 'var(--text-muted)', border: 'var(--border)' },
  success: { bg: 'var(--accent-soft)', fg: 'var(--accent-hover)', border: '#c9e0d2' },
  warning: { bg: '#fdf6e7', fg: '#8a6416', border: '#e8d6a8' },
}

export function Alert({ tone = 'info', children }: { tone?: Tone; children: ReactNode }) {
  const t = TONES[tone]
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className="rounded-xl border px-4 py-3 text-sm leading-relaxed"
      style={{ backgroundColor: t.bg, color: t.fg, borderColor: t.border }}
    >
      {children}
    </div>
  )
}
