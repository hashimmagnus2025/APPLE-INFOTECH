import { useEffect, useRef } from 'react'
import { gsap, SplitText } from '../../animations/registry'
import { scrubWords } from '../../animations/textAnimations'
import { markPaths, MARK, MARK_VIEWBOX, diamondPath } from '../../lib/logoGeometry'
import { about } from '../../data/content'
import { prefersReducedMotion } from '../../lib/env'
import { CorridorImage } from '../ui/CorridorImage'
import './About.css'

export function About() {
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = root.current!
    const reduced = prefersReducedMotion()
    if (reduced) return
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(el)
      const splits: SplitText[] = []

      // statement: words light up with scroll
      const { split } = scrubWords(q('.about__statement')[0], { start: 'top 80%', end: 'bottom 55%' })
      splits.push(split)

      // thread: a hairline that grows down the left edge, continuing the hero's grid
      gsap.fromTo(
        q('.about__thread-line'),
        { scaleY: 0 },
        { scaleY: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 70%', end: 'bottom 60%', scrub: 0.6 } },
      )

      // geometry draws itself, pods arrive one by one
      const figTl = gsap.timeline({
        scrollTrigger: { trigger: q('.about__fig')[0], start: 'top 85%', end: 'bottom 30%', scrub: 0.8 },
      })
      figTl
        .fromTo(q('.about__fig-line'), { drawSVG: '0%' }, { drawSVG: '100%', stagger: 0.12, ease: 'none', duration: 1 }, 0)
        .fromTo(q('.about__fig-pod'), { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, stagger: 0.22, ease: 'power2.out', duration: 0.5, transformOrigin: '50% 50%' }, 0.2)
        .fromTo(q('.about__fig-link'), { drawSVG: '50% 50%' }, { drawSVG: '0% 100%', stagger: 0.18, ease: 'none', duration: 0.5 }, 0.5)
      gsap.to(q('.about__fig-wrap'), {
        rotation: 90,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
      })
      gsap.to(q('.about__fig'), {
        yPercent: -14,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
      })

      // supporting copy + principles
      const body = SplitText.create(q('.about__body')[0], { type: 'lines', mask: 'lines' })
      splits.push(body)
      gsap.from(body.lines, {
        yPercent: 105,
        duration: 1.2,
        stagger: 0.07,
        ease: 'power4.out',
        scrollTrigger: { trigger: q('.about__body')[0], start: 'top 86%' },
      })
      gsap.from(q('.about__principle'), {
        opacity: 0,
        y: 24,
        stagger: 0.12,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: q('.about__principles')[0], start: 'top 88%' },
      })
      gsap.from(q('.about__principle-line'), {
        scaleX: 0,
        transformOrigin: 'left center',
        stagger: 0.12,
        duration: 1.4,
        ease: 'power3.inOut',
        scrollTrigger: { trigger: q('.about__principles')[0], start: 'top 88%' },
      })

      // image: mask opens + inner parallax
      gsap.from(q('.about__image'), {
        clipPath: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)',
        duration: 1.8,
        ease: 'power4.inOut',
        scrollTrigger: { trigger: q('.about__image')[0], start: 'top 85%' },
      })

      return () => splits.forEach((s) => s.revert())
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} id="about" className="about section" data-section="about" data-label="About">
      <div className="about__thread" aria-hidden="true">
        <span className="about__thread-line" />
      </div>

      <div className="about__fig" aria-hidden="true">
        <div className="about__fig-wrap">
          <svg viewBox={MARK_VIEWBOX} fill="none" overflow="visible">
            <path className="about__fig-line" d={diamondPath(58, 0.3)} stroke="rgba(175,197,227,0.18)" strokeWidth="0.3" vectorEffect="non-scaling-stroke" />
            <path className="about__fig-line" d={markPaths.outer} stroke="rgba(255,255,255,0.35)" strokeWidth="0.4" vectorEffect="non-scaling-stroke" />
            <path className="about__fig-line" d={markPaths.inner} stroke="rgba(255,255,255,0.35)" strokeWidth="0.4" vectorEffect="non-scaling-stroke" />
            {markPaths.links.map((d, i) => (
              <path key={'l' + i} className="about__fig-link" d={d} stroke="rgba(175,197,227,0.16)" strokeWidth={MARK.w} />
            ))}
            {markPaths.pods.map((d, i) => (
              <path key={'p' + i} className="about__fig-pod" d={d} stroke="rgba(255,255,255,0.1)" strokeWidth={MARK.w} />
            ))}
          </svg>
        </div>
      </div>

      <header className="about__head">
        <p className="eyebrow">
          <b>02</b>&nbsp;&nbsp;—&nbsp;&nbsp;{about.label}
        </p>
        <span className="rule" />
        <p className="eyebrow about__head-r">Impact, by design</p>
      </header>

      <div className="about__grid">
        <h2 className="about__statement">
          Technology should not just work. It should create <em className="serif">impact.</em>
        </h2>

        <div className="about__aside">
          <p className="about__body">{about.body}</p>
          <ul className="about__principles">
            {about.principles.map((p) => (
              <li key={p.k} className="about__principle" data-cursor="hover">
                <span className="about__principle-line" />
                <span className="eyebrow">{p.k}</span>
                <span className="about__principle-t">{p.t}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="about__image" data-cursor="view">
          <CorridorImage />
          <span className="about__image-cap eyebrow">Fig. 01 — Precision</span>
        </div>
      </div>
    </section>
  )
}
