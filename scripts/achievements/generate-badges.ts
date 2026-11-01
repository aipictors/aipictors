/**
 * 実績のバッジ画像（SVG）を作る
 *
 * bun scripts/achievements/generate-badges.ts [--preview <png のパス>]
 *
 * - 実績の一覧は app/lib/achievements/achievement-catalog.json（aipictors-system の
 *   scripts/export-achievement-catalog.ts で書き出す）
 * - 出力: public/achievements/badges/<key>.svg（と、隠し実績の hidden.svg）
 * - 形は分類（創作=六角形 / 交流=円 / ログイン=盾 / 特別=ロゼット）、
 *   枠の金属はランク（ブロンズ〜レジェンド）、中の色は種類ごと
 * - --preview を付けると、全バッジを並べた PNG を書き出す（見た目の確認用）
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"

type CatalogItem = {
  key: string
  category: "CREATE" | "COMMUNITY" | "LOGIN" | "SPECIAL"
  series: string
  tier: 1 | 2 | 3 | 4 | 5 | 6
  icon: string
  threshold: number | null
  isHidden: boolean
}

type IconNode = [string, Record<string, string>][]

const root = resolve(import.meta.dir, "../..")
const catalog: CatalogItem[] = JSON.parse(
  readFileSync(
    resolve(root, "app/lib/achievements/achievement-catalog.json"),
    "utf8",
  ),
)
const outputDir = resolve(root, "public/achievements/badges")

/* ------------------------------------------------------------------ */
/* 色                                                                  */
/* ------------------------------------------------------------------ */

/** ランクごとの金属（上から下へのグラデーション） */
const METALS: Record<number, { stops: string[]; edge: string; text: string }> =
  {
    1: {
      stops: ["#f3c08e", "#c8814a", "#8a5129", "#d9925a", "#6b3a1a"],
      edge: "#4a260f",
      text: "#3b1d08",
    },
    2: {
      stops: ["#ffffff", "#d7dde4", "#8d97a3", "#e9edf2", "#5f6873"],
      edge: "#3c434c",
      text: "#2a3038",
    },
    3: {
      stops: ["#fff6c4", "#f6cc4a", "#b07d0c", "#ffe27a", "#7a5300"],
      edge: "#5a3b00",
      text: "#4a3000",
    },
    4: {
      stops: ["#ffffff", "#d6ecf7", "#8fb0c4", "#f2fbff", "#56758a"],
      edge: "#2f4a5c",
      text: "#1f3646",
    },
    5: {
      stops: ["#f0fdff", "#7fe7ff", "#2a8fd6", "#c9f6ff", "#1c4fa8"],
      edge: "#0e2f6e",
      text: "#0b2559",
    },
    6: {
      stops: ["#ff8fab", "#ffd166", "#7bf1a8", "#6ecbff", "#c39bff"],
      edge: "#3b1a5c",
      text: "#2a0f47",
    },
  }

/** 種類ごとの中の色（内側→外側） */
const SERIES_COLORS: Record<string, [string, string]> = {
  works: ["#a78bfa", "#5b21b6"],
  "likes-received": ["#fb7185", "#9f1239"],
  "views-received": ["#fbbf24", "#b45309"],
  followers: ["#38bdf8", "#075985"],
  awards: ["#f87171", "#7f1d1d"],
  themes: ["#a3e635", "#3f6212"],
  generations: ["#818cf8", "#312e81"],
  "likes-given": ["#f9a8d4", "#9d174d"],
  "views-given": ["#2dd4bf", "#115e59"],
  "comments-given": ["#4ade80", "#166534"],
  following: ["#60a5fa", "#1e3a8a"],
  "login-days": ["#22d3ee", "#155e75"],
  "login-streak": ["#fb923c", "#9a3412"],
  "account-age": ["#f0abfc", "#86198f"],
  "special-profile-icon": ["#7dd3fc", "#0369a1"],
  "special-profile-biography": ["#6ee7b7", "#047857"],
  "special-plan-member": ["#c084fc", "#4c1d95"],
  "special-comeback": ["#5eead4", "#0f766e"],
  "special-night-owl": ["#6366f1", "#1e1b4b"],
  "special-early-bird": ["#fdba74", "#c2410c"],
  "special-new-year": ["#fca5a5", "#991b1b"],
  "special-valentine": ["#f9a8d4", "#be185d"],
  "special-tanabata": ["#93c5fd", "#1e1b4b"],
  "special-halloween": ["#fdba74", "#581c87"],
  "special-christmas": ["#86efac", "#14532d"],
}

