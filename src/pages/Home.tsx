import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { Alert } from '../components/Alert'
import { HeroBackdrop } from '../components/HeroBackdrop'

interface Stats {
  photo_count: number
  region_count: number
  contributor_count: number
}

/**
 * الصفحة الرئيسية — الهوية البصرية الأصلية لأَثَر (بيج وبنّي وأفق نجدي هادئ)،
 * ومعها رسالة المشروع: الاسم، ثم العبارة الجامعة، ثم وصف مختصر، ثم الفعل.
 */
export function Home() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    if (!isSupabaseConfigured) return
    let active = true

    void (async () => {
      const { data } = await supabase.rpc('archive_stats').single()
      if (active && data) setStats(data as Stats)
    })()

    return () => {
      active = false
    }
  }, [])

  return (
    <section className="relative flex min-h-[calc(100dvh-74px)] items-center overflow-hidden">
      <HeroBackdrop />

      <div className="relative z-10 mx-auto w-full max-w-3xl px-4 py-16 text-center">
        {/* أَثَر و ATHAR جنباً إلى جنب */}
        <h1
          className="display flex items-baseline justify-center gap-3.5 text-4xl font-bold leading-none sm:text-5xl"
          style={{ color: 'var(--ink)' }}
        >
          <span>أَثَر</span>
          <span
            className="text-[11px] font-medium sm:text-xs"
            style={{ color: 'var(--text-faint)', letterSpacing: '0.34em' }}
          >
            ATHAR
          </span>
        </h1>

        {/* الخط الأخضر الفاصل */}
        <span
          className="mx-auto mt-5 block h-[3px] w-20 rounded-full"
          style={{ backgroundColor: 'var(--accent)' }}
          aria-hidden
        />

        {/* الذاكرة البصرية للمملكة */}
        <p className="display mt-6 text-xl font-medium sm:text-2xl" style={{ color: 'var(--text-muted)' }}>
          الذاكرة البصرية للمملكة
        </p>

        {/* العبارة الجامعة */}
        <p
          className="display mx-auto mt-8 max-w-2xl text-xl leading-[1.7] sm:text-2xl"
          style={{ color: 'var(--ink)', fontWeight: 400 }}
        >
          كل صورةٍ قديمة…{' '}
          <span style={{ color: 'var(--accent)', fontWeight: 700 }}>أَثَرٌ لا يُمحى.</span>
        </p>

        {/* الوصف */}
        <p
          className="mx-auto mt-6 max-w-xl text-sm leading-loose sm:text-base"
          style={{ color: 'var(--text-muted)' }}
        >
          مساحة تحفظ صور الأماكن وذكرياتها، وتجمع حكايات المدن والأحياء والديار كما بقيت في ذاكرة
          من عاشها.
        </p>

        {/* الفعل */}
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link to="/explore" className="btn btn-primary px-7">
            استكشف الذاكرة
          </Link>
          <Link to="/add" className="btn btn-outline px-7">
            أضف أثرك
          </Link>
        </div>

        {stats && stats.photo_count > 0 && (
          <dl className="mx-auto mt-12 grid max-w-md grid-cols-3 gap-4">
            {[
              { label: 'صورة موثّقة', value: stats.photo_count },
              { label: 'منطقة', value: stats.region_count },
              { label: 'مساهم', value: stats.contributor_count },
            ].map((s) => (
              <div key={s.label}>
                <dd className="display text-2xl font-bold" style={{ color: 'var(--ink)' }}>
                  <span className="num">{s.value}</span>
                </dd>
                <dt className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                  {s.label}
                </dt>
              </div>
            ))}
          </dl>
        )}

        {!isSupabaseConfigured && (
          <div className="mx-auto mt-10 max-w-xl text-start">
            <Alert tone="warning">
              <strong>الموقع غير مربوط بقاعدة البيانات بعد.</strong> اضبط{' '}
              <code className="num">VITE_SUPABASE_URL</code> و{' '}
              <code className="num">VITE_SUPABASE_ANON_KEY</code>.
            </Alert>
          </div>
        )}
      </div>
    </section>
  )
}
