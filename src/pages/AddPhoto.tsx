import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { analyzePhoto, fileToBase64 } from '../lib/analyze'
import { Alert } from '../components/Alert'
import {
  ACCEPTED_IMAGE_TYPES,
  CATEGORIES,
  MAX_IMAGE_BYTES,
  REGIONS,
  STORAGE_BUCKET,
} from '../lib/constants'
import type { AnalysisRequest, AnalysisResult } from '../lib/types'

type MediaType = AnalysisRequest['imageMediaType']

const EXTENSIONS: Record<MediaType, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

/** ٨ ميجابايت مكتوبة بالعربية للرسائل */
const MAX_MB = Math.round(MAX_IMAGE_BYTES / (1024 * 1024))

/** «نخيل، سوق، طين» ← ['نخيل','سوق','طين'] — يقبل الفاصلة العربية واللاتينية والسطر الجديد */
function splitList(value: string): string[] {
  return value
    .split(/[,،\n]/)
    .map((v) => v.trim())
    .filter(Boolean)
}

export function AddPhoto() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ————— الصورة —————
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [dragging, setDragging] = useState(false)

  // ————— ما يعرفه المستخدم (يُمرَّر للنموذج كسياق مؤكد) —————
  const [region, setRegion] = useState('')
  const [city, setCity] = useState('')
  const [approxYear, setApproxYear] = useState('')
  const [story, setStory] = useState('')

  // ————— صورة المكان اليوم (اختيارية) — وجودها يفعّل مقارنة «قبل وبعد» —————
  const afterInputRef = useRef<HTMLInputElement>(null)
  const [afterFile, setAfterFile] = useState<File | null>(null)
  const [afterPreview, setAfterPreview] = useState('')
  const [afterYear, setAfterYear] = useState('')

  // ————— حقول التوثيق (يملؤها الذكاء الاصطناعي ويعدّلها المستخدم) —————
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState('')
  const [visibleElements, setVisibleElements] = useState('')

  // ————— حالة التشغيل —————
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [aiAssisted, setAiAssisted] = useState(false)
  const [aiError, setAiError] = useState('')

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  // رابط المعاينة كائن في الذاكرة — يُحرَّر عند تغيير الصورة أو مغادرة الصفحة
  useEffect(() => {
    if (!file) {
      setPreview('')
      return
    }

    const url = URL.createObjectURL(file)
    setPreview(url)

    return () => URL.revokeObjectURL(url)
  }, [file])

  useEffect(() => {
    if (!afterFile) {
      setAfterPreview('')
      return
    }

    const url = URL.createObjectURL(afterFile)
    setAfterPreview(url)

    return () => URL.revokeObjectURL(url)
  }, [afterFile])

  const acceptFile = (next: File | undefined | null) => {
    setAiError('')
    setSaveError('')

    if (!next) return

    if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(next.type)) {
      setSaveError('صيغة الصورة غير مدعومة. المدعوم: JPG أو PNG أو WebP.')
      return
    }

    if (next.size > MAX_IMAGE_BYTES) {
      setSaveError(`حجم الصورة كبير. الحد الأقصى ${MAX_MB} ميجابايت.`)
      return
    }

    setFile(next)
    // صورة جديدة تعني تحليلاً جديداً — لا نُبقي اقتراحات صورة سابقة
    setAnalysis(null)
    setAiAssisted(false)
  }

  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    acceptFile(e.target.files?.[0])
  }

  const clearFile = () => {
    setFile(null)
    setAnalysis(null)
    setAiAssisted(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ————— التحليل بالذكاء الاصطناعي —————
  const runAnalysis = async () => {
    if (!file) return

    setAnalyzing(true)
    setAiError('')
    setAnalysis(null)

    try {
      const imageBase64 = await fileToBase64(file)

      const result = await analyzePhoto({
        imageBase64,
        imageMediaType: file.type as MediaType,
        known: {
          region: region || undefined,
          city: city.trim() || undefined,
          approxYear: approxYear.trim() || undefined,
          note: story.trim() || undefined,
        },
      })

      setAnalysis(result)
      setAiAssisted(true)

      // الاقتراحات تملأ الحقول الفارغة فقط — لا تُلغى كتابة المستخدم
      setTitle((v) => v || result.title)
      setDescription((v) => v || result.description)
      setCategory((v) => v || result.category)
      setTags((v) => v || result.tags.join('، '))
      setVisibleElements((v) => v || result.visible_elements.join('، '))
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'تعذّر تحليل الصورة.')
    } finally {
      setAnalyzing(false)
    }
  }

  // ————— الحفظ —————
  const save = async (e: FormEvent) => {
    e.preventDefault()
    setSaveError('')

    if (!user) {
      setSaveError('انتهت الجلسة — سجّل الدخول من جديد.')
      return
    }
    if (!file) {
      setSaveError('اختر صورة أولاً.')
      return
    }
    if (title.trim().length < 2) {
      setSaveError('أدخل عنواناً للصورة (حرفان على الأقل).')
      return
    }
    if (!category) {
      setSaveError('اختر تصنيفاً للصورة.')
      return
    }
    if (!region) {
      setSaveError('اختر المنطقة.')
      return
    }

    let year: number | null = null
    if (approxYear.trim()) {
      const parsed = Number(approxYear.trim())
      if (!Number.isInteger(parsed) || parsed < 1900 || parsed > 2100) {
        setSaveError('السنة التقريبية يجب أن تكون بين ١٩٠٠ و ٢١٠٠.')
        return
      }
      year = parsed
    }

    setSaving(true)

    // المسار يبدأ بمعرّف المستخدم — سياسة التخزين تشترط ذلك
    const ext = EXTENSIONS[file.type as MediaType] ?? 'jpg'
    const imagePath = `${user.id}/${crypto.randomUUID()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(imagePath, file, { contentType: file.type, upsert: false })

    if (uploadError) {
      setSaveError('تعذّر رفع الصورة — تحقّق من الاتصال وأعد المحاولة.')
      setSaving(false)
      return
    }

    // الصورة الحديثة اختيارية — فشلها لا يُسقط الحفظ، بل يُلغي مقارنة قبل/بعد فقط
    let afterPath: string | null = null
    let afterYearValue: number | null = null

    if (afterFile) {
      const afterExt = EXTENSIONS[afterFile.type as MediaType] ?? 'jpg'
      const candidate = `${user.id}/${crypto.randomUUID()}.${afterExt}`
      const { error: afterErr } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(candidate, afterFile, { contentType: afterFile.type, upsert: false })

      if (!afterErr) {
        afterPath = candidate
        const parsedAfter = Number(afterYear.trim())
        if (Number.isInteger(parsedAfter) && parsedAfter >= 1900 && parsedAfter <= 2100) {
          afterYearValue = parsedAfter
        }
      }
    }

    const { data, error: insertError } = await supabase
      .from('photos')
      .insert({
        user_id: user.id,
        title: title.trim(),
        description: description.trim(),
        category,
        region,
        city: city.trim() || null,
        approx_year: year,
        story: story.trim() || null,
        tags: splitList(tags).slice(0, 12),
        visible_elements: splitList(visibleElements).slice(0, 20),
        image_path: imagePath,
        after_image_path: afterPath,
        after_year: afterYearValue,
        ai_assisted: aiAssisted,
      })
      .select('id')
      .single()

    if (insertError || !data) {
      // لا نترك ملفاً يتيماً في التخزين بعد فشل حفظ السجل
      await supabase.storage.from(STORAGE_BUCKET).remove([imagePath])
      setSaveError('تعذّر حفظ الصورة — أعد المحاولة.')
      setSaving(false)
      return
    }

    navigate(`/photo/${data.id}`, { replace: true })
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <header>
        <h1 className="display text-3xl font-bold sm:text-4xl">أضف صورة للأرشيف</h1>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          ارفع صورة قديمة، أضف ما تعرفه عنها، ودع أَثَر يقترح توثيقاً تراجعه وتعدّله قبل الحفظ.
        </p>
      </header>

      {!isSupabaseConfigured && (
        <div className="mt-6">
          <Alert tone="warning">
            <strong>الموقع غير مربوط بقاعدة البيانات بعد.</strong> لن يُحفظ شيء حتى تُضبط متغيرات
            Supabase.
          </Alert>
        </div>
      )}

      <form onSubmit={save} className="mt-8 space-y-6">
        {/* ————— ١) الصورة ————— */}
        <section className="card p-5">
          <h2 className="display text-lg font-bold">
            <span className="num">١</span> · الصورة
          </h2>

          {!file ? (
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragging(false)
                acceptFile(e.dataTransfer.files?.[0])
              }}
              className="mt-4 rounded-xl border-2 border-dashed p-10 text-center transition-colors"
              style={{
                borderColor: dragging ? 'var(--accent)' : 'var(--border-strong)',
                backgroundColor: dragging ? 'var(--accent-soft)' : 'var(--surface-alt)',
              }}
            >
              <p className="display text-base font-bold">اسحب الصورة هنا</p>
              <p className="mt-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                أو اخترها من جهازك — JPG أو PNG أو WebP، بحد أقصى{' '}
                <span className="num">{MAX_MB}</span> ميجابايت.
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-outline mt-5"
              >
                اختر صورة
              </button>
            </div>
          ) : (
            <div className="mt-4">
              <figure
                className="overflow-hidden rounded-xl border"
                style={{ backgroundColor: 'var(--surface-alt)', borderColor: 'var(--border)' }}
              >
                <img src={preview} alt="معاينة الصورة المختارة" className="max-h-96 w-full object-contain" />
              </figure>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
                  {file.name} · <span className="num">{(file.size / 1024 / 1024).toFixed(1)}</span> م.ب
                </span>
                <button
                  type="button"
                  onClick={clearFile}
                  className="text-sm underline"
                  style={{ color: 'var(--text-muted)' }}
                >
                  تغيير الصورة
                </button>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(',')}
            onChange={onPick}
            className="hidden"
            aria-label="اختيار صورة"
          />
        </section>

        {/* ————— ٢) ما تعرفه —————  */}
        <section className="card p-5">
          <h2 className="display text-lg font-bold">
            <span className="num">٢</span> · ما تعرفه عن الصورة
          </h2>
          <p className="mt-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>
            هذه معلوماتك أنت — يعتمدها أَثَر كما هي ولا يخالفها.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="region">
                المنطقة *
              </label>
              <select
                id="region"
                className="field"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              >
                <option value="">اختر المنطقة</option>
                {REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label" htmlFor="city">
                المدينة / البلدة
              </label>
              <input
                id="city"
                type="text"
                className="field"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="مثال: عنيزة"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="label" htmlFor="year">
              السنة التقريبية
            </label>
            <input
              id="year"
              type="number"
              inputMode="numeric"
              min={1900}
              max={2100}
              className="field num"
              value={approxYear}
              onChange={(e) => setApproxYear(e.target.value)}
              placeholder="1965"
            />
            <p className="mt-1.5 text-xs" style={{ color: 'var(--text-faint)' }}>
              اتركها فارغة إن لم تكن متأكداً — أَثَر لا يخمّن التواريخ.
            </p>
          </div>

          <div className="mt-4">
            <label className="label" htmlFor="story">
              القصة
            </label>
            <textarea
              id="story"
              className="field"
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="ما تذكره عن هذه الصورة: المكان، المناسبة، من فيها، ما تغيّر بعدها…"
            />
          </div>
        </section>

        {/* ————— ٣) التحليل ————— */}
        <section className="card p-5">
          <h2 className="display text-lg font-bold">
            <span className="num">٣</span> · مساعدة الذكاء الاصطناعي
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            يفحص أَثَر الصورة ويقترح عنواناً ووصفاً وتصنيفاً ووسوماً. الاقتراحات مساعِدة لا مرجعية —
            راجعها وعدّلها كما تشاء. هذه الخطوة اختيارية.
          </p>

          <button
            type="button"
            onClick={runAnalysis}
            disabled={!file || analyzing}
            className="btn btn-ink mt-4"
          >
            {analyzing ? 'جارٍ التحليل…' : analysis ? 'أعد التحليل' : 'حلّل الصورة'}
          </button>

          {!file && (
            <p className="mt-2 text-xs" style={{ color: 'var(--text-faint)' }}>
              اختر صورة أولاً لتفعيل التحليل.
            </p>
          )}

          {aiError && (
            <div className="mt-4">
              <Alert tone="error">{aiError}</Alert>
            </div>
          )}

          {analysis && (
            <div className="mt-4 space-y-3">
              <Alert tone="success">
                تمّ التحليل — نُقلت الاقتراحات إلى الحقول أدناه، وهي قابلة للتعديل بالكامل.
              </Alert>

              {analysis.uncertain_notes.length > 0 && (
                <div
                  className="rounded-xl border p-4"
                  style={{ backgroundColor: '#fdf6e7', borderColor: '#e8d6a8' }}
                >
                  <h3 className="text-sm font-bold" style={{ color: '#8a6416' }}>
                    ما لم يستطع أَثَر تأكيده
                  </h3>
                  <ul
                    className="mt-2 list-inside list-disc space-y-1 text-sm leading-relaxed"
                    style={{ color: '#8a6416' }}
                  >
                    {analysis.uncertain_notes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </section>

        {/* ————— ٤) التوثيق ————— */}
        <section className="card p-5">
          <h2 className="display text-lg font-bold">
            <span className="num">٤</span> · التوثيق
          </h2>

          <div className="mt-4">
            <label className="label" htmlFor="title">
              العنوان *
            </label>
            <input
              id="title"
              type="text"
              className="field"
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: سوق شعبي في حي قديم"
            />
          </div>

          <div className="mt-4">
            <label className="label" htmlFor="description">
              الوصف
            </label>
            <textarea
              id="description"
              className="field"
              maxLength={2000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="وصف لما يظهر في الصورة"
            />
          </div>

          <div className="mt-4">
            <label className="label" htmlFor="category">
              التصنيف *
            </label>
            <select
              id="category"
              className="field"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">اختر التصنيف</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            <label className="label" htmlFor="tags">
              الوسوم
            </label>
            <input
              id="tags"
              type="text"
              className="field"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="افصل بينها بفاصلة: سوق، نخيل، طين"
            />
            {splitList(tags).length > 0 && (
              <ul className="mt-2.5 flex flex-wrap gap-2">
                {splitList(tags).map((t) => (
                  <li key={t} className="chip">
                    #{t}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-4">
            <label className="label" htmlFor="elements">
              عناصر ظاهرة في الصورة
            </label>
            <input
              id="elements"
              type="text"
              className="field"
              value={visibleElements}
              onChange={(e) => setVisibleElements(e.target.value)}
              placeholder="افصل بينها بفاصلة: مبانٍ طينية، أشخاص، سيارة قديمة"
            />
          </div>

          {aiAssisted && (
            <label
              className="mt-5 flex cursor-pointer items-start gap-2.5 rounded-xl border p-3.5"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-alt)' }}
            >
              <input
                type="checkbox"
                checked={aiAssisted}
                onChange={(e) => setAiAssisted(e.target.checked)}
                className="mt-0.5 size-4 shrink-0 accent-[var(--accent)]"
              />
              <span className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                أظهِر شارة «وُثّقت بمساعدة الذكاء الاصطناعي» على هذه الصورة. أزل العلامة إن كتبت
                التوثيق بنفسك بالكامل.
              </span>
            </label>
          )}
        </section>

        {/* ————— ٥) صورة المكان اليوم ————— */}
        <section className="card p-5">
          <h2 className="display text-lg font-bold">
            <span className="num">٥</span> · صورة المكان اليوم <span className="text-sm font-normal" style={{ color: 'var(--text-faint)' }}>(اختياري)</span>
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            عندك صورة للمكان نفسه اليوم؟ أضفها ليظهر سحّاب «قبل وبعد» يقارن بينهما — أقوى ما يُظهر
            كم تغيّر المكان.
          </p>

          {!afterFile ? (
            <button
              type="button"
              onClick={() => afterInputRef.current?.click()}
              className="btn btn-outline mt-4"
            >
              اختر صورة حديثة
            </button>
          ) : (
            <div className="mt-4">
              <figure
                className="overflow-hidden rounded-xl border"
                style={{ backgroundColor: 'var(--surface-alt)', borderColor: 'var(--border)' }}
              >
                <img src={afterPreview} alt="معاينة الصورة الحديثة" className="max-h-72 w-full object-contain" />
              </figure>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
                  {afterFile.name}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAfterFile(null)
                    if (afterInputRef.current) afterInputRef.current.value = ''
                  }}
                  className="text-sm underline"
                  style={{ color: 'var(--text-muted)' }}
                >
                  إزالة
                </button>
              </div>

              <div className="mt-4">
                <label className="label" htmlFor="after-year">
                  سنة الصورة الحديثة
                </label>
                <input
                  id="after-year"
                  type="number"
                  inputMode="numeric"
                  min={1900}
                  max={2100}
                  className="field num"
                  value={afterYear}
                  onChange={(e) => setAfterYear(e.target.value)}
                  placeholder="2026"
                />
              </div>
            </div>
          )}

          <input
            ref={afterInputRef}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(',')}
            onChange={(e) => {
              const next = e.target.files?.[0]
              if (!next) return
              if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(next.type)) {
                setSaveError('صيغة الصورة الحديثة غير مدعومة.')
                return
              }
              if (next.size > MAX_IMAGE_BYTES) {
                setSaveError(`حجم الصورة الحديثة كبير. الحد الأقصى ${MAX_MB} ميجابايت.`)
                return
              }
              setSaveError('')
              setAfterFile(next)
            }}
            className="hidden"
            aria-label="اختيار صورة حديثة للمكان"
          />
        </section>

        {saveError && <Alert tone="error">{saveError}</Alert>}

        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={saving} className="btn btn-primary px-8">
            {saving ? 'جارٍ الحفظ…' : 'احفظ في الأرشيف'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={saving}
            className="btn btn-outline"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  )
}
