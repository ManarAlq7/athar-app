/**
 * GET /api/health — غلاف Vercel Edge Function لفحص جاهزية الـ API بعد النشر.
 */

import { healthResponse } from '../shared/analyze-core'

declare const process: { env: Record<string, string | undefined> }

export const config = { runtime: 'edge' }

export default async function handler(): Promise<Response> {
  return healthResponse(process.env.ANTHROPIC_API_KEY, 'vercel-edge')
}
