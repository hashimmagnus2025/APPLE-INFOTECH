import { useEffect, useRef } from 'react'
import { gsap } from '../animations/registry'
import { markPaths, MARK, MARK_VIEWBOX } from '../lib/logoGeometry'
import { completeIntro } from '../lib/intro'
import { lockScroll, unlockScroll } from '../animations/smoothScroll'
import { prefersReducedMotion } from '../lib/env'
import './Preloader.css'

/**
 * The logo draws itself: contour first, then the four node pods fill and the
 * links sweep in while a counter climbs. The hero is then revealed through an
 * expanding diamond — the logo's silhouette becomes the first transition.
 */
export function Preloader() {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = root.current!
    const hero = document.getElementById('top')
    const reduced = prefersReducedMotion()
    lockScroll()

    let seen = false
    try {
      seen = sessionStorage.getItem('ai-intro') === '1'
      sessionStorage.setItem('ai-intro', '1')
    } catch {
      /* storage unavailable — play the full intro */
    }

    const finish = () => {
      if (hero) hero.style.clipPath = ''
      document.documentElement.classList.remove('is-loading')
      unlockScroll()
      el.style.display = 'none'
    }

    if (reduced) {
      completeIntro()
      finish()
      return
    }

    const q = gsap.utils.selector(el)
    const counter = { v: 0 }
    const countEl = q('.pre__count')[0]
    const diamond = { L: 0 }
    const setClip = () => {
      if (!hero) return
      const w = hero.offsetWidth
      const h = hero.offsetHeight
      // measure around the viewport centre so the opening is centred on screen
      const cx = w / 2
      const cy = Math.min(h, window.innerHeight) / 2
      const L = diamond.L
      hero.style.clipPath = `polygon(${cx}px ${cy - L}px, ${cx + L}px ${cy}px, ${cx}px ${cy + L}px, ${cx - L}px ${cy}px)`
    }
    setClip()

    let failsafe = 0
    const ctx = gsap.context(() => {
      gsap.set(q('.pre__outer, .pre__inner'), { drawSVG: '0%' })
      gsap.set(q('.pre__pod'), { drawSVG: '0%' })
      gsap.set(q('.pre__link'), { drawSVG: '0%' })
      gsap.set(q('.pre__meta > *'), { opacity: 0, y: 12 })

      const maxL = () => (hero ? hero.offsetWidth / 2 + Math.min(hero.offsetHeight, window.innerHeight) / 2 + 40 : 2000)

      const tl = gsap.timeline({
        defaults: { ease: 'power3.inOut' },
        onComplete: () => {
          window.clearTimeout(failsafe)
          finish()
        },
      })
      // never leave a visitor stuck behind the intro (e.g. a throttled background tab)
      failsafe = window.setTimeout(() => tl.progress(1), 9000)
      if (seen) tl.timeScale(1.8)
      tl.to(q('.pre__meta > *'), { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out' }, 0)
        .to(q('.pre__outer, .pre__inner'), { drawSVG: '100%', duration: 1.1 }, 0.1)
        .to(q('.pre__link'), { drawSVG: '100%', duration: 0.8, stagger: 0.1 }, 0.7)
        .to(q('.pre__pod'), { drawSVG: '100%', duration: 0.8, stagger: 0.1 }, 0.8)
        .to(counter, {
            v: 100,
            duration: 1.8,
            ease: 'power2.inOut',
            onUpdate: () => {
              countEl.textContent = String(Math.round(counter.v)).padStart(3, '0')
            },
          }, 0)
        .to(q('.pre__outer, .pre__inner'), { opacity: 0, duration: 0.4 }, 1.8)
        .to(q('.pre__meta'), { opacity: 0, y: -10, duration: 0.4, ease: 'power2.in' }, 1.8)
        // diamond opens onto the hero while the mark scales through the viewfinder
        .to(q('.pre__mark'), { scale: 9, duration: 1.5, ease: 'power3.in' }, 1.95)
        .to(q('.pre__mark'), { opacity: 0, duration: 0.45, ease: 'power1.in' }, 2.75)
        .add(() => completeIntro(), 2.2)
        .to(diamond, { L: maxL, duration: 1.4, ease: 'power3.inOut', onUpdate: setClip }, 2.1)
    }, el)

    return () => {
      window.clearTimeout(failsafe)
      ctx.revert()
    }
  }, [])

  return (
    <div ref={root} className="pre" aria-hidden="true">
      <div className="pre__stage">
        <svg className="pre__mark" viewBox={MARK_VIEWBOX} fill="none">
          <path className="pre__outer" d={markPaths.outer} stroke="rgba(255,255,255,0.55)" strokeWidth="0.6" />
          <path className="pre__inner" d={markPaths.inner} stroke="rgba(255,255,255,0.55)" strokeWidth="0.6" />
          {markPaths.links.map((d, i) => (
            <path key={'l' + i} className="pre__link" d={d} stroke="#afc5e3" strokeWidth={MARK.w} />
          ))}
          {markPaths.pods.map((d, i) => (
            <path key={'p' + i} className="pre__pod" d={d} stroke="#ffffff" strokeWidth={MARK.w} />
          ))}
        </svg>
      </div>
      <div className="pre__meta">
        <span className="eyebrow">Apple Infotech</span>
        <span className="pre__count eyebrow">000</span>
        <span className="eyebrow">We Ensure Better ROI</span>
      </div>
    </div>
  )
}
