import type { Photo } from '../lib/types'

/**
 * سطر النسبة والحقوق تحت الصورة.
 *
 * الرخص من نوع CC BY تُلزم بعرض اسم المصوّر والرخصة ورابط المصدر بشكل ظاهر —
 * ذكرها داخل نص القصة لا يكفي نظاماً، فتُعرض هنا صراحةً.
 */
export function Attribution({ photo }: { photo: Photo }) {
  const has = photo.license || photo.creator || photo.source
  if (!has) return null

  return (
    <aside
      className="mt-4 rounded-xl border px-4 py-3 text-xs leading-relaxed"
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--surface-alt)',
        color: 'var(--text-muted)',
      }}
    >
      <span className="font-bold" style={{ color: 'var(--text)' }}>
        الحقوق:
      </span>{' '}

      {photo.creator && (
        <>
          تصوير <span className="font-semibold">{photo.creator}</span>
          {' · '}
        </>
      )}

      {photo.license && (
        <>
          {photo.license_url ? (
            <a href={photo.license_url} target="_blank" rel="noreferrer" className="underline">
              {photo.license}
            </a>
          ) : (
            <span>{photo.license}</span>
          )}
        </>
      )}

      {photo.source && (
        <>
          {' · '}
          {photo.source_url ? (
            <a href={photo.source_url} target="_blank" rel="noreferrer" className="underline">
              {photo.source}
            </a>
          ) : (
            <span>{photo.source}</span>
          )}
        </>
      )}

      {photo.attribution_required && (
        <span className="ms-2 chip" style={{ fontSize: '10px' }}>
          تتطلب نسبة
        </span>
      )}
    </aside>
  )
}
