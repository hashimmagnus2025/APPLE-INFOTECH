import { useEffect, useRef } from 'react'
import { gsap } from '../../animations/registry'
import { markPaths, MARK, MARK_VIEWBOX, ring, diamondPath } from '../../lib/logoGeometry'
import { roi } from '../../data/content'
import { prefersReducedMotion } from '../../lib/env'
import { setChromeTheme } from '../../lib/theme'
import './ROISection.css'

/** station order → pod index (0 right, 1 bottom, 2 left, 3 top): clockwise from the left node */
const ORDER = [2, 3, 0, 1]
const CHIP_POS = ['left', 'top', 'right', 'bottom'] as const

export function ROISection() {
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = root.current!
    const reduced = prefersReducedMotion()
    if (reduced) {
      el.classList.add('roi--static')
      setChromeTheme('light')
      return
    }

    const mm = gsap.matchMedia()
    mm.add('(min-width: 1px)', () => {
      const q = gsap.utils.selector(el)
      const all = <T extends Element = HTMLElement>(sel: string) => Array.from(el.querySelectorAll<T>(sel))
      const pin = q('.roi__pin')[0]
      const bg = q('.roi__bg')[0] as HTMLElement
      const word = q('.roi__word')[0] as HTMLElement
      const ringEl = q('.roi__ring')[0] as HTMLElement
      const pods = all<SVGPathElement>('.roi__pod')
      const links = all<SVGPathElement>('.roi__link')
      const halos = all<SVGGElement>('.roi__halo')
      const chips = q('.roi__chip-in')
      const caps = q('.roi__cap')
      const steps = q('.roi__step')
      const dot = el.querySelector<SVGCircleElement>('.roi__signal')!
      const trail = el.querySelector<SVGPathElement>('.roi__trail')!
      const sweep = q('.roi__sweep')[0]
      const pulses = q('.roi__pulse')

      // ——— initial states ———
      const exitEl = q('.roi__exit')[0] as HTMLElement
      const exitD = { L: 0 }
      const setExit = () => {
        const w = window.innerWidth
        const h = window.innerHeight
        const L = exitD.L
        exitEl.style.clipPath = `polygon(${w / 2}px ${h / 2 - L}px, ${w / 2 + L}px ${h / 2}px, ${w / 2}px ${h / 2 + L}px, ${w / 2 - L}px ${h / 2}px)`
      }
      setExit()
      const diamond = { L: 0 }
      const setClip = () => {
        const w = window.innerWidth
        const h = window.innerHeight
        const L = diamond.L
        bg.style.clipPath = `polygon(${w / 2}px ${h / 2 - L}px, ${w / 2 + L}px ${h / 2}px, ${w / 2}px ${h / 2 + L}px, ${w / 2 - L}px ${h / 2}px)`
      }
      setClip()
      const maxL = () => window.innerWidth / 2 + window.innerHeight / 2 + 60

      // pods begin displaced outward along their vertex directions
      const dirs = [0, 1, 2, 3].map((i) => {
        const c = ring.at(ring.cornerAt(i))
        const l = Math.hypot(c.x, c.y)
        return { x: c.x / l, y: c.y / l }
      })
      pods.forEach((p, i) => gsap.set(p, { x: dirs[i].x * 90, y: dirs[i].y * 90, opacity: 0, rotation: i % 2 ? 40 : -40, transformOrigin: '0px 0px' }))
      gsap.set(links, { drawSVG: '50% 50%', opacity: 1 })
      gsap.set(word, { xPercent: -50, yPercent: -50 })
      gsap.set(halos, { scale: 0, opacity: 0, transformOrigin: '50% 50%', svgOrigin: undefined })
      gsap.set(chips, { opacity: 0, y: 10 })
      gsap.set(caps, { opacity: 0, yPercent: 40 })
      gsap.set(q('.roi__left > *'), { opacity: 0, y: 24 })
      gsap.set(q('.roi__intro-label, .roi__intro-foot'), { opacity: 0, y: 16 })
      gsap.set(dot, { opacity: 0 })
      gsap.set(trail, { opacity: 0 })
      gsap.set(sweep, { scaleX: 0 })
      gsap.set(q('.roi__arrow'), { opacity: 0, scale: 0.4 })
      gsap.set(pulses, { scale: 0.3, opacity: 0, transformOrigin: '50% 50%' })
      gsap.set(ringEl, { opacity: 1 })
      gsap.set(q('.roi__ring-line'), { drawSVG: '0%' })
      steps.forEach((s) => s.classList.remove('is-active'))

      // reveal on entry (before the pin engages)
      gsap.from(word, {
        yPercent: 60,
        opacity: 0,
        duration: 1.6,
        ease: 'power4.out',
        scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play none none reverse' },
      })

      // layout-based (transform-independent): the word is centred in the pin; the ring is anchored by its centre
      const wordPlace = () => {
        const pw = pin.offsetWidth
        const ph = pin.offsetHeight
        const rc = { x: ringEl.offsetLeft, y: ringEl.offsetTop }
        const target = ringEl.offsetWidth * 0.37
        return { x: rc.x - pw / 2, y: rc.y - ph / 2, scale: target / word.offsetWidth }
      }

      const setSignal = (s: number) => {
        const p = ring.at(s)
        dot.setAttribute('cx', String(p.x))
        dot.setAttribute('cy', String(p.y))
      }

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: '+=580%',
          pin,
          scrub: 0.7,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            setChromeTheme(self.progress > 0.07 && self.progress < 0.93 ? 'light' : 'dark')
          },
          onLeave: () => setChromeTheme('dark'),
          onLeaveBack: () => setChromeTheme('dark'),
        },
      })

      // A — diamond opens, intro furniture
      tl.to(diamond, { L: maxL, duration: 1.5, ease: 'power2.inOut', onUpdate: setClip }, 0)
        .to(q('.roi__intro-label, .roi__intro-foot'), { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' }, 0.9)

      // B — the word shrinks into the void while the ring assembles
      tl.to(
        word,
        {
          x: () => wordPlace().x,
          y: () => wordPlace().y,
          scale: () => wordPlace().scale,
          duration: 2.2,
          ease: 'power3.inOut',
        },
        2.3,
      )
        .to(q('.roi__intro-label, .roi__intro-foot'), { opacity: 0, y: -16, duration: 0.5, stagger: 0.05 }, 2.2)
        .to(q('.roi__ring-line'), { drawSVG: '100%', duration: 1.6, stagger: 0.2, ease: 'power2.inOut' }, 2.4)
        .to(pods, { x: 0, y: 0, opacity: 1, rotation: 0, duration: 1.8, stagger: 0.14, ease: 'power3.out' }, 2.7)
        .to(links, { drawSVG: '0% 100%', duration: 1.2, stagger: 0.1, ease: 'power2.out' }, 3.7)
        .to(q('.roi__left > *'), { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out' }, 4.3)

      // C — four stations
      const T0 = 5.2
      const D = 1.0
      ORDER.forEach((podIdx, i) => {
        const t = T0 + i * D
        const chip = chips[i]
        const cap = caps[i]
        const step = steps[i]
        tl.add(() => steps.forEach((s, k) => s.classList.toggle('is-active', k === i)), t)
          .to(halos[podIdx], { scale: 1, opacity: 1, duration: 0.35, ease: 'power3.out' }, t)
          .to(chip, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }, t)
          .to(cap, { opacity: 1, yPercent: 0, duration: 0.4, ease: 'power3.out' }, t + 0.05)
        if (i > 0) {
          tl.to(caps[i - 1], { opacity: 0, yPercent: -40, duration: 0.3, ease: 'power2.in' }, t - 0.1)
        }
        // signal travelling to the next node
        const s0 = ring.cornerAt(podIdx)
        const s1 = ring.cornerAt(podIdx + 1)
        const sig = { s: s0 }
        tl.set(dot, { opacity: 1 }, t + 0.1)
          .to(
            sig,
            {
              s: s1,
              duration: D * 0.82,
              ease: 'power2.inOut',
              onUpdate: () => {
                setSignal(sig.s)
                trail.setAttribute('d', ring.pathD(Math.max(s0, sig.s - 14), sig.s, 0))
              },
            },
            t + 0.12,
          )
          .set(trail, { opacity: 1 }, t + 0.12)
        void step
      })

      // D — ROI: the loop closes
      const tF = T0 + 4 * D
      tl.to(caps[3], { opacity: 0, yPercent: -40, duration: 0.3, ease: 'power2.in' }, tF)
        .add(() => steps.forEach((s, k) => s.classList.toggle('is-active', k === 4)), tF)
        .to(trail, { opacity: 0, duration: 0.3 }, tF)
        .to(dot, { opacity: 0, duration: 0.3 }, tF)
        .to(halos, { scale: 1.25, opacity: 0.35, duration: 0.6, ease: 'power2.out' }, tF)
        .to(caps[4], { opacity: 1, yPercent: 0, duration: 0.6, ease: 'power3.out' }, tF + 0.1)
        .to(sweep, { scaleX: 1, duration: 0.9, ease: 'power3.inOut' }, tF + 0.1)
        .to(q('.roi__arrow'), { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(2)' }, tF + 0.5)
        .to(pulses, { scale: 1.9, opacity: 0, duration: 1.8, stagger: 0.28, ease: 'power2.out', startAt: { opacity: 0.55, scale: 0.4 } }, tF + 0.2)
        .to(chips, { opacity: 1, y: 0, duration: 0.4, stagger: 0.05 }, tF + 0.2)
        .to({}, { duration: 1.1 }, tF + 1) // hold
        // exit: a black diamond opens from the centre and takes the page back to dark
        .to(exitD, { L: maxL, duration: 1.5, ease: 'power2.inOut', onUpdate: setExit }, tF + 2.1)

      return () => {
        setChromeTheme('dark')
      }
    })

    return () => mm.revert()
  }, [])

  const echo = diamondPath(52, 0.32)
  const echo2 = diamondPath(60, 0.32)

  return (
    <section ref={root} id="roi" className="roi" data-section="roi" data-label="ROI" data-theme="light">
      <div className="roi__pin">
        <div className="roi__bg" aria-hidden="true" />
        <div className="roi__exit" aria-hidden="true" />

        {/* giant word: blends with `difference` so it reads white on black and black on white through the diamond edge */}
        <div className="roi__word" aria-hidden="true">
          <span>ROI</span>
          <i className="roi__sweep" />
          <b className="roi__arrow">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M5 19L19 5M8 5h11v11" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </b>
        </div>
        <h2 className="sr-only">We ensure better ROI — technology, efficiency, business and growth, measured in return.</h2>

        <div className="roi__intro-label eyebrow">
          <b>●</b>&nbsp;&nbsp;{roi.intro[0]} {roi.intro[1]}
        </div>
        <div className="roi__intro-foot eyebrow">Technology → Efficiency → Business → Growth → ROI</div>

        <div className="roi__stage">
          <div className="roi__left">
            <p className="eyebrow roi__eyebrow">03&nbsp;&nbsp;—&nbsp;&nbsp;{roi.label}</p>
            <p className="roi__title">
              We ensure
              <br />
              better <em className="serif">ROI.</em>
            </p>
            <ol className="roi__steps">
              {roi.steps.map((s, i) => (
                <li key={s.key} className="roi__step">
                  <span className="eyebrow">0{i + 1}</span>
                  <span className="roi__step-t">{s.title}</span>
                </li>
              ))}
              <li className="roi__step">
                <span className="eyebrow">05</span>
                <span className="roi__step-t">{roi.result.title}</span>
              </li>
            </ol>
          </div>

          <div className="roi__ring" aria-hidden="true">
            <svg viewBox={MARK_VIEWBOX} className="roi__svg" fill="none" overflow="visible">
              <path className="roi__ring-line" d={markPaths.outer} stroke="rgba(5,5,5,0.5)" strokeWidth="0.35" vectorEffect="non-scaling-stroke" />
              <path className="roi__ring-line" d={markPaths.inner} stroke="rgba(5,5,5,0.5)" strokeWidth="0.35" vectorEffect="non-scaling-stroke" />
              <path className="roi__echo" d={echo} stroke="rgba(5,5,5,0.12)" strokeWidth="0.3" vectorEffect="non-scaling-stroke" />
              <path className="roi__echo" d={echo2} stroke="rgba(5,5,5,0.07)" strokeWidth="0.3" vectorEffect="non-scaling-stroke" />
              {[0, 1].map((i) => (
                <path key={i} className="roi__pulse" d={markPaths.inner} stroke="#a9c1e2" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
              ))}
              {markPaths.links.map((d, i) => (
                <path key={'l' + i} className="roi__link" d={d} stroke="#a9c1e2" strokeWidth={MARK.w} />
              ))}
              {markPaths.pods.map((d, i) => (
                <path key={'p' + i} className="roi__pod" d={d} stroke="#050505" strokeWidth={MARK.w} />
              ))}
              {[0, 1, 2, 3].map((i) => {
                const c = ring.at(ring.cornerAt(i))
                return (
                  <g key={'h' + i} className="roi__halo" style={{ transformOrigin: `${c.x}px ${c.y}px` }}>
                    <circle cx={c.x} cy={c.y} r="14" stroke="#050505" strokeWidth="0.4" vectorEffect="non-scaling-stroke" />
                    <circle cx={c.x} cy={c.y} r="1.6" fill="#a9c1e2" />
                  </g>
                )
              })}
              <path className="roi__trail" d="M0 0" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
              <circle className="roi__signal" r="2.6" cx="0" cy="0" fill="#fff" stroke="#050505" strokeWidth="0.8" />
            </svg>

            {CHIP_POS.map((pos, i) => (
              <div key={roi.steps[i].key} className={`roi__chip roi__chip--${pos}`}>
                <div className="roi__chip-in">
                  <span className="eyebrow">0{i + 1}</span>
                  <span className="roi__chip-t">{roi.steps[i].title}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="roi__caps">
            {roi.steps.map((s) => (
              <div key={s.key} className="roi__cap">
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            ))}
            <div className="roi__cap">
              <h3>{roi.result.title}</h3>
              <p>{roi.result.text}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