/* ------------------------------------------------------------------ */
/* 形                                                                  */
/* ------------------------------------------------------------------ */

const CX = 128
const CY = 122

const round = (value: number) => Math.round(value * 100) / 100

function polygon(points: [number, number][]) {
  return `M${points.map(([x, y]) => `${round(x)} ${round(y)}`).join(" L")} Z`
}

/** 角を丸めた多角形 */
function roundedPolygon(points: [number, number][], radius: number) {
  const n = points.length
  let d = ""
  for (let i = 0; i < n; i++) {
    const prev = points[(i - 1 + n) % n]
    const current = points[i]
    const next = points[(i + 1) % n]
    if (!prev || !current || !next) continue
    const toPrev = [prev[0] - current[0], prev[1] - current[1]]
    const toNext = [next[0] - current[0], next[1] - current[1]]
    const lenPrev = Math.hypot(toPrev[0] ?? 0, toPrev[1] ?? 0)
    const lenNext = Math.hypot(toNext[0] ?? 0, toNext[1] ?? 0)
    const r = Math.min(radius, lenPrev / 2, lenNext / 2)
    const start = [
      current[0] + ((toPrev[0] ?? 0) / lenPrev) * r,
      current[1] + ((toPrev[1] ?? 0) / lenPrev) * r,
    ]
    const end = [
      current[0] + ((toNext[0] ?? 0) / lenNext) * r,
      current[1] + ((toNext[1] ?? 0) / lenNext) * r,
    ]
    d += `${i === 0 ? "M" : "L"}${round(start[0] ?? 0)} ${round(start[1] ?? 0)} Q${round(current[0])} ${round(current[1])} ${round(end[0] ?? 0)} ${round(end[1] ?? 0)} `
  }
  return `${d}Z`
}

function regularPoints(
  count: number,
  radius: number,
  offsetDeg: number,
): [number, number][] {
  return Array.from({ length: count }, (_, i) => {
    const angle = ((offsetDeg + (360 / count) * i) * Math.PI) / 180
    return [CX + radius * Math.cos(angle), CY + radius * Math.sin(angle)]
  })
}

function shapePath(category: CatalogItem["category"], scale: number) {
  switch (category) {
    case "CREATE":
      return roundedPolygon(regularPoints(6, 92 * scale, -90), 14 * scale)
    case "COMMUNITY": {
      const r = 86 * scale
      return `M${CX - r} ${CY} a${r} ${r} 0 1 0 ${r * 2} 0 a${r} ${r} 0 1 0 ${-r * 2} 0 Z`
    }
    case "LOGIN": {
      // 盾
      const s = scale
      const top = CY - 88 * s
      const bottom = CY + 92 * s
      const half = 78 * s
      return [
        `M${CX} ${round(top)}`,
        `C${round(CX + half * 0.55)} ${round(top + 16 * s)} ${round(CX + half * 0.85)} ${round(top + 18 * s)} ${round(CX + half)} ${round(top + 14 * s)}`,
        `L${round(CX + half)} ${round(CY + 6 * s)}`,
        `C${round(CX + half)} ${round(CY + 56 * s)} ${round(CX + 36 * s)} ${round(bottom - 18 * s)} ${CX} ${round(bottom)}`,
        `C${round(CX - 36 * s)} ${round(bottom - 18 * s)} ${round(CX - half)} ${round(CY + 56 * s)} ${round(CX - half)} ${round(CY + 6 * s)}`,
        `L${round(CX - half)} ${round(top + 14 * s)}`,
        `C${round(CX - half * 0.85)} ${round(top + 18 * s)} ${round(CX - half * 0.55)} ${round(top + 16 * s)} ${CX} ${round(top)} Z`,
      ].join(" ")
    }
    case "SPECIAL": {
      // ロゼット（ぎざぎざの丸）
      const points: [number, number][] = []
      const count = 32
      for (let i = 0; i < count; i++) {
        const radius = (i % 2 === 0 ? 92 : 84) * scale
        const angle = ((-90 + (360 / count) * i) * Math.PI) / 180
        points.push([CX + radius * Math.cos(angle), CY + radius * Math.sin(angle)])
      }
      return roundedPolygon(points, 3 * scale)
    }
  }
}

