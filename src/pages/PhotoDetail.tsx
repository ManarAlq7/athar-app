import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase, publicImageUrl } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Spinner } from '../components/Spinner'
import { Alert } from '../components/Alert'
import { MemoryWall } from '../components/MemoryWall'
import { BeforeAfter } from '../components/BeforeAfter'
import { Attribution } from '../components/Attribution'
import { STORAGE_BUCKET } from '../lib/constants'
import type { Photo } from '../lib/types'

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('ar-SA-u-ca-gregory', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}

export function PhotoDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [photo, setPhoto] = useState<Photo | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    let active = true

    void (async () => {
      const { data, error: err } = await supabase.from('photos').select('*').eq('id', id).single()

      if (!active) return

      if (err || !data) setNotFound(true)
      else setPhoto(data as Photo)

      setLoading(false)
    })()

    return () => {
      active = false
    }
  }, [id])

  const remove = async () => {
    if (!photo) return
    setDeleting(true)
    setError('')

    const { error: dbErr } = await supabase.from('photos').delete().eq('id', photo.id)

    if (dbErr) {
      setError('تعذّر حذف الصورة — أعد المحاولة.')
      setDeleting(false)
      return
    }

    // حذف الملف من التخزين بعد نجاح حذف السجل.
    // فشله هنا لا يُبلَّغ للمستخدم: السجل اختفى فعلاً والملف اليتيم لا يظهر في الأرشيف.
    await supabase.storage.from(STORAGE_BUCKET).remove([photo.image_path])

    navigate('/account', { replace: true })
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner label="جارٍ تحميل الصورة…" />
      </div>
    )
  }

  if (notFound || !photo) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="display text-2xl font-bold">الصورة غير موجودة</h1>
        <p className="mt-3 text-sm" style={{ color: 'var(--text-muted)' }}>
          ربما حُذفت أو أن الرابط غير صحيح.
        </p>
        <Link to="/explore" className="btn btn-primary mt-6">
          العودة للأرشيف
        </Link>
      </div>
    )
  }

  const isOwner = user?.id === photo.user_id

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link
        to="/explore"
        className="mb-5 inline-flex text-sm font-semibold hover:underline"
        style={{ color: 'var(--text-muted)' }}
      >
        → العودة للأرشيف
      </Link>

      {photo.after_image_path ? (
        <BeforeAfter
          beforeSrc={publicImageUrl(photo.image_path)}
          afterSrc={publicImageUrl(photo.after_image_path)}
          beforeYear={photo.approx_year}
          afterYear={photo.after_year}
          alt={photo.title}
        />
      ) : (
        <figure
          className="overflow-hidden rounded-2xl border"
          style={{ backgroundColor: 'var(--surface-alt)', borderColor: 'var(--border)' }}
        >
          <img
            src={publicImageUrl(photo.image_path)}
            alt={photo.title}
            className="max-h-[70vh] w-full object-contain"
          />
        </figure>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip" style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}>
              {photo.category}
            </span>
            {photo.ai_assisted && (
              <span className="chip" title="استُعين بالذكاء الاصطناعي في اقتراح التوثيق">
                وُثّقت بمساعدة الذكاء الاصطناعي
              </span>
            )}
          </div>

          <h1 className="display mt-4 text-3xl font-bold leading-snug sm:text-4xl">{photo.title}</h1>

          {photo.description && (
            <p className="mt-4 text-base leading-loose" style={{ color: 'var(--ink-soft)' }}>
              {photo.description}
            </p>
          )}

          {photo.story && (
            <section className="mt-8">
              <h2 className="display text-lg font-bold">القصة</h2>
              <p
                className="mt-3 whitespace-pre-line text-[15px] leading-loose"
                style={{ color: 'var(--ink-soft)' }}
              >
                {photo.story}
              </p>
            </section>
          )}

          {photo.visible_elements.length > 0 && (
            <section className="mt-8">
              <h2 className="display text-lg font-bold">عناصر ظاهرة في الصورة</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {photo.visible_elements.map((el) => (
                  <li key={el} className="chip">
                    {el}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {photo.tags.length > 0 && (
            <section className="mt-8">
              <h2 className="display text-lg font-bold">الوسوم</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {photo.tags.map((tag) => (
                  <li key={tag}>
                    <Link
                      to={`/explore?q=${encodeURIComponent(tag)}`}
                      className="chip transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    >
                      #{tag}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* ————— بطاقة المعلومات ————— */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <h2 className="display text-base font-bold">معلومات الصورة</h2>

            <dl className="mt-4 space-y-3.5 text-sm">
              <div>
                <dt style={{ color: 'var(--text-faint)' }}>المنطقة</dt>
                <dd className="mt-0.5 font-semibold">{photo.region}</dd>
              </div>

              {photo.city && (
                <div>
                  <dt style={{ color: 'var(--text-faint)' }}>المدينة / البلدة</dt>
                  <dd className="mt-0.5 font-semibold">{photo.city}</dd>
                </div>
              )}

              <div>
                <dt style={{ color: 'var(--text-faint)' }}>السنة التقريبية</dt>
                <dd className="mt-0.5 font-semibold">
                  {photo.approx_year ? (
                    <span className="num">{photo.approx_year}</span>
                  ) : (
                    <span style={{ color: 'var(--text-faint)' }}>غير محددة</span>
                  )}
                </dd>
              </div>

              <div>
                <dt style={{ color: 'var(--text-faint)' }}>أُضيفت في</dt>
                <dd className="mt-0.5 font-semibold">{formatDate(photo.created_at)}</dd>
              </div>
            </dl>

            <Attribution photo={photo} />

            {isOwner && (
              <div className="mt-5 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
                {error && (
                  <div className="mb-3">
                    <Alert tone="error">{error}</Alert>
                  </div>
                )}

                {confirming ? (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold" style={{ color: 'var(--danger)' }}>
                      سيُحذف هذا السجل والصورة نهائياً. هل أنت متأكد؟
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={remove}
                        disabled={deleting}
                        className="btn !min-h-[42px] flex-1 text-sm text-white"
                        style={{ backgroundColor: 'var(--danger)' }}
                      >
                        {deleting ? 'جارٍ الحذف…' : 'تأكيد الحذف'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirming(false)}
                        disabled={deleting}
                        className="btn btn-outline !min-h-[42px] text-sm"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirming(true)}
                    className="btn btn-outline w-full !min-h-[42px] text-sm"
                    style={{ color: 'var(--danger)', borderColor: '#e8c4c4' }}
                  >
                    حذف الصورة
                  </button>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>

      <MemoryWall photoId={photo.id} photoOwnerId={photo.user_id} />
    </div>
  )
}
