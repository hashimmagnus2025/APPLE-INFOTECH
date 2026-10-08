import { useEffect, useRef } from 'react'
import { gsap } from '../animations/registry'
import { isCoarsePointer, prefersReducedMotion } from '../lib/env'
import './Cursor.css'

/**
 * Minimal custom cursor: a precise dot and a lagging ring. Interactive elements
 * grow the ring; elements with data-cursor="explore|view|drag" show a label.
 * Uses difference blending so it reads on both dark and light sections.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (isCoarsePointer() || prefersReducedMotion()) return
    document.documentElement.classList.add('has-cursor')
    const d = dot.current!
    const r = ring.current!
    const l = label.current!
    gsap.set([d, r], { xPercent: -50, yPercent: -50, x: -100, y: -100 })

    const dx = gsap.quickTo(d, 'x', { duration: 0.08, ease: 'none' })
    const dy = gsap.quickTo(d, 'y', { duration: 0.08, ease: 'none' })
    const rx = gsap.quickTo(r, 'x', { duration: 0.55, ease: 'power3.out' })
    const ry = gsap.quickTo(r, 'y', { duration: 0.55, ease: 'power3.out' })

    let shown = false
    const move = (e: PointerEvent) => {
      if (!shown) {
        shown = true
        gsap.set([d, r], { x: e.clientX, y: e.clientY })
        gsap.to([d, r], { opacity: 1, duration: 0.4 })
      }
      dx(e.clientX)
      dy(e.clientY)
      rx(e.clientX)
      ry(e.clientY)
    }

    let state = ''
    const setState = (s: string, text = '') => {
      if (s === state && l.textContent === text) return
      state = s
      l.textContent = text
      if (s === 'label') {
        gsap.to(r, { width: 96, height: 96, duration: 0.5, ease: 'power3.out' })
        gsap.to(l, { opacity: 1, duration: 0.3 })
        gsap.to(d, { scale: 0, duration: 0.3 })
      } else if (s === 'hover') {
        gsap.to(r, { width: 56, height: 56, duration: 0.5, ease: 'power3.out' })
        gsap.to(l, { opacity: 0, duration: 0.2 })
        gsap.to(d, { scale: 0.5, duration: 0.3 })
      } else {
        gsap.to(r, { width: 30, height: 30, duration: 0.5, ease: 'power3.out' })
        gsap.to(l, { opacity: 0, duration: 0.2 })
        gsap.to(d, { scale: 1, duration: 0.3 })
      }
    }

    const over = (e: PointerEvent) => {
      const t = (e.target as HTMLElement | null)?.closest?.('[data-cursor], a, button') as HTMLElement | null
      if (!t) return setState('')
      const kind = t.dataset.cursor
      if (kind && kind !== 'hover') setState('label', kind.toUpperCase())
      else setState('hover')
    }
    const down = () => gsap.to(r, { scale: 0.86, duration: 0.2 })
    const up = () => gsap.to(r, { scale: 1, duration: 0.4, ease: 'power3.out' })
    const leave = () => gsap.to([d, r], { opacity: 0, duration: 0.3 })
    const enter = () => gsap.to([d, r], { opacity: 1, duration: 0.3 })

    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerover', over, { passive: true })
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    document.documentElement.addEventListener('pointerleave', leave)
    document.documentElement.addEventListener('pointerenter', enter)
    return () => {
      document.documentElement.classList.remove('has-cursor')
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerover', over)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      document.documentElement.removeEventListener('pointerleave', leave)
      document.documentElement.removeEventListener('pointerenter', enter)
    }
  }, [])

  return (
    <div className="cursor" aria-hidden="true">
      <div ref={ring} className="cursor__ring">
        <span ref={label} className="cursor__label" />
      </div>
      <div ref={dot} className="cursor__dot" />
    </div>
  )
}
