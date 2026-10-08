import { Ring, MARK } from '../../lib/logoGeometry'
import { pointer } from '../../lib/pointer'
import { canvasDpr } from '../../lib/env'

/**
 * HERO LATTICE
 * A custom, projected-3D composition built from the logo's own geometry:
 *  - the brand ring itself, extruded, with solid node pods and glass links
 *  - a tunnel of echo rings receding behind it, tied to it by hair-thin struts
 *  - two small rings inside the void and a glowing core (the "ROI point")
 *  - orbiting nodes and a travelling pulse of light around the ring
 * It is not a spinning object: it breathes, tilts with the pointer and reacts to scroll.
 */

export interface LatticeState {
  /** 0..1 pods fly in and the ring assembles */
  assemble: number
  /** per-ring reveal 0..1 (index matches `echoes`) */
  ringIn: number[]
  /** 0..1 as the hero scrolls away */
  scroll: number
  /** overall opacity */
  alpha: number
  /** pulse around ring on/off intensity */
  pulse: number
}

interface Echo {
  sc: number
  z: number
  a: number
  spd: number
  ph: number
  nodes: boolean
}

const TAU = Math.PI * 2

function makeGlow(): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')!
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  grd.addColorStop(0, 'rgba(205,223,248,1)')
  grd.addColorStop(0.18, 'rgba(175,197,227,0.55)')
  grd.addColorStop(0.5, 'rgba(120,150,195,0.12)')
  grd.addColorStop(1, 'rgba(120,150,195,0)')
  g.fillStyle = grd
  g.fillRect(0, 0, 128, 128)
  return c
}

