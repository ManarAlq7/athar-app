import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Alert } from '../components/Alert'

export function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  /** الوجهة التي حاول المستخدم بلوغها قبل تحويله إلى الدخول */
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('أدخل البريد الإلكتروني وكلمة المرور.')
      return
    }

    setBusy(true)
    const res = await signIn(email, password)
    setBusy(false)

    if (res.error) {
      setError(res.error)
      return
    }

    navigate(from, { replace: true })
  }

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <div className="text-center">
        <h1 className="display text-3xl font-bold">تسجيل الدخول</h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          ادخل لتضيف صورك وتدير مساهماتك في الأرشيف.
        </p>
      </div>

      <form onSubmit={submit} className="card mt-8 space-y-4 p-6">
        {error && <Alert tone="error">{error}</Alert>}

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
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <button type="submit" disabled={busy} className="btn btn-primary w-full">
          {busy ? 'جارٍ الدخول…' : 'تسجيل الدخول'}
        </button>

        <p className="pt-1 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
          ليس لديك حساب؟{' '}
          <Link to="/signup" className="font-bold hover:underline" style={{ color: 'var(--accent)' }}>
            أنشئ حساباً
          </Link>
        </p>
      </form>
    </div>
  )
}
