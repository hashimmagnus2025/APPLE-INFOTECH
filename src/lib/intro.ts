/**
 * Tiny pub/sub that lets sections wait for the preloader to finish
 * before running their entrance animations.
 */
let done = false
const listeners = new Set<() => void>()

export const introDone = () => done

export function onIntroDone(cb: () => void) {
  if (done) {
    cb()
    return () => {}
  }
  listeners.add(cb)
  return () => listeners.delete(cb)
}

export function completeIntro() {
  if (done) return
  done = true
  listeners.forEach((l) => l())
  listeners.clear()
}
