/**
 * POST /api/analyze — غلاف Cloudflare Pages Functions.
 * المنطق كله في shared/analyze-core.ts ليعمل على Cloudflare و Vercel معاً.
 * مفتاح Anthropic يُقرأ من بيئة الخادم ولا يصل المتصفح إطلاقاً.
 */

import { handleAnalyze, json } from '../../shared/analyze-core'

interface Env {
  ANTHROPIC_API_KEY: string
}

export const onRequestPost: PagesFunction<Env> = async (context) =>
  handleAnalyze(context.request, context.env.ANTHROPIC_API_KEY)

/** يمنع 405 غير المفهومة عند فتح المسار في المتصفح */
export const onRequestGet: PagesFunction<Env> = async () =>
  json({ error: 'استخدم POST مع صورة لتحليلها.' }, 405)
