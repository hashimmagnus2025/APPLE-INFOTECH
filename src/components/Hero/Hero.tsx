import { useEffect, useRef } from 'react'
import { gsap, SplitText } from '../../animations/registry'
import { onIntroDone } from '../../lib/intro'
import { prefersReducedMotion, isCoarsePointer } from '../../lib/env'
import { hero } from '../../data/content'
import { Button } from '../ui/Button'
import { HeroVisual, type HeroVisualHandle } from './HeroVisual'
import './Hero.css'

export function Hero() {
  const root = useRef<HTMLElement>(null)
  const visual = useRef<HeroVisualHandle>(null)

  useEffect(() => {
    const reduced = prefersReducedMotion()
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root)
      const lines = q('.hero__title .mask > span')
      const state = visual.current!.state

      if (!reduced) {
        gsap.set(lines, { yPercent: 112 })
        gsap.set(q('.hero__eyebrow, .hero__statement, .hero__cta, .hero__foot-item'), { opacity: 0, y: 24 })
        gsap.set(q('.hero__rule'), { scaleX: 0 })
        gsap.set(q('.hero__gridline'), { scaleY: 0 })
        gsap.set(q('.hero__glow'), { opacity: 0 })
      }

      // Statement as masked lines
      let statementSplit: SplitText | null = null
      if (!reduced) {
        statementSplit = SplitText.create(q('.hero__statement')[0], { type: 'lines', mask: 'lines' })
        gsap.set(statementSplit.lines, { yPercent: 110 })
        gsap.set(q('.hero__statement'), { opacity: 1, y: 0 })
      }

      const off = onIntroDone(() => {
        if (reduced) return
        const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })
        tl.to(q('.hero__gridline'), { scaleY: 1, duration: 1.8, stagger: 0.08, ease: 'power3.inOut' }, 0)
          .to(q('.hero__glow'), { opacity: 1, duration: 2.6, ease: 'power2.out' }, 0.1)
          .to(q('.hero__eyebrow'), { opacity: 1, y: 0, duration: 1 }, 0.25)
          .to(lines, { yPercent: 0, duration: 1.45, stagger: 0.13 }, 0.35)
          .to(statementSplit!.lines, { yPercent: 0, duration: 1.1, stagger: 0.08 }, 1.05)
          .to(q('.hero__cta'), { opacity: 1, y: 0, duration: 1 }, 1.25)
          .to(q('.hero__rule'), { scaleX: 1, duration: 1.6, ease: 'power3.inOut' }, 1.2)
          .to(q('.hero__foot-item'), { opacity: 1, y: 0, duration: 1, stagger: 0.1 }, 1.5)

        // lattice choreography
        tl.to(state, { alpha: 1, duration: 1.4, ease: 'power2.out' }, 0.2)
          .to(state, { assemble: 1, duration: 2.6, ease: 'power3.out' }, 0.35);
        state.ringIn.forEach((_, i) => {
          tl.to(state.ringIn, { [i]: 1, duration: 2.2, ease: 'power2.out' }, 0.5 + i * 0.16)
        })
        tl.to(state, { pulse: 1, duration: 1.4 }, 2.4)
      })

      // scroll-driven exit (parallax + lattice recede)
      if (!reduced) {
        gsap.to(q('.hero__content'), {
          yPercent: -14,
          opacity: 0.0,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top top', end: '82% top', scrub: true },
        })
        gsap.to(q('.hero__foot'), {
          yPercent: -60,
          opacity: 0,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top top', end: '50% top', scrub: true },
        })
        gsap.to(state, {
          scroll: 1,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
        })
        gsap.to(q('.hero__glow'), {
          yPercent: 18,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
        })
      }

      // gentle depth on the headline from pointer position
      let cleanupPtr = () => {}
      if (!reduced && !isCoarsePointer()) {
        const tx = gsap.quickTo(q('.hero__title')[0], 'x', { duration: 1.2, ease: 'power3.out' })
        const ty = gsap.quickTo(q('.hero__title')[0], 'y', { duration: 1.2, ease: 'power3.out' })
        const sx = gsap.quickTo(q('.hero__statement-wrap')[0], 'x', { duration: 1.4, ease: 'power3.out' })
        const sy = gsap.quickTo(q('.hero__statement-wrap')[0], 'y', { duration: 1.4, ease: 'power3.out' })
        const gx = gsap.quickTo(q('.hero__glow')[0], 'x', { duration: 1.8, ease: 'power3.out' })
        const move = (e: PointerEvent) => {
          const nx = (e.clientX / window.innerWidth) * 2 - 1
          const ny = (e.clientY / window.innerHeight) * 2 - 1
          tx(nx * -8)
          ty(ny * -5)
          sx(nx * -3)
          sy(ny * -2)
          gx(nx * 40)
        }
        window.addEventListener('pointermove', move, { passive: true })
        cleanupPtr = () => window.removeEventListener('pointermove', move)
      }

      return () => {
        off()
        cleanupPtr()
        statementSplit?.revert()
      }
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} id="top" className="hero" data-section="top" data-label="Intro">
      <div className="hero__glow" aria-hidden="true" />
      <div className="hero__grid" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="hero__gridline" />
        ))}
      </div>
      <HeroVisual ref={visual} />

      <div className="hero__content">
        <p className="eyebrow hero__eyebrow">
          <b>●</b>&nbsp;&nbsp;{hero.eyebrow}
        </p>
        <h1 className="hero__title" aria-label={hero.lines.join(' ')}>
          <span className="mask">
            <span>{hero.lines[0]}</span>
          </span>
          <span className="mask">
            <span>{hero.lines[1]}</span>
          </span>
          <span className="mask">
            <span>
              <em className="serif hero__accent">Better</em> ROI<span className="hero__dot">.</span>
            </span>
          </span>
        </h1>

        <div className="hero__lower">
          <div className="hero__statement-wrap">
            <p className="hero__statement">{hero.statement}</p>
          </div>
          <div className="hero__cta">
            <Button label={hero.cta} href="#about" variant="outline" cursor="explore" />
          </div>
        </div>
      </div>

      <div className="hero__foot">
        <span className="hero__rule" aria-hidden="true" />
        <div className="hero__foot-row">
          <div className="hero__foot-item hero__scroll">
            <span className="hero__scroll-line" aria-hidden="true" />
            <span className="eyebrow">Scroll</span>
          </div>
          <div className="hero__foot-item eyebrow hero__tagline">We Ensure Better ROI</div>
          <div className="hero__foot-item eyebrow hero__index">
            <b>01</b> — 08
          </div>
        </div>
      </div>
    </section>
  )
}
