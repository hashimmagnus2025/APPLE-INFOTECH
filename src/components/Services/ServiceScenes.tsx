import { useEffect, useRef } from 'react'
import { gsap } from '../../animations/registry'
import { ring, diamondPath } from '../../lib/logoGeometry'

/**
 * Five bespoke technical figures, one per service. Pure SVG, driven by CSS
 * keyframes (cheap) except the transformation scene, which morphs 64 nodes
 * between chaos, a grid, and the logo ring with GSAP.
 * Every figure is paused while it is not the active one.
 */

interface SceneProps {
  active: boolean
}

/** round the corners of a closed polygon with quadratic curves */
function roundedPoly(pts: [number, number][], r: number) {
  const n = pts.length
  let d = ''
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i + n - 1) % n]
    const p1 = pts[i]
    const p2 = pts[(i + 1) % n]
    const v1 = [p0[0] - p1[0], p0[1] - p1[1]]
    const v2 = [p2[0] - p1[0], p2[1] - p1[1]]
    const l1 = Math.hypot(v1[0], v1[1])
    const l2 = Math.hypot(v2[0], v2[1])
    const a = [p1[0] + (v1[0] / l1) * r, p1[1] + (v1[1] / l1) * r]
    const b = [p1[0] + (v2[0] / l2) * r, p1[1] + (v2[1] / l2) * r]
    d += `${i === 0 ? 'M' : 'L'}${a[0].toFixed(1)} ${a[1].toFixed(1)} Q${p1[0]} ${p1[1]} ${b[0].toFixed(1)} ${b[1].toFixed(1)} `
  }
  return d + 'Z'
}
const plate = (cx: number, cy: number, w: number, h: number, r = 16) =>
  roundedPoly(
    [
      [cx, cy - h / 2],
      [cx + w / 2, cy],
      [cx, cy + h / 2],
      [cx - w / 2, cy],
    ],
    r,
  )

/* ———————————————— 01 · Technology — layered stack ———————————————— */
export function SceneStack({ active }: SceneProps) {
  const plates = [
    { y: 150, w: 330, h: 170, label: 'APPLICATION' },
    { y: 245, w: 330, h: 170, label: 'PLATFORM' },
    { y: 340, w: 330, h: 170, label: 'DATA' },
    { y: 435, w: 330, h: 170, label: 'INFRASTRUCTURE' },
  ]
  return (
    <svg className={`scene scene-stack ${active ? 'is-active' : ''}`} viewBox="0 0 600 600" fill="none">
      <defs>
        <linearGradient id="stackFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.14" />
          <stop offset="1" stopColor="#afc5e3" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {/* vertical struts at the four vertices */}
      {[-165, 0, 165].map((dx, i) => (
        <line key={i} className="stack-strut" x1={300 + dx} y1={i === 1 ? 70 : 150} x2={300 + dx} y2={i === 1 ? 520 : 435} stroke="rgba(175,197,227,0.35)" strokeWidth="1" strokeDasharray="2 12" />
      ))}
      <line className="stack-beam" x1="300" y1="60" x2="300" y2="530" stroke="rgba(175,197,227,0.55)" strokeWidth="1" />
      {plates.map((p, i) => (
        <g key={p.label} className="stack-plate" style={{ animationDelay: `${i * -1.1}s` }}>
          <path d={plate(300, p.y, p.w, p.h)} fill="url(#stackFill)" stroke={i === 0 ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.38)'} strokeWidth="1" />
          {/* isometric grid lines inside */}
          {[-0.5, 0, 0.5].map((f) => (
            <g key={f} stroke="rgba(255,255,255,0.1)" strokeWidth="1">
              <line x1={300 + (f * p.w) / 2 - p.w * 0.25} y1={p.y - p.h * 0.25 - f * p.h * 0.25 + 0} x2={300 + (f * p.w) / 2 + p.w * 0.25} y2={p.y + p.h * 0.25 - f * p.h * 0.25} />
            </g>
          ))}
          {i === 0 && <circle cx="300" cy={p.y} r="5" fill="#fff" />}
          {i === 1 && [-70, 0, 70].map((dx) => <circle key={dx} cx={300 + dx} cy={p.y + (dx === 0 ? 0 : dx > 0 ? -dx * 0.5 : dx * 0.5)} r="3" fill="#afc5e3" />)}
          {i === 2 && [-40, 40].map((dx) => <rect key={dx} x={300 + dx - 9} y={p.y - 9} width="18" height="18" transform={`rotate(45 ${300 + dx} ${p.y})`} stroke="#afc5e3" strokeWidth="1" />)}
          <text x={300 + p.w / 2 + 14} y={p.y + 4} className="scene-tag">
            {`0${i + 1}  ${p.label}`}
          </text>
        </g>
      ))}
      <circle className="stack-pulse" cx="300" cy="60" r="3" fill="#fff" />
    </svg>
  )
}