/** 4 本の光（きらめき） */
function sparkle(x: number, y: number, size: number, opacity: number) {
  const s = size
  return `<path d="M${x} ${y - s} Q${x + s * 0.18} ${y - s * 0.18} ${x + s} ${y} Q${x + s * 0.18} ${y + s * 0.18} ${x} ${y + s} Q${x - s * 0.18} ${y + s * 0.18} ${x - s} ${y} Q${x - s * 0.18} ${y - s * 0.18} ${x} ${y - s} Z" fill="#fff" opacity="${opacity}"/>`
}

/** 月桂冠（左右の枝。下から上へ、外向きに葉を並べる） */
function laurel(fill: string, stroke: string) {
  const leaves: string[] = []
  const radius = 104
  const count = 9
  for (const side of [-1, 1]) {
    // 茎
    const stemStart = 100
    const stemEnd = 222
    const toPoint = (deg: number, r: number) => {
      const phi = side === -1 ? deg : 180 - deg
      const rad = (phi * Math.PI) / 180
      return [CX + r * Math.cos(rad), CY + 8 + r * Math.sin(rad)] as const
    }
    const [sx, sy] = toPoint(stemStart, radius - 4)
    const [ex, ey] = toPoint(stemEnd, radius - 4)
    leaves.push(
      `<path d="M${round(sx)} ${round(sy)} A${radius - 4} ${radius - 4} 0 0 ${side === -1 ? 1 : 0} ${round(ex)} ${round(ey)}" fill="none" stroke="${stroke}" stroke-width="3" stroke-linecap="round"/>`,
    )
    for (let i = 0; i < count; i++) {
      const deg = stemStart + 8 + ((stemEnd - stemStart - 8) / (count - 1)) * i
      for (const offset of [-1, 1]) {
        const [x, y] = toPoint(deg, radius - 4 + offset * 9)
        const phi = side === -1 ? deg : 180 - deg
        // 茎に沿って、上に向かって少し外へ開く
        const rotate = phi + (side === -1 ? 1 : -1) * (offset * 28) + 180 * (side === -1 ? 0 : 1)
        const size = 1 - i * 0.035
        leaves.push(
          `<ellipse cx="${round(x)}" cy="${round(y)}" rx="${round(5.5 * size)}" ry="${round(13 * size)}" transform="rotate(${round(rotate)} ${round(x)} ${round(y)})" fill="${fill}" stroke="${stroke}" stroke-width="1.4"/>`,
        )
      }
    }
  }
  return `<g>${leaves.join("")}</g>`
}

/** 後ろの光の筋 */
function rays(color: string, count: number) {
  const items: string[] = []
  for (let i = 0; i < count; i++) {
    const angle = (360 / count) * i
    items.push(
      `<path d="M${CX} ${CY} L${CX - 9} ${CY - 126} L${CX + 9} ${CY - 126} Z" fill="${color}" transform="rotate(${angle} ${CX} ${CY})"/>`,
    )
  }
  return `<g opacity="0.35">${items.join("")}</g>`
}

function crown(metalId: string, edge: string) {
  return `<g transform="translate(${CX - 30} ${CY - 128})">
    <path d="M4 34 L0 8 L16 20 L30 0 L44 20 L60 8 L56 34 Z" fill="url(#${metalId})" stroke="${edge}" stroke-width="2.5" stroke-linejoin="round"/>
    <rect x="4" y="32" width="52" height="8" rx="3" fill="url(#${metalId})" stroke="${edge}" stroke-width="2.5"/>
    <circle cx="30" cy="22" r="4" fill="#ff4d8d" stroke="${edge}" stroke-width="1.5"/>
    <circle cx="14" cy="26" r="2.5" fill="#4dd2ff"/>
    <circle cx="46" cy="26" r="2.5" fill="#4dd2ff"/>
  </g>`
}

