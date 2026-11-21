/**
 * ヘッダーの枠の画像を作る（header-frames.mjs の SVG を Chrome で PNG にする）
 *
 * node scripts/header-frames/generate-header-frames.mjs <puppeteer-core のパス> <PNG の出力先> [slug...]
 *
 * <出力先>/<slug>.<pc|sp>/base.png（止まった絵）と 00.png〜（動くものだけ）ができる。WebP にまとめるのは pack-header-frames.py
 * PICTOR_CHAN=off を付けると、ぴくたーちゃんの入った枠だけを「なし」で描いて <出力先>/<slug>.<pc|sp>.nopictor/base.png に出す
 * （ぴくたーちゃんは止まった絵にしかいないので、動く絵は「あり」と同じものを使う）
 */
import { mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { PICTOR_CHAN_OFF } from "../avatar-frames/pictor-chan.mjs"
import { HEADER_FRAME_VARIANTS, HEADER_FRAMES } from "./header-frames.mjs"

const [puppeteerPath, outputDir, ...slugs] = process.argv.slice(2)
const { default: puppeteer } = await import(puppeteerPath)

const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
})
const page = await browser.newPage()

const targets = (slugs.length > 0 ? HEADER_FRAMES.filter((item) => slugs.includes(item.slug)) : HEADER_FRAMES).filter((item) => !PICTOR_CHAN_OFF || item.pictor)

for (const item of targets) {
  for (const [variant, size] of Object.entries(HEADER_FRAME_VARIANTS)) {
    const dir = join(outputDir, `${item.slug}.${variant}${PICTOR_CHAN_OFF ? ".nopictor" : ""}`)
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, "meta.json"), JSON.stringify({ frameMs: item.frameMs }))
    await page.setViewport({ width: size.w, height: size.h })
    const shot = async (svg, name) => {
      await page.setContent(
        `<!doctype html><html><body style="margin:0;background:transparent">${svg.replace("<svg ", `<svg width="${size.w}" height="${size.h}" style="display:block" `)}</body></html>`,
      )
      await page.screenshot({ path: join(dir, name), omitBackground: true, clip: { x: 0, y: 0, width: size.w, height: size.h } })
    }
    // 宝石のきらめきなど止まった絵の中の t は、4 コマ目に合わせる
    await shot(item.draw(4 / item.frames, size, "base"), "base.png")
    if (PICTOR_CHAN_OFF) {
      console.log(`${item.slug}.${variant}.nopictor`)
      continue
    }
    for (let frame = 0; frame < item.frames; frame++) {
      await shot(item.draw(frame / item.frames, size, "motion"), `${String(frame).padStart(2, "0")}.png`)
    }
    console.log(`${item.slug}.${variant}`)
  }
}
await browser.close()
