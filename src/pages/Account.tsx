import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth, displayName } from '../context/AuthContext'
import { PhotoCard, PhotoCardSkeleton } from '../components/PhotoCard'
import { Alert } from '../components/Alert'
import type { Photo } from '../lib/types'

export function Account() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    let active = true

    void (async () => {
      const { data, error: err } = await supabase
        .from('photos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!active) return

      if (err) setError('تعذّر جلب مساهماتك — أعد المحاولة.')
      else setPhotos((data ?? []) as Photo[])

      setLoading(false)
    })()

    return () => {
      active = false
    }
  }, [user])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  if (!user) return null

  const regionCount = new Set(photos.map((p) => p.region)).size

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* ————— بطاقة الحساب ————— */}
      <section className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex items-center gap-4">
            <span
              className="display flex size-14 shrink-0 items-center justify-center rounded-2xl text-xl font-bold"
              style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}
              aria-hidden
            >
              {displayName(user).charAt(0)}
            </span>

            <div>
              <h1 className="display text-2xl font-bold">{displayName(user)}</h1>
              <p className="num mt-1 text-sm" style={{ color: 'var(--text-muted)' }} dir="ltr">
                {user.email}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link to="/add" className="btn btn-primary !min-h-[42px] text-sm">
              أضف صورة
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="btn btn-outline !min-h-[42px] text-sm"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>

        <dl className="mt-7 grid max-w-sm grid-cols-2 gap-4 border-t pt-5" style={{ borderColor: 'var(--border)' }}>
          <div>
            <dd className="display text-2xl font-bold">
              <span className="num">{photos.length}</span>
            </dd>
            <dt className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
              صورة مساهَم بها
            </dt>
          </div>
          <div>
            <dd className="display text-2xl font-bold">
              <span className="num">{regionCount}</span>
            </dd>
            <dt className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
              منطقة وثّقتها
            </dt>
          </div>
        </dl>
      </section>

      {/* ————— المساهمات ————— */}
      <section className="mt-10">
        <h2 className="display text-2xl font-bold">مساهماتي</h2>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          الصور التي أضفتها للأرشيف. افتح أي صورة لعرض تفاصيلها أو حذفها.
        </p>

        {error && (
          <div className="mt-5">
            <Alert tone="error">{error}</Alert>
          </div>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array.from({ length: 3 }, (_, i) => <PhotoCardSkeleton key={i} />)
          ) : photos.length > 0 ? (
            photos.map((p) => <PhotoCard key={p.id} photo={p} />)
          ) : (
            !error && (
              <div className="card col-span-full p-12 text-center">
                <p className="display text-lg font-bold">لم تضف صورة بعد</p>
                <p className="mx-auto mt-2 max-w-md text-sm" style={{ color: 'var(--text-muted)' }}>
                  ابدأ بصورة واحدة — سوق قديم، شارع تغيّر، أو منزل لم يبقَ منه إلا الصور.
                </p>
                <Link to="/add" className="btn btn-primary mt-5">
                  أضف أول صورة
                </Link>
              </div>
            )
          )}
        </div>
      </section>
    </div>
  )
}