export function createLattice(canvas: HTMLCanvasElement, opts: { reduced: boolean }) {
  const ctx = canvas.getContext('2d', { alpha: true })!
  const glow = makeGlow()
  const ring = new Ring(MARK)
  const mobileInit = window.innerWidth < 720

  const echoes: Echo[] = [
    { sc: 0.3, z: -70, a: 0.95, spd: 0.34, ph: 0, nodes: true },
    { sc: 0.6, z: -34, a: 0.8, spd: -0.21, ph: 1, nodes: true },
    { sc: 1.36, z: 62, a: 0.55, spd: 0.11, ph: 2, nodes: true },
    { sc: 1.82, z: 135, a: 0.4, spd: -0.08, ph: 3, nodes: true },
    { sc: 2.4, z: 235, a: 0.27, spd: 0.055, ph: 4, nodes: mobileInit ? false : true },
    { sc: 3.2, z: 370, a: 0.16, spd: -0.04, ph: 5, nodes: false },
  ].slice(0, mobileInit ? 5 : 6)

  const state: LatticeState = {
    assemble: opts.reduced ? 1 : 0,
    ringIn: echoes.map(() => (opts.reduced ? 1 : 0)),
    scroll: 0,
    alpha: opts.reduced ? 1 : 0,
    pulse: opts.reduced ? 0 : 0,
  }

  // ——— precomputed geometry (MARK units, centred at origin) ———
  const SAMPLES = 96
  const base = ring.sample(SAMPLES) // closed loop
  const hw = MARK.w / 2
  const podCount = 14
  const mk = (s0: number, s1: number) => {
    const outer: [number, number][] = []
    const inner: [number, number][] = []
    for (let i = 0; i <= podCount; i++) {
      const s = s0 + ((s1 - s0) * i) / podCount
      const o = ring.at(s, hw)
      const n = ring.at(s, -hw)
      outer.push([o.x, o.y])
      inner.push([n.x, n.y])
    }
    return { outer, inner }
  }
  const pods = ring.pods.map(([a, b]) => mk(a, b))
  const links = ring.links.map(([a, b]) => mk(a, b))
  const linkCentres = ring.links.map(([a, b]) => {
    const m = ring.at((a + b) / 2)
    return [m.x, m.y] as [number, number]
  })
  const podDirs = [0, 1, 2, 3].map((i) => {
    const c = ring.at(ring.cornerAt(i))
    const l = Math.hypot(c.x, c.y)
    return [c.x / l, c.y / l] as [number, number]
  })
  const vertexS = [0, 1, 2, 3].map((i) => ring.cornerAt(i))

  // orbit particles
  const particleCount = mobileInit ? 14 : 30
  const parts = Array.from({ length: particleCount }, (_, i) => ({
    e: i % echoes.length,
    s: Math.random() * ring.total,
    v: (6 + Math.random() * 12) * (Math.random() > 0.5 ? 1 : -1),
    r: 0.9 + Math.random() * 1.6,
    a: 0.35 + Math.random() * 0.6,
  }))

  // ——— sizing ———
  let W = 0
  let H = 0
  let dpr = 1
  let cx0 = 0
  let cy0 = 0
  let S = 1
  const F = 520

  function resize() {
    dpr = canvasDpr(1.6)
    const r = canvas.getBoundingClientRect()
    W = r.width
    H = r.height
    canvas.width = Math.round(W * dpr)
    canvas.height = Math.round(H * dpr)
    const narrow = W < 720
    if (narrow) {
      cx0 = W * 0.5
      cy0 = Math.min(H * 0.27, 250)
      S = Math.min(W * 0.3, H * 0.15) / 48
    } else if (W < 1100) {
      cx0 = W * 0.7
      cy0 = H * 0.46
      S = Math.min(W * 0.2, H * 0.3) / 48
    } else {
      cx0 = W * 0.745
      cy0 = H * 0.47
      S = Math.min(W * 0.172, H * 0.3) / 48
    }
  }
  resize()
  const ro = new ResizeObserver(() => {
    resize()
    if (opts.reduced) render(t) // a resized canvas is cleared — repaint the static frame
  })
  ro.observe(canvas)

  // ——— projection ———
  let yaw = 0
  let pitch = 0
  let zOff = 0
  let sy = 0
  let cyw = 1
  let sx = 0
  let cxp = 1
  const o: [number, number, number] = [0, 0, 1]
  function proj(x: number, y: number, z: number) {
    const x1 = x * cyw + z * sy
    const z1 = -x * sy + z * cyw
    const y2 = y * cxp - z1 * sx
    const z2 = y * sx + z1 * cxp + zOff
    const p = F / (F + z2)
    o[0] = cx0 + x1 * p * S
    o[1] = cy0 + y2 * p * S
    o[2] = p
    return o
  }

  const rot2 = (x: number, y: number, a: number): [number, number] => {
    const c = Math.cos(a)
    const s = Math.sin(a)
    return [x * c - y * s, x * s + y * c]
  }

  // ——— drawing ———
  function strokeEcho(e: Echo, i: number, t: number) {
    const rin = state.ringIn[i]
    if (rin <= 0.001) return
    const ang = t * e.spd + e.ph
    const reveal = rin
    ctx.beginPath()
    for (let k = 0; k <= SAMPLES; k++) {
      const p = base[k]
      const [rx, ry] = rot2(p.x * e.sc * (0.82 + 0.18 * reveal), p.y * e.sc * (0.82 + 0.18 * reveal), ang)
      const q = proj(rx, ry, e.z)
      if (k === 0) ctx.moveTo(q[0] * dpr, q[1] * dpr)
      else ctx.lineTo(q[0] * dpr, q[1] * dpr)
    }
    ctx.closePath()
    const near = Math.min(1, Math.max(0.25, o[2]))
    ctx.strokeStyle = `rgba(214,226,244,${(e.a * reveal * near * state.alpha).toFixed(3)})`
    ctx.lineWidth = Math.max(0.6, 1.05 * dpr * (0.6 + near * 0.5))
    ctx.stroke()
  }

  function ringVertex(e: Echo, vi: number, t: number): [number, number, number] {
    const ang = t * e.spd + e.ph
    const v = ring.at(vertexS[vi], 0, 0, e.sc)
    const [rx, ry] = rot2(v.x, v.y, ang)
    return [rx, ry, e.z]
  }

  function drawGlow(x: number, y: number, r: number, a: number) {
    ctx.globalAlpha = Math.max(0, Math.min(1, a))
    ctx.drawImage(glow, x - r, y - r, r * 2, r * 2)
    ctx.globalAlpha = 1
  }

  function render(t: number) {
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (state.alpha <= 0.003) return

    const sc = state.scroll
    yaw = pointer.x * 0.3 + Math.sin(t * 0.21) * 0.07 + sc * 0.55
    pitch = -pointer.y * 0.2 + Math.sin(t * 0.17 + 1) * 0.045 + sc * 0.12
    zOff = sc * 160
    sy = Math.sin(yaw)
    cyw = Math.cos(yaw)
    sx = Math.sin(pitch)
    cxp = Math.cos(pitch)

    const A = state.alpha * (1 - sc * 0.75)
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'

    // 1 — echo rings far→near (behind main ring)
    const behind = echoes.map((e, i) => ({ e, i })).filter(({ e }) => e.z > 0).sort((a, b) => b.e.z - a.e.z)
    const saved = state.alpha
    state.alpha = A
    for (const { e, i } of behind) strokeEcho(e, i, t)

    // 2 — struts joining vertices from the main ring outward through the echo rings
    ctx.lineWidth = Math.max(0.6, dpr * 0.8)
    for (let vi = 0; vi < 4; vi++) {
      let prev: [number, number, number] = [ring.at(vertexS[vi]).x, ring.at(vertexS[vi]).y, 0]
      for (let i = 0; i < echoes.length; i++) {
        const e = echoes[i]
        if (e.z <= 0 || state.ringIn[i] < 0.01) continue
        const v = ringVertex(e, vi, t)
        const a = proj(prev[0], prev[1], prev[2])
        const ax = a[0]
        const ay = a[1]
        const b = proj(v[0], v[1], v[2])
        const grad = ctx.createLinearGradient(ax * dpr, ay * dpr, b[0] * dpr, b[1] * dpr)
        const al = (0.32 * state.ringIn[i] * A).toFixed(3)
        grad.addColorStop(0, `rgba(175,197,227,${al})`)
        grad.addColorStop(1, `rgba(175,197,227,0)`)
        ctx.strokeStyle = grad
        ctx.beginPath()
        ctx.moveTo(ax * dpr, ay * dpr)
        ctx.lineTo(b[0] * dpr, b[1] * dpr)
        ctx.stroke()
        prev = v
      }
    }

    // 3 — main ring: glass links + extruded node pods
    drawMainRing(t, A)

    // 4 — inner rings (in front, inside the void)
    for (let i = 0; i < echoes.length; i++) if (echoes[i].z <= 0) strokeEcho(echoes[i], i, t)
    state.alpha = saved

    // 5 — vertex nodes + particles + core (additive light)
    ctx.globalCompositeOperation = 'lighter'
    for (let i = 0; i < echoes.length; i++) {
      const e = echoes[i]
      if (!e.nodes || state.ringIn[i] < 0.05) continue
      for (let vi = 0; vi < 4; vi++) {
        const v = ringVertex(e, vi, t)
        const q = proj(v[0], v[1], v[2])
        const a = e.a * state.ringIn[i] * A
        drawGlow(q[0] * dpr, q[1] * dpr, 9 * q[2] * dpr * (0.6 + e.a), a * 0.85)
        ctx.fillStyle = `rgba(235,242,252,${Math.min(1, a * 1.2).toFixed(3)})`
        ctx.beginPath()
        ctx.arc(q[0] * dpr, q[1] * dpr, Math.max(0.9, 1.7 * q[2] * dpr), 0, TAU)
        ctx.fill()
      }
    }

    for (const p of parts) {
      const e = echoes[p.e]
      const rin = state.ringIn[p.e]
      if (rin < 0.1) continue
      p.s += p.v * 0.016
      const ang = t * e.spd + e.ph
      const pt = ring.at(p.s, 0, 0, e.sc)
      const [rx, ry] = rot2(pt.x, pt.y, ang)
      const q = proj(rx, ry, e.z)
      const tail = ring.at(p.s - Math.sign(p.v) * 5, 0, 0, e.sc)
      const [tx, ty] = rot2(tail.x, tail.y, ang)
      const q2 = proj(tx, ty, e.z)
      const al = p.a * rin * A
      ctx.strokeStyle = `rgba(190,210,240,${(al * 0.5).toFixed(3)})`
      ctx.lineWidth = Math.max(0.6, 1.1 * dpr)
      ctx.beginPath()
      ctx.moveTo(q2[0] * dpr, q2[1] * dpr)
      ctx.lineTo(q[0] * dpr, q[1] * dpr)
      ctx.stroke()
      ctx.fillStyle = `rgba(240,246,255,${al.toFixed(3)})`
      ctx.beginPath()
      ctx.arc(q[0] * dpr, q[1] * dpr, Math.max(0.8, p.r * q[2] * dpr), 0, TAU)
      ctx.fill()
    }

    // core — the "ROI point" at the heart of the void
    {
      const c = proj(0, 0, -20)
      const breathe = 0.5 + 0.5 * Math.sin(t * 1.4)
      const k = state.ringIn[0]
      drawGlow(c[0] * dpr, c[1] * dpr, (46 + breathe * 14) * c[2] * dpr * (S / 6), 0.55 * k * A)
      ctx.fillStyle = `rgba(255,255,255,${(0.95 * k * A).toFixed(3)})`
      ctx.beginPath()
      ctx.arc(c[0] * dpr, c[1] * dpr, 2.4 * dpr * c[2], 0, TAU)
      ctx.fill()
    }
    ctx.globalCompositeOperation = 'source-over'
  }

  function polygon(pts: [number, number][], z: number, scaleAbout?: { c: [number, number]; k: number }) {
    for (let i = 0; i < pts.length; i++) {
      let [x, y] = pts[i]
      if (scaleAbout) {
        x = scaleAbout.c[0] + (x - scaleAbout.c[0]) * scaleAbout.k
        y = scaleAbout.c[1] + (y - scaleAbout.c[1]) * scaleAbout.k
      }
      const q = proj(x, y, z)
      if (i === 0) ctx.moveTo(q[0] * dpr, q[1] * dpr)
      else ctx.lineTo(q[0] * dpr, q[1] * dpr)
    }
  }

  const layerZ = mobileInit ? [5, 2.5, 0, -2.5, -5] : [6, 4, 2, 0, -2, -4, -6]

  function drawMainRing(t: number, A: number) {
    const asm = state.assemble
    const ease = 1 - Math.pow(1 - asm, 3)
    ctx.globalAlpha = Math.min(1, asm * 1.4) * A

    // links — glass bars
    for (let k = 0; k < 4; k++) {
      const ls = Math.min(1, Math.max(0, (asm - 0.35) / 0.65))
      if (ls <= 0.001) continue
      const k2 = 1 - Math.pow(1 - ls, 3)
      for (const z of [layerZ[0], layerZ[layerZ.length - 1]]) {
        const l = links[k]
        ctx.beginPath()
        polygon(l.outer, z, { c: linkCentres[k], k: k2 })
        for (let i = l.inner.length - 1; i >= 0; i--) {
          const [x, y] = l.inner[i]
          const kx = linkCentres[k][0] + (x - linkCentres[k][0]) * k2
          const ky = linkCentres[k][1] + (y - linkCentres[k][1]) * k2
          const q = proj(kx, ky, z)
          ctx.lineTo(q[0] * dpr, q[1] * dpr)
        }
        ctx.closePath()
        if (z === layerZ[0]) {
          ctx.fillStyle = 'rgba(110,138,182,0.28)'
          ctx.fill()
          ctx.strokeStyle = 'rgba(175,197,227,0.35)'
          ctx.lineWidth = Math.max(0.6, 0.8 * dpr)
          ctx.stroke()
        } else {
          const og = ring.at((ring.links[k][0] + ring.links[k][1]) / 2, hw)
          const ig = ring.at((ring.links[k][0] + ring.links[k][1]) / 2, -hw)
          const po = proj(og.x, og.y, z)
          const ax = po[0]
          const ay = po[1]
          const pi = proj(ig.x, ig.y, z)
          const g = ctx.createLinearGradient(ax * dpr, ay * dpr, pi[0] * dpr, pi[1] * dpr)
          g.addColorStop(0, 'rgba(190,212,244,0.72)')
          g.addColorStop(1, 'rgba(115,150,208,0.34)')
          ctx.fillStyle = g
          ctx.fill()
          ctx.strokeStyle = 'rgba(220,234,252,0.95)'
          ctx.lineWidth = Math.max(0.8, 1.1 * dpr)
          ctx.stroke()
        }
      }
    }

    // pods — extruded solids
    for (let li = 0; li < layerZ.length; li++) {
      const z = layerZ[li]
      const shade = li / (layerZ.length - 1) // 0 back → 1 front
      const c = Math.round(58 + shade * shade * 197)
      const cb = Math.round(70 + shade * shade * 185)
      for (let k = 0; k < 4; k++) {
        const d = podDirs[k]
        const out = Math.pow(1 - ease, 2) * 120
        const dz = -(1 - ease) * 200
        const p = pods[k]
        ctx.beginPath()
        const pts: [number, number][] = [...p.outer, ...[...p.inner].reverse()]
        for (let i = 0; i < pts.length; i++) {
          const q = proj(pts[i][0] + d[0] * out, pts[i][1] + d[1] * out, z + dz)
          if (i === 0) ctx.moveTo(q[0] * dpr, q[1] * dpr)
          else ctx.lineTo(q[0] * dpr, q[1] * dpr)
        }
        ctx.closePath()
        if (li === layerZ.length - 1) {
          const mid = Math.floor(podCount / 2)
          const po = proj(p.outer[mid][0] + d[0] * out, p.outer[mid][1] + d[1] * out, z + dz)
          const ox = po[0]
          const oy = po[1]
          const pi = proj(p.inner[mid][0] + d[0] * out, p.inner[mid][1] + d[1] * out, z + dz)
          const g = ctx.createLinearGradient(ox * dpr, oy * dpr, pi[0] * dpr, pi[1] * dpr)
          g.addColorStop(0, '#ffffff')
          g.addColorStop(0.5, '#eef3fa')
          g.addColorStop(1, '#b4c3da')
          ctx.fillStyle = g
          ctx.fill()
          ctx.strokeStyle = 'rgba(255,255,255,0.8)'
          ctx.lineWidth = Math.max(0.8, 1 * dpr)
          ctx.stroke()
        } else {
          ctx.fillStyle = `rgb(${c},${c + 2},${cb})`
          ctx.fill()
        }
      }
    }
    ctx.globalAlpha = 1

    // light travelling around the ring
    if (state.pulse > 0.01) {
      ctx.globalCompositeOperation = 'lighter'
      for (let j = 0; j < 2; j++) {
        const s0 = (t * 26 + j * ring.total * 0.5) % ring.total
        for (const [w, a, col] of [
          [7, 0.1, '175,197,227'],
          [2.2, 0.85, '255,255,255'],
        ] as const) {
          ctx.beginPath()
          for (let i = 0; i <= 18; i++) {
            const p = ring.at(s0 + i * 1.6, hw)
            const q = proj(p.x, p.y, layerZ[layerZ.length - 1] - 0.5)
            if (i === 0) ctx.moveTo(q[0] * dpr, q[1] * dpr)
            else ctx.lineTo(q[0] * dpr, q[1] * dpr)
          }
          ctx.strokeStyle = `rgba(${col},${(a * state.pulse * A).toFixed(3)})`
          ctx.lineWidth = w * dpr * 0.8
          ctx.stroke()
        }
      }
      ctx.globalCompositeOperation = 'source-over'
    }
  }

  let t = 0
  let visible = true
  let last = performance.now()
  const io = new IntersectionObserver(([en]) => (visible = en.isIntersecting), { threshold: 0 })
  io.observe(canvas)

  function frame() {
    const now = performance.now()
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    if (!visible || document.hidden) return
    t += dt
    render(t)
  }

  return {
    state,
    frame,
    renderOnce: () => render(t),
    destroy() {
      ro.disconnect()
      io.disconnect()
    },
  }
}
