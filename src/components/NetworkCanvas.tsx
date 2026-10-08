import { useEffect, useRef } from 'react'
import { gsap } from '../animations/registry'
import { pointer, startPointer, stepPointer } from '../lib/pointer'
import { canvasDpr, isMobileViewport, prefersReducedMotion } from '../lib/env'
import { onIntroDone } from '../lib/intro'

/**
 * Ambient network: hair-thin links between slow-drifting nodes, with the odd
 * node blooming and a signal travelling along a link. Deliberately sparse and
 * low-opacity — it should read as business + connectivity, never as crypto.
 * One fixed canvas serves every dark section; light sections simply cover it.
 */
interface Node {
  x: number
  y: number
  vx: number
  vy: number
  z: number
  ph: number
}

export function NetworkCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    const reduced = prefersReducedMotion()
    startPointer()

    let W = 0
    let H = 0
    let dpr = 1
    let nodes: Node[] = []
    let linkDist = 150
    const signals: { a: number; b: number; t: number; dur: number }[] = []
    const blooms: { i: number; t: number }[] = []

    const build = () => {
      dpr = canvasDpr(1.5)
      W = window.innerWidth
      H = window.innerHeight
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      const mobile = isMobileViewport()
      const count = mobile ? 34 : Math.round(Math.min(96, Math.max(44, (W * H) / 21000)))
      linkDist = mobile ? 112 : Math.min(190, Math.max(140, W / 9))
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.16,
        z: 0.35 + Math.random() * 0.65,
        ph: Math.random() * 6.28,
      }))
    }
    build()
    let rt = 0
    const onResize = () => {
      clearTimeout(rt)
      rt = window.setTimeout(build, 160)
    }
    window.addEventListener('resize', onResize)

    let t = 0
    let nextEvent = 0.6
    const draw = (dt: number) => {
      t += dt
      stepPointer(0.05)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      const sy = window.scrollY
      const mx = pointer.px
      const my = pointer.py
      const px = pointer.x
      const py = pointer.y

      // spawn occasional signals/blooms
      if (!reduced && t > nextEvent) {
        nextEvent = t + 0.5 + Math.random() * 1.2
        const a = (Math.random() * nodes.length) | 0
        let best = -1
        let bd = linkDist
        for (let j = 0; j < nodes.length; j++) {
          if (j === a) continue
          const d = Math.hypot(nodes[a].x - nodes[j].x, nodes[a].y - nodes[j].y)
          if (d < bd && Math.random() > 0.5) {
            bd = d
            best = j
          }
        }
        if (best >= 0 && signals.length < 6) signals.push({ a, b: best, t: 0, dur: 0.9 + Math.random() * 0.8 })
        if (blooms.length < 4) blooms.push({ i: (Math.random() * nodes.length) | 0, t: 0 })
      }

      const pos = nodes.map((n) => {
        n.x += n.vx * dt * 60
        n.y += n.vy * dt * 60
        if (n.x < -40) n.x = W + 40
        if (n.x > W + 40) n.x = -40
        if (n.y < -40) n.y = H + 40
        if (n.y > H + 40) n.y = -40
        // parallax by depth: pointer + scroll
        let x = n.x - px * 26 * n.z
        let y = n.y - py * 18 * n.z - ((sy * 0.07 * n.z) % (H + 80))
        y = ((y % (H + 80)) + (H + 80)) % (H + 80) - 40
        // gentle repulsion from pointer
        const dx = x - mx
        const dy = y - my
        const d2 = dx * dx + dy * dy
        if (d2 < 140 * 140 && d2 > 1) {
          const d = Math.sqrt(d2)
          const f = (1 - d / 140) * 14
          x += (dx / d) * f
          y += (dy / d) * f
        }
        return [x, y] as const
      })

      ctx.lineWidth = 1
      for (let i = 0; i < nodes.length; i++) {
        const [x1, y1] = pos[i]
        for (let j = i + 1; j < nodes.length; j++) {
          const [x2, y2] = pos[j]
          const dx = x1 - x2
          if (dx > linkDist || dx < -linkDist) continue
          const dy = y1 - y2
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d > linkDist) continue
          const k = 1 - d / linkDist
          const a = k * k * 0.3 * Math.min(nodes[i].z, nodes[j].z)
          ctx.strokeStyle = `rgba(190,208,235,${a.toFixed(3)})`
          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.lineTo(x2, y2)
          ctx.stroke()
        }
        // pointer link
        const pd = Math.hypot(x1 - mx, y1 - my)
        if (pd < 190) {
          ctx.strokeStyle = `rgba(215,228,248,${((1 - pd / 190) * 0.4).toFixed(3)})`
          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.lineTo(mx, my)
          ctx.stroke()
        }
      }

      // nodes
      for (let i = 0; i < nodes.length; i++) {
        const [x, y] = pos[i]
        const n = nodes[i]
        const tw = 0.55 + 0.45 * Math.sin(t * 0.8 + n.ph)
        ctx.fillStyle = `rgba(220,232,250,${(0.22 + 0.4 * tw * n.z).toFixed(3)})`
        ctx.beginPath()
        ctx.arc(x, y, 0.9 + n.z * 0.9, 0, 6.283)
        ctx.fill()
      }

      // blooms
      for (let k = blooms.length - 1; k >= 0; k--) {
        const b = blooms[k]
        b.t += dt
        const u = b.t / 2.2
        if (u >= 1) {
          blooms.splice(k, 1)
          continue
        }
        const [x, y] = pos[b.i]
        ctx.strokeStyle = `rgba(175,197,227,${((1 - u) * 0.55).toFixed(3)})`
        ctx.beginPath()
        ctx.arc(x, y, 3 + u * 22, 0, 6.283)
        ctx.stroke()
        ctx.fillStyle = `rgba(255,255,255,${(1 - u).toFixed(3)})`
        ctx.beginPath()
        ctx.arc(x, y, 2.2, 0, 6.283)
        ctx.fill()
      }

      // signals
      for (let k = signals.length - 1; k >= 0; k--) {
        const s = signals[k]
        s.t += dt
        const u = s.t / s.dur
        if (u >= 1) {
          signals.splice(k, 1)
          continue
        }
        const [ax, ay] = pos[s.a]
        const [bx, by] = pos[s.b]
        const e = u * u * (3 - 2 * u)
        const x = ax + (bx - ax) * e
        const y = ay + (by - ay) * e
        const tx = ax + (bx - ax) * Math.max(0, e - 0.16)
        const ty = ay + (by - ay) * Math.max(0, e - 0.16)
        const g = ctx.createLinearGradient(tx, ty, x, y)
        g.addColorStop(0, 'rgba(175,197,227,0)')
        g.addColorStop(1, 'rgba(235,243,255,0.95)')
        ctx.strokeStyle = g
        ctx.lineWidth = 1.4
        ctx.beginPath()
        ctx.moveTo(tx, ty)
        ctx.lineTo(x, y)
        ctx.stroke()
        ctx.lineWidth = 1
      }
    }

    let last = performance.now()
    const tick = () => {
      const now = performance.now()
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (document.hidden) return
      if (canvas.style.opacity === '0') return
      // a light section is covering the page — nothing to see, skip the work
      if (document.documentElement.dataset.chrome === 'light') return
      draw(dt)
    }

    if (reduced) {
      draw(0)
      gsap.set(canvas, { opacity: 0.5 })
    } else {
      gsap.ticker.add(tick)
    }

    // fade in after preloader
    const off = onIntroDone(() => gsap.to(canvas, { opacity: 1, duration: 2.4, ease: 'power2.out', delay: 0.4 }))

    return () => {
      off()
      gsap.ticker.remove(tick)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <div className="network-wrap" aria-hidden="true">
      <canvas ref={ref} className="network" style={{ opacity: 0 }} />
    </div>
  )
}
