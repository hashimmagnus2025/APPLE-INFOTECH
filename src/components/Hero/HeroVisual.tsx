import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { gsap } from '../../animations/registry'
import { createLattice, type LatticeState } from './heroLattice'
import { prefersReducedMotion } from '../../lib/env'
import { startPointer } from '../../lib/pointer'

export interface HeroVisualHandle {
  state: LatticeState
}

/** Canvas host for the lattice; exposes its animatable state to the hero timeline. */
export const HeroVisual = forwardRef<HeroVisualHandle>(function HeroVisual(_, fwd) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<LatticeState>({ assemble: 0, ringIn: [], scroll: 0, alpha: 0, pulse: 0 })

  useImperativeHandle(fwd, () => ({
    get state() {
      return stateRef.current
    },
  }))

  useEffect(() => {
    startPointer()
    const reduced = prefersReducedMotion()
    const lattice = createLattice(canvas.current!, { reduced })
    stateRef.current = lattice.state
    if (reduced) lattice.renderOnce()
    else gsap.ticker.add(lattice.frame)
    return () => {
      gsap.ticker.remove(lattice.frame)
      lattice.destroy()
    }
  }, [])

  return <canvas ref={canvas} className="hero__lattice" aria-hidden="true" />
})
