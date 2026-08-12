import { Link } from 'react-router-dom'
import { publicImageUrl } from '../lib/supabase'
import type { Photo } from '../lib/types'

export function PhotoCard({ photo }: { photo: Photo }) {
  return (
    <Link
      to={`/photo/${photo.id}`}
      className="card group block overflow-hidden transition-shadow hover:shadow-[var(--shadow)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden" style={{ backgroundColor: 'var(--surface-alt)' }}>
        <img
          src={publicImageUrl(photo.image_path)}
          alt={photo.title}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />

        <span
          className="absolute top-2.5 rounded-full px-2.5 py-1 text-[11px] font-bold backdrop-blur"
          style={{
            insetInlineStart: '0.625rem',
            backgroundColor: 'color-mix(in srgb, var(--ink) 78%, transparent)',
            color: 'var(--surface)',
          }}
        >
          {photo.category}
        </span>
      </div>

      <div className="p-4">
        <h3 className="display line-clamp-2 text-base font-bold leading-snug">{photo.title}</h3>

        {photo.description && (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {photo.description}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs" style={{ color: 'var(--text-faint)' }}>
          <span>{photo.region}</span>
          {photo.city && (
            <>
              <span aria-hidden>·</span>
              <span>{photo.city}</span>
            </>
          )}
          {photo.approx_year && (
            <>
              <span aria-hidden>·</span>
              <span className="num">{photo.approx_year}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  )
}

export function PhotoCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-[4/3] animate-pulse" style={{ backgroundColor: 'var(--surface-alt)' }} />
      <div className="space-y-2 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded" style={{ backgroundColor: 'var(--surface-alt)' }} />
        <div className="h-3 w-full animate-pulse rounded" style={{ backgroundColor: 'var(--surface-alt)' }} />
        <div className="h-3 w-1/2 animate-pulse rounded" style={{ backgroundColor: 'var(--surface-alt)' }} />
      </div>
    </div>
  )
}
