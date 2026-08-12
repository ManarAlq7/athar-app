/**
 * خلفية الواجهة الرئيسية — مشهد نهاري نجدي مرسوم بالكامل بـ SVG.
 *
 * المحتوى: نخيل وبيوت طين وعائلة، في ضوء النهار.
 *
 * لماذا رسم لا صورة فوتوغرافية:
 *   • عمل أصلي — لا حقوق نشر ولا مصدر مجهول، وهو ما يليق بمشروع أرشيفي
 *     مبني على مبدأ «لا نثبّت ما لا نتأكد منه».
 *   • لا وجوه لأشخاص حقيقيين — الأشكال ظلال مجرّدة، فلا مسألة خصوصية.
 *   • بضعة كيلوبايتات، وتبقى حادة على كل شاشة، وتتلوّن من نظام التصميم.
 */
export function HeroBackdrop() {
  return (
    <svg
      className="absolute inset-x-0 bottom-0 -z-10 h-[68%] w-full"
      viewBox="0 0 1440 520"
      preserveAspectRatio="xMidYMax slice"
      fill="none"
      aria-hidden
    >
      <defs>
        {/* تلاشٍ علوي حتى يبقى العنوان مقروءاً فوق المشهد */}
        <linearGradient id="ath-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--surface)" stopOpacity="1" />
          <stop offset="34%" stopColor="var(--surface)" stopOpacity="0.72" />
          <stop offset="58%" stopColor="var(--surface)" stopOpacity="0" />
        </linearGradient>

        {/* وهج شمس النهار */}
        <radialGradient id="ath-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffd98a" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#ffd98a" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#ffd98a" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="ath-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#eaf1f5" />
          <stop offset="100%" stopColor="#fdf6e8" />
        </linearGradient>
      </defs>

      {/* ————— السماء ————— */}
      <rect x="0" y="0" width="1440" height="520" fill="url(#ath-sky)" />
      <circle cx="1108" cy="132" r="190" fill="url(#ath-sun)" />
      <circle cx="1108" cy="132" r="34" fill="#ffdd9c" opacity="0.75" />

      {/* ————— كثبان بعيدة ————— */}
      <path
        d="M0 372 C 160 344, 320 366, 486 352 C 652 338, 742 312, 902 326 C 1062 340, 1180 366, 1310 356 C 1372 351, 1412 360, 1440 366 L1440 520 L0 520 Z"
        fill="#e5d7ba"
      />
      <path
        d="M0 404 C 190 386, 330 412, 520 404 C 710 396, 850 378, 1030 392 C 1210 406, 1330 418, 1440 410 L1440 520 L0 520 Z"
        fill="#dcc9a4"
      />

      {/* ————— بيوت الطين ————— */}
      <g>
        {/* بيت أيسر */}
        <rect x="228" y="330" width="168" height="112" fill="#c9ac7d" />
        <rect x="228" y="330" width="46" height="112" fill="#b8975f" opacity="0.55" />
        <path d="M228 330 l16.8 -19 l16.8 19 l16.8 -19 l16.8 19 l16.8 -19 l16.8 19 l16.8 -19 l16.8 19 l16.8 -19 l16.8 19 z" fill="#b8975f" />
        <rect x="268" y="358" width="22" height="28" rx="2" fill="#54402c" opacity="0.75" />
        <rect x="322" y="358" width="22" height="28" rx="2" fill="#54402c" opacity="0.75" />
        {/* جذوع أثل بارزة من الجدار — تفصيل نجدي مميّز */}
        <g fill="#8a6f4e" opacity="0.6">
          <rect x="222" y="348" width="12" height="6" rx="3" />
          <rect x="222" y="392" width="12" height="6" rx="3" />
          <rect x="390" y="348" width="12" height="6" rx="3" />
          <rect x="390" y="392" width="12" height="6" rx="3" />
        </g>

        {/* البيت الأوسط — الأكبر */}
        <rect x="606" y="288" width="232" height="154" fill="#d0b184" />
        <rect x="606" y="288" width="58" height="154" fill="#bb9a62" opacity="0.5" />
        <path d="M606 288 l19.3 -22 l19.3 22 l19.3 -22 l19.3 22 l19.3 -22 l19.3 22 l19.3 -22 l19.3 22 l19.3 -22 l19.3 22 l19.3 -22 l19.3 22 z" fill="#bb9a62" />
        <rect x="646" y="322" width="26" height="32" rx="2" fill="#54402c" opacity="0.75" />
        <rect x="712" y="322" width="26" height="32" rx="2" fill="#54402c" opacity="0.75" />
        <rect x="778" y="322" width="26" height="32" rx="2" fill="#54402c" opacity="0.75" />
        {/* باب بقوس مدبّب */}
        <path d="M698 442 v-56 a24 24 0 0 1 48 0 v56 z" fill="#6b4f34" />
        <path d="M706 442 v-52 a16 16 0 0 1 32 0 v52 z" fill="#54402c" />
        <g fill="#8a6f4e" opacity="0.55">
          <rect x="600" y="308" width="14" height="7" rx="3.5" />
          <rect x="600" y="360" width="14" height="7" rx="3.5" />
          <rect x="830" y="308" width="14" height="7" rx="3.5" />
          <rect x="830" y="360" width="14" height="7" rx="3.5" />
        </g>

        {/* بيت أيمن */}
        <rect x="1004" y="342" width="150" height="100" fill="#c9ac7d" />
        <rect x="1004" y="342" width="40" height="100" fill="#b8975f" opacity="0.5" />
        <path d="M1004 342 l18.75 -18 l18.75 18 l18.75 -18 l18.75 18 l18.75 -18 l18.75 18 l18.75 -18 l18.75 18 z" fill="#b8975f" />
        <rect x="1040" y="368" width="22" height="26" rx="2" fill="#54402c" opacity="0.75" />
        <rect x="1094" y="368" width="22" height="26" rx="2" fill="#54402c" opacity="0.75" />

        {/* برج مراقبة */}
        <rect x="452" y="306" width="58" height="136" fill="#c4a373" />
        <rect x="452" y="306" width="16" height="136" fill="#b8975f" opacity="0.5" />
        <path d="M452 306 l14.5 -16 l14.5 16 l14.5 -16 l14.5 16 z" fill="#b8975f" />
        <rect x="472" y="334" width="18" height="24" rx="2" fill="#54402c" opacity="0.75" />
      </g>

      {/* ————— النخيل في ضوء النهار ————— */}
      <g>
        {palm(122, 442, 1.15)}
        {palm(392, 442, 0.82)}
        {palm(902, 442, 0.95)}
        {palm(1244, 442, 1.2)}
        {palm(1352, 442, 0.78)}
        {palm(556, 442, 0.7)}
      </g>

      {/* ————— العائلة ————— */}
      <g fill="#4a3826">
        {/* أب بثوب وغترة */}
        <g transform="translate(872 442)">
          <path d="M-11 0 v-40 q0 -12 11 -12 q11 0 11 12 v40 z" />
          <circle cx="0" cy="-58" r="8" />
          <path d="M-9 -60 q9 -12 18 0 q2 10 -3 14 h-12 q-5 -4 -3 -14 z" opacity="0.85" />
        </g>

        {/* أم بعباءة */}
        <g transform="translate(846 442)">
          <path d="M-13 0 q1 -30 4 -44 q2 -10 9 -10 q7 0 9 10 q3 14 4 44 z" />
          <circle cx="0" cy="-60" r="7.5" />
          <path d="M-8 -62 q8 -13 16 0 q1 12 -4 15 h-8 q-5 -3 -4 -15 z" opacity="0.85" />
        </g>

        {/* طفلان */}
        <g transform="translate(820 442)">
          <path d="M-7 0 v-24 q0 -8 7 -8 q7 0 7 8 v24 z" />
          <circle cx="0" cy="-37" r="5.5" />
        </g>
        <g transform="translate(800 442)">
          <path d="M-6 0 v-19 q0 -7 6 -7 q6 0 6 7 v19 z" />
          <circle cx="0" cy="-31" r="4.8" />
        </g>
      </g>

      {/* ————— الأرض الأمامية ————— */}
      <path
        d="M0 442 C 200 434, 380 452, 560 446 C 740 440, 880 428, 1060 438 C 1240 448, 1340 456, 1440 450 L1440 520 L0 520 Z"
        fill="#d3bd93"
      />
      <path
        d="M0 474 C 240 466, 420 484, 640 478 C 860 472, 1020 462, 1230 472 C 1330 477, 1390 480, 1440 478 L1440 520 L0 520 Z"
        fill="#c7ae82"
        opacity="0.7"
      />

      {/* التلاشي فوق كل شيء */}
      <rect x="0" y="0" width="1440" height="520" fill="url(#ath-fade)" />
    </svg>
  )
}

