export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const isCoarsePointer = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: none), (pointer: coarse)').matches

export const isMobileViewport = () => typeof window !== 'undefined' && window.innerWidth < 900

/** DPR capped for canvas work so average hardware stays smooth */
export const canvasDpr = (cap = 1.75) => Math.min(window.devicePixelRatio || 1, cap)

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const map = (v: number, a: number, b: number, c: number, d: number) =>
  c + ((v - a) / (b - a)) * (d - c)
