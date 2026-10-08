import { gsap, SplitText } from './registry'

/**
 * Reveal the lines of a text block with a masked upward slide.
 * Returns the tween so callers can add it to a timeline or trigger it.
 */
export function splitLinesReveal(
  el: Element,
  vars: { delay?: number; stagger?: number; duration?: number; y?: string; scrollTrigger?: gsap.plugins.ScrollTriggerInstanceVars } = {},
) {
  const split = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'split-line', autoSplit: true,
    onSplit: (self) => {
      return gsap.from(self.lines, {
        yPercent: 110,
        duration: vars.duration ?? 1.1,
        stagger: vars.stagger ?? 0.09,
        ease: 'power4.out',
        delay: vars.delay ?? 0,
        scrollTrigger: vars.scrollTrigger,
      })
    },
  })
  return split
}

/**
 * Scroll-scrubbed word illumination: every word starts dim and lights up
 * in sequence as the block travels through the viewport.
 */
export function scrubWords(el: Element, opts: { start?: string; end?: string; from?: number } = {}) {
  const split = SplitText.create(el, { type: 'words', wordsClass: 'sw' })
  gsap.set(split.words, { opacity: opts.from ?? 0.14 })
  const tween = gsap.to(split.words, {
    opacity: 1,
    ease: 'none',
    stagger: 0.12,
    scrollTrigger: {
      trigger: el,
      start: opts.start ?? 'top 82%',
      end: opts.end ?? 'bottom 48%',
      scrub: 0.6,
    },
  })
  return { split, tween }
}

/** Generic fade-up used for small supporting elements. */
export function fadeUp(
  targets: gsap.TweenTarget,
  trigger: Element | string,
  opts: { y?: number; stagger?: number; delay?: number; start?: string; duration?: number } = {},
) {
  return gsap.from(targets, {
    y: opts.y ?? 36,
    opacity: 0,
    duration: opts.duration ?? 1.1,
    stagger: opts.stagger ?? 0.1,
    delay: opts.delay ?? 0,
    ease: 'power3.out',
    scrollTrigger: { trigger, start: opts.start ?? 'top 85%', toggleActions: 'play none none none' },
  })
}
