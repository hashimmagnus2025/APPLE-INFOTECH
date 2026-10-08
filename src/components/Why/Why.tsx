import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../../animations/registry'
import { why } from '../../data/content'
import { prefersReducedMotion } from '../../lib/env'
import { setChromeTheme } from '../../lib/theme'
import { LogoMark } from '../ui/LogoMark'
import { ArrowUpRight } from '../ui/Icons'
import './Why.css'

export function Why() {
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = root.current!
    const reduced = prefersReducedMotion()
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(el)
      const pods = q('.why__mark [data-pod]')
      const setPod = (idx: number) => {
        pods.forEach((p, i) => gsap.to(p, { opacity: i === idx ? 1 : 0.16, duration: 0.6, overwrite: 'auto' }))
      }
      // chrome turns dark-on-light while this section sits under the navigation
      ScrollTrigger.create({
        trigger: el,
        start: 'top 56px',
        end: 'bottom 56px',
        onToggle: (self) => setChromeTheme(self.isActive ? 'light' : 'dark'),
      })
      if (reduced) {
        pods.forEach((p) => gsap.set(p, { opacity: 1 }))
        return
      }
      setPod(-1)

      gsap.from(q('.why__title .mask > span'), {
        yPercent: 110,
        duration: 1.3,
        stagger: 0.1,
        ease: 'power4.out',
        scrollTrigger: { trigger: q('.why__title')[0], start: 'top 85%' },
      })
      gsap.from(q('.why__lead, .why__head > *'), {
        opacity: 0,
        y: 24,
        stagger: 0.1,
        duration: 1,
        scrollTrigger: { trigger: el, start: 'top 70%' },
      })
      gsap.fromTo(
        q('.why__mark'),
        { rotation: -45 },
        { rotation: 45, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } },
      )

      q('.why__item').forEach((item, i) => {
        const line = item.querySelector('.why__line')
        const parts = item.querySelectorAll('.why__n, .why__t, .why__d, .why__go')
        gsap.from(line, { scaleX: 0, transformOrigin: 'left center', duration: 1.5, ease: 'power3.inOut', scrollTrigger: { trigger: item, start: 'top 86%' } })
        gsap.from(parts, {
          y: 50,
          opacity: 0,
          duration: 1.2,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: { trigger: item, start: 'top 84%' },
        })
        ScrollTrigger.create({
          trigger: item,
          start: 'top 62%',
          end: 'bottom 62%',
          onToggle: (self) => self.isActive && setPod(i),
        })
      })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} id="why" className="why section section--light" data-section="why" data-label="Why Us">
      <div className="why__grid">
        <div className="why__side">
          <div className="why__sticky">
            <header className="why__head">
              <p className="eyebrow">
                <b>07</b>&nbsp;&nbsp;—&nbsp;&nbsp;{why.label}
              </p>
            </header>
            <h2 className="why__title" aria-label={why.title.join(' ')}>
              <span className="mask">
                <span>{why.title[0]}</span>
              </span>
              <span className="mask">
                <span>
                  <em className="serif">{why.title[1]}</em>
                </span>
              </span>
            </h2>
            <p className="why__lead">{why.lead}</p>
            <LogoMark className="why__mark" />
          </div>
        </div>

        <ol className="why__list">
          {why.items.map((it) => (
            <li key={it.n} className="why__item" data-cursor="hover">
              <span className="why__line" />
              <span className="why__wipe" aria-hidden="true" />
              <span className="why__n eyebrow">{it.n}</span>
              <h3 className="why__t">{it.t}</h3>
              <p className="why__d">{it.d}</p>
              <span className="why__go" aria-hidden="true">
                <ArrowUpRight />
              </span>
            </li>
          ))}
          <li className="why__end" aria-hidden="true" />
        </ol>
      </div>
    </section>
  )
}
