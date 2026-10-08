import { useEffect, useRef } from 'react'
import { gsap } from '../../animations/registry'
import { cta } from '../../data/content'
import { prefersReducedMotion, isMobileViewport } from '../../lib/env'
import { startPointer } from '../../lib/pointer'
import { Button } from '../ui/Button'
import { createCTAGeometry } from './CTAGeometry'
import './CTA.css'

export function CTA() {
  const root = useRef<HTMLElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const el = root.current!
    const reduced = prefersReducedMotion()
    startPointer()
    const geo = createCTAGeometry(canvas.current!, { mobile: isMobileViewport(), reduced })
    if (reduced) geo.renderOnce()
    else gsap.ticker.add(geo.frame)

    const ctx = gsap.context(() => {
      if (reduced) return
      const q = gsap.utils.selector(el)
      gsap
        .timeline({ scrollTrigger: { trigger: el, start: 'top 65%' }, defaults: { ease: 'power4.out' } })
        .to(geo.state, { alpha: 1, duration: 2.4, ease: 'power2.out' }, 0)
        .from(q('.cta__title .mask > span'), { yPercent: 112, duration: 1.5, stagger: 0.12 }, 0.1)
        .from(q('.cta__text, .cta__btn, .cta__label'), { y: 30, opacity: 0, duration: 1.1, stagger: 0.12 }, 0.7)
      gsap.to(geo.state, {
        progress: 1,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom bottom', scrub: true },
      })
      gsap.fromTo(
        q('.cta__title'),
        { yPercent: 8 },
        { yPercent: -6, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } },
      )
    }, el)

    return () => {
      ctx.revert()
      gsap.ticker.remove(geo.frame)
      geo.destroy()
    }
  }, [])

  return (
    <section ref={root} id="contact" className="cta section" data-section="contact" data-label="Contact">
      <canvas ref={canvas} className="cta__geo" aria-hidden="true" />
      <div className="cta__glow" aria-hidden="true" />
      <div className="cta__inner">
        <p className="eyebrow cta__label">
          <b>08</b>&nbsp;&nbsp;—&nbsp;&nbsp;Contact
        </p>
        <h2 className="cta__title" aria-label={cta.lines.join(' ')}>
          <span className="mask">
            <span>{cta.lines[0]}</span>
          </span>
          <span className="mask">
            <span>
              <em className="serif">{cta.lines[1]}</em>
            </span>
          </span>
        </h2>
        <p className="cta__text">{cta.text}</p>
        <div className="cta__btn">
          <Button label={cta.button} href="mailto:?subject=Apple%20Infotech%20enquiry" variant="solid" size="lg" cursor="explore" />
        </div>
      </div>
    </section>
  )
}
