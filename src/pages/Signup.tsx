import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Alert } from '../components/Alert'

export function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [confirmSent, setConfirmSent] = useState(false)
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('أدخل اسمك.')
      return
    }
    if (!email.trim()) {
      setError('أدخل البريد الإلكتروني.')
      return
    }
    if (password.length < 6) {
      setError('كلمة المرور قصيرة — الحد الأدنى ٦ أحرف.')
      return
    }

    setBusy(true)
    const res = await signUp(email, password, name)
    setBusy(false)

    if (res.error) {
      setError(res.error)
      return
    }

    // تأكيد البريد مفعّل في المشروع: لا جلسة قبل فتح الرسالة
    if (res.needsConfirmation) {
      setConfirmSent(true)
      return
    }

    navigate('/add', { replace: true })
  }

  if (confirmSent) {
    return (
      <div className="mx-auto max-w-md px-4 py-14">
        <div className="card p-8 text-center">
          <h1 className="display text-2xl font-bold">تحقّق من بريدك</h1>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            أرسلنا رسالة تأكيد إلى <span className="num font-bold">{email}</span>. افتحها واضغط رابط
            التأكيد، ثم عد لتسجيل الدخول.
          </p>
          <Link to="/login" className="btn btn-primary mt-6 w-full">
            الذهاب لتسجيل الدخول
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <div className="text-center">
        <h1 className="display text-3xl font-bold">إنشاء حساب</h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          انضم لحفظ الذاكرة البصرية للمملكة.
        </p>
      </div>

      <form onSubmit={submit} className="card mt-8 space-y-4 p-6">
        {error && <Alert tone="error">{error}</Alert>}

        <div>
          <label className="label" htmlFor="name">
            الاسم
          </label>
          <input
            id="name"
            type="text"
            className="field"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="اسمك كما تحب أن يظهر"
          />
        </div>

        <div>
          <label className="label" htmlFor="email">
            البريد الإلكتروني
          </label>
          <input
            id="email"
            type="email"
            className="field"
            dir="ltr"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="label" htmlFor="password">
            كلمة المرور
          </label>
          <input
            id="password"
            type="password"
            className="field"
            dir="ltr"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="٦ أحرف على الأقل"
          />
        </div>

        <button type="submit" disabled={busy} className="btn btn-primary w-full">
          {busy ? 'جارٍ الإنشاء…' : 'إنشاء الحساب'}
        </button>

        <p className="pt-1 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
          لديك حساب؟{' '}
          <Link to="/login" className="font-bold hover:underline" style={{ color: 'var(--accent)' }}>
            سجّل الدخول
          </Link>
        </p>
      </form>
    </div>
  )
}