/**
 * نخلة واحدة: جذع بحلقات ليفية وتاج سعف أخضر.
 * x,y = موضع قاعدة الجذع، s = مقياس الحجم.
 */
function palm(x: number, y: number, s: number) {
  const fronds = [
    'M0 0 q -46 -16 -74 6',
    'M0 0 q -52 4 -68 30',
    'M0 0 q -34 -30 -34 -56',
    'M0 0 q 46 -16 74 6',
    'M0 0 q 52 4 68 30',
    'M0 0 q 34 -30 34 -56',
    'M0 0 q -14 -34 4 -58',
    'M0 0 q 16 -32 34 -44',
  ]

  return (
    <g key={`${x}-${y}`} transform={`translate(${x} ${y}) scale(${s})`}>
      {/* الجذع */}
      <path d="M-7 0 q 3 -60 -1 -104 l 12 0 q 4 44 3 104 z" fill="#8f7350" />
      {/* حلقات ليف النخل */}
      <g stroke="#6f5839" strokeWidth="1.6" opacity="0.55">
        <path d="M-6 -16 h12 M-6 -34 h12 M-5 -52 h12 M-5 -70 h12 M-4 -88 h12" />
      </g>

      {/* التاج */}
      <g transform="translate(1 -106)">
        <g stroke="#5a8a4e" strokeWidth="7" strokeLinecap="round" fill="none">
          {fronds.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
        <g stroke="#79a866" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.9">
          {fronds.map((d) => (
            <path key={`l${d}`} d={d} />
          ))}
        </g>
        {/* عذوق التمر */}
        <circle cx="-9" cy="7" r="4.5" fill="#b1762f" opacity="0.75" />
        <circle cx="9" cy="9" r="4" fill="#b1762f" opacity="0.65" />
        <circle cx="0" cy="4" r="3.4" fill="#8f5f24" opacity="0.6" />
      </g>
    </g>
  )
}
