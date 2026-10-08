import { useEffect, useRef } from 'react'
import { gsap } from '../../animations/registry'
import { brand, footer, nav } from '../../data/content'
import { prefersReducedMotion } from '../../lib/env'
import { scrollToTarget } from '../../animations/smoothScroll'
import { LogoMark } from '../ui/LogoMark'
import { ArrowUpRight } from '../ui/Icons'
import './Footer.css'

export function Footer() {
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const el = root.current!
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(el)
      gsap.from(q('.foot__col'), {
        y: 40,
        opacity: 0,
        duration: 1.1,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: q('.foot__grid')[0], start: 'top 90%' },
      })
      gsap.from(q('.foot__rule'), { scaleX: 0, transformOrigin: 'left center', duration: 1.6, ease: 'power3.inOut', scrollTrigger: { trigger: el, start: 'top 90%' } })
      gsap.fromTo(
        q('.foot__giant span'),
        { yPercent: 60 },
        { yPercent: 0, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom bottom', scrub: true } },
      )
    }, el)
    return () => ctx.revert()
  }, [])

  const go = (href: string) => (e: React.MouseEvent) => {
    if (href.startsWith('#') && href.length > 1) {
      e.preventDefault()
      scrollToTarget(href)
    }
  }

  return (
    <footer ref={root} className="foot section">
      <span className="foot__rule" />
      <div className="foot__grid">
        <div className="foot__col foot__brand">
          <div className="foot__logo">
            <LogoMark className="foot__mark" />
            <span className="foot__word">
              <b>Apple</b>
              <i>Infotech</i>
            </span>
          </div>
          <p className="foot__statement">{footer.statement}</p>
        </div>

        <nav className="foot__col foot__nav" aria-label="Footer">
          <p className="eyebrow">Navigate</p>
          <ul>
            {nav.map((n) => (
              <li key={n.href}>
                <a href={n.href} onClick={go(n.href)} className="foot__link">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="foot__col foot__contact">
          <p className="eyebrow">Contact</p>
          <ul>
            {footer.contact.map((c) => (
              <li key={c.k}>
                <span className="eyebrow">{c.k}</span>
                <a href={c.href} className="foot__link">
                  {c.v}
                </a>
              </li>
            ))}
          </ul>
          <ul className="foot__social">
            {footer.social.map((s) => (
              <li key={s.label}>
                <a href={s.href} className="foot__link">
                  {s.label}
                  <ArrowUpRight />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="foot__bottom">
        <span className="eyebrow">
          © {brand.year} {brand.name}. All rights reserved.
        </span>
        <span className="eyebrow foot__tag">{brand.tagline}</span>
        <button className="eyebrow foot__top" onClick={() => scrollToTarget(0)} data-cursor="hover">
          Back to top ↑
        </button>
      </div>

      <div className="foot__giant" aria-hidden="true">
        <span>Apple Infotech</span>
      </div>
    </footer>
  )
}
