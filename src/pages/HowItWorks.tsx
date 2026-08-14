import { Link } from 'react-router-dom'

const STEPS = [
  {
    n: '١',
    title: 'ارفع الصورة',
    body: 'صورة قديمة لسوق أو شارع أو منزل أو مدرسة أو معلم سعودي. JPG أو PNG أو WebP، بحد أقصى ٨ ميجابايت.',
  },
  {
    n: '٢',
    title: 'أضف ما تعرفه',
    body: 'المنطقة والمدينة والسنة التقريبية والقصة المرتبطة بها — بقدر ما تذكر. ما لا تعرفه اتركه فارغاً.',
  },
  {
    n: '٣',
    title: 'دع أَثَر يساعدك',
    body: 'الذكاء الاصطناعي يقترح عنواناً ووصفاً وتصنيفاً ووسوماً، ويذكر لك صراحةً ما لم يستطع تأكيده. وأنت تراجع وتعدّل.',
  },
  {
    n: '٤',
    title: 'احفظها في الأرشيف',
    body: 'تصبح جزءاً من ذاكرة بصرية مفتوحة للجميع، يبحث فيها الناس بالمنطقة والتصنيف والوسم.',
  },
]

const PRINCIPLES = [
  {
    title: 'لا نخترع تاريخاً',
    body: 'أَثَر لا يخمّن سنة ولا يسمّي مكاناً غير مؤكد. ما لم يتأكد منه يُعرض لك صراحةً لتصحّحه أنت.',
  },
  {
    title: 'التوثيق مسؤوليتك',
    body: 'اقتراحات الذكاء الاصطناعي مساعِدة لا مرجعية. الكلمة الأخيرة لصاحب الصورة، وهو من يعرف قصتها.',
  },
  {
    title: 'شفافية معلنة',
    body: 'كل صورة استُعين فيها بالذكاء الاصطناعي تحمل شارة تقول ذلك، فلا يختلط المقترَح بالمؤكَّد.',
  },
  {
    title: 'صورك ملكك',
    body: 'تستطيع حذف أي صورة أضفتها في أي وقت، فيُحذف سجلّها وملفّها معاً.',
  },
]

export function HowItWorks() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <header className="text-center">
        <h1 className="display text-3xl font-bold sm:text-4xl">كيف يعمل أَثَر؟</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          أربع خطوات من الصورة إلى الأرشيف.
        </p>
      </header>

      <ol className="mt-12 grid gap-4 sm:grid-cols-2">
        {STEPS.map((s) => (
          <li key={s.n} className="card p-6">
            <span
              className="display flex size-11 items-center justify-center rounded-xl text-lg font-bold"
              style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}
              aria-hidden
            >
              {s.n}
            </span>
            <h2 className="display mt-4 text-lg font-bold">{s.title}</h2>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {s.body}
            </p>
          </li>
        ))}
      </ol>

      <section className="mt-16">
        <h2 className="display text-center text-2xl font-bold">على أي مبدأ يقوم؟</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {PRINCIPLES.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border p-5"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-alt)' }}
            >
              <h3 className="display text-base font-bold">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-14 flex flex-wrap justify-center gap-3">
        <Link to="/add" className="btn btn-primary px-7">
          أضف صورة الآن
        </Link>
        <Link to="/latest" className="btn btn-outline px-7">
          شاهد أحدث الإضافات
        </Link>
      </div>
    </div>
  )
}
