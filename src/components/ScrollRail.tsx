import { useEffect, useRef, useState } from 'react'
import { gsap } from '../animations/registry'
import { scrollToTarget } from '../animations/smoothScroll'
import { onIntroDone } from '../lib/intro'
import './ScrollRail.css'

interface Item {
  id: string
  label: string
}

/**
 * A quiet progress rail on the right edge: one diamond node per section on a
 * hairline — the logo's "nodes on a connection" idea, used as navigation.
 */
export function ScrollRail() {
  const [items, setItems] = useState<Item[]>([])
  const [active, setActive] = useState(0)
  const nav = useRef<HTMLElement>(null)

  useEffect(() => {
    const secs = Array.from(document.querySelectorAll<HTMLElement>('[data-section]'))
    setItems(secs.map((s) => ({ id: s.id, label: s.dataset.label ?? s.id })))
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(secs.indexOf(e.target as HTMLElement))
        })
      },
      { rootMargin: '-50% 0px -50% 0px' },
    )
    secs.forEach((s) => io.observe(s))
    // the footer belongs to the final section (Contact)
    const footer = document.querySelector<HTMLElement>('footer')
    const fio = new IntersectionObserver(([e]) => e.isIntersecting && setActive(secs.length - 1), { rootMargin: '-50% 0px -50% 0px' })
    if (footer) fio.observe(footer)
    const off = onIntroDone(() => {
      gsap.to(nav.current, { opacity: 1, x: 0, duration: 1.2, delay: 1.2, ease: 'power3.out', startAt: { x: 16 } })
    })
    return () => {
      io.disconnect()
      fio.disconnect()
      off()
    }
  }, [])

  const pct = items.length > 1 ? (active / (items.length - 1)) * 100 : 0

  return (
    <nav ref={nav} className="rail" aria-label="Sections" style={{ opacity: 0 }}>
      <span className="rail__line" />
      <span className="rail__fill" style={{ height: `${pct}%` }} />
      <ul>
        {items.map((it, i) => (
          <li key={it.id} className={i === active ? 'is-active' : i < active ? 'is-past' : ''}>
            <button onClick={() => scrollToTarget(it.id === 'top' ? 0 : `#${it.id}`)} aria-label={it.label} data-cursor="hover">
              <span className="rail__label">
                <em>0{i + 1}</em> {it.label}
              </span>
              <i className="rail__dia" />
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
