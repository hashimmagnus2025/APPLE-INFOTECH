import { useEffect } from 'react'
import { gsap, ScrollTrigger } from './animations/registry'
import { initSmoothScroll, destroySmoothScroll } from './animations/smoothScroll'
import { prefersReducedMotion } from './lib/env'
import { Preloader } from './components/Preloader'
import { Cursor } from './components/Cursor'
import { NetworkCanvas } from './components/NetworkCanvas'
import { Navbar } from './components/Navbar'
import { ScrollRail } from './components/ScrollRail'
import { Hero } from './components/Hero/Hero'
import { About } from './components/About/About'
import { ROISection } from './components/ROI/ROISection'
import { Services } from './components/Services/Services'
import { Solutions } from './components/Solutions/Solutions'
import { Stats } from './components/Stats/Stats'
import { Marquee } from './components/Marquee'
import { Why } from './components/Why/Why'
import { CTA } from './components/CTA/CTA'
import { Footer } from './components/Footer/Footer'

export default function App() {
  useEffect(() => {
    initSmoothScroll()

    // the ambient network is strongest in the hero, quieter behind everything else
    let tween: gsap.core.Tween | undefined
    if (!prefersReducedMotion()) {
      tween = gsap.to('.network-wrap', {
        opacity: 0.5,
        ease: 'none',
        scrollTrigger: { trigger: '#top', start: 'top top', end: 'bottom top', scrub: true },
      })
    }

    // fonts and late layout change text metrics — recalc pinned/scrubbed positions once they settle
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    const onLoad = () => ScrollTrigger.refresh()
    window.addEventListener('load', onLoad)
    return () => {
      window.removeEventListener('load', onLoad)
      tween?.scrollTrigger?.kill()
      tween?.kill()
      destroySmoothScroll()
    }
  }, [])

  return (
    <>
      <Preloader />
      <NetworkCanvas />
      <Navbar />
      <ScrollRail />
      <Cursor />
      <div className="grain" aria-hidden="true" />
      <main className="page">
        <Hero />
        <About />
        <ROISection />
        <Services />
        <Solutions />
        <Stats />
        <Marquee />
        <Why />
        <CTA />
      </main>
      <Footer />
    </>
  )
}
