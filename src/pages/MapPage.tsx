import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { SaudiMap } from '../components/SaudiMap'
import { Spinner } from '../components/Spinner'
import { Alert } from '../components/Alert'
import { REGIONS } from '../lib/constants'

export function MapPage() {
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    let active = true

    void (async () => {
      // العدد صغير، فالتجميع في المتصفح أبسط من دالة إضافية في القاعدة
      const { data, error: err } = await supabase.from('photos').select('region')

      if (!active) return

      if (err) {
        setError('تعذّر جلب توزيع الصور على المناطق.')
      } else {
        const tally: Record<string, number> = {}
        for (const row of data ?? []) {
          const r = (row as { region: string }).region
          tally[r] = (tally[r] ?? 0) + 1
        }
        setCounts(tally)
      }
      setLoading(false)
    })()

    return () => {
      active = false
    }
  }, [])

  const covered = REGIONS.filter((r) => counts[r]).length
  const total = Object.values(counts).reduce((a, b) => a + b, 0)

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <header className="text-center">
        <h1 className="display text-3xl font-bold sm:text-4xl">خريطة الذاكرة</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          كل منطقة تحمل لوناً بحسب ما وثّقه المساهمون فيها. اضغط منطقتك لترى صورها — أو لتكون أول من
          يضيف إليها.
        </p>
      </header>

      {error && (
        <div className="mt-8">
          <Alert tone="error">{error}</Alert>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner label="جارٍ رسم الخريطة…" />
        </div>
      ) : (
        <>
          <div className="mt-10">
            <SaudiMap counts={counts} />
          </div>

          <dl className="mx-auto mt-10 grid max-w-md grid-cols-3 gap-4 text-center">
            <div>
              <dd className="display text-2xl font-bold">
                <span className="num">{total}</span>
              </dd>
              <dt className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                صورة موثّقة
              </dt>
            </div>
            <div>
              <dd className="display text-2xl font-bold" style={{ color: 'var(--accent)' }}>
                <span className="num">{covered}</span>
              </dd>
              <dt className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                منطقة فيها صور
              </dt>
            </div>
            <div>
              <dd className="display text-2xl font-bold" style={{ color: 'var(--text-faint)' }}>
                <span className="num">{REGIONS.length - covered}</span>
              </dd>
              <dt className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                منطقة تنتظر
              </dt>
            </div>
          </dl>

          {/* قائمة نصّية مكافئة — للوصول من لوحة المفاتيح وقارئات الشاشة والجوّال */}
          <section className="mt-12">
            <h2 className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>
              أو اختر من القائمة
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {REGIONS.map((r) => (
                <Link
                  key={r}
                  to={`/explore?region=${encodeURIComponent(r)}`}
                  className="rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  style={{
                    borderColor: counts[r] ? 'var(--accent)' : 'var(--border-strong)',
                    color: counts[r] ? 'var(--accent)' : 'var(--text-faint)',
                  }}
                >
                  {r}
                  {counts[r] ? <span className="num mx-1.5">({counts[r]})</span> : null}
                </Link>
              ))}
            </div>
          </section>

          <p className="mt-10 text-center text-xs" style={{ color: 'var(--text-faint)' }}>
            الخريطة الأساسية من{' '}
            <a
              href="https://commons.wikimedia.org/wiki/File:Saudi_Arabia,_administrative_divisions_-_Nmbrs_-_colored.svg"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Wikimedia Commons
            </a>{' '}
            بإعداد المستخدم TUBS، برخصة المشاع الإبداعي.
          </p>
        </>
      )}
    </div>
  )
}
