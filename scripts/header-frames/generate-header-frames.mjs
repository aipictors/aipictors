/**
 * ヘッダーの枠の画像を作る（header-frames.mjs の SVG を Chrome で PNG にする）
 *
 * node scripts/header-frames/generate-header-frames.mjs <puppeteer-core のパス> <PNG の出力先> [slug...]
 *
 * <出力先>/<slug>.<pc|sp>/00.png〜 ができる。WebP にまとめるのは pack-header-frames.py
 */
import { mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { HEADER_FRAME_VARIANTS, HEADER_FRAMES } from "./header-frames.mjs"

const [puppeteerPath, outputDir, ...slugs] = process.argv.slice(2)
const { default: puppeteer } = await import(puppeteerPath)

const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
})
const page = await browser.newPage()

const targets = slugs.length > 0 ? HEADER_FRAMES.filter((item) => slugs.includes(item.slug)) : HEADER_FRAMES

for (const item of targets) {
  for (const [variant, size] of Object.entries(HEADER_FRAME_VARIANTS)) {
    const dir = join(outputDir, `${item.slug}.${variant}`)
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, "meta.json"), JSON.stringify({ frameMs: item.frameMs }))
    await page.setViewport({ width: size.w, height: size.h })
    for (let frame = 0; frame < item.frames; frame++) {
      const svg = item.draw(frame / item.frames, size)
      await page.setContent(
        `<!doctype html><html><body style="margin:0;background:transparent">${svg.replace("<svg ", `<svg width="${size.w}" height="${size.h}" style="display:block" `)}</body></html>`,
      )
      await page.screenshot({
        path: join(dir, `${String(frame).padStart(2, "0")}.png`),
        omitBackground: true,
        clip: { x: 0, y: 0, width: size.w, height: size.h },
      })
    }
    console.log(`${item.slug}.${variant}`)
  }
}
await browser.close()
