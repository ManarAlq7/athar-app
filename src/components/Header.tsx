import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth, displayName } from '../context/AuthContext'
import { Logo } from './Logo'

const LINKS = [
  { to: '/', label: 'الرئيسية' },
  { to: '/map', label: 'الخريطة' },
  { to: '/timeline', label: 'الخط الزمني' },
  { to: '/explore', label: 'استكشف الأرشيف' },
  { to: '/add', label: 'أضف صورة' },
]

export function Header() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    setOpen(false)
    navigate('/')
  }

  const linkStyle = ({ isActive }: { isActive: boolean }) => ({
    color: isActive ? 'var(--accent)' : 'var(--text-muted)',
    fontWeight: isActive ? 700 : 500,
  })

  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--surface) 88%, transparent)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="shrink-0" style={{ color: 'var(--ink)' }} aria-label="أَثَر — الرئيسية">
          <Logo />
        </Link>

        {/* سطح المكتب */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="التنقل الرئيسي">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              style={linkStyle}
              className="rounded-lg px-3.5 py-2 text-[15px] transition-colors hover:bg-[var(--surface-alt)]"
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Link
                to="/account"
                className="btn btn-outline !min-h-[42px] !px-3.5 whitespace-nowrap text-sm"
              >
                {displayName(user)}
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="btn btn-ink !min-h-[42px] whitespace-nowrap text-sm"
              >
                تسجيل الخروج
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="btn btn-outline !min-h-[42px] !px-3.5 whitespace-nowrap text-sm"
              >
                تسجيل الدخول
              </Link>
              <Link to="/signup" className="btn btn-primary !min-h-[42px] whitespace-nowrap text-sm">
                إنشاء حساب
              </Link>
            </>
          )}
        </div>

        {/* الجوال */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="القائمة"
          className="rounded-lg border p-2.5 md:hidden"
          style={{ borderColor: 'var(--border-strong)' }}
        >
          <span className="block space-y-1" aria-hidden>
            <span className="block h-0.5 w-5 rounded" style={{ backgroundColor: 'var(--ink)' }} />
            <span className="block h-0.5 w-5 rounded" style={{ backgroundColor: 'var(--ink)' }} />
            <span className="block h-0.5 w-5 rounded" style={{ backgroundColor: 'var(--ink)' }} />
          </span>
        </button>
      </div>

      {open && (
        <div className="border-t md:hidden" style={{ borderColor: 'var(--border)' }}>
          <nav className="mx-auto max-w-6xl px-4 py-3" aria-label="التنقل الرئيسي">
            <ul className="space-y-1">
              {LINKS.map((l) => (
                <li key={l.to}>
                  <NavLink
                    to={l.to}
                    style={linkStyle}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-3 text-[15px]"
                  >
                    {l.label}
                  </NavLink>
                </li>
              ))}
            </ul>

            <div className="mt-3 flex flex-col gap-2 border-t pt-3" style={{ borderColor: 'var(--border)' }}>
              {user ? (
                <>
                  <Link
                    to="/account"
                    onClick={() => setOpen(false)}
                    className="btn btn-outline whitespace-nowrap"
                  >
                    حسابي — {displayName(user)}
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="btn btn-ink whitespace-nowrap"
                  >
                    تسجيل الخروج
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="btn btn-outline whitespace-nowrap"
                  >
                    تسجيل الدخول
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setOpen(false)}
                    className="btn btn-primary whitespace-nowrap"
                  >
                    إنشاء حساب
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
