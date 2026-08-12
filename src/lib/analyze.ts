import type { AnalysisRequest, AnalysisResult } from './types'

/** تحويل ملف إلى base64 بلا بادئة data: — الصيغة التي تتوقعها Anthropic */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      const comma = result.indexOf(',')
      resolve(comma === -1 ? result : result.slice(comma + 1))
    }
    reader.onerror = () => reject(new Error('تعذّرت قراءة الملف'))
    reader.readAsDataURL(file)
  })
}

/**
 * استدعاء دالة التحليل على الخادم.
 * المتصفح لا يعرف مفتاح Anthropic ولا يتصل بها مباشرة — كل شيء عبر /api/analyze.
 */
export async function analyzePhoto(payload: AnalysisRequest): Promise<AnalysisResult> {
  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  let data: unknown
  try {
    data = await res.json()
  } catch {
    throw new Error('استجابة غير مفهومة من خدمة التحليل.')
  }

  if (!res.ok) {
    const message = (data as { error?: string })?.error
    throw new Error(message || 'تعذّر تحليل الصورة.')
  }

  return data as AnalysisResult
}
