import Lenis from 'lenis'
import { gsap, ScrollTrigger } from './registry'
import { prefersReducedMotion } from '../lib/env'
import { introDone } from '../lib/intro'

let lenis: Lenis | null = null

export function getLenis() {
  return lenis
}

/** Lenis wired to GSAP's ticker so ScrollTrigger and smooth scrolling share one clock. */
export function initSmoothScroll() {
  if (lenis || prefersReducedMotion()) return null
  lenis = new Lenis({
    lerp: 0.085,
    wheelMultiplier: 0.95,
    touchMultiplier: 1.2,
    smoothWheel: true,
    anchors: false,
  })
  if (!introDone()) lenis.stop() // the preloader owns scrolling until it finishes
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)
  return lenis
}

function tick(time: number) {
  lenis?.raf(time * 1000)
}

export function destroySmoothScroll() {
  if (!lenis) return
  gsap.ticker.remove(tick)
  lenis.destroy()
  lenis = null
}

export function scrollToTarget(target: string | number | HTMLElement, offset = 0) {
  if (lenis) {
    lenis.scrollTo(target as never, { offset, duration: 1.8, easing: (t: number) => 1 - Math.pow(1 - t, 4) })
  } else if (typeof target === 'string') {
    document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' })
  } else if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior: 'smooth' })
  } else {
    target.scrollIntoView({ behavior: 'smooth' })
  }
}

export function lockScroll() {
  lenis?.stop()
}
export function unlockScroll() {
  lenis?.start()
}
