import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { PhotoCard, PhotoCardSkeleton } from '../components/PhotoCard'
import { Alert } from '../components/Alert'
import { REGIONS } from '../lib/constants'
import type { Photo } from '../lib/types'

/** أحدث ما أُضيف — صفحة مستقلة تعرض آخر المساهمات، مع تصفّح سريع حسب المنطقة. */
export function Latest() {
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
        .order('created_at', { ascending: false })
        .limit(12)

      if (!active) return

      if (err) setError('تعذّر جلب الصور — تحقّق من الاتصال وأعد المحاولة.')
      else setPhotos((data ?? []) as Photo[])

      setLoading(false)
    })()

    return () => {
      active = false
    }
  }, [])

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-3xl font-bold sm:text-4xl">أحدث ما أُضيف</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            صور وثّقها المساهمون مؤخراً في أرشيف أَثَر.
          </p>
        </div>
        <Link
          to="/explore"
          className="shrink-0 text-sm font-bold hover:underline"
          style={{ color: 'var(--accent)' }}
        >
          استكشف الأرشيف كاملاً ←
        </Link>
      </header>

      {error && (
        <div className="mt-6">
          <Alert tone="error">{error}</Alert>
        </div>
      )}

      {/* التصفّح حسب المنطقة أعلى الصفحة — قبل الصور لا بعدها */}
      <section className="mt-8">
        <h2 className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>
          تصفّح حسب المنطقة
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {REGIONS.map((r) => (
            <Link
              key={r}
              to={`/explore?region=${encodeURIComponent(r)}`}
              className="rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
              style={{ borderColor: 'var(--border-strong)', color: 'var(--text-muted)' }}
            >
              {r}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }, (_, i) => <PhotoCardSkeleton key={i} />)
        ) : photos.length > 0 ? (
          photos.map((p) => <PhotoCard key={p.id} photo={p} />)
        ) : (
          !error && (
            <div className="card col-span-full p-12 text-center">
              <p className="display text-lg font-bold">الأرشيف ينتظر أول صورة</p>
              <p className="mx-auto mt-2 max-w-md text-sm" style={{ color: 'var(--text-muted)' }}>
                لم تُضف أي صورة بعد. كن أول من يساهم في حفظ الذاكرة البصرية للمملكة.
              </p>
              <Link to="/add" className="btn btn-primary mt-5">
                أضف أول صورة
              </Link>
            </div>
          )
        )}
      </section>

    </div>
  )
}
