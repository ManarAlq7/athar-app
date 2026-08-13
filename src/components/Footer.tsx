import { Link } from 'react-router-dom'
import { LogoMark } from './Logo'

export function Footer() {
  return (
    <footer
      className="mt-20 border-t"
      style={{ backgroundColor: 'var(--surface-alt)', borderColor: 'var(--border)' }}
    >
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="max-w-sm">
            <span className="flex items-center gap-2.5" style={{ color: 'var(--ink)' }}>
              <LogoMark size={32} />
              <span className="display text-lg font-bold">أَثَر</span>
            </span>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              منصة سعودية لحفظ الذاكرة البصرية للمملكة. صورة قديمة تُرفع اليوم، تبقى شاهداً غداً.
            </p>
          </div>

          <nav aria-label="روابط التذييل">
            <h2 className="mb-3 text-sm font-bold">تصفّح</h2>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              <li>
                <Link to="/explore" className="hover:underline">
                  استكشف الأرشيف
                </Link>
              </li>
              <li>
                <Link to="/add" className="hover:underline">
                  أضف صورة
                </Link>
              </li>
              <li>
                <Link to="/account" className="hover:underline">
                  حسابي
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div
          className="mt-8 border-t pt-5 text-xs"
          style={{ borderColor: 'var(--border)', color: 'var(--text-faint)' }}
        >
          <p>
            اقتراحات الذكاء الاصطناعي في أَثَر مساعِدة لا مرجعية — التوثيق النهائي مسؤولية صاحب
            الصورة، ولا يُثبَّت تاريخ أو موقع لم يؤكّده.
          </p>
          <p className="mt-2">
            صورة الواجهة الرئيسية من{' '}
            <a
              href="https://www.pexels.com/photo/palm-trees-in-desert-19820992/"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Pexels
            </a>{' '}
            برخصة استخدام مجانية.
          </p>
        </div>
      </div>
    </footer>
  )
}