function ribbonTails(colors: [string, string], edge: string) {
  const [, dark] = colors
  return `<g>
    <path d="M${CX - 46} ${CY + 52} L${CX - 66} ${CY + 122} L${CX - 50} ${CY + 112} L${CX - 38} ${CY + 128} L${CX - 18} ${CY + 60} Z" fill="${dark}" stroke="${edge}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M${CX + 46} ${CY + 52} L${CX + 66} ${CY + 122} L${CX + 50} ${CY + 112} L${CX + 38} ${CY + 128} L${CX + 18} ${CY + 60} Z" fill="${dark}" stroke="${edge}" stroke-width="2" stroke-linejoin="round"/>
  </g>`
}

/* ------------------------------------------------------------------ */
/* アイコン（lucide）                                                   */
/* ------------------------------------------------------------------ */

async function loadIcon(name: string): Promise<IconNode> {
  const module = await import(
    resolve(root, `node_modules/lucide-react/dist/esm/icons/${name}.js`)
  )
  return module.__iconNode as IconNode
}

function renderIcon(node: IconNode) {
  return node
    .map(([tag, attrs]) => {
      const attributes = Object.entries(attrs)
        .filter(([key]) => key !== "key")
        .map(([key, value]) => `${key}="${value}"`)
        .join(" ")
      return `<${tag} ${attributes}/>`
    })
    .join("")
}

/* ------------------------------------------------------------------ */
/* 数のラベル                                                           */
/* ------------------------------------------------------------------ */

function formatThreshold(item: CatalogItem): { value: string; unit: string } {
  const n = item.threshold
  if (n === null) return { value: "", unit: "" }
  if (item.series === "account-age") {
    if (n >= 365 && n % 365 === 0) return { value: `${n / 365}`, unit: "YEAR" }
    return { value: `${n}`, unit: "DAYS" }
  }
  const compact =
    n >= 1_000_000
      ? `${n / 1_000_000}M`
      : n >= 1000
        ? `${Number.isInteger(n / 1000) ? n / 1000 : (n / 1000).toFixed(1)}K`
        : `${n}`
  const unit =
    item.series === "login-days"
      ? "DAYS"
      : item.series === "login-streak"
        ? "STREAK"
        : ""
  return { value: compact, unit }
}

/* ------------------------------------------------------------------ */
/* バッジ                                                               */
/* ------------------------------------------------------------------ */

