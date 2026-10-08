import { useCallback, useEffect, useRef, useState } from 'react'
import { gsap } from '../../animations/registry'
import { services } from '../../data/content'
import { prefersReducedMotion, isCoarsePointer } from '../../lib/env'
import { SCENES } from './ServiceScenes'
import './Services.css'

const COLLAPSED = 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)'
const OPEN = 'polygon(50% -50%, 150% 50%, 50% 150%, -50% 50%)'

export function Services() {
  const root = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const layers = useRef<(HTMLDivElement | null)[]>([])
  const [active, setActive] = useState(0)
  const prev = useRef(0)
  const hoverTimer = useRef<number>(0)
  const userTouched = useRef(false)
  const inView = useRef(false)
  const paused = useRef(false)

  // stage transitions: diamond mask reveal + scale + blur-to-sharp
  useEffect(() => {
    const from = prev.current
    const to = active
    const el = root.current!
    const nextEl = layers.current[to]
    const prevEl = layers.current[from]
    const reduced = prefersReducedMotion()
    const q = gsap.utils.selector(el)

    // number roll + fig label
    gsap.to(q('.svc-stage__track'), { yPercent: -(100 / services.items.length) * to, duration: reduced ? 0 : 1, ease: 'power4.inOut' })
    gsap.fromTo(q('.svc-stage__fig-t'), { yPercent: 100 }, { yPercent: 0, duration: reduced ? 0 : 0.8, ease: 'power4.out' })

    if (from === to || !nextEl) return
    prev.current = to
    if (reduced) {
      gsap.set(layers.current, { opacity: 0, visibility: 'hidden' })
      gsap.set(nextEl, { opacity: 1, visibility: 'visible' })
      return
    }
    const tl = gsap.timeline()
    tl.set(nextEl, { visibility: 'visible', opacity: 1, zIndex: 2, clipPath: COLLAPSED, scale: 1.2, filter: 'blur(16px)' })
      .to(nextEl, { clipPath: OPEN, scale: 1, filter: 'blur(0px)', duration: 1.25, ease: 'power4.inOut' }, 0)
    if (prevEl) {
      tl.set(prevEl, { zIndex: 1 }, 0)
        .to(prevEl, { scale: 0.9, filter: 'blur(6px)', opacity: 0.0, duration: 1.1, ease: 'power3.inOut' }, 0.12)
        .set(prevEl, { visibility: 'hidden', clipPath: 'none', scale: 1, filter: 'none' })
    }
    tl.set(nextEl, { clipPath: 'none' })
    return () => {
      tl.progress(1)
    }
  }, [active])

  // intro + pointer-driven crosshair, parallax and coordinates
  useEffect(() => {
    const el = root.current!
    const st = stage.current!
    const reduced = prefersReducedMotion()
    layers.current.forEach((l, i) => l && gsap.set(l, { visibility: i === 0 ? 'visible' : 'hidden', opacity: i === 0 ? 1 : 0 }))
    if (reduced) return

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(el)
      gsap.from(q('.svc__row-wrap'), {
        opacity: 0,
        y: 40,
        duration: 1.1,
        stagger: 0.09,
        ease: 'power3.out',
        scrollTrigger: { trigger: q('.svc__list')[0], start: 'top 82%' },
      })
      gsap.from(q('.svc__rule'), {
        scaleX: 0,
        duration: 1.4,
        stagger: 0.09,
        ease: 'power3.inOut',
        scrollTrigger: { trigger: q('.svc__list')[0], start: 'top 82%' },
      })
      gsap.from(st, {
        clipPath: COLLAPSED,
        duration: 1.8,
        ease: 'power4.inOut',
        scrollTrigger: { trigger: st, start: 'top 80%' },
      })
      gsap.from(q('.svc__title-mask > span'), {
        yPercent: 110,
        duration: 1.3,
        stagger: 0.1,
        ease: 'power4.out',
        scrollTrigger: { trigger: q('.svc__title')[0], start: 'top 85%' },
      })
      gsap.from(q('.svc__head-r, .svc__head .eyebrow'), {
        opacity: 0,
        y: 20,
        duration: 1,
        stagger: 0.1,
        scrollTrigger: { trigger: q('.svc__head')[0], start: 'top 88%' },
      })
      // stage drifts slightly against the scroll
      gsap.fromTo(
        q('.svc-stage__inner'),
        { yPercent: 4 },
        { yPercent: -4, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } },
      )
    }, el)

    let cleanup = () => {}
    if (!isCoarsePointer()) {
      const cross = st.querySelector<HTMLElement>('.svc-stage__cross')!
      const coord = st.querySelector<HTMLElement>('.svc-stage__coord')!
      const stackX = gsap.quickTo(st.querySelector('.svc-stage__scenes'), 'x', { duration: 1, ease: 'power3.out' })
      const stackY = gsap.quickTo(st.querySelector('.svc-stage__scenes'), 'y', { duration: 1, ease: 'power3.out' })
      const move = (e: PointerEvent) => {
        const r = st.getBoundingClientRect()
        const nx = (e.clientX - r.left) / r.width
        const ny = (e.clientY - r.top) / r.height
        cross.style.setProperty('--cx', `${(nx * 100).toFixed(2)}%`)
        cross.style.setProperty('--cy', `${(ny * 100).toFixed(2)}%`)
        coord.textContent = `X ${nx.toFixed(3)}  Y ${ny.toFixed(3)}`
        stackX((nx - 0.5) * -14)
        stackY((ny - 0.5) * -14)
      }
      const enter = () => {
        cross.style.opacity = '1'
        paused.current = true
      }
      const leave = () => {
        cross.style.opacity = '0'
        paused.current = false
        stackX(0)
        stackY(0)
      }
      st.addEventListener('pointermove', move)
      st.addEventListener('pointerenter', enter)
      st.addEventListener('pointerleave', leave)
      cleanup = () => {
        st.removeEventListener('pointermove', move)
        st.removeEventListener('pointerenter', enter)
        st.removeEventListener('pointerleave', leave)
      }
    }
    return () => {
      ctx.revert()
      cleanup()
    }
  }, [])

  // gentle autoplay while in view and untouched
  useEffect(() => {
    if (prefersReducedMotion()) return
    const io = new IntersectionObserver(([e]) => (inView.current = e.isIntersecting), { threshold: 0.35 })
    io.observe(root.current!)
    const id = window.setInterval(() => {
      if (inView.current && !userTouched.current && !paused.current && !document.hidden) {
        setActive((a) => (a + 1) % services.items.length)
      }
    }, 5200)
    return () => {
      io.disconnect()
      clearInterval(id)
    }
  }, [])

  const choose = useCallback((i: number, intent = false) => {
    window.clearTimeout(hoverTimer.current)
    const go = () => {
      userTouched.current = true
      setActive(i)
    }
    if (intent) hoverTimer.current = window.setTimeout(go, 90)
    else go()
  }, [])

  return (
    <section ref={root} id="services" className="svc section" data-section="services" data-label="Services">
      <header className="svc__head">
        <p className="eyebrow">
          <b>04</b>&nbsp;&nbsp;—&nbsp;&nbsp;{services.label}
        </p>
        <span className="rule" />
        <p className="eyebrow svc__head-r">Five disciplines. One standard.</p>
      </header>

      <h2 className="svc__title" aria-label={services.title.join(' ')}>
        <span className="mask svc__title-mask">
          <span>{services.title[0]}</span>
        </span>
        <span className="mask svc__title-mask">
          <span>
            <em className="serif">{services.title[1]}</em>
          </span>
        </span>
      </h2>

      <div className="svc__body">
        <ul className="svc__list" onMouseLeave={() => window.clearTimeout(hoverTimer.current)}>
          {services.items.map((s, i) => (
            <li key={s.id} className={`svc__row-wrap ${active === i ? 'is-active' : ''}`}>
              <span className="svc__rule" />
              <span className="svc__line" aria-hidden="true" />
              <button
                className="svc__row"
                aria-expanded={active === i}
                onMouseEnter={() => choose(i, true)}
                onFocus={() => choose(i)}
                onClick={() => choose(i)}
              >
                <span className="svc__num">0{i + 1}</span>
                <span className="svc__t">{s.title}</span>
                <span className="svc__icon" aria-hidden="true">
                  <i />
                </span>
              </button>
              <div className="svc__panel">
                <div className="svc__panel-in">
                  <p>{s.text}</p>
                  <ul className="svc__tags">
                    {s.tags.map((t) => (
                      <li key={t} className="eyebrow">
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>
          ))}
          <li className="svc__rule svc__rule--end" aria-hidden="true" />
        </ul>

        <div ref={stage} className="svc-stage" aria-hidden="true" data-cursor="explore">
          <div className="svc-stage__inner">
            <div className="svc-stage__scenes">
              {SCENES.map((Scene, i) => (
                <div key={i} className="svc-layer" ref={(el) => { layers.current[i] = el }}>
                  <Scene active={active === i} />
                </div>
              ))}
            </div>
            <div className="svc-stage__cross" style={{ opacity: 0 }}>
              <i className="v" />
              <i className="h" />
            </div>
            <span className="svc-stage__corner tl" />
            <span className="svc-stage__corner tr" />
            <span className="svc-stage__corner bl" />
            <span className="svc-stage__corner br" />
            <div className="svc-stage__fig eyebrow">
              <span>Fig. 0{active + 1} —&nbsp;</span>
              <span className="svc-stage__fig-mask">
                <span className="svc-stage__fig-t">{services.items[active].fig}</span>
              </span>
            </div>
            <div className="svc-stage__coord eyebrow">X 0.500&nbsp; Y 0.500</div>
            <div className="svc-stage__num">
              <div className="svc-stage__track">
                {services.items.map((_, i) => (
                  <span key={i}>0{i + 1}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
