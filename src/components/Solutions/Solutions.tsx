import { useEffect, useRef } from 'react'
import { gsap } from '../../animations/registry'
import { solutions } from '../../data/content'
import { prefersReducedMotion } from '../../lib/env'
import { ARTS } from './SolutionsArt'
import './Solutions.css'

const pad = (n: number) => String(n).padStart(2, '0')

export function Solutions() {
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = root.current!
    if (prefersReducedMotion()) {
      el.classList.add('sol--static')
      return
    }
    const mm = gsap.matchMedia()

    /* ——— desktop / tablet landscape: pinned horizontal story ——— */
    mm.add('(min-width: 900px)', () => {
      const q = gsap.utils.selector(el)
      const pin = q('.sol__pin')[0]
      const track = q('.sol__track')[0] as HTMLElement
      const panels = q('.sol__panel') as HTMLElement[]
      const count = panels.length
      const dist = () => track.scrollWidth - window.innerWidth

      const scroller = gsap.to(track, {
        x: () => -dist(),
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: () => `+=${dist() * 1.15}`,
          pin,
          scrub: 0.9,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            const idx = Math.min(count - 1, Math.round(self.progress * (count - 1)))
            const cur = q('.sol__count-cur')[0]
            if (cur && cur.textContent !== pad(idx + 1)) cur.textContent = pad(idx + 1)
            q('.sol__nav-item').forEach((n, i) => n.classList.toggle('is-active', i === idx))
          },
        },
      })

      gsap.to(q('.sol__bar-fill'), {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top top', end: () => `+=${dist() * 1.15}`, scrub: true },
      })

      panels.forEach((panel, i) => {
        const word = panel.querySelector('.sol__word-fill') as HTMLElement
        const outline = panel.querySelector('.sol__word') as HTMLElement
        const cap = panel.querySelector('.sol__cap') as HTMLElement
        const art = panel.querySelector('.sol__art') as HTMLElement
        const draws = panel.querySelectorAll('.sol-draw')
        const containerAnimation = scroller

        // word is revealed (outline → solid) as it travels to centre
        gsap.fromTo(
          word,
          { clipPath: 'inset(0 100% 0 0)' },
          {
            clipPath: 'inset(0 0% 0 0)',
            ease: 'none',
            scrollTrigger: { trigger: panel, containerAnimation, start: i === 0 ? 'left 55%' : 'left 85%', end: 'left 8%', scrub: true },
          },
        )
        // word + art drift at different speeds against the track
        gsap.fromTo(
          outline,
          { xPercent: 9 },
          { xPercent: -9, ease: 'none', scrollTrigger: { trigger: panel, containerAnimation, start: 'left right', end: 'right left', scrub: true } },
        )
        gsap.fromTo(
          art,
          { xPercent: 14 },
          { xPercent: -14, ease: 'none', scrollTrigger: { trigger: panel, containerAnimation, start: 'left right', end: 'right left', scrub: true } },
        )
        gsap.from(cap.children, {
          y: 40,
          opacity: 0,
          duration: 1,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: panel, containerAnimation, start: i === 0 ? 'left 70%' : 'left 75%', toggleActions: 'play none none reverse' },
        })
        if (draws.length) {
          gsap.fromTo(
            draws,
            { drawSVG: '0%' },
            {
              drawSVG: '100%',
              duration: 2,
              stagger: 0.05,
              ease: 'power2.inOut',
              scrollTrigger: { trigger: panel, containerAnimation, start: 'left 85%', toggleActions: 'play none none none' },
            },
          )
        }
      })

      // header + progress chrome
      gsap.from(q('.sol__top > *, .sol__bottom'), {
        opacity: 0,
        y: 20,
        stagger: 0.08,
        duration: 1,
        scrollTrigger: { trigger: el, start: 'top 70%' },
      })
    })

    /* ——— mobile / portrait: vertical editorial stack ——— */
    mm.add('(max-width: 899px)', () => {
      const q = gsap.utils.selector(el)
      q('.sol__panel').forEach((panel) => {
        const word = panel.querySelector('.sol__word-fill')
        const cap = panel.querySelector('.sol__cap')
        const art = panel.querySelector('.sol__art')
        gsap.fromTo(
          word,
          { clipPath: 'inset(0 100% 0 0)' },
          { clipPath: 'inset(0 0% 0 0)', ease: 'none', scrollTrigger: { trigger: panel, start: 'top 80%', end: 'top 25%', scrub: true } },
        )
        gsap.from(cap!.children, { y: 30, opacity: 0, stagger: 0.1, duration: 1, scrollTrigger: { trigger: panel, start: 'top 70%' } })
        gsap.fromTo(art, { yPercent: 8 }, { yPercent: -8, ease: 'none', scrollTrigger: { trigger: panel, start: 'top bottom', end: 'bottom top', scrub: true } })
        const draws = panel.querySelectorAll('.sol-draw')
        if (draws.length)
          gsap.fromTo(draws, { drawSVG: '0%' }, { drawSVG: '100%', duration: 2, stagger: 0.05, ease: 'power2.inOut', scrollTrigger: { trigger: panel, start: 'top 80%' } })
      })
    })

    return () => mm.revert()
  }, [])

  return (
    <section ref={root} id="solutions" className="sol" data-section="solutions" data-label="Solutions">
      <div className="sol__pin">
        <header className="sol__top">
          <p className="eyebrow">
            <b>05</b>&nbsp;&nbsp;—&nbsp;&nbsp;{solutions.label}
          </p>
          <p className="eyebrow sol__count">
            <span className="sol__count-cur">01</span> / {pad(solutions.panels.length)}
          </p>
        </header>

        <div className="sol__track">
          {solutions.panels.map((p, i) => {
            const Art = ARTS[i]
            return (
              <article key={p.word} className="sol__panel" data-cursor="scroll">
                <div className="sol__art" aria-hidden="true">
                  <Art />
                </div>
                <h2 className="sol__word-wrap">
                  <span className="sol__word">{p.word}</span>
                  <span className="sol__word-fill" aria-hidden="true">
                    {p.word}
                  </span>
                </h2>
                <div className="sol__cap">
                  <span className="eyebrow">
                    <b>{pad(i + 1)}</b>&nbsp;&nbsp;—&nbsp;&nbsp;{p.kicker}
                  </span>
                  <p>{p.text}</p>
                </div>
              </article>
            )
          })}
        </div>

        <div className="sol__bottom" aria-hidden="true">
          <div className="sol__bar">
            <span className="sol__bar-fill" />
          </div>
          <ul className="sol__nav">
            {solutions.panels.map((p, i) => (
              <li key={p.word} className={`sol__nav-item eyebrow ${i === 0 ? 'is-active' : ''}`}>
                {p.word}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
