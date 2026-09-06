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
        {/* العبارة الجامعة */}
        <h1
          className="display mx-auto max-w-3xl text-4xl font-bold leading-[1.3] sm:text-6xl"
          style={{ color: 'var(--ink)' }}
        >
          كل صورةٍ قديمة
          <br />
          <span style={{ color: 'var(--accent)' }}>أَثَرٌ لا يُمحى</span>
        </h1>

        {/* الوصف */}
        <p
          className="mx-auto mt-7 max-w-2xl text-base leading-relaxed sm:text-lg"
          style={{ color: 'var(--text-muted)' }}
        >
          أسواقٌ تغيّرت، وشوارعُ لم تعد كما كانت، ومنازلُ لم يبقَ منها إلا الصور.
          <br />
          ارفع ما لديك، ودع أَثَر يساعدك على توثيقه وحفظه للأجيال القادمة.
        </p>

        {/* الشارة */}
        <span className="chip mx-auto mt-9">منصة سعودية لحفظ الذاكرة البصرية</span>

        {/* الفعل */}
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Link to="/add" className="btn btn-primary px-7">
            أضف صورة
          </Link>
          <Link to="/explore" className="btn btn-outline px-7">
            استكشف الأرشيف
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
