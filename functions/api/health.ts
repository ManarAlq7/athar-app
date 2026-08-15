/**
 * GET /api/health — فحص سريع لجاهزية الـ API بعد النشر.
 * يخبر أي مصدر ذكاء اصطناعي مفعّل دون كشف أي مفتاح.
 */

import { healthResponse } from '../../shared/analyze-core'

interface Env {
  ANTHROPIC_API_KEY?: string
  AI_GATEWAY_API_KEY?: string
}

export const onRequestGet: PagesFunction<Env> = async (context) =>
  healthResponse(
    {
      gatewayKey: context.env.AI_GATEWAY_API_KEY,
      anthropicKey: context.env.ANTHROPIC_API_KEY,
    },
    'cloudflare-pages',
  )
