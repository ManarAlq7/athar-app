import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { PhotoCard, PhotoCardSkeleton } from '../components/PhotoCard'
import { Alert } from '../components/Alert'
import { CATEGORIES, REGIONS } from '../lib/constants'
import type { Photo } from '../lib/types'

const PAGE_SIZE = 12

export function Explore() {
  const [params, setParams] = useSearchParams()

  const search = params.get('q') ?? ''
  const region = params.get('region') ?? ''
  const category = params.get('category') ?? ''

  const [draft, setDraft] = useState(search)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // تغيّر أي فلتر يعيدنا للصفحة الأولى — وإلا ظهرت نتائج فارغة بلا سبب واضح
  useEffect(() => {
    setPage(0)
  }, [search, region, category])

  useEffect(() => {
    setDraft(search)
  }, [search])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')

    void (async () => {
      let query = supabase.from('photos').select('*', { count: 'exact' })

      if (region) query = query.eq('region', region)
      if (category) query = query.eq('category', category)
      if (search.trim()) {
        // القيم تُحاط بعلامتي اقتباس، وإلا كسرت الفاصلة داخل نص البحث صياغة or وأفشلت الاستعلام
        const raw = search.trim().replace(/\\/g, '\\\\').replace(/"/g, '\\"')
        const term = `"%${raw}%"`

        // الوسوم عمود مصفوفة لا يقبل ilike — يُطابَق بالاحتواء.
        // بدونه تعطي روابط الوسوم في صفحة التفاصيل نتيجة فارغة دائماً.
        query = query.or(
          [
            `title.ilike.${term}`,
            `description.ilike.${term}`,
            `city.ilike.${term}`,
            `story.ilike.${term}`,
            `tags.cs.{"${raw}"}`,
          ].join(','),
        )
      }

      const { data, count, error: err } = await query
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1)

      if (!active) return

      if (err) {
        setError('تعذّر جلب الصور — تحقّق من الاتصال وأعد المحاولة.')
        setPhotos([])
      } else {
        setPhotos((data ?? []) as Photo[])
        setTotal(count ?? 0)
      }
      setLoading(false)
    })()

    return () => {
      active = false
    }
  }, [search, region, category, page])

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  const hasFilters = Boolean(search || region || category)
  const pageCount = Math.ceil(total / PAGE_SIZE)

  const resultLabel = useMemo(() => {
    if (loading) return 'جارٍ البحث…'
    if (total === 0) return 'لا نتائج'
    return `${total} صورة`
  }, [loading, total])

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header>
        <h1 className="display text-3xl font-bold sm:text-4xl">استكشف الأرشيف</h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          ابحث في الذاكرة البصرية للمملكة، أو صفِّ حسب المنطقة والتصنيف.
        </p>
      </header>

      {/* ————— البحث والفلاتر ————— */}
      <section className="card mt-7 p-4" aria-label="البحث والتصفية">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            update('q', draft)
          }}
          className="flex gap-2"
        >
          <input
            type="search"
            className="field"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="ابحث بعنوان أو وصف أو مدينة…"
            aria-label="البحث في الأرشيف"
          />
          <button type="submit" className="btn btn-primary shrink-0 px-6">
            بحث
          </button>
        </form>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="region">
              المنطقة
            </label>
            <select
              id="region"
              className="field"
              value={region}
              onChange={(e) => update('region', e.target.value)}
            >
              <option value="">كل المناطق</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="category">
              التصنيف
            </label>
            <select
              id="category"
              className="field"
              value={category}
              onChange={(e) => update('category', e.target.value)}
            >
              <option value="">كل التصنيفات</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
            {resultLabel}
          </span>

          {hasFilters && (
            <button
              type="button"
              onClick={() => setParams(new URLSearchParams(), { replace: true })}
              className="text-sm underline"
              style={{ color: 'var(--text-muted)' }}
            >
              مسح الفلاتر
            </button>
          )}
        </div>
      </section>

      {error && (
        <div className="mt-6">
          <Alert tone="error">{error}</Alert>
        </div>
      )}

      {/* ————— النتائج ————— */}
      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }, (_, i) => <PhotoCardSkeleton key={i} />)
        ) : photos.length > 0 ? (
          photos.map((p) => <PhotoCard key={p.id} photo={p} />)
        ) : (
          !error && (
            <div className="card col-span-full p-12 text-center">
              <p className="display text-lg font-bold">
                {hasFilters ? 'لا توجد صور مطابقة' : 'الأرشيف فارغ'}
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm" style={{ color: 'var(--text-muted)' }}>
                {hasFilters
                  ? 'جرّب كلمات أخرى أو وسّع نطاق التصفية.'
                  : 'لم تُضف أي صورة بعد — كن أول المساهمين.'}
              </p>
            </div>
          )
        )}
      </section>

      {/* ————— التنقّل بين الصفحات ————— */}
      {pageCount > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-3" aria-label="صفحات النتائج">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="btn btn-outline !min-h-[42px]"
          >
            السابق
          </button>

          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            <span className="num">{page + 1}</span> من <span className="num">{pageCount}</span>
          </span>

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={page >= pageCount - 1}
            className="btn btn-outline !min-h-[42px]"
          >
            التالي
          </button>
        </nav>
      )}
    </div>
  )
}
