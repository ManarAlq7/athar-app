import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth, displayName } from '../context/AuthContext'
import { Alert } from '../components/Alert'
import type { Memory } from '../lib/types'

const MAX = 1000

function formatWhen(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('ar-SA-u-ca-gregory', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}

/**
 * جدار الذاكرة: يكتب الزوّار ما يعرفونه عن الصورة.
 * صاحب الذكرى يحذف ذكراه، وصاحب الصورة يحذف ما يُكتب تحت صورته.
 */
export function MemoryWall({ photoId, photoOwnerId }: { photoId: string; photoOwnerId: string }) {
  const { user } = useAuth()

  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    void (async () => {
      const { data, error: err } = await supabase
        .from('memories')
        .select('*')
        .eq('photo_id', photoId)
        .order('created_at', { ascending: true })

      if (!active) return

      if (err) setError('تعذّر جلب الذكريات.')
      else setMemories((data ?? []) as Memory[])

      setLoading(false)
    })()

    return () => {
      active = false
    }
  }, [photoId])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!user) return
    const text = body.trim()
    if (text.length < 2) {
      setError('اكتب ذكرى أطول قليلاً.')
      return
    }

    setBusy(true)
    const { data, error: err } = await supabase
      .from('memories')
      .insert({
        photo_id: photoId,
        user_id: user.id,
        author: displayName(user),
        body: text,
      })
      .select('*')
      .single()
    setBusy(false)

    if (err || !data) {
      setError('تعذّر حفظ ذكراك — أعد المحاولة.')
      return
    }

    setMemories((prev) => [...prev, data as Memory])
    setBody('')
  }

  const remove = async (id: string) => {
    setDeletingId(id)
    const { error: err } = await supabase.from('memories').delete().eq('id', id)
    setDeletingId(null)

    if (err) {
      setError('تعذّر الحذف.')
      return
    }
    setMemories((prev) => prev.filter((m) => m.id !== id))
  }

  const canDelete = (m: Memory) => user && (m.user_id === user.id || photoOwnerId === user.id)

  return (
    <section className="mt-12 border-t pt-10" style={{ borderColor: 'var(--border)' }}>
      <header>
        <h2 className="display text-xl font-bold">جدار الذاكرة</h2>
        <p className="mt-1.5 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          تعرف هذا المكان؟ اكتب ما تذكره عنه — من كان فيه، وما الذي تغيّر. الذكريات تُكمل التوثيق.
        </p>
      </header>

      {error && (
        <div className="mt-5">
          <Alert tone="error">{error}</Alert>
        </div>
      )}

      {/* ————— الذكريات ————— */}
      {loading ? (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 2 }, (_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-2xl"
              style={{ backgroundColor: 'var(--surface-alt)' }}
            />
          ))}
        </div>
      ) : memories.length > 0 ? (
        <ol className="mt-6 space-y-3">
          {memories.map((m) => (
            <li
              key={m.id}
              className="rounded-2xl border p-4"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-alt)' }}
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span
                  className="display flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                  style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}
                  aria-hidden
                >
                  {m.author.charAt(0)}
                </span>
                <span className="text-sm font-bold">{m.author}</span>
                <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
                  {formatWhen(m.created_at)}
                </span>

                {canDelete(m) && (
                  <button
                    type="button"
                    onClick={() => remove(m.id)}
                    disabled={deletingId === m.id}
                    className="ms-auto text-xs underline"
                    style={{ color: 'var(--danger)' }}
                  >
                    {deletingId === m.id ? 'جارٍ الحذف…' : 'حذف'}
                  </button>
                )}
              </div>

              <p
                className="mt-3 whitespace-pre-line text-[15px] leading-loose"
                style={{ color: 'var(--ink-soft)' }}
              >
                {m.body}
              </p>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-6 text-sm" style={{ color: 'var(--text-faint)' }}>
          لا ذكريات بعد — كن أول من يكتب.
        </p>
      )}

      {/* ————— الكتابة ————— */}
      {user ? (
        <form onSubmit={submit} className="mt-6">
          <label className="label" htmlFor="memory-body">
            اكتب ذكراك
          </label>
          <textarea
            id="memory-body"
            className="field"
            maxLength={MAX}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="أعرف هذا المكان… كان…"
          />
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
              ستُنشر باسم <span className="font-bold">{displayName(user)}</span>
              <span className="mx-2">·</span>
              <span className="num">{body.length}</span>/<span className="num">{MAX}</span>
            </span>
            <button type="submit" disabled={busy} className="btn btn-primary !min-h-[42px] text-sm">
              {busy ? 'جارٍ النشر…' : 'انشر الذكرى'}
            </button>
          </div>
        </form>
      ) : (
        <div
          className="mt-6 rounded-2xl border p-5 text-center"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-alt)' }}
        >
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            سجّل الدخول لتكتب ذكراك عن هذه الصورة.
          </p>
          <Link to="/login" className="btn btn-outline mt-4 !min-h-[42px] text-sm">
            تسجيل الدخول
          </Link>
        </div>
      )}
    </section>
  )
}
