import { useEffect, useRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * "Data water plant" background — the layers of a dbt project as a water-treatment plant:
 *
 *   postgres · kafka · s3 · api  →  RAW (muddy intake)  →  BASE  →  STG (filter beds)
 *   →  INTERMEDIATE (mixer)  →  DIM (silo) / FACT (capsule tank)  →  REPORT (screen)  →  tap → users
 *
 * The water gets clearer at every stage. 2.5D SVG, zero dependencies: CSS animations for the
 * current in the pipes, water bob, mixer and chart bars; SMIL for droplets / bubbles.
 * Colours come from theme tokens. prefers-reduced-motion → everything frozen. aria-hidden.
 * The page decides where the plant goes (top / height) so it never collides with the shelf.
 */

// Ground line every object stands on (viewBox units).
const GROUND = 236

// Pipe routes — droplets follow the same paths via <mpath>.
const PIPES: Array<{ id: string; d: string; water: string; dur: number }> = [
  { id: 'p-pg', d: 'M150,40 C210,40 212,200 266,200', water: 'var(--w-raw)', dur: 2.6 },
  { id: 'p-kafka', d: 'M150,95 C210,95 212,200 266,200', water: 'var(--w-raw)', dur: 2.3 },
  { id: 'p-s3', d: 'M150,153 C210,153 212,200 266,200', water: 'var(--w-raw)', dur: 2.1 },
  { id: 'p-api', d: 'M150,206 C210,206 212,200 266,200', water: 'var(--w-raw)', dur: 2 },
  { id: 'p-raw-base', d: 'M375,204 H456', water: 'var(--w-raw)', dur: 1.6 },
  { id: 'p-base-stg', d: 'M545,204 C580,204 578,134 610,134', water: 'var(--w-base)', dur: 1.8 },
  { id: 'p-stg-int', d: 'M730,212 H793', water: 'var(--w-stg)', dur: 1.4 },
  { id: 'p-int-dim', d: 'M888,188 H976', water: 'var(--w)', dur: 1.5 },
  { id: 'p-int-fact', d: 'M888,212 C925,212 925,232 955,232 H1048 C1066,232 1062,200 1076,200', water: 'var(--w)', dur: 2.4 },
  { id: 'p-dim-report', d: 'M1045,112 C1190,112 1250,138 1326,138', water: 'var(--w)', dur: 2.6 },
  { id: 'p-fact-report', d: 'M1235,196 C1285,196 1290,160 1326,160', water: 'var(--w)', dur: 1.8 },
  { id: 'p-report-tap', d: 'M1455,122 H1496 Q1512,122 1512,138 V150', water: 'var(--w)', dur: 1.4 },
]

const STAGES: Array<{ x: number; name: string; caption: string }> = [
  { x: 320, name: 'RAW', caption: 'landed as-is' },
  { x: 500, name: 'BASE', caption: 'typed & renamed' },
  { x: 670, name: 'STG', caption: 'cleaned & tested' },
  { x: 840, name: 'INTERMEDIATE', caption: 'business logic' },
  { x: 1010, name: 'DIM', caption: 'who · what · where' },
  { x: 1155, name: 'FACT', caption: 'events · measures' },
  { x: 1390, name: 'REPORT', caption: 'where users look' },
  { x: 1512, name: 'USERS', caption: 'data, served' },
]

interface DataPlantBackgroundProps {
  className?: string
  /** Top of the plant band in px (below the page top bar). */
  top?: number
  /** Height of the plant band in px. Below 90px the plant is hidden; below 200px it goes compact. */
  height?: number
}

export function DataPlantBackground({ className, top = 92, height = 220 }: DataPlantBackgroundProps) {
  const visible = height >= 90
  const compact = height < 200
  const svgRef = useRef<SVGSVGElement>(null)
  const plantRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      svgRef.current?.pauseAnimations()
      return
    }
    if (!visible) return
    // Gentle pointer parallax for depth.
    let raf = 0
    let x = 0
    let y = 0
    let tx = 0
    let ty = 0
    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * -14
      ty = (e.clientY / window.innerHeight - 0.5) * -6
    }
    const tick = () => {
      x += (tx - x) * 0.06
      y += (ty - y) * 0.06
      if (plantRef.current) plantRef.current.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`
      raf = requestAnimationFrame(tick)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
    }
  }, [visible])

  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none overflow-hidden', className)}
      style={{
        backgroundImage: [
          // cool light from above (the water), warm lamp light on the shelf below
          'radial-gradient(ellipse 80% 50% at 50% 0%, color-mix(in srgb, var(--primary) 5%, transparent), transparent 70%)',
          'radial-gradient(ellipse 70% 45% at 50% 100%, color-mix(in srgb, #d9a441 9%, transparent), transparent 70%)',
          'radial-gradient(color-mix(in srgb, var(--foreground) 6%, transparent) 1px, transparent 1px)',
        ].join(','),
        backgroundSize: '100% 100%, 100% 100%, 24px 24px',
      }}
    >
      <style>{CSS}</style>
      {visible && (
        <div
          ref={plantRef}
          className={cn('plant absolute inset-x-0 hidden px-6 sm:block', compact && 'plant-compact')}
          style={{ top, height }}
        >
          <svg ref={svgRef} viewBox="0 0 1600 282" preserveAspectRatio="xMidYMid meet" className="size-full">
            <defs>
              <linearGradient id="plant-floor" x1="0" x2="1">
                <stop offset="0" stopColor="currentColor" stopOpacity="0" />
                <stop offset="0.15" stopColor="currentColor" stopOpacity="0.35" />
                <stop offset="0.85" stopColor="currentColor" stopOpacity="0.35" />
                <stop offset="1" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
              <pattern id="plant-gravel" width="8" height="6" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.4" className="plant-gravel-dot" />
                <circle cx="6" cy="4.5" r="1.1" className="plant-gravel-dot" />
              </pattern>
              {PIPES.map((p) => (
                <path key={p.id} id={p.id} d={p.d} />
              ))}
            </defs>

            {/* Floor */}
            <line x1="20" x2="1580" y1={GROUND} y2={GROUND} stroke="url(#plant-floor)" strokeWidth="1" className="plant-floor" />

            {/* Pipes go behind the tanks */}
            {PIPES.map((p) => (
              <Pipe key={p.id} {...p} />
            ))}

            <Sources />

            <Tank id="raw" cx={320} top={74} w={110} h={146} level={112} water="var(--w-raw)" murky />
            <Tank id="base" cx={500} top={92} w={90} h={128} level={128} water="var(--w-base)" />
            <FilterBeds />
            <Mixer />
            <Silo />
            <FactTank />
            <ReportScreen />
            <TapAndGlass />

            {/* Stage names */}
            {STAGES.map((s) => (
              <g key={s.name}>
                <text x={s.x} y={257} textAnchor="middle" className="plant-label">
                  {s.name}
                </text>
                <text x={s.x} y={274} textAnchor="middle" className="plant-caption">
                  {s.caption}
                </text>
              </g>
            ))}
          </svg>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────── building blocks ─────────────────────────── */

function Pipe({ id, water, dur }: { id: string; water: string; dur: number }) {
  return (
    <g>
      <use href={`#${id}`} className="plant-pipe" />
      <use href={`#${id}`} className="plant-current" style={{ stroke: water }} />
      {[0, 0.5].map((offset) => (
        <circle key={offset} r="2.6" style={{ fill: water }} className="plant-droplet">
          <animateMotion dur={`${dur}s`} begin={`${-offset * dur}s`} repeatCount="indefinite" rotate="auto">
            <mpath href={`#${id}`} />
          </animateMotion>
        </circle>
      ))}
    </g>
  )
}