/* ———————————————— 02 · Transformation — chaos → grid → ring ———————————————— */
const DOTS = 64
export function SceneTransform({ active }: SceneProps) {
  const root = useRef<SVGSVGElement>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  useEffect(() => {
    const svg = root.current!
    const dots = Array.from(svg.querySelectorAll<SVGCircleElement>('.tf-dot'))
    const lines = Array.from(svg.querySelectorAll<SVGLineElement>('.tf-line'))
    const ringS = ring.total
    const rand = (a: number, b: number) => a + Math.random() * (b - a)
    const chaos = () => dots.map(() => ({ x: rand(50, 550), y: rand(50, 550) }))
    const grid = dots.map((_, i) => ({ x: 300 + ((i % 8) - 3.5) * 50, y: 300 + (Math.floor(i / 8) - 3.5) * 50 }))
    const ringPts = dots.map((_, i) => {
      const p = ring.at((i / DOTS) * ringS, 0, 0, 5.2)
      return { x: 300 + p.x, y: 300 + p.y }
    })
    const cur = chaos()
    // line topology per mode
    const gridLinks: [number, number][] = []
    dots.forEach((_, i) => {
      if (i % 8 < 7) gridLinks.push([i, i + 1])
      if (i < 56) gridLinks.push([i, i + 8])
    })
    const ringLinks: [number, number][] = dots.map((_, i) => [i, (i + 1) % DOTS])
    const mode = { grid: 0, ring: 0 }

    const render = () => {
      dots.forEach((d, i) => {
        d.setAttribute('cx', cur[i].x.toFixed(1))
        d.setAttribute('cy', cur[i].y.toFixed(1))
      })
      let li = 0
      const setLine = (a: number, b: number, o: number) => {
        const l = lines[li++]
        if (!l) return
        l.setAttribute('x1', cur[a].x.toFixed(1))
        l.setAttribute('y1', cur[a].y.toFixed(1))
        l.setAttribute('x2', cur[b].x.toFixed(1))
        l.setAttribute('y2', cur[b].y.toFixed(1))
        l.style.opacity = String(o)
      }
      gridLinks.forEach(([a, b]) => setLine(a, b, mode.grid * 0.34))
      ringLinks.forEach(([a, b]) => setLine(a, b, mode.ring * 0.7))
      while (li < lines.length) lines[li++].style.opacity = '0'
    }
    render()

    const tl = gsap.timeline({ repeat: -1, paused: true, onUpdate: render })
    const morph = (target: { x: number; y: number }[], at: number) =>
      cur.forEach((c, i) => {
        tl.to(c, { x: target[i].x, y: target[i].y, duration: 1.7, ease: 'power3.inOut' }, at + ((i % 8) + Math.floor(i / 8)) * 0.035)
      })
    morph(grid, 0.2) // chaos → grid
    tl.to(mode, { grid: 1, duration: 0.8, ease: 'power2.out' }, 2.0)
      .to(mode, { grid: 0, duration: 0.5, ease: 'power2.in' }, 4.2)
    morph(ringPts, 4.4) // grid → the logo ring
    tl.to(mode, { ring: 1, duration: 0.8, ease: 'power2.out' }, 6.3)
      .to(mode, { ring: 0, duration: 0.5, ease: 'power2.in' }, 8.4)
    morph(chaos(), 8.6) // ring → chaos, ready to begin again
    tl.to({}, { duration: 0.5 }, 10.9)
    tlRef.current = tl
    return () => {
      tl.kill()
    }
  }, [])

  useEffect(() => {
    if (active) tlRef.current?.play()
    else tlRef.current?.pause()
  }, [active])

  return (
    <svg ref={root} className={`scene scene-tf ${active ? 'is-active' : ''}`} viewBox="0 0 600 600" fill="none">
      {Array.from({ length: 112 + 8 }, (_, i) => (
        <line key={i} className="tf-line" x1="0" y1="0" x2="0" y2="0" stroke="#afc5e3" strokeWidth="1" />
      ))}
      {Array.from({ length: DOTS }, (_, i) => (
        <circle key={i} className="tf-dot" r={i % 9 === 0 ? 3.4 : 2.4} fill={i % 9 === 0 ? '#fff' : 'rgba(225,235,250,0.85)'} cx="300" cy="300" />
      ))}
    </svg>
  )
}

