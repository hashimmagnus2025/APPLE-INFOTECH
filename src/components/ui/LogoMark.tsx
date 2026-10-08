import { markPaths, MARK, MARK_VIEWBOX } from '../../lib/logoGeometry'

interface Props {
  className?: string
  /** stroke widths can be thinned for line-art variants */
  title?: string
}

/**
 * The Apple Infotech mark rebuilt as vector geometry:
 * four node pods + four link bars. Colours come from CSS variables
 * (--pod / --link) so it adapts to dark and light sections.
 */
export function LogoMark({ className = '', title }: Props) {
  return (
    <svg
      className={`logo-mark ${className}`}
      viewBox={MARK_VIEWBOX}
      fill="none"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {markPaths.links.map((d, i) => (
        <path key={`l${i}`} data-link d={d} stroke="var(--link, #afc5e3)" strokeWidth={MARK.w} />
      ))}
      {markPaths.pods.map((d, i) => (
        <path key={`p${i}`} data-pod d={d} stroke="var(--pod, #fff)" strokeWidth={MARK.w} />
      ))}
    </svg>
  )
}
