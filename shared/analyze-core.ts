/**
 * منطق تحليل الصور — محايد تجاه المنصة.
 *
 * يعتمد على Request/Response القياسيين فقط، فيعمل كما هو على:
 *   • Cloudflare Pages Functions  → functions/api/*.ts
 *   • Vercel Edge Functions       → api/*.ts
 *
 * المبدأ الحاكم: النموذج يصف ما يراه فقط. لا يخترع تاريخاً ولا موقعاً
 * ولا اسم مكان غير مؤكد — وما لم يتأكد منه يُدرج صراحةً في uncertain_notes.
 */

const MODEL = 'claude-sonnet-4-5'
const MAX_IMAGE_BYTES = 8 * 1024 * 1024
const ALLOWED_MEDIA = ['image/jpeg', 'image/png', 'image/webp'] as const

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
]

interface KnownContext {
  region?: string
  city?: string
  approxYear?: string
  note?: string
}

interface RequestBody {
  imageBase64?: string
  imageMediaType?: string
  known?: KnownContext
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}

function fail(message: string, status: number): Response {
  return json({ error: message }, status)
}

function buildSystemPrompt(): string {
  return `أنت مساعد توثيق في منصة "أَثَر"، وهي أرشيف سعودي للصور القديمة.

مهمتك: فحص صورة قديمة واقتراح توثيق عربي لها.

قواعد ملزمة:
1. صف ما تراه في الصورة فقط. لا تخترع معلومة غير ظاهرة.
2. لا تحدد تاريخاً ولا سنة إطلاقاً. إن بدت الصورة قديمة فاذكر ذلك وصفياً ("تبدو من فترة مبكرة") دون رقم.
3. لا تسمِّ مدينة أو حياً أو مبنى بعينه ما لم تكن هويته ظاهرة بوضوح تام (لوحة مكتوبة، معلم لا يُخطئه أحد).
4. إن أعطاك المستخدم معلومات مؤكدة (المنطقة/المدينة/السنة) فاستخدمها كما هي ولا تخالفها ولا تشكك فيها.
5. كل ما استنتجته ولم تتأكد منه، أدرجه في uncertain_notes بصيغة واضحة للمستخدم.
6. اكتب بعربية فصحى سليمة وبسيطة، بلا مبالغة أدبية ولا عبارات إنشائية.

التصنيف يجب أن يكون واحداً من هذه بالضبط:
${CATEGORIES.join('، ')}

أعِد ردك عبر أداة submit_documentation فقط.`
}

function buildUserText(known?: KnownContext): string {
  const lines = ['حلّل هذه الصورة القديمة واقترح توثيقاً لها.']

  const facts: string[] = []
  if (known?.region) facts.push(`المنطقة: ${known.region}`)
  if (known?.city) facts.push(`المدينة/البلدة: ${known.city}`)
  if (known?.approxYear) facts.push(`السنة التقريبية: ${known.approxYear}`)
  if (known?.note) facts.push(`ما يذكره صاحب الصورة: ${known.note}`)

  if (facts.length > 0) {
    lines.push('', 'معلومات مؤكدة من صاحب الصورة — اعتمدها ولا تخالفها:', ...facts)
  } else {
    lines.push('', 'لم يزوّدك صاحب الصورة بأي معلومة. اعتمد على ما تراه فقط.')
  }

  return lines.join('\n')
}

/** مخطط الأداة — يفرض على النموذج إرجاع بنية صحيحة بدل نص حر نحلله يدوياً */
const TOOL = {
  name: 'submit_documentation',
  description: 'إرسال التوثيق المقترح للصورة',
  input_schema: {
    type: 'object' as const,
    properties: {
      title: {
        type: 'string',
        description: 'عنوان عربي موجز ووصفي، من ٣ إلى ٨ كلمات، بلا تاريخ',
      },
      description: {
        type: 'string',
        description: 'وصف عربي لما يظهر في الصورة، من جملتين إلى أربع',
      },
      category: {
        type: 'string',
        enum: CATEGORIES,
        description: 'التصنيف الأنسب من القائمة',
      },
      tags: {
        type: 'array',
        items: { type: 'string' },
        description: 'من ٣ إلى ٨ وسوم عربية مفردة أو مركّبة قصيرة',
      },
      visible_elements: {
        type: 'array',
        items: { type: 'string' },
        description: 'العناصر الظاهرة فعلياً في الصورة: مبانٍ، أشخاص، مركبات، نباتات، أدوات',
      },
      uncertain_notes: {
        type: 'array',
        items: { type: 'string' },
        description: 'ما لم تستطع تأكيده، وما ينبغي لصاحب الصورة مراجعته أو تصحيحه',
      },
    },
    required: ['title', 'description', 'category', 'tags', 'visible_elements', 'uncertain_notes'],
  },
}

