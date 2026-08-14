import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MAP_VIEWBOX, REGION_SHAPES } from '../lib/saudi-map'

interface Props {
  /** عدد الصور في كل منطقة — يحدّد شدّة اللون */
  counts: Record<string, number>
}

/**
 * خريطة المملكة التفاعلية: تُلوَّن كل منطقة بحسب عدد صورها،
 * والنقر عليها ينقل إلى الأرشيف مُصفّى على تلك المنطقة.
 */
export function SaudiMap({ counts }: Props) {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState<string | null>(null)

  const max = Math.max(1, ...Object.values(counts))

  const fillFor = (name: string) => {
    const n = counts[name] ?? 0
    if (n === 0) return 'var(--surface-alt)'
    // تدرّج من الأخضر الفاتح إلى الأخضر السعودي بحسب النصيب من الأكبر
    const t = 0.25 + 0.75 * (n / max)
    return `color-mix(in srgb, var(--accent) ${Math.round(t * 100)}%, #ffffff)`
  }

  const go = (name: string) => navigate(`/explore?region=${encodeURIComponent(name)}`)

  return (
    <div className="relative">
      <svg
        viewBox={MAP_VIEWBOX}
        className="w-full"
        role="group"
        aria-label="خريطة مناطق المملكة — اختر منطقة لعرض صورها"
      >
        {REGION_SHAPES.map((r) => {
          const active = hovered === r.name
          const n = counts[r.name] ?? 0
          return (
            <g
              key={r.name}
              role="button"
              tabIndex={0}
              aria-label={`${r.name} — ${n} صورة`}
              onMouseEnter={() => setHovered(r.name)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(r.name)}
              onBlur={() => setHovered(null)}
              onClick={() => go(r.name)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  go(r.name)
                }
              }}
              style={{ cursor: 'pointer', outline: 'none' }}
            >
              {r.paths.map((d, i) => (
                <path
                  key={i}
                  d={d}
                  fill={fillFor(r.name)}
                  stroke={active ? 'var(--ink)' : 'var(--border-strong)'}
                  strokeWidth={active ? 6 : 3}
                  style={{
                    transition: 'fill 140ms ease, stroke 140ms ease',
                    filter: active ? 'brightness(0.94)' : undefined,
                  }}
                />
              ))}
            </g>
          )
        })}
      </svg>

      {/* بطاقة المنطقة تحت المؤشّر */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center"
        aria-live="polite"
      >
        {hovered && (
          <div
            className="rounded-xl border px-4 py-2 text-sm font-bold shadow-[var(--shadow)]"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border-strong)' }}
          >
            {hovered}
            <span className="mx-2" style={{ color: 'var(--border-strong)' }}>
              ·
            </span>
            <span style={{ color: counts[hovered] ? 'var(--accent)' : 'var(--text-faint)' }}>
              {counts[hovered] ? (
                <>
                  <span className="num">{counts[hovered]}</span> صورة
                </>
              ) : (
                'لا صور بعد'
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
