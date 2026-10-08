import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'

let registered = false
export function registerGsap() {
  if (registered) return
  registered = true
  gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, ScrambleTextPlugin)
  ScrollTrigger.config({ ignoreMobileResize: true })
  gsap.defaults({ ease: 'power3.out' })
}

export { gsap, ScrollTrigger, SplitText }