function asStringArray(value: unknown, limit: number): string[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((v): v is string => typeof v === 'string')
    .map((v) => v.trim())
    .filter(Boolean)
    .slice(0, limit)
}

/** استجابة فحص الجاهزية — لا تكشف المفتاح، تكتفي بالإخبار عن وجوده */
export function healthResponse(apiKey: string | undefined, platform: string): Response {
  return json({
    status: 'ok',
    service: 'athar-api',
    platform,
    analyze_endpoint: '/api/analyze',
    ai_configured: Boolean(apiKey),
    time: new Date().toISOString(),
  })
}

/** المعالج الرئيسي لـ POST /api/analyze */
export async function handleAnalyze(request: Request, apiKey: string | undefined): Promise<Response> {
  if (!apiKey) {
    return fail('خدمة التحليل غير مهيّأة على الخادم — لم يُضبط مفتاح Anthropic.', 503)
  }

  let body: RequestBody
  try {
    body = (await request.json()) as RequestBody
  } catch {
    return fail('صيغة الطلب غير صحيحة.', 400)
  }

  const { imageBase64, imageMediaType, known } = body

  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return fail('لم تصل الصورة.', 400)
  }

  if (!ALLOWED_MEDIA.includes(imageMediaType as (typeof ALLOWED_MEDIA)[number])) {
    return fail('صيغة الصورة غير مدعومة. المدعوم: JPG أو PNG أو WebP.', 400)
  }

  // حجم base64 يزيد على الأصل بنحو الثلث
  if (imageBase64.length > MAX_IMAGE_BYTES * 1.4) {
    return fail('حجم الصورة كبير. الحد الأقصى ٨ ميجابايت.', 413)
  }

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1500,
        system: buildSystemPrompt(),
        tools: [TOOL],
        tool_choice: { type: 'tool', name: 'submit_documentation' },
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: imageMediaType, data: imageBase64 },
              },
              { type: 'text', text: buildUserText(known) },
            ],
          },
        ],
      }),
    })

    if (!upstream.ok) {
      const detail = await upstream.text()
      console.error('Anthropic error', upstream.status, detail)

      if (upstream.status === 401) return fail('مفتاح خدمة التحليل غير صالح.', 502)
      if (upstream.status === 429) return fail('الخدمة مزدحمة الآن — أعد المحاولة بعد قليل.', 429)
      if (upstream.status >= 500) return fail('خدمة التحليل غير متاحة مؤقتاً.', 502)
      return fail('تعذّر تحليل الصورة.', 502)
    }

    const data = (await upstream.json()) as {
      content?: Array<{ type: string; name?: string; input?: Record<string, unknown> }>
    }

    const toolUse = data.content?.find(
      (block) => block.type === 'tool_use' && block.name === 'submit_documentation',
    )

    if (!toolUse?.input) {
      return fail('لم تُفهم استجابة خدمة التحليل.', 502)
    }

    const raw = toolUse.input
    const category =
      typeof raw.category === 'string' && CATEGORIES.includes(raw.category) ? raw.category : ''

    return json({
      title: typeof raw.title === 'string' ? raw.title.trim().slice(0, 120) : '',
      description: typeof raw.description === 'string' ? raw.description.trim().slice(0, 2000) : '',
      category,
      tags: asStringArray(raw.tags, 8),
      visible_elements: asStringArray(raw.visible_elements, 12),
      uncertain_notes: asStringArray(raw.uncertain_notes, 6),
    })
  } catch (err) {
    console.error('analyze failed', err)
    return fail('تعذّر الاتصال بخدمة التحليل.', 502)
  }
}