function renderBadge(item: CatalogItem, icon: IconNode) {
  const id = item.key.replace(/[^a-z0-9]/g, "")
  const metal = METALS[item.tier] ?? METALS[1]
  const colors = SERIES_COLORS[item.series] ?? ["#a1a1aa", "#3f3f46"]
  const metalId = `m${id}`
  const metalDarkId = `md${id}`
  const fieldId = `f${id}`
  const glossId = `g${id}`
  const shadowId = `s${id}`
  const clipId = `c${id}`
  const outer = shapePath(item.category, 1)
  const rim = shapePath(item.category, 0.9)
  const field = shapePath(item.category, 0.8)
  const label = formatThreshold(item)
  const hasLabel = label.value !== ""
  const isLegend = item.tier === 6

  const metalStops = metal.stops
    .map(
      (color, index) =>
        `<stop offset="${round(index / (metal.stops.length - 1))}" stop-color="${color}"/>`,
    )
    .join("")

  // レジェンドの虹は、ゆっくり流れる
  const legendAnimation = isLegend
    ? `<animateTransform attributeName="gradientTransform" type="rotate" from="0 0.5 0.5" to="360 0.5 0.5" dur="8s" repeatCount="indefinite"/>`
    : ""

  const sparkles: string[] = []
  if (item.tier >= 3) sparkles.push(sparkle(CX + 58, CY - 70, 9, 0.95))
  if (item.tier >= 4) sparkles.push(sparkle(CX - 66, CY - 52, 6, 0.85))
  if (item.tier >= 5) {
    sparkles.push(sparkle(CX + 74, CY + 30, 7, 0.9))
    sparkles.push(sparkle(CX - 40, CY - 86, 4.5, 0.8))
  }
  if (item.tier >= 6) {
    sparkles.push(sparkle(CX - 82, CY + 18, 8, 0.95))
    sparkles.push(sparkle(CX + 30, CY - 96, 5, 0.9))
  }

  // 中の模様（放射状の線）
  const pattern = Array.from({ length: 24 }, (_, i) => {
    const angle = (360 / 24) * i
    return `<path d="M${CX} ${CY} L${CX - 4} ${CY - 120} L${CX + 4} ${CY - 120} Z" transform="rotate(${angle} ${CX} ${CY})"/>`
  }).join("")

  const iconSize = hasLabel ? 84 : 96
  const iconY = hasLabel ? CY - iconSize / 2 - 12 : CY - iconSize / 2
  const iconScale = iconSize / 24

  const plaqueWidth = Math.max(70, 28 + label.value.length * 17 + (label.unit ? 6 : 0))
  const plaqueY = CY + 48

  const plaque = hasLabel
    ? `<g>
      <path d="M${CX - plaqueWidth / 2 - 12} ${plaqueY + 2} L${CX - plaqueWidth / 2} ${plaqueY + 15} L${CX - plaqueWidth / 2 - 12} ${plaqueY + 28} L${CX - plaqueWidth / 2 + 6} ${plaqueY + 28} L${CX - plaqueWidth / 2 + 6} ${plaqueY + 2} Z" fill="url(#${metalDarkId})" stroke="${metal.edge}" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M${CX + plaqueWidth / 2 + 12} ${plaqueY + 2} L${CX + plaqueWidth / 2} ${plaqueY + 15} L${CX + plaqueWidth / 2 + 12} ${plaqueY + 28} L${CX + plaqueWidth / 2 - 6} ${plaqueY + 28} L${CX + plaqueWidth / 2 - 6} ${plaqueY + 2} Z" fill="url(#${metalDarkId})" stroke="${metal.edge}" stroke-width="1.5" stroke-linejoin="round"/>
      <rect x="${CX - plaqueWidth / 2}" y="${plaqueY - 4}" width="${plaqueWidth}" height="${label.unit ? 40 : 34}" rx="9" fill="url(#${metalId})" stroke="${metal.edge}" stroke-width="2.5"/>
      <rect x="${CX - plaqueWidth / 2 + 4}" y="${plaqueY}" width="${plaqueWidth - 8}" height="6" rx="3" fill="#fff" opacity="0.35"/>
      <text x="${CX}" y="${plaqueY + 23}" text-anchor="middle" font-family="'Arial Black','Helvetica Neue',Arial,sans-serif" font-weight="900" font-size="26" letter-spacing="0.5" fill="${metal.text}">${label.value}</text>
      ${label.unit ? `<text x="${CX}" y="${plaqueY + 33}" text-anchor="middle" font-family="'Helvetica Neue',Arial,sans-serif" font-weight="800" font-size="8" letter-spacing="2" fill="${metal.text}" opacity="0.85">${label.unit}</text>` : ""}
    </g>`
    : ""

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img">
  <defs>
    <linearGradient id="${metalId}" x1="0" y1="0" x2="${isLegend ? 1 : 0.35}" y2="1">${metalStops}${legendAnimation}</linearGradient>
    <linearGradient id="${metalDarkId}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${metal.stops[2]}"/><stop offset="1" stop-color="${metal.stops[4]}"/></linearGradient>
    <radialGradient id="${fieldId}" cx="0.5" cy="0.38" r="0.7"><stop offset="0" stop-color="${colors[0]}"/><stop offset="1" stop-color="${colors[1]}"/></radialGradient>
    <linearGradient id="${glossId}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <filter id="${shadowId}" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000" flood-opacity="0.35"/></filter>
    <clipPath id="${clipId}"><path d="${field}"/></clipPath>
  </defs>
  ${item.tier >= 5 ? rays(isLegend ? "#ffe08a" : metal.stops[1] ?? "#fff", isLegend ? 18 : 12) : ""}
  ${item.tier >= 4 ? laurel(`url(#${metalId})`, metal.edge) : ""}
  ${item.tier >= 3 ? ribbonTails(colors, metal.edge) : ""}
  <g filter="url(#${shadowId})">
    <path d="${outer}" fill="url(#${metalId})" stroke="${metal.edge}" stroke-width="3" stroke-linejoin="round"/>
  </g>
  <path d="${rim}" fill="none" stroke="${metal.edge}" stroke-opacity="0.55" stroke-width="2"/>
  <path d="${rim}" fill="none" stroke="#fff" stroke-opacity="0.35" stroke-width="1" transform="translate(0 1.5)"/>
  <path d="${field}" fill="url(#${fieldId})"/>
  <g clip-path="url(#${clipId})">
    <g fill="#fff" opacity="0.08">${pattern}</g>
    <ellipse cx="${CX}" cy="${CY - 40}" rx="80" ry="46" fill="url(#${glossId})" opacity="0.6"/>
  </g>
  <path d="${field}" fill="none" stroke="#000" stroke-opacity="0.25" stroke-width="2"/>
  <g transform="translate(${CX - iconSize / 2} ${iconY}) scale(${round(iconScale)})" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <g stroke="#000" stroke-opacity="0.28" stroke-width="2.6" transform="translate(0 0.45)">${renderIcon(icon)}</g>
    <g stroke="#fff" stroke-width="2">${renderIcon(icon)}</g>
  </g>
  ${plaque}
  ${isLegend ? crown(metalId, metal.edge) : ""}
  ${sparkles.join("")}
</svg>
`
}

/** 隠し実績（未達成）のバッジ */
function renderHiddenBadge() {
  const outer = shapePath("SPECIAL", 1)
  const field = shapePath("SPECIAL", 0.8)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img">
  <defs>
    <linearGradient id="hm" x1="0" y1="0" x2="0.35" y2="1"><stop offset="0" stop-color="#9ca3af"/><stop offset="0.5" stop-color="#4b5563"/><stop offset="1" stop-color="#1f2937"/></linearGradient>
    <radialGradient id="hf" cx="0.5" cy="0.4" r="0.7"><stop offset="0" stop-color="#374151"/><stop offset="1" stop-color="#111827"/></radialGradient>
  </defs>
  <path d="${outer}" fill="url(#hm)" stroke="#111827" stroke-width="3" stroke-linejoin="round"/>
  <path d="${field}" fill="url(#hf)"/>
  <text x="${CX}" y="${CY + 30}" text-anchor="middle" font-family="'Arial Black','Helvetica Neue',Arial,sans-serif" font-weight="900" font-size="96" fill="#9ca3af">?</text>
</svg>
`
}

