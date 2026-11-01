/**
 * アイコンの装飾の画像を作る（decorations.mjs の SVG を Chrome で PNG にする）
 *
 * node scripts/avatar-frames/generate-decorations.mjs <puppeteer-core のパス> <PNG の出力先> [slug...]
 *
 * <出力先>/<slug>/00.png〜 ができる。WebP にまとめるのは pack-decorations.py
 */
import { mkdirSync } from "node:fs"
import { join } from "node:path"
import { DECORATIONS } from "./decorations.mjs"

const [puppeteerPath, outputDir, ...slugs] = process.argv.slice(2)
const { default: puppeteer } = await import(puppeteerPath)

const SIZE = 384
const FRAMES = 24

const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
})
const page = await browser.newPage()
await page.setViewport({ width: SIZE, height: SIZE })

const targets =
  slugs.length > 0
    ? DECORATIONS.filter((item) => slugs.includes(item.slug))
    : DECORATIONS

for (const item of targets) {
  const dir = join(outputDir, item.slug)
  mkdirSync(dir, { recursive: true })
  for (let frame = 0; frame < FRAMES; frame++) {
    const svg = item.draw(frame / FRAMES)
    await page.setContent(
      `<!doctype html><html><body style="margin:0;background:transparent;width:${SIZE}px;height:${SIZE}px">${svg.replace("<svg ", `<svg width="${SIZE}" height="${SIZE}" `)}</body></html>`,
    )
    await page.screenshot({
      path: join(dir, `${String(frame).padStart(2, "0")}.png`),
      omitBackground: true,
      clip: { x: 0, y: 0, width: SIZE, height: SIZE },
    })
  }
  console.log(item.slug)
}
await browser.close()
