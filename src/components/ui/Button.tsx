import { useEffect, useRef } from 'react'
import { magnetic } from '../../animations/magneticEffects'
import { scrollToTarget } from '../../animations/smoothScroll'
import { ArrowRight } from './Icons'
import './Button.css'

interface Props {
  label: string
  href?: string
  variant?: 'outline' | 'solid' | 'text'
  size?: 'md' | 'lg'
  className?: string
  cursor?: string
  onClick?: () => void
}

/** Thin-bordered, label-rolling, arrow-sliding button with a subtle magnetic pull. */
export function Button({ label, href = '#', variant = 'outline', size = 'md', className = '', cursor, onClick }: Props) {
  const ref = useRef<HTMLAnchorElement>(null)
  const inner = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!ref.current) return
    return magnetic(ref.current, inner.current, 0.22)
  }, [])

  const handle = (e: React.MouseEvent) => {
    onClick?.()
    if (href.startsWith('#') && href.length > 1) {
      e.preventDefault()
      scrollToTarget(href)
    }
  }

  return (
    <a
      ref={ref}
      href={href}
      onClick={handle}
      className={`btn btn--${variant} btn--${size} ${className}`}
      data-cursor={cursor ?? 'hover'}
    >
      <span className="btn__fill" aria-hidden="true" />
      <span className="btn__inner" ref={inner}>
        <span className="btn__label">
          <span className="btn__text">{label}</span>
          <span className="btn__text btn__text--clone" aria-hidden="true">
            {label}
          </span>
        </span>
        <span className="btn__arrow" aria-hidden="true">
          <ArrowRight className="btn__arrow-a" />
          <ArrowRight className="btn__arrow-b" />
        </span>
      </span>
    </a>
  )
}
