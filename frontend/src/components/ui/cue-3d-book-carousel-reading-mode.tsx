/**
 * Cue Foundations · 3D Book Carousel Reading Mode
 * ────────────────────────────────────────────
 * A perspective-driven CSS 3D shelf of books that morphs spines into covers as you scroll,
 * opening into a two-phase rise-and-swing reading spread.
 *
 * Original: https://cuedesign.space/component/cue074 (Cue ID: cue074, via 21st.dev)
 *
 * Adapted for DE Hub:
 *  - React 19 typing fix (callback refs must not return a value)
 *  - keyboard support: ← → browse, Enter open/close, Esc close; books are focusable buttons
 *  - theme-aware text / close button (follows --foreground, works in dark mode)
 *  - text covers (eyebrow / title / subtitle) instead of stock images
 *  - `renderPage` prop to customise the page shown when a book is open
 *  - corner labels removed — the page renders its own top bar
 *
 * Zero deps. CSS 3D transforms + RAF loop.
 */

import { useEffect, useRef, useState, type ReactNode } from 'react'

export interface Book {
  title: string
  color: string
  textColor: string
  spineW: number // spine width in px
  h: number // book height in px
  rotZ?: number
  img?: string
  eyebrow?: string // small label on the cover, e.g. "Vol. 01"
  subtitle?: string // tagline on the cover
}

interface BookCarousel3DProps {
  books: Book[]
  initialIndex?: number
  onOpenBook?: (index: number, book: Book) => void
  /**
   * Content of the right-hand page when a book is open. Pages of every book are in the DOM,
   * so use `isOpen` to keep interactive elements out of the tab order while hidden.
   */
  renderPage?: (book: Book, index: number, isOpen: boolean) => ReactNode
}

const OPEN_W = 240
const GAP = 80
const smoothstep = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)

