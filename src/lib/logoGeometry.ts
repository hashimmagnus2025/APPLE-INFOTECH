/**
 * Apple Infotech — logo geometry.
 *
 * The brand mark is a rounded diamond RING made of four node "pods" (at the
 * vertices) joined by four light-blue "links". It reads as a closed network of
 * four connected nodes around an empty centre. Everything on the site — canvas
 * scenes, SVG marks, section transitions — is derived from this one definition
 * so the geometry stays consistent.
 *
 * The centre-line is a rounded square (half-side `h`, corner radius `r`)
 * rotated 45°, walked clockwise (screen coordinates, y down), starting at the
 * middle of the upper-right edge. The ring is drawn as a stroke of width `w`
 * around that centre-line.
 */

export interface RingSpec {
  h: number
  r: number
  w: number
  /** length of the node pods along the path */
  pod: number
}

/** Measured from the supplied logo (units match a ~106 unit wide mark). */
export const MARK: RingSpec = { h: 35.4, r: 14, w: 12.4, pod: 40 }

/** viewBox for the mark: centred on (0,0), padded a little beyond the outer edge. */
export const MARK_VIEWBOX = '-60 -60 120 120'

const ROT = Math.PI / 4

type V2 = [number, number]

interface Piece {
  kind: 'L' | 'A'
  len: number
  /** line: start + unit direction; arc: centre + start angle */
  a: V2
  b: V2 | number
}

function rot([x, y]: V2, extra = 0): V2 {
  const c = Math.cos(ROT + extra)
  const s = Math.sin(ROT + extra)
  return [x * c - y * s, x * s + y * c]
}

export class Ring {
  readonly pieces: Piece[]
  readonly total: number
  readonly quarter: number
  /** path position of the first corner (right vertex) centre */
  readonly corner0: number

  constructor(readonly spec: RingSpec = MARK) {
    const { h, r } = spec
    const k = h - r
    const straight = 2 * k
    const arc = (Math.PI * r) / 2
    // [start point, end point] for lines; [centre, start angle] for arcs
    this.pieces = [
      { kind: 'L', len: k, a: [0, -h], b: [1, 0] },
      { kind: 'A', len: arc, a: [k, -k], b: -Math.PI / 2 },
      { kind: 'L', len: straight, a: [h, -k], b: [0, 1] },
      { kind: 'A', len: arc, a: [k, k], b: 0 },
      { kind: 'L', len: straight, a: [k, h], b: [-1, 0] },
      { kind: 'A', len: arc, a: [-k, k], b: Math.PI / 2 },
      { kind: 'L', len: straight, a: [-h, k], b: [0, -1] },
      { kind: 'A', len: arc, a: [-k, -k], b: Math.PI },
      { kind: 'L', len: k, a: [-k, -h], b: [1, 0] },
    ]
    this.total = this.pieces.reduce((n, p) => n + p.len, 0)
    this.quarter = this.total / 4
    this.corner0 = k + arc / 2
  }

  /** centre of pod `i` (0 right, 1 bottom, 2 left, 3 top) along the path */
  cornerAt(i: number) {
    return this.corner0 + i * this.quarter
  }

  /** point + outward normal at path position s (wraps) with optional offset and extra rotation */
  at(s: number, offset = 0, extraRot = 0, scale = 1): { x: number; y: number; nx: number; ny: number } {
    const P = this.total
    s = ((s % P) + P) % P
    let acc = 0
    for (const p of this.pieces) {
      if (s <= acc + p.len + 1e-9) {
        const u = s - acc
        let px: number, py: number, nx: number, ny: number
        if (p.kind === 'L') {
          const d = p.b as V2
          px = p.a[0] + d[0] * u
          py = p.a[1] + d[1] * u
          nx = d[1]
          ny = -d[0]
        } else {
          const ang = (p.b as number) + u / this.spec.r
          nx = Math.cos(ang)
          ny = Math.sin(ang)
          px = p.a[0] + this.spec.r * nx
          py = p.a[1] + this.spec.r * ny
        }
        const [rx, ry] = rot([px + nx * offset, py + ny * offset], extraRot)
        const [rnx, rny] = rot([nx, ny], extraRot)
        return { x: rx * scale, y: ry * scale, nx: rnx, ny: rny }
      }
      acc += p.len
    }
    return this.at(0, offset, extraRot, scale)
  }

  /** exact SVG path (lines + arcs) for the centre-line between s0 and s1 (s1 may exceed total to wrap) */
  pathD(s0: number, s1: number, offset = 0, scale = 1): string {
    const P = this.total
    const r = this.spec.r + offset
    const f = (n: number) => +n.toFixed(3)
    const start = this.at(s0, offset, 0, scale)
    let d = `M${f(start.x)} ${f(start.y)}`
    let cursor = s0
    // piece boundaries over two laps so intervals may wrap
    const edges: { end: number; kind: 'L' | 'A' }[] = []
    let a2 = 0
    for (let lap = 0; lap < 2; lap++) {
      for (const p of this.pieces) {
        a2 += p.len
        edges.push({ end: a2, kind: p.kind })
      }
    }
    for (const e of edges) {
      if (e.end <= cursor + 1e-9) continue
      const stop = Math.min(e.end, s1)
      const pt = this.at(stop % P === 0 ? P : stop, offset, 0, scale)
      if (e.kind === 'L') d += ` L${f(pt.x)} ${f(pt.y)}`
      else d += ` A${f(r * scale)} ${f(r * scale)} 0 0 1 ${f(pt.x)} ${f(pt.y)}`
      cursor = stop
      if (stop >= s1 - 1e-9) break
    }
    return d
  }

  /** full closed contour at an offset from the centre-line (used for thin outlines) */
  closedD(offset = 0, scale = 1): string {
    return this.pathD(0, this.total, offset, scale) + ' Z'
  }

  /** dense polyline of [x,y,nx,ny] samples (used by canvas scenes) */
  sample(count: number, s0 = 0, s1 = this.total, extraRot = 0) {
    const out: { x: number; y: number; nx: number; ny: number }[] = []
    for (let i = 0; i <= count; i++) {
      out.push(this.at(s0 + ((s1 - s0) * i) / count, 0, extraRot))
    }
    return out
  }

  /** pods (4) and links (4) as [s0,s1] intervals along the path */
  get pods(): [number, number][] {
    const hp = this.spec.pod / 2
    return [0, 1, 2, 3].map((i) => [this.cornerAt(i) - hp, this.cornerAt(i) + hp])
  }
  get links(): [number, number][] {
    const hp = this.spec.pod / 2
    return [0, 1, 2, 3].map((i) => [this.cornerAt(i) + hp, this.cornerAt(i + 1) - hp])
  }
}

export const ring = new Ring(MARK)

/** Pre-computed SVG path strings for the brand mark. */
export const markPaths = {
  pods: ring.pods.map(([a, b]) => ring.pathD(a, b)),
  links: ring.links.map(([a, b]) => ring.pathD(a, b)),
  /** thin outer / inner contours (for line-draw intros) */
  outer: ring.closedD(MARK.w / 2),
  inner: ring.closedD(-MARK.w / 2),
  centre: ring.closedD(0),
}

/** Rounded-diamond contour of a given half-diagonal, for decorative outlines (viewBox centred at 0). */
export function diamondPath(extent: number, rounding = 0.3): string {
  // extent = distance from centre to vertex (after rounding)
  const h = extent / (Math.SQRT2 * (1 - rounding) + rounding)
  const rr = new Ring({ h, r: h * rounding, w: 1, pod: 1 })
  return rr.closedD(0)
}
