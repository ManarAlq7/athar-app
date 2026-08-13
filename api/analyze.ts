/**
 * POST /api/analyze — غلاف Vercel Edge Function.
 * نفس منطق Cloudflare بالضبط عبر shared/analyze-core.ts.
 *
 * المفتاح يُضبط في: Vercel → Project → Settings → Environment Variables
 *   الاسم: ANTHROPIC_API_KEY   (بلا بادئة VITE_ حتى لا يُحقن في حزمة المتصفح)
 */

// الامتداد .js مقصود: مُجمِّع Vercel يستخدم moduleResolution=node16 الذي يشترطه،
// و TypeScript يحلّه إلى ملف .ts الحقيقي.
import { handleAnalyze, json } from '../shared/analyze-core.js'

declare const process: { env: Record<string, string | undefined> }

export const config = { runtime: 'edge' }

export default async function handler(request: Request): Promise<Response> {
  if (request.method === 'GET') {
    return json({ error: 'استخدم POST مع صورة لتحليلها.' }, 405)
  }

  if (request.method !== 'POST') {
    return json({ error: 'طريقة غير مدعومة.' }, 405)
  }

  return handleAnalyze(request, process.env.ANTHROPIC_API_KEY)
}
