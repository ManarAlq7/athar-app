import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, isSupabaseConfigured, publicImageUrl } from '../lib/supabase'
import { Spinner } from '../components/Spinner'
import { Alert } from '../components/Alert'
import type { Photo } from '../lib/types'

interface Decade {
  start: number
  label: string
  photos: Photo[]
}

/** ١٩٥٢ → ١٩٥٠ */
const decadeOf = (year: number) => Math.floor(year / 10) * 10

export function Timeline() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    let active = true

    void (async () => {
      const { data, error: err } = await supabase
        .from('photos')
        .select('*')
        .order('approx_year', { ascending: true, nullsFirst: false })

      if (!active) return

      if (err) setError('تعذّر جلب الصور — أعد المحاولة.')
      else setPhotos((data ?? []) as Photo[])

      setLoading(false)
    })()

    return () => {
      active = false
    }
  }, [])

  const { decades, undated } = useMemo(() => {
    const dated = photos.filter((p) => p.approx_year !== null)
    const undatedList = photos.filter((p) => p.approx_year === null)

    const map = new Map<number, Photo[]>()
    for (const p of dated) {
      const d = decadeOf(p.approx_year as number)
      map.set(d, [...(map.get(d) ?? []), p])
    }

    const list: Decade[] = [...map.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([start, ps]) => ({
        start,
        label: `${start}`,
        photos: ps.sort((a, b) => (a.approx_year ?? 0) - (b.approx_year ?? 0)),
      }))

    return { decades: list, undated: undatedList }
  }, [photos])

  const span =
    decades.length > 0
      ? `${decades[0].start} — ${decades[decades.length - 1].start + 9}`
      : ''

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <header className="text-center">
        <h1 className="display text-3xl font-bold sm:text-4xl">الخط الزمني</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          الأرشيف مرتّباً كما جرى الزمن — من أقدم صورة إلى أحدثها.
        </p>
        {span && (
          <p className="display mt-4 text-lg font-bold" style={{ color: 'var(--accent)' }}>
            <span className="num">{span}</span>
          </p>
        )}
      </header>

      {error && (
        <div className="mt-8">
          <Alert tone="error">{error}</Alert>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner label="جارٍ ترتيب الزمن…" />
        </div>
      ) : decades.length === 0 && undated.length === 0 ? (
        <div className="card mt-10 p-12 text-center">
          <p className="display text-lg font-bold">لا صور في الأرشيف بعد</p>
          <Link to="/add" className="btn btn-primary mt-5">
            أضف أول صورة
          </Link>
        </div>
      ) : (
        <div className="relative mt-14">
          {/* العمود الفقري — عند حافة البداية (اليمين في العربية) */}
          <div
            className="absolute bottom-0 top-0 w-px"
            style={{ insetInlineStart: '2.5rem', backgroundColor: 'var(--border-strong)' }}
            aria-hidden
          />

          {decades.map((d) => (
            <section key={d.start} className="relative mb-14" style={{ paddingInlineStart: '6.5rem' }}>
              <span
                className="display absolute top-0 flex size-20 items-center justify-center rounded-full border-4 text-base font-bold"
                style={{
                  insetInlineStart: 0,
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--accent-soft)',
                  color: 'var(--accent)',
                }}
              >
                <span className="num">{d.label}</span>
              </span>

              <div className="pt-3">
                <h2 className="display text-lg font-bold">
                  عقد <span className="num">{d.label}</span>
                </h2>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  <span className="num">{d.photos.length}</span> صورة
                </p>
              </div>

              <ol className="mt-6 space-y-4">
                {d.photos.map((p) => (
                  <li key={p.id}>
                    <Link
                      to={`/photo/${p.id}`}
                      className="card group flex items-stretch gap-4 overflow-hidden transition-shadow hover:shadow-[var(--shadow)]"
                    >
                      <div
                        className="relative h-36 w-32 shrink-0 overflow-hidden sm:h-44 sm:w-44"
                        style={{ backgroundColor: 'var(--surface-alt)' }}
                      >
                        <img
                          src={publicImageUrl(p.image_path)}
                          alt={p.title}
                          loading="lazy"
                          className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                        />
                      </div>

                      <div className="min-w-0 flex-1 py-4 pe-4">
                        <div className="flex items-center gap-2">
                          <span
                            className="display text-sm font-bold"
                            style={{ color: 'var(--accent)' }}
                          >
                            <span className="num">{p.approx_year}</span>
                          </span>
                          <span className="chip">{p.category}</span>
                        </div>
                        <h3 className="display mt-2 line-clamp-2 text-base font-bold leading-snug">
                          {p.title}
                        </h3>
                        <p
                          className="mt-1.5 line-clamp-2 text-sm leading-relaxed"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {p.description}
                        </p>
                        <p className="mt-2 text-xs" style={{ color: 'var(--text-faint)' }}>
                          {p.region}
                          {p.city ? ` · ${p.city}` : ''}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          ))}

          {undated.length > 0 && (
            <section className="relative" style={{ paddingInlineStart: '6.5rem' }}>
              <span
                className="display absolute top-0 flex size-20 items-center justify-center rounded-full border-4 text-center text-xs font-bold leading-tight"
                style={{
                  insetInlineStart: 0,
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-faint)',
                }}
              >
                بلا
                <br />
                تاريخ
              </span>

              <div className="pt-3">
                <h2 className="display text-lg font-bold">صور لم تُؤرَّخ بعد</h2>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  تعرف سنتها؟ ساعدنا في تحديدها.
                </p>
              </div>

              <ol className="mt-6 grid gap-4 sm:grid-cols-2">
                {undated.map((p) => (
                  <li key={p.id}>
                    <Link
                      to={`/photo/${p.id}`}
                      className="card group block overflow-hidden transition-shadow hover:shadow-[var(--shadow)]"
                    >
                      <div
                        className="aspect-[4/3] overflow-hidden"
                        style={{ backgroundColor: 'var(--surface-alt)' }}
                      >
                        <img
                          src={publicImageUrl(p.image_path)}
                          alt={p.title}
                          loading="lazy"
                          className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="display line-clamp-2 text-base font-bold leading-snug">
                          {p.title}
                        </h3>
                        <p className="mt-1.5 text-xs" style={{ color: 'var(--text-faint)' }}>
                          {p.region}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
