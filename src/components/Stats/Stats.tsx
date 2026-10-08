import { useEffect, useRef } from 'react'
import { gsap } from '../../animations/registry'
import { stats, stats_meta } from '../../data/content'
import { prefersReducedMotion } from '../../lib/env'
import './Stats.css'

/**
 * Giant statistics. Placeholders (value: null) display as [XX] and "scramble"
 * through digits before resolving; real numbers count up.
 */
export function Stats() {
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = root.current!
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(el)
      gsap.from(q('.stats__title .mask > span'), {
        yPercent: 110,
        duration: 1.3,
        stagger: 0.1,
        ease: 'power4.out',
        scrollTrigger: { trigger: q('.stats__title')[0], start: 'top 85%' },
      })
      gsap.from(q('.stats__head > *'), {
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 1,
        scrollTrigger: { trigger: q('.stats__head')[0], start: 'top 90%' },
      })

      q('.stat').forEach((row, i) => {
        const num = row.querySelector<HTMLElement>('.stat__num')!
        const fill = row.querySelector<HTMLElement>('.stat__num-fill')!
        const val = row.querySelector<HTMLElement>('.stat__val')!
        const fillVal = row.querySelector<HTMLElement>('.stat__val-fill')!
        const target = stats[i].value
        const rule = row.querySelector('.stat__rule')
        const meta = row.querySelectorAll('.stat__label, .stat__note')
        const br = row.querySelectorAll('.stat__br')

        gsap.from(rule, { scaleX: 0, transformOrigin: 'left center', duration: 1.6, ease: 'power3.inOut', scrollTrigger: { trigger: row, start: 'top 85%' } })
        gsap.from(meta, { y: 24, opacity: 0, duration: 1, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: row, start: 'top 80%' } })
        gsap.from(br, { opacity: 0, x: (k) => (k === 0 ? 20 : -20), duration: 1, ease: 'power3.out', scrollTrigger: { trigger: row, start: 'top 80%' } })

        // outline → solid fill as the number crosses the viewport
        gsap.fromTo(
          fill,
          { clipPath: 'inset(100% 0 0 0)' },
          { clipPath: 'inset(0% 0 0 0)', ease: 'none', scrollTrigger: { trigger: row, start: 'top 80%', end: 'top 32%', scrub: 0.5 } },
        )

        const play = () => {
          if (target === null) {
            const targets = [val, fillVal]
            targets.forEach((t) =>
              gsap.to(t, { duration: 1.6, ease: 'none', scrambleText: { text: 'XX', chars: '0123456789', speed: 0.5, revealDelay: 0.35, rightToLeft: false } }),
            )
          } else {
            const c = { v: 0 }
            gsap.to(c, {
              v: target,
              duration: 2.2,
              ease: 'power3.out',
              onUpdate: () => {
                const txt = String(Math.round(c.v))
                val.textContent = txt
                fillVal.textContent = txt
              },
            })
          }
        }
        // start from digits so the effect reads as "measuring"
        val.textContent = '00'
        fillVal.textContent = '00'
        gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 72%', once: true } }).add(play)
        void num
      })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} id="proof" className="stats section" data-section="proof" data-label="Proof">
      <header className="stats__head">
        <p className="eyebrow">
          <b>06</b>&nbsp;&nbsp;—&nbsp;&nbsp;{stats_meta.label}
        </p>
        <span className="rule" />
        <p className="eyebrow stats__note-top">Placeholder data</p>
      </header>

      <h2 className="stats__title" aria-label={stats_meta.title.join(' ')}>
        <span className="mask">
          <span>{stats_meta.title[0]}</span>
        </span>
        <span className="mask">
          <span>
            <em className="serif">{stats_meta.title[1]}</em>
          </span>
        </span>
      </h2>

      <ul className="stats__list">
        {stats.map((s, i) => (
          <li key={s.label} className="stat" data-cursor="hover">
            <span className="stat__rule" />
            <span className="stat__index eyebrow">0{i + 1}</span>
            <div className="stat__num" aria-label={s.value === null ? `${s.label}: figure to be supplied` : `${s.value}${s.suffix}`}>
              <span className="stat__br" aria-hidden="true">
                {s.value === null ? '[' : ''}
              </span>
              <span className="stat__val">{s.value === null ? 'XX' : s.value}</span>
              <span className="stat__br" aria-hidden="true">
                {s.value === null ? ']' : ''}
              </span>
              <span className="stat__suffix">{s.suffix}</span>
              <span className="stat__num-fill" aria-hidden="true">
                <span className="stat__br">{s.value === null ? '[' : ''}</span>
                <span className="stat__val-fill">{s.value === null ? 'XX' : s.value}</span>
                <span className="stat__br">{s.value === null ? ']' : ''}</span>
                <span className="stat__suffix">{s.suffix}</span>
              </span>
            </div>
            <div className="stat__meta">
              <span className="stat__label">{s.label}</span>
              <span className="stat__note eyebrow">
                <i />
                {s.note}
              </span>
            </div>
          </li>
        ))}
        <li className="stat__rule stat__rule--end" aria-hidden="true" />
      </ul>
    </section>
  )
}
