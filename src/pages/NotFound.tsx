import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="display text-6xl font-bold" style={{ color: 'var(--border-strong)' }}>
        <span className="num">٤٠٤</span>
      </p>

      <h1 className="display mt-5 text-2xl font-bold">لا أثر لهذه الصفحة</h1>

      <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        الرابط غير صحيح، أو أن الصفحة لم تعد موجودة.
      </p>

      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn btn-primary">
          الصفحة الرئيسية
        </Link>
        <Link to="/explore" className="btn btn-outline">
          استكشف الأرشيف
        </Link>
      </div>
    </div>
  )
}