/* ———————————————— 03 · Business — compounding return ———————————————— */
export function SceneGrowth({ active }: SceneProps) {
  const root = useRef<SVGSVGElement>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const N = 9
  const bars = Array.from({ length: N }, (_, i) => {
    const t = i / (N - 1)
    const h = 40 + Math.pow(t, 1.9) * 330
    const x = 78 + i * 52
    return { x, h, y: 500 - h }
  })
  const curve = bars.map((b, i) => `${i === 0 ? 'M' : 'L'}${b.x + 14} ${b.y - 18}`).join(' ')

  useEffect(() => {
    const svg = root.current!
    const q = gsap.utils.selector(svg)
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.6, paused: true })
    const barEls = Array.from(svg.querySelectorAll<SVGRectElement>('.gr-bar'))
    barEls.forEach((el, i) => {
      tl.fromTo(el, { attr: { y: 500, height: 0 } }, { attr: { y: bars[i].y, height: bars[i].h }, duration: 1, ease: 'power3.out' }, i * 0.11)
    })
    tl.fromTo(q('.gr-mark'), { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, transformOrigin: '50% 50%', duration: 0.4, ease: 'back.out(3)', stagger: 0.11 }, 0.5)
      .fromTo(q('.gr-curve'), { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.4, ease: 'power2.inOut' }, 0.7)
      .fromTo(q('.gr-end'), { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, transformOrigin: '50% 50%', duration: 0.5, ease: 'back.out(3)' }, 2)
      .fromTo(q('.gr-label'), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.6 }, 2.1)
      .to({}, { duration: 1.8 })
      .to(q('.gr-bar, .gr-mark, .gr-curve, .gr-end, .gr-label'), { opacity: 0, duration: 0.5 })
    tlRef.current = tl
    return () => {
      tl.kill()
    }
  }, [])
  useEffect(() => {
    if (active) tlRef.current?.play()
    else tlRef.current?.pause()
  }, [active])

  return (
    <svg ref={root} className={`scene scene-growth ${active ? 'is-active' : ''}`} viewBox="0 0 600 600" fill="none">
      <defs>
        <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.2" />
          <stop offset="1" stopColor="#afc5e3" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {[140, 220, 300, 380, 460].map((y) => (
        <line key={y} x1="50" y1={y} x2="550" y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      ))}
      <line x1="50" y1="500" x2="550" y2="500" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
      <line x1="50" y1={bars[0].y - 18} x2="550" y2={bars[0].y - 18} stroke="rgba(175,197,227,0.45)" strokeWidth="1" strokeDasharray="3 7" />
      <text x="552" y={bars[0].y - 24} textAnchor="end" className="scene-tag">INVESTMENT</text>
      {bars.map((b, i) => (
        <g key={i}>
          <rect className="gr-bar" x={b.x} y={b.y} width="28" height={b.h} fill="url(#barFill)" stroke="rgba(255,255,255,0.42)" strokeWidth="1" />
          <rect className="gr-mark" x={b.x + 14 - 4.5} y={b.y - 18 - 4.5} width="9" height="9" transform={`rotate(45 ${b.x + 14} ${b.y - 18})`} fill="#050505" stroke="#fff" strokeWidth="1" />
        </g>
      ))}
      <path className="gr-curve" d={curve} stroke="#afc5e3" strokeWidth="2" strokeLinejoin="round" />
      <circle className="gr-end" cx={bars[N - 1].x + 14} cy={bars[N - 1].y - 18} r="7" fill="#fff" />
      <circle className="gr-end" cx={bars[N - 1].x + 14} cy={bars[N - 1].y - 18} r="16" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
      <text className="gr-label scene-tag scene-tag--lg" x={bars[N - 1].x - 6} y={bars[N - 1].y - 48} textAnchor="end">
        ROI ↗
      </text>
    </svg>
  )
}

