import { diamondPath, markPaths, MARK } from '../../lib/logoGeometry'

/** Line-art backdrops for the five horizontal panels. All drawn on an 800×600 canvas. */

const stroke = 'rgba(255,255,255,'

export function ArtRings() {
  const rings = [44, 86, 130, 178, 232, 292]
  return (
    <svg viewBox="0 0 800 600" fill="none" className="sol-art">
      <g transform="translate(400 300)">
        {rings.map((e, i) => (
          <g key={e} className="sol-spin" style={{ animationDuration: `${28 + i * 9}s`, animationDirection: i % 2 ? 'reverse' : 'normal' }}>
            <path className="sol-draw" d={diamondPath(e, 0.3)} stroke={`${stroke}${(0.55 - i * 0.07).toFixed(2)})`} strokeWidth="1" vectorEffect="non-scaling-stroke" />
          </g>
        ))}
        <g transform="scale(0.78)">
          {markPaths.links.map((d, i) => (
            <path key={'l' + i} d={d} stroke="#afc5e3" strokeOpacity="0.8" strokeWidth={MARK.w} />
          ))}
          {markPaths.pods.map((d, i) => (
            <path key={'p' + i} d={d} stroke="#fff" strokeWidth={MARK.w} />
          ))}
        </g>
      </g>
    </svg>
  )
}

export function ArtLattice() {
  const cells: { x: number; y: number; on: boolean; d: number }[] = []
  const cols = 8
  const rows = 6
  for (let i = 0; i < cols; i++)
    for (let j = 0; j < rows; j++)
      cells.push({ x: 150 + (i - j) * 66 + 250, y: 90 + (i + j) * 38, on: (i * 7 + j * 3) % 5 === 0, d: (i + j) * 0.18 })
  const small = diamondPath(30, 0.3)
  return (
    <svg viewBox="0 0 800 600" fill="none" className="sol-art">
      {cells.map((c, i) => (
        <g key={i} transform={`translate(${c.x} ${c.y}) scale(1 0.58)`}>
          <path className="sol-draw" d={small} stroke={`${stroke}${c.on ? 0.7 : 0.2})`} strokeWidth="1.5" fill={c.on ? 'rgba(175,197,227,0.12)' : 'none'} />
          {c.on && <circle r="2.6" fill="#fff" className="sol-twinkle" style={{ animationDelay: `${c.d}s` }} />}
        </g>
      ))}
    </svg>
  )
}

export function ArtFunnel() {
  const lines = Array.from({ length: 15 }, (_, i) => {
    const y = 40 + i * 39
    return { y, d: `M0 ${y} C 300 ${y}, 380 300, 560 300` }
  })
  return (
    <svg viewBox="0 0 800 600" fill="none" className="sol-art">
      {lines.map((l, i) => (
        <path key={i} className="sol-draw sol-flow" d={l.d} stroke={`${stroke}${i % 3 === 0 ? 0.5 : 0.2})`} strokeWidth="1" strokeDasharray={i % 3 === 0 ? '2 12' : undefined} style={{ animationDelay: `${i * -0.2}s` }} />
      ))}
      <path className="sol-draw" d="M560 300 H800" stroke="#afc5e3" strokeWidth="2" />
      <g transform="translate(560 300)">
        <path d={diamondPath(18, 0.3)} fill="#050505" stroke="#fff" strokeWidth="1.2" />
        <circle r="3" fill="#fff" />
      </g>
    </svg>
  )
}

export function ArtRipples() {
  const sparks = [
    [120, 140], [660, 90], [700, 420], [180, 470], [420, 70], [560, 540], [60, 300],
  ]
  return (
    <svg viewBox="0 0 800 600" fill="none" className="sol-art">
      <g transform="translate(400 300)">
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} className="sol-ripple" d={diamondPath(120, 0.3)} stroke="rgba(255,255,255,0.7)" strokeWidth="1" vectorEffect="non-scaling-stroke" style={{ animationDelay: `${i * -1.6}s` }} />
        ))}
        <path d={diamondPath(16, 0.3)} fill="#fff" />
      </g>
      {sparks.map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`} className="sol-twinkle" style={{ animationDelay: `${i * 0.4}s` }}>
          <path d="M-7 0H7M0 -7V7" stroke="#afc5e3" strokeWidth="1" />
        </g>
      ))}
    </svg>
  )
}

export function ArtSteps() {
  const pts: [number, number][] = [
    [90, 500], [230, 500], [230, 420], [370, 420], [370, 330], [510, 330], [510, 230], [650, 230], [650, 130],
  ]
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ')
  const nodes: [number, number][] = [[230, 500], [370, 420], [510, 330], [650, 230]]
  return (
    <svg viewBox="0 0 800 600" fill="none" className="sol-art">
      <line x1="60" y1="520" x2="760" y2="520" stroke="rgba(255,255,255,0.3)" />
      {nodes.map(([x, y], i) => (
        <line key={i} x1={x} y1={y} x2={x} y2="520" stroke="rgba(175,197,227,0.35)" strokeDasharray="2 8" />
      ))}
      <path className="sol-draw" d={d} stroke="#afc5e3" strokeWidth="2" strokeLinejoin="round" />
      {nodes.map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <path d={diamondPath(11, 0.3)} fill="#050505" stroke="#fff" strokeWidth="1.2" />
        </g>
      ))}
      <g transform="translate(650 130)">
        <circle r="22" stroke="rgba(255,255,255,0.4)" className="sol-ripple" vectorEffect="non-scaling-stroke" />
        <circle r="6" fill="#fff" />
      </g>
      <path d="M690 100 L740 60 M712 60 H740 V88" stroke="#fff" strokeWidth="1.6" />
    </svg>
  )
}

export const ARTS = [ArtRings, ArtLattice, ArtFunnel, ArtRipples, ArtSteps]