function Shadow({ cx, rx }: { cx: number; rx: number }) {
  return <ellipse cx={cx} cy={GROUND} rx={rx} ry={5} className="plant-shadow" />
}

/** Rising bubbles inside a tank (clipped by the caller). */
function Bubbles({ xs, from, to }: { xs: number[]; from: number; to: number }) {
  return (
    <>
      {xs.map((x, i) => (
        <circle key={x} cx={x} cy={from} r={1.6 + (i % 2)} className="plant-bubble">
          <animate attributeName="cy" from={from} to={to} dur={`${2.6 + i * 0.7}s`} begin={`${-i * 1.1}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;0.7;0" dur={`${2.6 + i * 0.7}s`} begin={`${-i * 1.1}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </>
  )
}

/** Glass cylinder with water inside. */
function Tank({
  id,
  cx,
  top,
  w,
  h,
  level,
  water,
  murky,
  children,
}: {
  id: string
  cx: number
  top: number
  w: number
  h: number
  level: number
  water: string
  murky?: boolean
  children?: ReactNode
}) {
  const rx = w / 2
  const ry = w * 0.16
  const bottom = top + h
  const body = `M${cx - rx},${top} V${bottom} A${rx},${ry} 0 0 0 ${cx + rx},${bottom} V${top} A${rx},${ry} 0 0 0 ${cx - rx},${top} Z`
  return (
    <g>
      <Shadow cx={cx} rx={rx * 1.1} />
      <clipPath id={`clip-${id}`}>
        <path d={body} />
      </clipPath>
      <path d={body} className="plant-glass" />
      <g clipPath={`url(#clip-${id})`}>
        <g className="plant-bob">
          <rect x={cx - rx} y={level} width={w} height={bottom - level + ry + 4} style={{ fill: water }} className="plant-water" />
          <ellipse cx={cx} cy={level} rx={rx} ry={ry} style={{ fill: water }} className="plant-surface" />
        </g>
        {murky && (
          <g className="plant-sediment">
            {[-30, -12, 8, 24, 36, -22, 16].map((dx, i) => (
              <circle key={i} cx={cx + dx} cy={bottom - 6 - (i % 3) * 7} r={2 + (i % 2)} />
            ))}
          </g>
        )}
        <Bubbles xs={[cx - rx * 0.4, cx + rx * 0.15, cx + rx * 0.5]} from={bottom + 4} to={level + 4} />
        {children}
      </g>
      {/* glass highlight + rim */}
      <rect x={cx - rx * 0.62} y={top + 6} width={4} height={h - 12} rx={2} className="plant-highlight" />
      <ellipse cx={cx} cy={top} rx={rx} ry={ry} className="plant-rim" />
    </g>
  )
}

/** postgres (database), kafka (append-only log), s3 (bucket), api (cube). */
function Sources() {
  return (
    <g>
      {/* postgres */}
      <text x={100} y={44} textAnchor="end" className="plant-source-label">postgres</text>
      <path d="M114,26 V52 A14,4.5 0 0 0 142,52 V26" className="plant-solid" />
      <path d="M114,35 A14,4.5 0 0 0 142,35 M114,44 A14,4.5 0 0 0 142,44" className="plant-line" />
      <ellipse cx={128} cy={26} rx={14} ry={4.5} className="plant-solid-top" />

      {/* kafka: partitions of an append-only log */}
      <text x={100} y={99} textAnchor="end" className="plant-source-label">kafka</text>
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={110 + i * 9}
          y={86}
          width={7}
          height={18}
          rx={1.5}
          className={i === 3 ? 'plant-log-head' : 'plant-solid'}
        />
      ))}

      {/* s3 bucket */}
      <text x={100} y={157} textAnchor="end" className="plant-source-label">s3 files</text>
      <path d="M113,141 L117,166 Q128,170 139,166 L143,141 Z" className="plant-solid" />
      <ellipse cx={128} cy={141} rx={15} ry={4} className="plant-solid-top" />

      {/* rest api: iso cube */}
      <text x={100} y={210} textAnchor="end" className="plant-source-label">rest api</text>
      <polygon points="116,198 136,198 144,193 124,193" className="plant-solid-top" />
      <polygon points="136,198 144,193 144,213 136,218" className="plant-solid-side" />
      <rect x={116} y={198} width={20} height={20} className="plant-solid" />
      <text x={126} y={212} textAnchor="middle" className="plant-glyph">{'{}'}</text>
    </g>
  )
}

/** STG: glass box with gravel + sand filter beds; water comes out clear. */
function FilterBeds() {
  const x = 610
  const y = 86
  const w = 120
  const h = 134
  const d = 18 // iso depth
  return (
    <g>
      <Shadow cx={x + w / 2 + d / 2} rx={w * 0.6} />
      <polygon points={`${x},${y} ${x + w},${y} ${x + w + d},${y - d * 0.6} ${x + d},${y - d * 0.6}`} className="plant-glass-top" />
      <polygon points={`${x + w},${y} ${x + w + d},${y - d * 0.6} ${x + w + d},${y + h - d * 0.6} ${x + w},${y + h}`} className="plant-glass-side" />
      <clipPath id="clip-stg">
        <rect x={x} y={y} width={w} height={h} />
      </clipPath>
      <rect x={x} y={y} width={w} height={h} className="plant-glass" />
      <g clipPath="url(#clip-stg)">
        <g className="plant-bob">
          <rect x={x} y={114} width={w} height={70} style={{ fill: 'var(--w-stg)' }} className="plant-water" />
          <rect x={x} y={112} width={w} height={3} style={{ fill: 'var(--w-stg)' }} className="plant-surface" />
        </g>
        <rect x={x} y={178} width={w} height={18} className="plant-sand" />
        <rect x={x} y={196} width={w} height={24} className="plant-gravel" />
        <rect x={x} y={196} width={w} height={24} fill="url(#plant-gravel)" />
        <Bubbles xs={[x + 30, x + 75, x + 96]} from={176} to={118} />
      </g>
      <rect x={x + 8} y={y + 6} width={4} height={h - 12} rx={2} className="plant-highlight" />
      {/* tested ✓ badge */}
      <circle cx={x + w - 14} cy={y + 14} r={9} className="plant-badge" />
      <path d={`M${x + w - 18},${y + 14} l3,3 l6,-6`} className="plant-badge-check" />
    </g>
  )
}

/** INTERMEDIATE: mixing tank with a motor and a spinning vortex. */
function Mixer() {
  const cx = 840
  const top = 96
  const level = 132
  return (
    <g>
      <Tank id="int" cx={cx} top={top} w={96} h={124} level={level} water="var(--w)">
        <g className="plant-spin" style={{ transformOrigin: `${cx}px 182px` }}>
          <circle cx={cx} cy={182} r={18} className="plant-vortex" />
          <circle cx={cx} cy={182} r={9} className="plant-vortex" />
        </g>
      </Tank>
      <line x1={cx} x2={cx} y1={top - 6} y2={182} className="plant-shaft" />
      <rect x={cx - 13} y={top - 24} width={26} height={16} rx={3} className="plant-solid" />
      <rect x={cx - 5} y={top - 29} width={10} height={5} rx={1} className="plant-solid-top" />
    </g>
  )
}

/** DIM: tall silo with a dome and a ladder. */
function Silo() {
  const cx = 1010
  const top = 64
  const w = 70
  const rx = w / 2
  return (
    <g>
      <Tank id="dim" cx={cx} top={top} w={w} h={156} level={100} water="var(--w)" />
      <path d={`M${cx - rx},${top} A${rx},${rx * 0.75} 0 0 1 ${cx + rx},${top}`} className="plant-solid" />
      {/* ladder */}
      <line x1={cx + rx + 5} x2={cx + rx + 5} y1={top - 6} y2={220} className="plant-line" />
      <line x1={cx + rx + 11} x2={cx + rx + 11} y1={top - 6} y2={220} className="plant-line" />
      {Array.from({ length: 13 }, (_, i) => (
        <line key={i} x1={cx + rx + 5} x2={cx + rx + 11} y1={top + i * 12} y2={top + i * 12} className="plant-line" />
      ))}
    </g>
  )
}

/** FACT: wide capsule tank on legs. */
function FactTank() {
  const x = 1075
  const y = 150
  const w = 160
  const h = 66
  return (
    <g>
      <Shadow cx={x + w / 2} rx={w * 0.55} />
      <path d={`M${x + 30},${y + h} l-6,${GROUND - y - h} h14 l-2,${-(GROUND - y - h)} Z`} className="plant-solid" />
      <path d={`M${x + w - 30},${y + h} l6,${GROUND - y - h} h-14 l2,${-(GROUND - y - h)} Z`} className="plant-solid" />
      <clipPath id="clip-fact">
        <rect x={x} y={y} width={w} height={h} rx={h / 2} />
      </clipPath>
      <rect x={x} y={y} width={w} height={h} rx={h / 2} className="plant-glass" />
      <g clipPath="url(#clip-fact)">
        <g className="plant-bob">
          <rect x={x} y={170} width={w} height={60} style={{ fill: 'var(--w)' }} className="plant-water" />
          <rect x={x} y={168} width={w} height={3} style={{ fill: 'var(--w)' }} className="plant-surface" />
        </g>
        <Bubbles xs={[x + 40, x + 90, x + 128]} from={y + h + 4} to={174} />
      </g>
      {[x + 52, x + 108].map((rx) => (
        <rect key={rx} x={rx} y={y - 1} width={6} height={h + 2} rx={2} className="plant-band" />
      ))}
      <rect x={x + 18} y={y + 9} width={w - 36} height={3} rx={1.5} className="plant-highlight" />
    </g>
  )
}

/** REPORT: a dashboard screen with live bars. */
function ReportScreen() {
  const x = 1326
  const y = 82
  const w = 130
  const h = 90
  const bars = [34, 52, 28, 60, 44]
  return (
    <g>
      <Shadow cx={x + w / 2} rx={42} />
      <rect x={x + w / 2 - 6} y={y + h} width={12} height={GROUND - y - h - 8} className="plant-solid" />
      <ellipse cx={x + w / 2} cy={GROUND - 6} rx={30} ry={5} className="plant-solid-top" />
      <rect x={x} y={y} width={w} height={h} rx={9} className="plant-screen-frame" />
      <rect x={x + 6} y={y + 6} width={w - 12} height={h - 12} rx={5} className="plant-screen" />
      <polyline points={`${x + 14},${y + 30} ${x + 40},${y + 22} ${x + 66},${y + 28} ${x + 92},${y + 16} ${x + 116},${y + 20}`} className="plant-chart-line" />
      {bars.map((bh, i) => (
        <rect
          key={i}
          x={x + 16 + i * 21}
          y={y + h - 12 - bh * 0.75}
          width={12}
          height={bh * 0.75}
          rx={2}
          className="plant-bar"
          style={{ animationDelay: `${-i * 0.45}s` }}
        />
      ))}
    </g>
  )
}

/** The tap pours the served data into a glass — the users. */
function TapAndGlass() {
  return (
    <g>
      <rect x={1505} y={146} width={14} height={7} rx={2} className="plant-solid" />
      <circle cx={1512} cy={156} r={2.6} style={{ fill: 'var(--w)' }} className="plant-droplet">
        <animate attributeName="cy" values="156;206" dur="0.9s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1;1;0" dur="0.9s" repeatCount="indefinite" />
      </circle>
      <Shadow cx={1512} rx={22} />
      <clipPath id="clip-glass">
        <path d="M1495,182 L1499,232 H1525 L1529,182 Z" />
      </clipPath>
      <g clipPath="url(#clip-glass)">
        <rect x={1494} y={186} width={36} height={46} style={{ fill: 'var(--w)' }} className="plant-water plant-fill" />
      </g>
      <path d="M1495,182 L1499,232 H1525 L1529,182" className="plant-glass-outline" />
    </g>
  )
}

const CSS = `
.plant {
  color: var(--foreground);
  --stroke: color-mix(in srgb, var(--foreground) 30%, transparent);
  --stroke-soft: color-mix(in srgb, var(--foreground) 16%, transparent);
  --glass: color-mix(in srgb, var(--card) 55%, transparent);
  --solid: color-mix(in srgb, var(--foreground) 12%, var(--card));
  --solid-top: color-mix(in srgb, var(--foreground) 20%, var(--card));
  --solid-side: color-mix(in srgb, var(--foreground) 7%, var(--card));
  --mud: #9a7b4f;
  /* the water gets clearer stage by stage */
  --w-raw: color-mix(in srgb, var(--mud) 72%, var(--primary));
  --w-base: color-mix(in srgb, var(--mud) 42%, var(--primary));
  --w-stg: color-mix(in srgb, var(--mud) 12%, var(--primary));
  --w: var(--primary);
}
.plant-floor { color: var(--foreground); }
.plant-shadow { fill: color-mix(in srgb, var(--foreground) 8%, transparent); }

.plant-pipe { fill: none; stroke: color-mix(in srgb, var(--foreground) 13%, var(--background)); stroke-width: 8; stroke-linecap: round; }
.plant-current { fill: none; stroke-width: 2.5; stroke-linecap: round; opacity: 0.85;
  stroke-dasharray: 5 9; animation: plant-flow 1.1s linear infinite; }
.plant-droplet { opacity: 0.95; }

.plant-glass { fill: var(--glass); stroke: var(--stroke); stroke-width: 1.2; }
.plant-glass-top { fill: color-mix(in srgb, var(--foreground) 6%, var(--card)); stroke: var(--stroke); stroke-width: 1.2; opacity: 0.8; }
.plant-glass-side { fill: color-mix(in srgb, var(--foreground) 9%, var(--card)); stroke: var(--stroke); stroke-width: 1.2; opacity: 0.8; }
.plant-glass-outline { fill: none; stroke: var(--stroke); stroke-width: 1.4; stroke-linejoin: round; }
.plant-rim { fill: none; stroke: var(--stroke); stroke-width: 1.2; }
.plant-highlight { fill: color-mix(in srgb, white 35%, transparent); opacity: 0.35; }
.plant-water { opacity: 0.5; }
.plant-surface { opacity: 0.8; }
.plant-sediment circle { fill: color-mix(in srgb, var(--mud) 80%, black); opacity: 0.45; }
.plant-bubble { fill: color-mix(in srgb, white 80%, var(--primary)); opacity: 0; }

.plant-solid { fill: var(--solid); stroke: var(--stroke); stroke-width: 1.2; }
.plant-solid-top { fill: var(--solid-top); stroke: var(--stroke); stroke-width: 1.2; }
.plant-solid-side { fill: var(--solid-side); stroke: var(--stroke); stroke-width: 1.2; }
.plant-line { fill: none; stroke: var(--stroke); stroke-width: 1.2; }
.plant-band { fill: var(--solid-top); stroke: var(--stroke); stroke-width: 1; }
.plant-shaft { stroke: var(--stroke); stroke-width: 2; }
.plant-log-head { fill: var(--primary); opacity: 0.7; animation: plant-blink 1.6s ease-in-out infinite; }

.plant-sand { fill: color-mix(in srgb, #d9b97f 55%, var(--card)); }
.plant-gravel { fill: color-mix(in srgb, #8a7560 55%, var(--card)); }
.plant-gravel-dot { fill: color-mix(in srgb, var(--foreground) 30%, transparent); }
.plant-badge { fill: var(--primary); }
.plant-badge-check { fill: none; stroke: var(--primary-foreground); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.plant-vortex { fill: none; stroke: color-mix(in srgb, white 70%, var(--primary)); stroke-width: 1.5; stroke-dasharray: 10 7; opacity: 0.65; }

.plant-screen-frame { fill: var(--solid); stroke: var(--stroke); stroke-width: 1.2; }
.plant-screen { fill: color-mix(in srgb, var(--primary) 12%, var(--card)); }
.plant-chart-line { fill: none; stroke: var(--primary); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.plant-bar { fill: var(--primary); opacity: 0.75; transform-box: fill-box; transform-origin: bottom;
  animation: plant-bar 2.6s ease-in-out infinite; }

.plant-label { font: 600 13px var(--font-mono); letter-spacing: 0.18em; fill: var(--foreground); opacity: 0.75; }
.plant-caption { font: 400 11.5px var(--font-mono); fill: var(--muted-foreground); }
.plant-source-label { font: 400 12px var(--font-mono); fill: var(--muted-foreground); }
.plant-glyph { font: 600 9px var(--font-mono); fill: var(--foreground); opacity: 0.7; }

.plant-bob { animation: plant-bob 5s ease-in-out infinite; }
.plant-spin { animation: plant-spin 3.5s linear infinite; }
.plant-fill { transform-box: fill-box; transform-origin: bottom; animation: plant-fill 7s ease-in infinite; }

/* Short viewports: the plant renders small, so drop captions and enlarge names */
.plant-compact .plant-caption { display: none; }
.plant-compact .plant-label { font-size: 19px; letter-spacing: 0.12em; }
.plant-compact .plant-source-label { font-size: 16px; }

@keyframes plant-flow { to { stroke-dashoffset: -28; } }
@keyframes plant-bob { 50% { transform: translateY(2px); } }
@keyframes plant-spin { to { transform: rotate(360deg); } }
@keyframes plant-bar { 50% { transform: scaleY(0.6); } }
@keyframes plant-blink { 50% { opacity: 0.25; } }
@keyframes plant-fill { 0% { transform: scaleY(0.08); } 88% { transform: scaleY(1); } 100% { transform: scaleY(0.08); } }

@media (prefers-reduced-motion: reduce) {
  .plant * { animation: none !important; }
}
`
