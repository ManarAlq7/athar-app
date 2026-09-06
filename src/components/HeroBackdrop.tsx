/**
 * خلفية الواجهة الرئيسية — أفق نجدي هادئ مرسوم بـ SVG.
 *
 * هذه هي الهوية البصرية الأصلية لأَثَر، المطابقة لصورة المشاركة public/og.png
 * المحفوظة منذ أول حفظة في المستودع: كثبان رملية، بيوت طينية بشُرفات مثلّثة،
 * ونخيل — كلها بدرجات الرمل والطين الهادئة، بلا ألوان صارخة.
 *
 * الألوان من متغيّرات نظام التصميم لا قيم ثابتة، فتتناغم مع بقية الموقع تلقائياً.
 */
export function HeroBackdrop() {
  return (
    <svg
      className="absolute inset-x-0 bottom-0 h-[32%] w-full"
      viewBox="0 0 1440 480"
      preserveAspectRatio="xMidYMax slice"
      fill="none"
      aria-hidden
    >
      <defs>
        {/* تلاشٍ علوي حتى تذوب الرسمة في خلفية الصفحة بلا حدّ حاد */}
        <linearGradient id="athar-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--surface)" stopOpacity="1" />
          <stop offset="42%" stopColor="var(--surface)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* ————— كثبان بعيدة ————— */}
      <path
        d="M0 356 C 150 322, 300 344, 452 330 C 604 316, 700 286, 852 300 C 1004 314, 1140 344, 1290 332 C 1360 326, 1408 336, 1440 344 L1440 480 L0 480 Z"
        fill="var(--border)"
        opacity="0.55"
      />

      {/* ————— بيوت طينية بشُرفات نجدية ————— */}
      <g fill="var(--ink)" opacity="0.13">
        {/* بيت أيمن */}
        <path d="M1044 300 h150 v128 h-150 z" />
        <path d="M1044 300 l18 -20 l18 20 l18 -20 l18 20 l18 -20 l18 20 l18 -20 l18 20 l18 -20 l18 20 z" />
        <rect x="1074" y="332" width="20" height="30" rx="3" fill="var(--surface)" opacity="0.5" />
        <rect x="1120" y="332" width="20" height="30" rx="3" fill="var(--surface)" opacity="0.5" />

        {/* بيت أوسط — الأعلى */}
        <path d="M660 262 h196 v166 h-196 z" />
        <path d="M660 262 l19.6 -22 l19.6 22 l19.6 -22 l19.6 22 l19.6 -22 l19.6 22 l19.6 -22 l19.6 22 l19.6 -22 l19.6 22 z" />
        <rect x="694" y="300" width="24" height="34" rx="3" fill="var(--surface)" opacity="0.5" />
        <rect x="750" y="300" width="24" height="34" rx="3" fill="var(--surface)" opacity="0.5" />
        <rect x="806" y="300" width="24" height="34" rx="3" fill="var(--surface)" opacity="0.5" />
        {/* باب بقوس مدبّب — العنصر الأبرز في العمارة النجدية */}
        <path d="M742 428 v-52 a20 20 0 0 1 40 0 v52 z" fill="var(--surface)" opacity="0.45" />

        {/* بيت أيسر */}
        <path d="M232 318 h164 v110 h-164 z" />
        <path d="M232 318 l16.4 -18 l16.4 18 l16.4 -18 l16.4 18 l16.4 -18 l16.4 18 l16.4 -18 l16.4 18 l16.4 -18 l16.4 18 z" />
        <rect x="264" y="346" width="22" height="30" rx="3" fill="var(--surface)" opacity="0.5" />
        <rect x="316" y="346" width="22" height="30" rx="3" fill="var(--surface)" opacity="0.5" />

        {/* برج مراقبة صغير */}
        <path d="M470 286 h54 v142 h-54 z" />
        <path d="M470 286 l13.5 -16 l13.5 16 l13.5 -16 l13.5 16 z" />
        <rect x="488" y="316" width="18" height="26" rx="3" fill="var(--surface)" opacity="0.5" />
      </g>

      {/* ————— نخيل ————— */}
      <g stroke="var(--ink)" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.2">
        {/* نخلة يمنى */}
        <path d="M1284 428 q -6 -54 2 -92" />
        <path d="M1286 336 q -30 -20 -50 -8 M1286 336 q -34 -4 -46 14 M1286 336 q 30 -22 52 -10 M1286 336 q 34 -2 46 16 M1286 336 q 2 -28 -8 -40 M1286 336 q 6 -26 20 -36" />

        {/* نخلة وسطى */}
        <path d="M566 428 q -5 -44 1 -76" />
        <path d="M567 352 q -26 -17 -43 -7 M567 352 q -29 -3 -39 12 M567 352 q 26 -19 45 -9 M567 352 q 29 -2 39 14 M567 352 q 2 -24 -7 -34" />

        {/* نخلة يسرى */}
        <path d="M158 428 q -6 -50 2 -86" />
        <path d="M160 342 q -28 -19 -47 -8 M160 342 q -32 -3 -43 13 M160 342 q 28 -21 49 -9 M160 342 q 32 -2 43 15 M160 342 q 6 -25 19 -34" />
      </g>

      {/* ————— كثيب أمامي ————— */}
      <path
        d="M0 424 C 180 404, 340 436, 520 428 C 700 420, 820 398, 1000 412 C 1180 426, 1320 442, 1440 430 L1440 480 L0 480 Z"
        fill="var(--border-strong)"
        opacity="0.4"
      />

      {/* التلاشي العلوي فوق كل شيء */}
      <rect x="0" y="0" width="1440" height="480" fill="url(#athar-fade)" />
    </svg>
  )
}
