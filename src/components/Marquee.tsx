import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../animations/registry'
import { cta } from '../data/content'
import { prefersReducedMotion } from '../lib/env'
import './Marquee.css'

/** Two rows of oversized outline type; scroll velocity speeds them up, reverses them and skews the block. */
export function Marquee() {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const el = root.current!
    const ctx = gsap.context(() => {
      const rows = gsap.utils.toArray<HTMLElement>('.mq__row', el)
      const tweens = rows.map((row, i) => {
        const track = row.querySelector<HTMLElement>('.mq__track')!
        return gsap.fromTo(track, { xPercent: i % 2 ? -50 : 0 }, { xPercent: i % 2 ? 0 : -50, ease: 'none', duration: 38 - i * 6, repeat: -1 })
      })
      const skew = gsap.quickTo(el.querySelector('.mq__inner'), 'skewX', { duration: 0.6, ease: 'power3.out' })
      let dir = 1
      let boost = 0
      let target = 0
      ScrollTrigger.create({
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          const v = self.getVelocity()
          if (Math.abs(v) > 60) dir = v > 0 ? 1 : -1
          target = Math.min(Math.abs(v) / 260, 5)
          skew(gsap.utils.clamp(-7, 7, v / -420))
        },
      })
      // ease the velocity boost back to rest every frame
      const tick = () => {
        boost += (target - boost) * 0.07
        target *= 0.94
        tweens.forEach((t) => t.timeScale(dir * (1 + boost)))
      }
      gsap.ticker.add(tick)
      return () => gsap.ticker.remove(tick)
    }, el)
    return () => ctx.revert()
  }, [])

  const items = Array.from({ length: 8 })
  return (
    <div ref={root} className="mq" aria-hidden="true">
      <div className="mq__inner">
        {[0, 1].map((r) => (
          <div key={r} className={`mq__row mq__row--${r}`}>
            <div className="mq__track">
              {items.map((_, i) => (
                <span key={i} className="mq__item">
                  <span className={r ? 'mq__solid' : 'mq__outline'}>{cta.marquee}</span>
                  <i className="mq__dia" />
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
