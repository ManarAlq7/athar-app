/** المناطق الإدارية الثلاث عشرة في المملكة */
export const REGIONS = [
  'الرياض',
  'مكة المكرمة',
  'المدينة المنورة',
  'القصيم',
  'الشرقية',
  'عسير',
  'تبوك',
  'حائل',
  'الحدود الشمالية',
  'جازان',
  'نجران',
  'الباحة',
  'الجوف',
] as const

export type Region = (typeof REGIONS)[number]

export const CATEGORIES = [
  'أسواق',
  'شوارع وأحياء',
  'عمارة ومنازل',
  'مدارس وتعليم',
  'قرى وبلدات',
  'معالم ومواقع',
  'حِرَف ومهن',
  'مناسبات وحياة يومية',
  'زراعة وطبيعة',
  'نقل ومواصلات',
] as const

export type Category = (typeof CATEGORIES)[number]

/** أقصى حجم للصورة المرفوعة — 8 ميجابايت */
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

/** اسم حاوية التخزين في Supabase */
export const STORAGE_BUCKET = 'photos'

export function isValidRegion(value: unknown): value is Region {
  return typeof value === 'string' && (REGIONS as readonly string[]).includes(value)
}

export function isValidCategory(value: unknown): value is Category {
  return typeof value === 'string' && (CATEGORIES as readonly string[]).includes(value)
}
