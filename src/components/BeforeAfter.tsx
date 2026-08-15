import { useRef, useState } from 'react'

interface Props {
  beforeSrc: string
  afterSrc: string
  beforeYear: number | null
  afterYear: number | null
  alt: string
}

/**
 * مقارنة «قبل وبعد»: صورتان للمكان نفسه، يفصل بينهما مقبض يُسحب.
 *
 * السحب يعمل بالفأرة واللمس، ومعه شريط مدى مخفي بصرياً يتيح نفس التحكّم
 * بلوحة المفاتيح وقارئات الشاشة.
 */
export function BeforeAfter({ beforeSrc, afterSrc, beforeYear, afterYear, alt }: Props) {
  const [pos, setPos] = useState(50)
  const boxRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const moveTo = (clientX: number) => {
    const box = boxRef.current
    if (!box) return
    const r = box.getBoundingClientRect()
    const pct = ((clientX - r.left) / r.width) * 100
    setPos(Math.min(100, Math.max(0, pct)))
  }

  return (
    <figure>
      <div
        ref={boxRef}
        dir="ltr"
        className="relative select-none overflow-hidden rounded-2xl border"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-alt)', cursor: 'ew-resize' }}
        onPointerDown={(e) => {
          dragging.current = true
          e.currentTarget.setPointerCapture(e.pointerId)
          moveTo(e.clientX)
        }}
        onPointerMove={(e) => {
          if (dragging.current) moveTo(e.clientX)
        }}
        onPointerUp={(e) => {
          dragging.current = false
          e.currentTarget.releasePointerCapture(e.pointerId)
        }}
      >
        {/* الصورة القديمة — الطبقة السفلى */}
        <img src={beforeSrc} alt={`${alt} — قديماً`} className="block max-h-[70vh] w-full object-contain" />

        {/* الصورة الحديثة — تُقصّ بحسب موضع المقبض */}
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 0 0 ${pos}%)` }}
          aria-hidden
        >
          <img src={afterSrc} alt="" className="size-full object-contain" />
        </div>

        {/* الخط والمقبض */}
        <div
          className="absolute inset-y-0 w-0.5"
          style={{ left: `${pos}%`, backgroundColor: '#fdfaf3', boxShadow: '0 0 12px rgba(36,26,18,0.5)' }}
          aria-hidden
        >
          <span
            className="absolute top-1/2 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-lg font-bold"
            style={{
              left: '50%',
              backgroundColor: '#fdfaf3',
              borderColor: 'var(--accent)',
              color: 'var(--accent)',
              boxShadow: '0 2px 10px rgba(36,26,18,0.35)',
            }}
          >
            ⇄
          </span>
        </div>

        {/* شارتا السنة */}
        {beforeYear && (
          <span
            className="absolute bottom-3 left-3 rounded-full px-3 py-1 text-xs font-bold backdrop-blur"
            style={{ backgroundColor: 'rgba(36,26,18,0.75)', color: '#fdfaf3' }}
          >
            <span className="num">{beforeYear}</span>
          </span>
        )}
        {afterYear && (
          <span
            className="absolute bottom-3 right-3 rounded-full px-3 py-1 text-xs font-bold backdrop-blur"
            style={{ backgroundColor: 'rgba(0,108,53,0.85)', color: '#fdfaf3' }}
          >
            <span className="num">{afterYear}</span>
          </span>
        )}
      </div>

      {/* تحكّم مكافئ بلوحة المفاتيح */}
      <label className="mt-3 block">
        <span className="sr-only">موضع المقارنة بين الصورتين</span>
        <input
          type="range"
          min={0}
          max={100}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          className="w-full accent-[var(--accent)]"
          aria-label="اسحب للمقارنة بين الصورة القديمة والحديثة"
        />
      </label>

      <figcaption className="mt-1 text-center text-xs" style={{ color: 'var(--text-faint)' }}>
        اسحب المقبض لترى كيف تغيّر المكان
      </figcaption>
    </figure>
  )
}
