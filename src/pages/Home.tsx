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
 * الصفحة الرئيسية = الواجهة وحدها، بملء الشاشة، فوق مشهد نجدي مرسوم.
 * «كيف يعمل أَثَر» و«أحدث ما أُضيف» لكلٍّ منهما صفحته المستقلة.
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
      {/* نقشة هندسية خفيفة خلف كل شيء */}
      <div className="pattern-najdi absolute inset-0" aria-hidden />
      <div
        className="absolute inset-0"
        aria-hidden
        style={{
          background:
            'linear-gradient(180deg, color-mix(in srgb, var(--surface) 62%, transparent) 0%, var(--surface) 72%)',
        }}
      />

      {/* المشهد النجدي المرسوم — نخيل وبيوت طين وعائلة */}
      <HeroBackdrop />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-20 text-center">
        <h1 className="display mx-auto max-w-3xl text-4xl font-bold leading-[1.25] sm:text-6xl">
          كل صورة قديمة
          <br />
          <span style={{ color: 'var(--accent)' }}>أَثَرٌ لا يُمحى</span>
        </h1>

        <p
          className="mx-auto mt-6 max-w-2xl text-base leading-relaxed sm:text-lg"
          style={{ color: 'var(--text-muted)' }}
        >
          أسواقٌ تغيّرت، وشوارعُ لم تعد كما كانت، ومنازلُ لم يبقَ منها إلا الصور.
          <br />
          ارفع ما لديك، ودع أَثَر يساعدك على توثيقه وحفظه للأجيال القادمة.
        </p>

        {/* الشارة تسبق الزرّين مباشرةً */}
        <span className="chip mx-auto mt-10">منصة سعودية لحفظ الذاكرة البصرية</span>

        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Link to="/add" className="btn btn-primary px-7">
            أضف صورة
          </Link>
          <Link to="/explore" className="btn btn-outline px-7">
            استكشف الأرشيف
          </Link>
        </div>

        {stats && stats.photo_count > 0 && (
          <dl className="mx-auto mt-14 grid max-w-lg grid-cols-3 gap-4">
            {[
              { label: 'صورة موثّقة', value: stats.photo_count },
              { label: 'منطقة', value: stats.region_count },
              { label: 'مساهم', value: stats.contributor_count },
            ].map((s) => (
              <div key={s.label}>
                <dd className="display text-3xl font-bold" style={{ color: 'var(--ink)' }}>
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
