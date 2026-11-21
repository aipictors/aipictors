/**
 * 枠に入れるぴくたーちゃんの絵（スタンプ用に LoRA で生成した絵から、文字なしで切り抜いたもの）。
 * SVG の <image> に WebP をそのまま埋め込む。白いふちと薄い影は filter で付ける
 */
import { readFileSync } from "node:fs"

/** 絵の元の大きさ（幅・高さ） */
const SIZES = {
  hello: [217, 320],
  thanks: [252, 320],
  wow: [240, 320],
  love: [229, 320],
  nice: [246, 320],
}

const cache = {}
const uri = (name) => {
  cache[name] ??= `data:image/webp;base64,${readFileSync(new URL(`./pictor-chan/${name}.webp`, import.meta.url)).toString("base64")}`
  return cache[name]
}

const f = (n) => Number(n.toFixed(2))

/** 白いふちと足もとの影。r はふちの太さ */
export const pictorOutlineDef = (id = "pcOut", r = 3) =>
  `<filter id="${id}" x="-15%" y="-15%" width="130%" height="130%" color-interpolation-filters="sRGB"><feMorphology in="SourceAlpha" operator="dilate" radius="${r}" result="d"/><feFlood flood-color="#fff"/><feComposite in2="d" operator="in" result="o"/><feGaussianBlur in="d" stdDeviation="${r}" result="b"/><feOffset in="b" dy="${f(r * 0.8)}" result="bo"/><feFlood flood-color="#1a1030" flood-opacity=".35"/><feComposite in2="bo" operator="in" result="s"/><feMerge><feMergeNode in="s"/><feMergeNode in="o"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`

/** ぴくたーちゃん。(x, y) が足もと、h が高さ */
export const pictorChan = (name, x, y, h, { rot = 0, filter = "pcOut" } = {}) => {
  const [w0, h0] = SIZES[name]
  const w = (w0 * h) / h0
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)})"><image href="${uri(name)}" x="${f(-w / 2)}" y="${f(-h)}" width="${f(w)}" height="${f(h)}" filter="url(#${filter})"/></g>`
}