/* ———————————————— 04 · IT Services — continuous watch (radar) ———————————————— */
export function SceneRadar({ active }: SceneProps) {
  const ticks = Array.from({ length: 96 }, (_, i) => {
    const a = (i / 96) * Math.PI * 2
    const long = i % 8 === 0
    const r0 = 244
    const r1 = long ? 270 : 256
    return { x1: 300 + Math.cos(a) * r0, y1: 300 + Math.sin(a) * r0, x2: 300 + Math.cos(a) * r1, y2: 300 + Math.sin(a) * r1, long }
  })
  const blips = [
    { x: 380, y: 170, d: 0.8 },
    { x: 190, y: 235, d: 3.2 },
    { x: 410, y: 385, d: 5.4 },
    { x: 250, y: 440, d: 6.9 },
    { x: 455, y: 262, d: 1.9 },
  ]
  return (
    <svg className={`scene scene-radar ${active ? 'is-active' : ''}`} viewBox="0 0 600 600" fill="none">
      <defs>
        <linearGradient id="sweepGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#afc5e3" stopOpacity="0" />
          <stop offset="1" stopColor="#dce8fa" stopOpacity="0.55" />
        </linearGradient>
      </defs>
      {[60, 120, 180, 240].map((r, i) => (
        <circle key={r} cx="300" cy="300" r={r} stroke={`rgba(255,255,255,${0.1 + i * 0.03})`} strokeWidth="1" strokeDasharray={i === 1 ? '2 8' : undefined} />
      ))}
      {ticks.map((t, i) => (
        <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={t.long ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.25)'} strokeWidth="1" />
      ))}
      <line x1="300" y1="40" x2="300" y2="560" stroke="rgba(255,255,255,0.1)" />
      <line x1="40" y1="300" x2="560" y2="300" stroke="rgba(255,255,255,0.1)" />
      <g className="radar-sweep">
        <path d="M300 300 L300 58 A242 242 0 0 1 468 126 Z" fill="url(#sweepGrad)" transform="rotate(-8 300 300)" />
        <line x1="300" y1="300" x2="300" y2="56" stroke="#fff" strokeWidth="1.5" />
      </g>
      {blips.map((b, i) => (
        <g key={i} className="radar-blip" style={{ animationDelay: `${b.d}s` }}>
          <circle cx={b.x} cy={b.y} r="4" fill="#fff" />
          <circle cx={b.x} cy={b.y} r="12" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
        </g>
      ))}
      <path d={diamondPath(24, 0.3)} transform="translate(300 300)" stroke="#fff" strokeWidth="1.2" fill="#050505" />
      <circle cx="300" cy="300" r="3" fill="#afc5e3" />
      <text x="300" y="590" textAnchor="middle" className="scene-tag">ALL SYSTEMS NOMINAL</text>
    </svg>
  )
}

/* ———————————————— 05 · Enterprise — connected network ———————————————— */
export function SceneNetwork({ active }: SceneProps) {
  const orbits = [
    { r: 100, n: 4, dur: 26, dir: 1, size: 5 },
    { r: 170, n: 6, dur: 40, dir: -1, size: 4 },
    { r: 238, n: 9, dur: 62, dir: 1, size: 3.4 },
  ]
  return (
    <svg className={`scene scene-network ${active ? 'is-active' : ''}`} viewBox="0 0 600 600" fill="none">
      {orbits.map((o, oi) => (
        <g key={oi} className="net-orbit" style={{ animationDuration: `${o.dur}s`, animationDirection: o.dir > 0 ? 'normal' : 'reverse' }}>
          <circle cx="300" cy="300" r={o.r} stroke="rgba(255,255,255,0.18)" strokeWidth="1" strokeDasharray={oi === 1 ? '3 9' : undefined} />
          {Array.from({ length: o.n }, (_, i) => {
            const a = (i / o.n) * Math.PI * 2 + oi * 0.5
            const x = 300 + Math.cos(a) * o.r
            const y = 300 + Math.sin(a) * o.r
            return (
              <g key={i}>
                <line x1="300" y1="300" x2={x} y2={y} stroke="rgba(175,197,227,0.16)" strokeWidth="1" />
                <circle cx={x} cy={y} r={o.size} fill={i % 3 === 0 ? '#fff' : '#afc5e3'} />
                {i % 3 === 0 && <circle cx={x} cy={y} r={o.size + 7} stroke="rgba(255,255,255,0.3)" strokeWidth="1" />}
              </g>
            )
          })}
        </g>
      ))}
      <g className="net-core">
        <path d={diamondPath(44, 0.32)} transform="translate(300 300)" fill="#050505" stroke="#fff" strokeWidth="1.2" />
        <path d={diamondPath(26, 0.32)} transform="translate(300 300)" stroke="#afc5e3" strokeWidth="1" />
        <circle cx="300" cy="300" r="4" fill="#fff" />
      </g>
    </svg>
  )
}

export const SCENES = [SceneStack, SceneTransform, SceneGrowth, SceneRadar, SceneNetwork]
