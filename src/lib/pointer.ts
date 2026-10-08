/** Shared normalised pointer state (−1..1 around viewport centre) used for parallax across canvases. */
export const pointer = { x: 0, y: 0, px: 0, py: 0, tx: 0, ty: 0 }

let started = false
export function startPointer() {
  if (started || typeof window === 'undefined') return
  started = true
  window.addEventListener(
    'pointermove',
    (e) => {
      pointer.px = e.clientX
      pointer.py = e.clientY
      pointer.tx = (e.clientX / window.innerWidth) * 2 - 1
      pointer.ty = (e.clientY / window.innerHeight) * 2 - 1
    },
    { passive: true },
  )
}

/** eased pointer; call once per frame from a single owner (or per-canvas for local smoothing) */
export function stepPointer(k = 0.06) {
  pointer.x += (pointer.tx - pointer.x) * k
  pointer.y += (pointer.ty - pointer.y) * k
}
