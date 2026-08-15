/**
 * GET /api/health — غلاف Vercel Edge Function لفحص جاهزية الـ API بعد النشر.
 * يخبر أي مصدر ذكاء اصطناعي مفعّل دون كشف أي مفتاح.
 */

import { healthResponse } from '../shared/analyze-core.js'

declare const process: { env: Record<string, string | undefined> }

export const config = { runtime: 'edge' }

export default async function handler(): Promise<Response> {
  return healthResponse(
    {
      // على Vercel يُحقن VERCEL_OIDC_TOKEN تلقائياً وتقبله البوابة — فلا مفتاح يُدار أصلاً
      gatewayKey: process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN,
      anthropicKey: process.env.ANTHROPIC_API_KEY,
    },
    'vercel-edge',
  )
}
