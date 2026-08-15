/**
 * POST /api/analyze — غلاف Vercel Edge Function.
 * نفس منطق Cloudflare بالضبط عبر shared/analyze-core.ts.
 *
 * مصدران مقبولان للذكاء الاصطناعي، والبوابة مقدَّمة إن توفّرت:
 *   • AI_GATEWAY_API_KEY  → بوابة Vercel (تأتي مع رصيد مجاني)
 *   • ANTHROPIC_API_KEY   → Anthropic مباشرة
 *
 * كلاهما يُضبط في: Vercel → Project → Settings → Environment Variables
 * (بلا بادئة VITE_ حتى لا يُحقن في حزمة المتصفح)
 */

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

  return handleAnalyze(request, {
    // على Vercel يُحقن VERCEL_OIDC_TOKEN تلقائياً وتقبله البوابة — فلا مفتاح يُدار أصلاً
    gatewayKey: process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN,
    anthropicKey: process.env.ANTHROPIC_API_KEY,
  })
}