async function main() {
  mkdirSync(outputDir, { recursive: true })

  const icons = new Map<string, IconNode>()
  for (const item of catalog) {
    if (!icons.has(item.icon)) icons.set(item.icon, await loadIcon(item.icon))
  }

  const files: { key: string; svg: string }[] = []
  for (const item of catalog) {
    const icon = icons.get(item.icon)
    if (icon === undefined) throw new Error(`icon not found: ${item.icon}`)
    const svg = renderBadge(item, icon)
    writeFileSync(resolve(outputDir, `${item.key}.svg`), svg)
    files.push({ key: item.key, svg })
  }
  const hidden = renderHiddenBadge()
  writeFileSync(resolve(outputDir, "hidden.svg"), hidden)
  files.push({ key: "hidden", svg: hidden })

  console.log(`${files.length} 枚 → ${outputDir}`)

  const previewIndex = process.argv.indexOf("--preview")
  if (previewIndex !== -1) {
    const previewPath = resolve(process.argv[previewIndex + 1] ?? "badges.png")
    const sharp = (await import("sharp")).default
    const size = 128
    const columns = 15
    const rows = Math.ceil(files.length / columns)
    const tiles = await Promise.all(
      files.map(async (file, index) => ({
        input: await sharp(Buffer.from(file.svg)).resize(size, size).png().toBuffer(),
        left: (index % columns) * size,
        top: Math.floor(index / columns) * size,
      })),
    )
    mkdirSync(dirname(previewPath), { recursive: true })
    await sharp({
      create: {
        width: columns * size,
        height: rows * size,
        channels: 4,
        background: { r: 24, g: 24, b: 27, alpha: 1 },
      },
    })
      .composite(tiles)
      .png()
      .toFile(previewPath)
    console.log(`プレビュー → ${previewPath}`)
  }
}

await main()
