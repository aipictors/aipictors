/**
 * Discord のレベルのロールアイコン（PNG 256px）を作る
 *
 * node scripts/discord/generate-level-icons.mjs <puppeteer-core のパス> <出力先>
 * 出力を R2 の assets/discord/level/<レベル>.png に置く。
 * Discord では 20px ほどで表示されるので、数字を大きく太くする
 */
import { mkdirSync } from "node:fs"
import { join } from "node:path"

const [puppeteerPath, outputDir] = process.argv.slice(2)
const { default: puppeteer } = await import(puppeteerPath)

const LEVELS = [
  [1, 1],
  [5, 1],
  [10, 2],
  [15, 2],
  [20, 3],
  [30, 3],
  [40, 4],
  [50, 4],
  [60, 5],
  [70, 5],
  [80, 6],
  [90, 6],
  [100, 7],
]

// 実績のバッジのランクの金属と同じ系統
const METALS = {
  1: { stops: ["#f7cfa3", "#c8814a", "#7d4520"], edge: "#3b1d08", text: "#fff6ea", shadow: "#3b1d08" },
  2: { stops: ["#ffffff", "#c3ccd6", "#6b7581"], edge: "#2a3038", text: "#1c2127", shadow: "#ffffff" },
  3: { stops: ["#fff3b0", "#f2bd2c", "#9a6a00"], edge: "#4a3000", text: "#3b2600", shadow: "#fff3b0" },
  4: { stops: ["#ffffff", "#bfe6f7", "#5f8ba5"], edge: "#23465c", text: "#123044", shadow: "#ffffff" },
  5: { stops: ["#d7fbff", "#39c5f2", "#1a4fd0"], edge: "#0b2373", text: "#ffffff", shadow: "#0b2373" },
  6: { stops: ["#f3d0ff", "#b14cff", "#4d13a8"], edge: "#22055a", text: "#ffffff", shadow: "#22055a" },
  7: { stops: ["#ffe08a", "#ff4d6d", "#7b2ff7"], edge: "#2c0746", text: "#ffffff", shadow: "#2c0746" },
}

const toSvg = (level, tier) => {
  const metal = METALS[tier]
  const text = String(level)
  const fontSize = text.length >= 3 ? 118 : text.length === 2 ? 150 : 176
  return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <defs>
    <linearGradient id="m" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="0" stop-color="${metal.stops[0]}"/>
      <stop offset="0.5" stop-color="${metal.stops[1]}"/>
      <stop offset="1" stop-color="${metal.stops[2]}"/>
    </linearGradient>
    <linearGradient id="s" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.55"/>
      <stop offset="0.55" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <path d="M128 6 L234 66 V190 L128 250 L22 190 V66 Z" fill="${metal.edge}"/>
  <path d="M128 22 L220 74 V182 L128 234 L36 182 V74 Z" fill="url(#m)"/>
  <path d="M128 22 L220 74 V128 Q128 104 36 128 V74 Z" fill="url(#s)"/>
  <text x="128" y="132" text-anchor="middle" dominant-baseline="central"
    font-family="'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="${fontSize}"
    letter-spacing="-6" fill="${metal.text}" stroke="${metal.shadow}" stroke-width="5"
    paint-order="stroke" stroke-opacity="0.55">${text}</text>
</svg>`
}

mkdirSync(outputDir, { recursive: true })
const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
})
const page = await browser.newPage()
await page.setViewport({ width: 256, height: 256 })
for (const [level, tier] of LEVELS) {
  await page.setContent(
    `<!doctype html><html><body style="margin:0;background:transparent">${toSvg(level, tier)}</body></html>`,
  )
  await page.screenshot({
    path: join(outputDir, `${level}.png`),
    omitBackground: true,
    clip: { x: 0, y: 0, width: 256, height: 256 },
  })
}
await browser.close()
console.log(`wrote ${LEVELS.length} icons to ${outputDir}`)
