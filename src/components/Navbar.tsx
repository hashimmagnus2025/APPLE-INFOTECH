import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '../animations/registry'
import { onIntroDone } from '../lib/intro'
import { nav, brand } from '../data/content'
import { LogoMark } from './ui/LogoMark'
import { Button } from './ui/Button'
import { lockScroll, unlockScroll, scrollToTarget } from '../animations/smoothScroll'
import { prefersReducedMotion } from '../lib/env'
import './Navbar.css'

export function Navbar() {
  const header = useRef<HTMLElement>(null)
  const menu = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  // entrance + hide-on-scroll-down / show-on-scroll-up
  useEffect(() => {
    const el = header.current!
    const reduced = prefersReducedMotion()
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(el)
      if (!reduced) {
        gsap.set(el, { yPercent: -100 })
        gsap.set(q('.nav__brand, .nav__link, .nav__cta, .nav__burger'), { opacity: 0, y: -14 })
      }
      const off = onIntroDone(() => {
        if (reduced) return
        gsap
          .timeline({ defaults: { ease: 'power4.out', duration: 1.1 } })
          .to(el, { yPercent: 0, duration: 0.01 }, 0)
          .to(q('.nav__brand'), { opacity: 1, y: 0 }, 0.1)
          .to(q('.nav__link'), { opacity: 1, y: 0, stagger: 0.07 }, 0.25)
          .to(q('.nav__cta, .nav__burger'), { opacity: 1, y: 0 }, 0.5)
      })

      let hidden = false
      const st = ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => {
          const y = self.scroll()
          el.classList.toggle('is-scrolled', y > 60)
          if (menuOpenRef.current) return
          if (self.direction === 1 && y > 240 && !hidden) {
            hidden = true
            gsap.to(el, { yPercent: -100, duration: 0.7, ease: 'power3.inOut', overwrite: 'auto' })
          } else if ((self.direction === -1 || y < 240) && hidden) {
            hidden = false
            gsap.to(el, { yPercent: 0, duration: 0.7, ease: 'power3.out', overwrite: 'auto' })
          }
        },
      })
      return () => {
        off()
        st.kill()
      }
    }, el)
    return () => ctx.revert()
  }, [])

  const menuOpenRef = useRef(false)

  // mobile menu — opens through a diamond-shaped reveal
  useEffect(() => {
    const m = menu.current!
    const q = gsap.utils.selector(m)
    const ctx = gsap.context(() => {
      gsap.set(m, { clipPath: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)', visibility: 'hidden' })
      gsap.set(q('.menu__link span'), { yPercent: 110 })
      gsap.set(q('.menu__foot'), { opacity: 0 })
      tlRef.current = gsap
        .timeline({ paused: true, defaults: { ease: 'power4.inOut' } })
        .set(m, { visibility: 'visible' })
        .to(m, { clipPath: 'polygon(50% -60%, 160% 50%, 50% 160%, -60% 50%)', duration: 1 }, 0)
        .to(q('.menu__link span'), { yPercent: 0, duration: 1, stagger: 0.07, ease: 'power4.out' }, 0.45)
        .to(q('.menu__foot'), { opacity: 1, duration: 0.6 }, 0.9)
    }, m)
    return () => ctx.revert()
  }, [])

  const toggle = (next: boolean) => {
    setOpen(next)
    menuOpenRef.current = next
    if (next) {
      lockScroll()
      tlRef.current?.timeScale(1).play()
    } else {
      tlRef.current?.timeScale(1.5).reverse()
      unlockScroll()
    }
  }

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    if (open) toggle(false)
    scrollToTarget(href === '#top' ? 0 : href)
  }

  return (
    <>
      <header ref={header} className={`nav ${open ? 'is-open' : ''}`}>
        <a className="nav__brand" href="#top" onClick={go('#top')} aria-label={`${brand.name} — home`}>
          <LogoMark className="nav__mark" />
          <span className="nav__word">
            <b>Apple</b>
            <i>Infotech</i>
          </span>
        </a>

        <nav className="nav__links" aria-label="Primary">
          {nav.map((n) => (
            <a key={n.href} className="nav__link" href={n.href} onClick={go(n.href)}>
              <span>{n.label}</span>
            </a>
          ))}
        </nav>

        <div className="nav__cta">
          <Button label="Let's Talk" href="#contact" variant="outline" />
        </div>

        <button
          className="nav__burger"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => toggle(!open)}
        >
          <span />
          <span />
        </button>
      </header>

      <div ref={menu} className="menu" aria-hidden={!open}>
        <nav className="menu__nav" aria-label="Mobile">
          {nav.map((n, i) => (
            <a key={n.href} className="menu__link" href={n.href} onClick={go(n.href)}>
              <span>
                <em className="eyebrow">0{i + 1}</em>
                {n.label}
              </span>
            </a>
          ))}
        </nav>
        <div className="menu__foot">
          <span className="eyebrow">{brand.tagline}</span>
          <Button label="Let's Talk" href="#contact" variant="outline" onClick={() => toggle(false)} />
        </div>
      </div>
    </>
  )
}
