import { useEffect, useRef } from 'react'
import { gsap } from '../../animations/registry'
import { canvasDpr, prefersReducedMotion } from '../../lib/env'

/**
 * A procedural, monochrome "editorial photograph": a receding corridor of
 * lit server bays, drawn once to a canvas. It stands in for real imagery
 * (black & white, high contrast, ice-blue light) until client photography is
 * supplied — the surrounding treatment (chamfered mask, parallax, caption)
 * is the same one real photos will use.
 */
function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function paint(canvas: HTMLCanvasElement) {
  const dpr = canvasDpr(1.5)
  const r = canvas.getBoundingClientRect()
  const W = Math.max(2, Math.round(r.width * dpr))
  const H = Math.max(2, Math.round(r.height * dpr))
  canvas.width = W
  canvas.height = H
  const c = canvas.getContext('2d')!
  const rand = rng(11)

  c.fillStyle = '#020203'
  c.fillRect(0, 0, W, H)

  const vx = W * 0.5
  const vy = H * 0.45
  const N = 26
  const k = 0.87
  const base = { w: W * 1.2, h: H * 0.95 }
  const lw = Math.max(0.6, dpr * 0.8)

  const frame = (i: number) => {
    const s = Math.pow(k, i)
    return { l: vx - (base.w * s) / 2, r: vx + (base.w * s) / 2, t: vy - (base.h * s) / 2, b: vy + (base.h * s) / 2, s }
  }
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t

  // far light — the vanishing glow
  const glow = c.createRadialGradient(vx, vy, 0, vx, vy, W * 0.5)
  glow.addColorStop(0, 'rgba(255,255,255,1)')
  glow.addColorStop(0.05, 'rgba(215,230,252,0.8)')
  glow.addColorStop(0.2, 'rgba(140,170,215,0.28)')
  glow.addColorStop(1, 'rgba(0,0,0,0)')

  for (let i = N - 1; i >= 0; i--) {
    const a = frame(i)
    const b = frame(i + 1)
    const near = a.s // 1 → 0 with depth
    // wall bays
    for (const side of [-1, 1]) {
      const xa = side < 0 ? a.l : a.r
      const xb = side < 0 ? b.l : b.r
      const rows = 6
      for (let j = 0; j < rows; j++) {
        const f0 = j / rows
        const f1 = (j + 1) / rows
        const ya0 = lerp(a.t, a.b, f0)
        const ya1 = lerp(a.t, a.b, f1)
        const yb0 = lerp(b.t, b.b, f0)
        const yb1 = lerp(b.t, b.b, f1)
        c.beginPath()
        c.moveTo(xa, ya0 + 1)
        c.lineTo(xb, yb0 + 1)
        c.lineTo(xb, yb1 - 1)
        c.lineTo(xa, ya1 - 1)
        c.closePath()
        const g = c.createLinearGradient(xa, 0, xb, 0)
        g.addColorStop(0, `rgba(26,29,36,${0.95})`)
        g.addColorStop(1, `rgba(12,14,18,${0.95})`)
        c.fillStyle = g
        c.fill()
        c.strokeStyle = `rgba(210,222,240,${(0.1 + near * 0.18).toFixed(3)})`
        c.lineWidth = lw
        c.stroke()
        // status LEDs
        for (let n = 0; n < 3; n++) {
          if (rand() > 0.5) continue
          const t = 0.2 + n * 0.28
          const x = lerp(xa, xb, t)
          const y = lerp((ya0 + ya1) / 2, (yb0 + yb1) / 2, t)
          const hot = rand() > 0.62
          c.fillStyle = hot ? `rgba(225,238,255,${(0.7 + rand() * 0.3).toFixed(2)})` : `rgba(140,170,215,${(0.35 + rand() * 0.3).toFixed(2)})`
          c.beginPath()
          c.arc(x, y, Math.max(0.7, 2.4 * near * dpr), 0, 6.283)
          c.fill()
        }
      }
      // rib: bright frame edge
      c.strokeStyle = `rgba(235,242,255,${(0.16 + near * 0.35).toFixed(3)})`
      c.lineWidth = Math.max(lw, 1.4 * near * dpr)
      c.beginPath()
      c.moveTo(xa, a.t)
      c.lineTo(xa, a.b)
      c.stroke()
    }
    // floor sheen + ceiling
    c.fillStyle = `rgba(255,255,255,${(0.015 + near * 0.045).toFixed(3)})`
    c.beginPath()
    c.moveTo(a.l, a.b)
    c.lineTo(a.r, a.b)
    c.lineTo(b.r, b.b)
    c.lineTo(b.l, b.b)
    c.closePath()
    c.fill()
    // ceiling light bars (dashed rhythm)
    if (i % 2 === 0) {
      for (const side of [-1, 1]) {
        const xa = vx + side * (base.w * a.s * 0.16)
        const xb = vx + side * (base.w * b.s * 0.16)
        const m = 0.78
        c.strokeStyle = `rgba(235,244,255,${(0.35 + near * 0.6).toFixed(3)})`
        c.lineWidth = Math.max(1, 3.4 * near * dpr)
        c.lineCap = 'round'
        c.beginPath()
        c.moveTo(xa, a.t + 2)
        c.lineTo(lerp(xa, xb, m), lerp(a.t, b.t, m) + 2)
        c.stroke()
        // soft reflection on the floor
        c.strokeStyle = `rgba(200,220,250,${(0.05 + near * 0.18).toFixed(3)})`
        c.lineWidth = Math.max(1, 5 * near * dpr)
        c.beginPath()
        c.moveTo(xa, a.b - 2)
        c.lineTo(lerp(xa, xb, m), lerp(a.b, b.b, m) - 2)
        c.stroke()
      }
    }
  }

  c.globalCompositeOperation = 'screen'
  c.fillStyle = glow
  c.fillRect(0, 0, W, H)
  c.globalCompositeOperation = 'source-over'

  // vignette + bottom fall-off
  const vg = c.createRadialGradient(vx, H * 0.48, H * 0.18, vx, H * 0.5, H * 0.9)
  vg.addColorStop(0, 'rgba(0,0,0,0)')
  vg.addColorStop(1, 'rgba(0,0,0,0.72)')
  c.fillStyle = vg
  c.fillRect(0, 0, W, H)
  const bottom = c.createLinearGradient(0, H * 0.62, 0, H)
  bottom.addColorStop(0, 'rgba(2,2,3,0)')
  bottom.addColorStop(1, 'rgba(2,2,3,0.9)')
  c.fillStyle = bottom
  c.fillRect(0, 0, W, H)
}

export function CorridorImage({ className = '' }: { className?: string }) {
  const wrap = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = canvas.current!
    paint(cv)
    let t = 0
    const onResize = () => {
      clearTimeout(t)
      t = window.setTimeout(() => paint(cv), 200)
    }
    window.addEventListener('resize', onResize)

    let tween: gsap.core.Tween | undefined
    if (!prefersReducedMotion()) {
      tween = gsap.fromTo(
        cv,
        { scale: 1.28, yPercent: 6 },
        {
          scale: 1.02,
          yPercent: -4,
          ease: 'none',
          scrollTrigger: { trigger: wrap.current, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      )
    }
    return () => {
      window.removeEventListener('resize', onResize)
      clearTimeout(t)
      tween?.scrollTrigger?.kill()
      tween?.kill()
    }
  }, [])

  return (
    <div ref={wrap} className={`mono-image ${className}`}>
      <canvas ref={canvas} className="mono-image__canvas" />
      <div className="mono-image__tint" />
    </div>
  )
}
