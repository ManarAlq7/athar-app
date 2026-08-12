/**
 * GET /api/health — فحص سريع لجاهزية الـ API بعد النشر.
 * يفيد أثناء العرض: يثبت أن الدالة تعمل وأن المفتاح مضبوط، دون كشف المفتاح نفسه.
 */

import { healthResponse } from '../../shared/analyze-core'

interface Env {
  ANTHROPIC_API_KEY: string
}

export const onRequestGet: PagesFunction<Env> = async (context) =>
  healthResponse(context.env.ANTHROPIC_API_KEY, 'cloudflare-pages')
