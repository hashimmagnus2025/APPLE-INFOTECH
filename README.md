# Apple Infotech — Premium Single-Page Experience

A cinematic, scroll-driven single-page concept for **Apple Infotech** — *We Ensure Better ROI*.

Built with **React + Vite + TypeScript**, **GSAP (ScrollTrigger, SplitText, DrawSVG, ScrambleText)** and **Lenis**.
No UI kits, no templates: every visual is custom and derived from the logo.

```bash
npm install
npm run dev        # local development
npm run build      # type-check + production build into /dist
npm run preview    # serve the production build
```

## The idea: the logo is the design system

The Apple Infotech mark is a **closed ring of four nodes joined by four links, around an empty centre**.
That is a network — and it is also the ROI story. The whole site is built from that one geometry
(`src/lib/logoGeometry.ts`, measured from the supplied logo):

| Where | How the geometry is used |
| --- | --- |
| Preloader | The mark draws itself; the hero is revealed through an expanding **diamond** |
| Hero | A projected-3D lattice: the extruded ring (solid pods + glass links), echo rings, struts, orbiting nodes, a glowing core |
| About | A ghost ring that draws itself and assembles with scroll; chamfered image mask |
| **ROI** | The four nodes become *Technology → Efficiency → Business → Growth*; the empty centre is **ROI**. A giant "ROI" shrinks into the void as the logo assembles |
| Services | Diamond-mask transitions between five bespoke technical figures (one morphs 64 nodes into the logo ring) |
| Solutions | Pinned horizontal story; panel art built from diamond rings/lattices |
| Why Us | Four reasons light the four nodes of the mark as you scroll |
| CTA | The ring expands outward like a signal through the page |
| Chrome | Diamond scroll rail, diamond menu reveal, diamond buttons/markers |

Palette: **black + white + ice blue** (`#AFC5E3`, sampled from the logo) with steel (`#71839A`) as the quiet secondary.

## Project structure

```
src/
  components/
    Preloader, Navbar, Cursor, NetworkCanvas, ScrollRail
    Hero/        Hero, HeroVisual, heroLattice (canvas 3D)
    About/       About
    ROI/         ROISection  (pinned, scrubbed)
    Services/    Services, ServiceScenes
    Solutions/   Solutions, SolutionsArt  (pinned horizontal scroll)
    Stats/       Stats
    Why/         Why
    CTA/         CTA, CTAGeometry (canvas)
    Footer/      Footer
    Marquee.tsx  velocity-reactive type
    ui/          Button (magnetic), LogoMark, Icons, CorridorImage
  animations/    registry, smoothScroll (Lenis↔GSAP), textAnimations, magneticEffects
  lib/           logoGeometry, env, intro, pointer, theme
  data/content.ts   ← ALL copy lives here
  styles/        tokens.css, global.css
```

## Replacing the placeholder content

**No company facts were supplied for this demo.** Everything in `src/data/content.ts` is strategic
placeholder copy to be replaced:

* **Services** (`services.items`) — the five listed are the examples from the brief.
* **Statistics** — all four are `value: null` and render as `[XX]`. Set `value` to a number and they
  count up automatically; leave `null` and they "scramble" through digits then resolve to `XX`.
* **Footer contact details / social links** — placeholders (`[ email address ]`, `#`).
* **Photography** — none supplied. The About image is a *procedural monochrome stand-in*
  (`ui/CorridorImage.tsx`). Drop a real photo into `.mono-image` (an `<img>` is already styled with the
  same black-and-white, high-contrast, ice-blue treatment — see `.mono-image` in `global.css`).

Nothing on the site claims clients, awards, testimonials, history or results.

## Motion & interaction

Lenis smooth scrolling on GSAP's ticker · pinned ROI sequence (diamond reveal → shrink-into-void → four stations → diamond exit) ·
pinned horizontal Solutions · masked line reveals · scroll-scrubbed word illumination · SVG line drawing ·
count/scramble numerals · velocity-skewed marquee · magnetic buttons · custom cursor (`EXPLORE` / `VIEW` / `SCROLL` states) ·
canvas network with pointer interaction · pointer parallax on the hero.

## Responsive, performance, accessibility

* Desktop / tablet / mobile: the horizontal Solutions story becomes a vertical editorial stack under 900px,
  the cursor is disabled on touch, canvases use fewer nodes, the ROI chips relocate to the ring's corners.
* Canvases are DPR-capped, pause when off-screen or the tab is hidden, and use GPU-friendly transforms.
  Fonts are self-hosted (latin subsets only); the JS bundle is ~150 KB gzipped including React.
* `prefers-reduced-motion`: smooth scrolling, pinning, preloader, cursor and ambient animation are disabled; every
  section renders as a composed static layout (the canvases paint a single still frame).
* Repeat visits in the same session play a faster preloader.
