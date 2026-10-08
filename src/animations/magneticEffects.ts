import { gsap } from './registry'
import { isCoarsePointer, prefersReducedMotion } from '../lib/env'

/**
 * Subtle magnetic pull. The element drifts toward the pointer; an optional
 * inner element drifts a little further for a layered feel.
 */
export function magnetic(el: HTMLElement, inner?: HTMLElement | null, strength = 0.28) {
  if (isCoarsePointer() || prefersReducedMotion()) return () => {}
  const xTo = gsap.quickTo(el, 'x', { duration: 0.7, ease: 'power3.out' })
  const yTo = gsap.quickTo(el, 'y', { duration: 0.7, ease: 'power3.out' })
  const ixTo = inner ? gsap.quickTo(inner, 'x', { duration: 0.8, ease: 'power3.out' }) : null
  const iyTo = inner ? gsap.quickTo(inner, 'y', { duration: 0.8, ease: 'power3.out' }) : null

  const move = (e: PointerEvent) => {
    const r = el.getBoundingClientRect()
    const dx = e.clientX - (r.left + r.width / 2)
    const dy = e.clientY - (r.top + r.height / 2)
    xTo(dx * strength)
    yTo(dy * strength)
    ixTo?.(dx * strength * 0.35)
    iyTo?.(dy * strength * 0.35)
  }
  const leave = () => {
    xTo(0)
    yTo(0)
    ixTo?.(0)
    iyTo?.(0)
  }
  el.addEventListener('pointermove', move)
  el.addEventListener('pointerleave', leave)
  return () => {
    el.removeEventListener('pointermove', move)
    el.removeEventListener('pointerleave', leave)
  }
}
