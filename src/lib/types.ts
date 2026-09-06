/** شكل السجل في جدول photos */
export interface Photo {
  id: string
  user_id: string
  title: string
  description: string
  category: string
  region: string
  city: string | null
  approx_year: number | null
  story: string | null
  tags: string[]
  visible_elements: string[]
  image_path: string
  /** صورة المكان اليوم — وجودها يفعّل مقارنة «قبل وبعد» */
  after_image_path: string | null
  /** سنة الصورة الحديثة */
  after_year: number | null
  /** هل استُخدم الذكاء الاصطناعي في التوثيق؟ يُعرض كشارة شفافية */
  ai_assisted: boolean

  // ————— بيانات الحقوق —————
  /** الجهة أو الأرشيف: Wikimedia Commons، أرشيف عائلي، تصوير المساهم… */
  source: string | null
  /** اسم المصوّر أو صاحب الحق */
  creator: string | null
  /** اسم الرخصة: PD-Saudi Arabia، CC BY 2.0، ملك الرافع… */
  license: string | null
  /** رابط نص الرخصة */
  license_url: string | null
  /** رابط صفحة الصورة في مصدرها */
  source_url: string | null
  /** هل تُلزم الرخصة بعرض النسبة؟ */
  attribution_required: boolean
  /** إقرار الرافع بامتلاكه الحقوق أو الإذن */
  rights_confirmed: boolean

  created_at: string
}

/** الرخص المتاحة في نموذج الإضافة */
export const LICENSES = [
  { value: 'ملك الرافع', label: 'صورتي — أملك حقوقها', attribution: false },
  { value: 'إذن من المالك', label: 'لدي إذن كتابي من صاحب الحقوق', attribution: false },
  { value: 'PD-Saudi Arabia', label: 'ملك عام في المملكة (نُشرت قبل ٢٠٠١)', attribution: false },
  { value: 'Public Domain', label: 'ملك عام / CC0', attribution: false },
  { value: 'CC BY', label: 'مشاع إبداعي — نسب المصنّف (CC BY)', attribution: true },
  { value: 'CC BY-SA', label: 'مشاع إبداعي — نسب وترخيص بالمثل (CC BY-SA)', attribution: true },
] as const

/** حقول الإدخال عند إنشاء سجل جديد */
export type PhotoInput = Omit<Photo, 'id' | 'user_id' | 'created_at'>

/** استجابة دالة تحليل الصور */
export interface AnalysisResult {
  title: string
  description: string
  category: string
  tags: string[]
  visible_elements: string[]
  /**
   * ملاحظات النموذج عمّا لم يستطع تأكيده — تُعرض للمستخدم صراحةً
   * لأن المشروع يمنع اختراع تواريخ أو مواقع غير مؤكدة.
   */
  uncertain_notes: string[]
}

export interface AnalysisRequest {
  /** الصورة بترميز base64 بلا بادئة data: */
  imageBase64: string
  imageMediaType: 'image/jpeg' | 'image/png' | 'image/webp'
  /** ما يعرفه المستخدم — يُمرَّر للنموذج كسياق مؤكد لا يخالفه */
  known?: {
    region?: string
    city?: string
    approxYear?: string
    note?: string
  }
}

/** ذكرى يكتبها زائر تحت صورة — جدار الذاكرة */
export interface Memory {
  id: string
  photo_id: string
  user_id: string
  /** اسم الكاتب وقت الكتابة، لا مرجع متغيّر */
  author: string
  body: string
  created_at: string
}

export interface ExploreFilters {
  search: string
  region: string
  category: string
}