export default function BookCarousel3D({
  books,
  initialIndex = 0,
  onOpenBook,
  renderPage,
}: BookCarousel3DProps) {
  const progressRef = useRef<HTMLDivElement>(null)
  const wrapperRefs = useRef<Array<HTMLDivElement | null>>([])
  const rafRef = useRef<number | null>(null)
  const onOpenBookRef = useRef(onOpenBook)
  const [activeIndex, setActiveIndex] = useState(initialIndex)
  const [reading, setReading] = useState(false)

  useEffect(() => {
    onOpenBookRef.current = onOpenBook
  }, [onOpenBook])

  const state = useRef({
    target: initialIndex,
    current: initialIndex,
    dragging: false,
    startX: 0,
    scrollStart: 0,
    opened: -1,
    openness: new Array(books.length).fill(0) as number[],
  })

  useEffect(() => {
    const spineWidths = books.map((b) => b.spineW || 40)
    const rotZs = books.map((b) => b.rotZ || 0)

    function step() {
      const s = state.current
      s.current += (s.target - s.current) * 0.08

      // Compute widths + cumulative left positions
      const positions: number[] = []
      let left = 0
      for (let i = 0; i < books.length; i++) {
        positions[i] = left
        const openness = Math.max(0, 1 - Math.abs(i - s.current))
        const w = spineWidths[i] + smoothstep(openness) * (OPEN_W - spineWidths[i])
        left += w + GAP
      }

      const getCenter = (i: number, prog: number) => {
        const openness = Math.max(0, 1 - Math.abs(i - prog))
        const w = spineWidths[i] + smoothstep(openness) * (OPEN_W - spineWidths[i])
        return positions[i] + w / 2
      }

      const prev = Math.floor(s.current)
      const next = prev + 1
      const frac = s.current - prev
      const c1 = getCenter(prev, s.current)
      const c2 = next < books.length ? getCenter(next, s.current) : c1
      const cameraX = c1 * (1 - frac) + c2 * frac

      setActiveIndex(Math.max(0, Math.min(books.length - 1, Math.round(s.current))))

      wrapperRefs.current.forEach((el, i) => {
        if (!el) return
        const diff = i - s.current
        const eo = smoothstep(Math.max(0, 1 - Math.abs(diff)))

        let x = positions[i] - cameraX + (1 - eo) * (spineWidths[i] / 2)
        let z = eo * 60
        let y = 0
        const rotateY = (1 - eo) * 90
        const zIndex = Math.round(100 - Math.abs(diff) * 10)
        const scale = 1 + eo * 0.05
        const rotZ = rotZs[i] * (1 - eo)

        // Reading mode: rise first, then swing the cover open
        const target = s.opened === i ? 1 : 0
        s.openness[i] += (target - s.openness[i]) * 0.06
        const cOpen = s.openness[i]
        const easeRise = smoothstep(Math.min(1, cOpen * 2))
        const easeSwing = smoothstep(Math.max(0, (cOpen - 0.5) * 2))

        x += easeSwing * (OPEN_W / 2)
        z += easeRise * 150
        y += easeRise * -120

        el.style.zIndex = String(zIndex)
        el.style.transform = `translateX(${x}px) translateY(${y}px) translateZ(${z}px) scale(${scale}) rotateZ(${rotZ}deg)`

        const inner = el.querySelector<HTMLElement>('.bc-book')
        if (inner) inner.style.transform = `rotateY(${rotateY}deg)`

        const hinge = el.querySelector<HTMLElement>('.bc-hinge')
        if (hinge)
          hinge.style.transform = `translateZ(${spineWidths[i] / 2}px) rotateY(${easeSwing * -140}deg)`

        const spine = el.querySelector<HTMLElement>('.bc-spine')
        if (spine) spine.style.filter = `brightness(${0.6 + eo * 0.4})`
      })

      if (progressRef.current) {
        progressRef.current.style.width = `${(s.current / Math.max(1, books.length - 1)) * 100}%`
      }
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)

    // ── Input handlers ──
    const clamp = (v: number) => Math.max(0, Math.min(v, books.length - 1))
    const isOpen = () => state.current.opened !== -1

    const onWheel = (e: WheelEvent) => {
      if (isOpen()) return
      state.current.target = clamp(state.current.target + Math.sign(e.deltaY) * 0.3)
    }
    const onMouseDown = (e: MouseEvent) => {
      if (isOpen()) return
      state.current.dragging = true
      state.current.startX = e.clientX
      state.current.scrollStart = state.current.target
    }
    const onMouseMove = (e: MouseEvent) => {
      if (!state.current.dragging || isOpen()) return
      state.current.target = clamp(state.current.scrollStart + (e.clientX - state.current.startX) * -0.01)
    }
    const onMouseUp = () => {
      state.current.dragging = false
    }
    const onTouchStart = (e: TouchEvent) => {
      if (isOpen()) return
      state.current.dragging = true
      state.current.startX = e.touches[0].clientX
      state.current.scrollStart = state.current.target
    }
    const onTouchMove = (e: TouchEvent) => {
      if (!state.current.dragging || isOpen()) return
      state.current.target = clamp(
        state.current.scrollStart + (e.touches[0].clientX - state.current.startX) * -0.01,
      )
    }
    const onKeyDown = (e: KeyboardEvent) => {
      const s = state.current
      if (e.key === 'Escape' && isOpen()) {
        s.opened = -1
        setReading(false)
      } else if (!isOpen() && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        s.target = clamp(Math.round(s.target) + (e.key === 'ArrowRight' ? 1 : -1))
        wrapperRefs.current[s.target]?.focus({ preventScroll: true })
      }
    }

    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('mouseleave', onMouseUp)
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onMouseUp)
    window.addEventListener('keydown', onKeyDown)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('mouseleave', onMouseUp)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onMouseUp)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [books])

  function handleClick(i: number) {
    const s = state.current
    if (Math.round(s.current) === i) {
      const nextOpen = s.opened === i ? -1 : i
      s.opened = nextOpen
      setReading(nextOpen !== -1)
      if (nextOpen !== -1) onOpenBookRef.current?.(i, books[i])
    } else {
      s.target = i
    }
  }

  function closeReading() {
    state.current.opened = -1
    setReading(false)
  }

  const active = books[activeIndex]

  return (
    <>
      <style>{CSS}</style>

      <button
        type="button"
        className={`bc-close ${reading ? 'visible' : ''}`}
        onClick={closeReading}
        aria-label="Close book"
        tabIndex={reading ? 0 : -1}
      >
        <div className="bc-close-wrap">
          <span className="bc-line bc-line-1" />
          <span className="bc-line bc-line-2" />
        </div>
      </button>

      <div className={`bc-header ${reading ? 'hidden' : ''}`} aria-live="polite">
        {active?.eyebrow && <div className="bc-header-eyebrow">{active.eyebrow}</div>}
        <h1 className="bc-title">{active?.title}</h1>
      </div>

      <div className="bc-scene">
        <div className="bc-track">
          {books.map((b, i) => {
            const sW = b.spineW || 40
            return (
              <div
                key={b.title}
                ref={(el) => {
                  wrapperRefs.current[i] = el
                }}
                className="bc-wrapper"
                role="button"
                tabIndex={0}
                aria-label={`${b.title}${b.subtitle ? ` — ${b.subtitle}` : ''}`}
                aria-pressed={reading && activeIndex === i}
                onClick={() => handleClick(i)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleClick(i)
                  }
                }}
              >
                <div className="bc-book" style={{ height: `${b.h}px` }}>
                  {/* Front hinge (cover + inside) */}
                  <div className="bc-face bc-hinge" style={{ transform: `translateZ(${sW / 2}px)` }}>
                    <div className="bc-face bc-front" style={{ width: OPEN_W, background: b.color }}>
                      <div className="bc-overlay" />
                      {b.img ? (
                        <img src={b.img} alt="" className="bc-cover-img" />
                      ) : (
                        <div className="bc-cover" style={{ color: b.textColor }}>
                          {b.eyebrow && <div className="bc-cover-eyebrow">{b.eyebrow}</div>}
                          <div className="bc-cover-title">{b.title}</div>
                          {b.subtitle && <div className="bc-cover-subtitle">{b.subtitle}</div>}
                          <div className="bc-cover-mark">DE Hub</div>
                        </div>
                      )}
                    </div>
                    <div className="bc-face bc-inside" style={{ width: OPEN_W }} />
                  </div>

                  {/* Reading page */}
                  <div className="bc-face bc-page" style={{ transform: `translateZ(${sW / 2 - 1}px)` }}>
                    <div className="bc-page-inner">
                      {renderPage ? (
                        renderPage(b, i, reading && activeIndex === i)
                      ) : (
                        <>
                          <div className="bc-page-eyebrow">{b.eyebrow}</div>
                          <h3 className="bc-page-title">{b.title}</h3>
                          <div className="bc-page-rule" />
                        </>
                      )}
                    </div>
                  </div>

                  <div
                    className="bc-face bc-back"
                    style={{ width: OPEN_W, background: b.color, transform: `rotateY(180deg) translateZ(${sW / 2}px)` }}
                  />

                  <div className="bc-face bc-spine" style={{ width: sW, left: -sW / 2, background: b.color }}>
                    <div className="bc-spine-text" style={{ color: b.textColor }}>
                      {b.title}
                    </div>
                  </div>

                  <div className="bc-face bc-pages bc-pages-right" style={{ width: sW, left: OPEN_W - sW / 2 }} />
                  <div className="bc-face bc-pages bc-pages-top" style={{ height: sW, top: -sW / 2 }} />
                  <div className="bc-face bc-pages bc-pages-bottom" style={{ height: sW, bottom: -sW / 2 }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="bc-progress" aria-hidden="true">
        <div ref={progressRef} className="bc-progress-bar" />
      </div>
    </>
  )
}

const CSS = `
:root { --bc-text: var(--foreground, #1a1a1a); }

.bc-header {
  position: absolute; bottom: calc(4% + 420px); left: 0; width: 100%;
  text-align: center; z-index: 10; pointer-events: none;
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.bc-header.hidden { opacity: 0; transform: translateY(-10px); }
.bc-header-eyebrow {
  font-family: var(--font-mono); font-size: 11px; letter-spacing: 3px;
  text-transform: uppercase; color: var(--muted-foreground); margin-bottom: 8px;
}
.bc-title {
  font-family: var(--font-display); font-size: 34px; font-weight: 500;
  letter-spacing: 0.5px; margin: 0; color: var(--bc-text); line-height: 1.1;
}

.bc-close {
  position: fixed; top: 88px; right: 40px;
  width: 44px; height: 44px; border: 1px solid color-mix(in srgb, var(--bc-text) 15%, transparent);
  border-radius: 50%; background: var(--card); cursor: pointer; z-index: 100;
  opacity: 0; pointer-events: none;
  display: flex; align-items: center; justify-content: center;
  transition: opacity 0.4s ease, transform 0.4s ease, border-color 0.4s ease;
}
.bc-close:hover { transform: scale(1.08); border-color: color-mix(in srgb, var(--bc-text) 40%, transparent); }
.bc-close:focus-visible { outline: 2px solid var(--ring); outline-offset: 2px; }
.bc-close.visible { opacity: 1; pointer-events: auto; }
.bc-close-wrap { position: relative; width: 14px; height: 14px; }
.bc-line {
  position: absolute; top: 50%; left: 0; width: 100%; height: 1px;
  background: var(--bc-text); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.bc-close.visible .bc-line-1 { transform: translateY(-50%) rotate(45deg); }
.bc-close.visible .bc-line-2 { transform: translateY(-50%) rotate(-45deg); }
.bc-close:hover .bc-line-1  { transform: translateY(-50%) rotate(135deg); }
.bc-close:hover .bc-line-2  { transform: translateY(-50%) rotate(45deg); }

.bc-scene { position: absolute; inset: 0; perspective: 3000px; overflow: hidden; }
.bc-track {
  position: absolute; bottom: 9%; left: 50%;
  transform-style: preserve-3d; will-change: transform;
}

.bc-wrapper {
  position: absolute; bottom: 0;
  transform-style: preserve-3d; will-change: transform;
  cursor: pointer; outline: none;
}
.bc-wrapper:focus-visible .bc-front,
.bc-wrapper:focus-visible .bc-spine { outline: 2px solid var(--ring); outline-offset: 3px; }
.bc-book {
  position: relative; width: 240px;
  transform-style: preserve-3d; transform-origin: left center;
}

.bc-face {
  position: absolute; backface-visibility: hidden;
  display: flex; align-items: center; justify-content: center; overflow: hidden;
}
.bc-hinge {
  position: absolute; width: 240px; height: 100%; top: 0; left: 0;
  transform-origin: left center; transform-style: preserve-3d; will-change: transform;
}
.bc-front { width: 100%; height: 100%; top: 0; left: 0; border-radius: 2px 6px 6px 2px; }
.bc-inside {
  width: 100%; height: 100%; top: 0; left: 0;
  background: #e2e8f0; transform: rotateY(180deg) translateZ(1px);
  background-image: linear-gradient(to right, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 10%);
}
.bc-page {
  width: 236px; height: calc(100% - 4px); top: 2px; left: 2px;
  background: #fdfdfb; color: #1e293b; box-sizing: border-box;
  box-shadow: inset -5px 0 10px rgba(0,0,0,0.02); border-radius: 1px 4px 4px 1px;
}
.bc-page-inner { width: 100%; height: 100%; padding: 22px; box-sizing: border-box; display: flex; flex-direction: column; }
.bc-page-eyebrow { font-family: var(--font-mono); font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: #64748b; margin-bottom: 12px; }
.bc-page-title { font-family: var(--font-display); font-size: 24px; font-weight: 500; color: #0f172a; margin: 0; line-height: 1.15; }
.bc-page-rule { width: 24px; height: 1px; background: #0f172a; margin: 16px 0; }

.bc-overlay {
  position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(to right, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 10%, rgba(0,0,0,0.1) 95%, rgba(0,0,0,0.2) 100%);
}
.bc-cover-img { width: 100%; height: 100%; object-fit: cover; }
.bc-cover {
  position: relative; width: 100%; height: 100%; box-sizing: border-box;
  padding: 26px 22px 22px 28px; display: flex; flex-direction: column;
}
.bc-cover-eyebrow { font-family: var(--font-mono); font-size: 10px; letter-spacing: 3px; text-transform: uppercase; opacity: 0.75; }
.bc-cover-title {
  margin-top: auto; font-family: var(--font-display); font-size: 34px; font-weight: 500;
  line-height: 1.02; letter-spacing: -0.3px;
}
.bc-cover-subtitle { margin-top: 10px; font-size: 12px; line-height: 1.45; opacity: 0.8; }
.bc-cover-mark {
  margin-top: 22px; padding-top: 12px; border-top: 1px solid currentColor;
  font-family: var(--font-mono); font-size: 10px; letter-spacing: 2px; text-transform: uppercase; opacity: 0.6;
}

.bc-back { width: 240px; height: 100%; top: 0; left: 0; }

.bc-spine {
  width: 40px; height: 100%; top: 0; left: -20px;
  transform: rotateY(-90deg);
  box-shadow: inset 5px 0 10px rgba(255,255,255,0.2), inset -5px 0 10px rgba(0,0,0,0.3);
  border-right: 1px solid rgba(0,0,0,0.1);
}
.bc-spine-text {
  writing-mode: vertical-rl; text-orientation: mixed;
  transform: rotate(180deg);
  font-family: var(--font-sans); font-size: 12px; font-weight: 700;
  letter-spacing: 1.5px; text-transform: uppercase;
  white-space: nowrap; padding: 20px 0; width: 100%;
  text-align: center; display: flex; align-items: center; gap: 15px;
}

.bc-pages {
  background: #f4f4f2;
  background-image: repeating-linear-gradient(to right, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 3px);
}
.bc-pages-right  { width: 40px; height: 100%; top: 0; left: 220px; transform: rotateY(90deg); }
.bc-pages-top    { width: 240px; height: 40px; left: 0; top: -20px; transform: rotateX(90deg);
                   background-image: repeating-linear-gradient(to bottom, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 3px); }
.bc-pages-bottom { width: 240px; height: 40px; left: 0; bottom: -20px; transform: rotateX(-90deg);
                   background-image: repeating-linear-gradient(to bottom, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 3px);
                   box-shadow: 0 0 15px 5px rgba(0,0,0,0.2); }

.bc-progress {
  position: absolute; bottom: 4%; left: 50%; transform: translateX(-50%);
  width: 200px; height: 2px; background: color-mix(in srgb, var(--bc-text) 12%, transparent); z-index: 20;
  border-radius: 2px; overflow: hidden;
}
.bc-progress-bar { height: 100%; width: 0%; background: var(--primary); will-change: width; }

@media (max-width: 900px) {
  .bc-progress { width: 140px; }
}
@media (max-width: 600px) {
  .bc-header { bottom: calc(9% + 400px); }
  .bc-title { font-size: 26px; }
  .bc-close { right: 16px; }
  .bc-scene { perspective: 2000px; }
}
@media (prefers-reduced-motion: reduce) {
  .bc-book, .bc-hinge, .bc-header, .bc-close, .bc-line { transition: none !important; }
}
`
