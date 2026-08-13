/**
 * GET /api/health — غلاف Vercel Edge Function لفحص جاهزية الـ API بعد النشر.
 */

// الامتداد .js مقصود — انظر التعليق في api/analyze.ts
import { healthResponse } from '../shared/analyze-core.js'

declare const process: { env: Record<string, string | undefined> }

export const config = { runtime: 'edge' }

export default async function handler(): Promise<Response> {
  return healthResponse(process.env.ANTHROPIC_API_KEY, 'vercel-edge')
}
