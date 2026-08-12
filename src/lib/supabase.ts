import { createClient } from '@supabase/supabase-js'
import { STORAGE_BUCKET } from './constants'

const url = import.meta.env.VITE_SUPABASE_URL ?? ''
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

/**
 * هل ضُبطت بيانات Supabase؟
 * الواجهة تستخدم هذا لعرض رسالة إعداد واضحة بدل الانهيار بخطأ غامض
 * لو نُشر الموقع بلا متغيرات بيئة.
 */
export const isSupabaseConfigured = Boolean(url && anonKey)

if (!isSupabaseConfigured && import.meta.env.DEV) {
  console.warn(
    'أَثَر: لم تُضبط VITE_SUPABASE_URL أو VITE_SUPABASE_ANON_KEY — انسخ .env.example إلى .env وعبّئهما.',
  )
}

export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  anonKey || 'placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
)

/** الرابط العام لصورة مخزّنة */
export function publicImageUrl(path: string): string {
  if (!path) return ''
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

/**
 * ترجمة أخطاء Supabase إلى رسائل عربية مفهومة.
 * رسائل المكتبة إنجليزية وتقنية، ولا يجوز عرضها للمستخدم كما هي.
 */
export function authErrorMessage(message: string): string {
  const m = message.toLowerCase()

  if (m.includes('invalid login credentials')) return 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
  if (m.includes('email not confirmed')) return 'لم يتم تأكيد البريد بعد — افتح رسالة التأكيد في بريدك'
  if (m.includes('user already registered') || m.includes('already been registered'))
    return 'هذا البريد مسجَّل مسبقاً — سجّل الدخول بدل إنشاء حساب'
  if (m.includes('password should be at least')) return 'كلمة المرور قصيرة — الحد الأدنى ٦ أحرف'
  if (m.includes('unable to validate email') || m.includes('invalid email'))
    return 'صيغة البريد الإلكتروني غير صحيحة'
  if (m.includes('rate limit') || m.includes('too many requests'))
    return 'محاولات كثيرة متتالية — انتظر قليلاً ثم أعد المحاولة'
  if (m.includes('network') || m.includes('fetch')) return 'تعذّر الاتصال — تحقّق من الإنترنت'

  return 'حدث خطأ غير متوقع — أعد المحاولة'
}
