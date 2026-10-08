import { Ring, MARK } from '../../lib/logoGeometry'
import { pointer } from '../../lib/pointer'
import { canvasDpr } from '../../lib/env'

/**
 * The closing geometry: rings of the logo's diamond expand outward from the
 * centre like a signal, tied together by hair-thin struts through their
 * vertices — the same visual DNA as the hero, now released and travelling.
 */
export function createCTAGeometry(canvas: HTMLCanvasElement, opts: { mobile: boolean; reduced: boolean }) {
  const ctx = canvas.getContext('2d')!
  const ring = new Ring(MARK)
  const N = opts.mobile ? 8 : 12
  const SAMPLES = opts.mobile ? 56 : 88
  const base = ring.sample(SAMPLES)
  let W = 0
  let H = 0
  let dpr = 1
  let visible = true
  let t = opts.reduced ? 6 : 0
  const state = { progress: 0, alpha: opts.reduced ? 1 : 0 }

  const resize = () => {
    dpr = canvasDpr(1.5)
    const r = canvas.getBoundingClientRect()
    W = r.width
    H = r.height
    canvas.width = Math.round(W * dpr)
    canvas.height = Math.round(H * dpr)
  }
  resize()
  const ro = new ResizeObserver(() => {
    resize()
    if (opts.reduced) draw()
  })
  ro.observe(canvas)
  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0 })
  io.observe(canvas)

  const draw = () => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, W, H)
    if (state.alpha < 0.01) return
    const cx = W * 0.5 + pointer.x * -22
    const cy = H * 0.5 + pointer.y * -14
    const unit = Math.max(W, H) / 58 // MARK units → px at scale 1
    const rings: { sc: number; a: number; rot: number }[] = []
    for (let i = 0; i < N; i++) {
      const u = (t * 0.045 + i / N) % 1
      const sc = 0.12 + Math.pow(u, 1.55) * 2.9 * (0.75 + state.progress * 0.5)
      const a = Math.sin(Math.PI * Math.min(1, u * 1.04)) * 0.72 * state.alpha
      const rot = (i % 2 ? 1 : -1) * t * 0.035 + i * 0.12
      rings.push({ sc, a, rot })
    }
    rings.sort((a, b) => a.sc - b.sc)

    const cs = Math.cos
    const sn = Math.sin
    ctx.lineJoin = 'round'
    // rings
    for (const r of rings) {
      ctx.beginPath()
      for (let k = 0; k <= SAMPLES; k++) {
        const p = base[k]
        const x = (p.x * cs(r.rot) - p.y * sn(r.rot)) * r.sc * unit
        const y = (p.x * sn(r.rot) + p.y * cs(r.rot)) * r.sc * unit
        if (k === 0) ctx.moveTo(cx + x, cy + y)
        else ctx.lineTo(cx + x, cy + y)
      }
      ctx.closePath()
      ctx.strokeStyle = `rgba(205,222,247,${r.a.toFixed(3)})`
      ctx.lineWidth = 1
      ctx.stroke()
    }

    // struts through the vertices of successive rings + nodes
    const vert = (r: { sc: number; rot: number }, i: number) => {
      const v = ring.at(ring.cornerAt(i))
      const x = (v.x * cs(r.rot) - v.y * sn(r.rot)) * r.sc * unit
      const y = (v.x * sn(r.rot) + v.y * cs(r.rot)) * r.sc * unit
      return [cx + x, cy + y]
    }
    for (let i = 0; i < 4; i++) {
      ctx.beginPath()
      for (let k = 0; k < rings.length; k++) {
        const [x, y] = vert(rings[k], i)
        if (k === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = `rgba(175,197,227,${(0.2 * state.alpha).toFixed(3)})`
      ctx.lineWidth = 1
      ctx.stroke()
    }
    for (const r of rings) {
      for (let i = 0; i < 4; i++) {
        const [x, y] = vert(r, i)
        ctx.fillStyle = `rgba(240,246,255,${(r.a * 1.6).toFixed(3)})`
        ctx.beginPath()
        ctx.arc(x, y, 1.6, 0, 6.283)
        ctx.fill()
      }
    }
    // core
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 120)
    g.addColorStop(0, `rgba(175,197,227,${(0.22 * state.alpha).toFixed(3)})`)
    g.addColorStop(1, 'rgba(175,197,227,0)')
    ctx.fillStyle = g
    ctx.fillRect(cx - 120, cy - 120, 240, 240)
  }

  let last = performance.now()
  const frame = () => {
    const now = performance.now()
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    if (!visible || document.hidden) return
    t += dt
    draw()
  }
  return {
    state,
    frame,
    renderOnce: draw,
    destroy() {
      ro.disconnect()
      io.disconnect()
    },
  }
}
