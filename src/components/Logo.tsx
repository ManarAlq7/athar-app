/**
 * شعار أَثَر — قوس نجدي بسيط داخل مربّع، بخط يمثّل الأفق.
 * مرسوم بـ SVG لا صورة، فيبقى حاداً في كل المقاسات ويتلوّن مع السياق.
 */
export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <rect x="1" y="1" width="38" height="38" rx="10" fill="currentColor" opacity="0.1" />
      <rect
        x="1"
        y="1"
        width="38"
        height="38"
        rx="10"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.35"
      />
      {/* قوس مدبّب — العنصر الأبرز في العمارة النجدية والحجازية */}
      <path
        d="M13 29V20.5C13 16.9 16.1 14 20 14C23.9 14 27 16.9 27 20.5V29"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path d="M9 29H31" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="20" cy="21.5" r="2" fill="currentColor" />
    </svg>
  )
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark size={compact ? 30 : 36} />
      <span className="flex flex-col leading-none">
        <span className="display text-lg font-bold tracking-tight">أَثَر</span>
        {!compact && (
          <span
            className="mt-0.5 text-[10px] font-medium tracking-[0.18em]"
            style={{ color: 'var(--text-faint)' }}
          >
            ATHAR
          </span>
        )}
      </span>
    </span>
  )
}
