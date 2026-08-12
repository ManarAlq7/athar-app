import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { PhotoCard, PhotoCardSkeleton } from '../components/PhotoCard'
import { Alert } from '../components/Alert'
import { HeroBackdrop } from '../components/HeroBackdrop'
import { REGIONS } from '../lib/constants'
import type { Photo } from '../lib/types'

interface Stats {
  photo_count: number
  region_count: number
  contributor_count: number
}

const STEPS = [
  {
    n: '١',
    title: 'ارفع الصورة',
    body: 'صورة قديمة لسوق أو شارع أو منزل أو مدرسة أو معلم سعودي.',
  },
  {
    n: '٢',
    title: 'أضف ما تعرفه',
    body: 'المنطقة والمدينة والسنة التقريبية والقصة المرتبطة بها — بقدر ما تذكر.',
  },
  {
    n: '٣',
    title: 'دع أَثَر يساعدك',
    body: 'الذكاء الاصطناعي يقترح عنواناً ووصفاً وتصنيفاً ووسوماً، وأنت تراجع وتعدّل.',
  },
  {
    n: '٤',
    title: 'احفظها في الأرشيف',
    body: 'تصبح جزءاً من ذاكرة بصرية مفتوحة للجميع.',
  },
]

export function Home() {
  const [recent, setRecent] = useState<Photo[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    let active = true

    void (async () => {
      const [photosRes, statsRes] = await Promise.all([
        supabase.from('photos').select('*').order('created_at', { ascending: false }).limit(8),
        supabase.rpc('archive_stats').single(),
      ])

      if (!active) return

      if (photosRes.data) setRecent(photosRes.data as Photo[])
      if (statsRes.data) setStats(statsRes.data as Stats)
      setLoading(false)
    })()

    return () => {
      active = false
    }
  }, [])

  return (
    <div>
      {/* ————— الواجهة الرئيسية ————— */}
      <section className="relative overflow-hidden">
        <div className="pattern-najdi absolute inset-0 -z-10" aria-hidden />
        <div
          className="absolute inset-0 -z-10"
          aria-hidden
          style={{
            background:
              'linear-gradient(180deg, color-mix(in srgb, var(--surface) 55%, transparent) 0%, var(--surface) 78%)',
          }}
        />
        <HeroBackdrop />

        <div className="mx-auto max-w-6xl px-4 pb-16 pt-16 text-center sm:pb-24 sm:pt-24">
          <span className="chip mx-auto">منصة سعودية لحفظ الذاكرة البصرية</span>

          <h1 className="display mx-auto mt-6 max-w-3xl text-4xl font-bold leading-[1.25] sm:text-6xl">
            كل صورة قديمة
            <br />
            <span style={{ color: 'var(--accent)' }}>أَثَرٌ لا يُمحى</span>
          </h1>

          <p
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed sm:text-lg"
            style={{ color: 'var(--text-muted)' }}
          >
            أسواقٌ تغيّرت، وشوارعُ لم تعد كما كانت، ومنازلُ لم يبقَ منها إلا الصور. ارفع ما لديك، ودع
            أَثَر يساعدك على توثيقه وحفظه للأجيال القادمة.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-3">
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
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4">
        {!isSupabaseConfigured && (
          <Alert tone="warning">
            <strong>الموقع غير مربوط بقاعدة البيانات بعد.</strong> اضبط{' '}
            <code className="num">VITE_SUPABASE_URL</code> و{' '}
            <code className="num">VITE_SUPABASE_ANON_KEY</code> في ملف <code className="num">.env</code>{' '}
            ثم أعد التشغيل.
          </Alert>
        )}

        {/* ————— كيف يعمل ————— */}
        <section className="py-16">
          <h2 className="display text-center text-2xl font-bold sm:text-3xl">كيف يعمل أَثَر؟</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            أربع خطوات من الصورة إلى الأرشيف.
          </p>

          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <li key={s.n} className="card p-5">
                <span
                  className="display flex size-10 items-center justify-center rounded-xl text-lg font-bold"
                  style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}
                  aria-hidden
                >
                  {s.n}
                </span>
                <h3 className="display mt-4 text-base font-bold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {s.body}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* ————— أحدث الإضافات ————— */}
        <section className="pb-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="display text-2xl font-bold sm:text-3xl">أحدث ما أُضيف</h2>
              <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                صور وثّقها المساهمون مؤخراً.
              </p>
            </div>
            <Link
              to="/explore"
              className="shrink-0 text-sm font-bold hover:underline"
              style={{ color: 'var(--accent)' }}
            >
              عرض الكل ←
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {loading ? (
              Array.from({ length: 4 }, (_, i) => <PhotoCardSkeleton key={i} />)
            ) : recent.length > 0 ? (
              recent.map((p) => <PhotoCard key={p.id} photo={p} />)
            ) : (
              <div className="card col-span-full p-10 text-center">
                <p className="display text-lg font-bold">الأرشيف ينتظر أول صورة</p>
                <p className="mx-auto mt-2 max-w-md text-sm" style={{ color: 'var(--text-muted)' }}>
                  لم تُضف أي صورة بعد. كن أول من يساهم في حفظ الذاكرة البصرية للمملكة.
                </p>
                <Link to="/add" className="btn btn-primary mt-5">
                  أضف أول صورة
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* ————— المناطق ————— */}
        <section className="pb-20">
          <h2 className="display text-2xl font-bold sm:text-3xl">تصفّح حسب المنطقة</h2>
          <div className="mt-6 flex flex-wrap gap-2">
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
      </div>
    </div>
  )
}
