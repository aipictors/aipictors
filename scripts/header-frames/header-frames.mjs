/**
 * プロフィールのヘッダーの枠（SVG）。ヘッダー画像の上に重ねる。
 * 真ん中は空けて、飾りはふちと角に集める（その人のヘッダー画像を隠さないように）。
 * 比率はスマホ 5:2（1000×400）と PC 3:1（1200×400）の 2 枚を作る。どちらも高さは 400 で、
 * 角の飾りは同じ大きさ・同じ位置に置き、横に長い分だけ辺が伸びる（引き伸ばさないので絵がゆがまない）。
 * t は 0〜1 のループの位置。最初と最後が同じ絵になるように作る
 *
 * 軽くするために 2 枚に分ける。base は止まった絵（ふち・角の飾り・光）、motion は動くものだけ（花びら・粒・きらめき）。
 * 画面では base の上に motion を重ねる。motion はほとんど透明なので、動く絵でも軽くなる。
 * layer に "base" / "motion" / "all" を渡す（all は確認用の 1 枚絵）
 */
import { PARTS } from "../avatar-frames/decorations.mjs"
import { pictorChan, pictorOutlineDef } from "../avatar-frames/pictor-chan.mjs"

const { f, rng, wave, place, sparkle, glint, flash, heart, blossom, looseP, goldBlossom, star5, setGem, bezelDef, PEARL_DEF, METAL, GEM, PRISM, prismAt, mixHex, lg, TAU } = PARTS

const H = 400

/** 枠の比率。rad は角の丸み（PC は rounded-3xl に合わせる。スマホは画面の端まで広がるので角なし） */
export const HEADER_FRAME_VARIANTS = {
  pc: { w: 1200, h: H, rad: 30 },
  sp: { w: 1000, h: H, rad: 0 },
}

/** 角の丸い四角（inset だけ内側） */
const rrect = (w, rad, inset, attrs) =>
  `<rect x="${inset}" y="${inset}" width="${w - inset * 2}" height="${H - inset * 2}" rx="${Math.max(rad - inset, 2)}" ${attrs}/>`

/** ふちに沿って流れる帯の色（spreadMethod=reflect で、period ずらすと元に戻る） */
const flowGrad = (id, stops, t, w) => {
  const span = w / 3
  return `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${f(span)}" y2="${f(span * 0.35)}" spreadMethod="reflect" gradientTransform="translate(${f(t * span * 2)} 0)">${stops
    .map((c, i) => `<stop offset="${f(i / (stops.length - 1))}" stop-color="${c}"/>`)
    .join("")}</linearGradient>`
}

/** 枠の外周（角を丸めない四角）の上の位置 s（0〜1）の座標 */
const perimeter = (w, inset, s) => {
  const iw = w - inset * 2
  const ih = H - inset * 2
  const total = (iw + ih) * 2
  let d = ((((s % 1) + 1) % 1) * total)
  if (d < iw) return [inset + d, inset]
  d -= iw
  if (d < ih) return [w - inset, inset + d]
  d -= ih
  if (d < iw) return [w - inset - d, H - inset]
  d -= iw
  return [inset, H - inset - d]
}

/** 角から広がる光の筋（SSR・UR）。面積が大きく、動かすと画像が重くなるので止めておく */
const cornerRays = (t, x, y, from, to, count, color, opacity) =>
  `<g opacity="${opacity}">${Array.from({ length: count }, (_, i) => {
    const d = from + ((to - from) * (i + 0.5)) / count
    const len = i % 2 ? 230 : 300
    const a = ((d - 90) * Math.PI) / 180
    const half = (i % 2 ? 1.6 : 2.4) * (Math.PI / 180)
    const p = (r, k) => `${f(x + r * Math.cos(a + k))} ${f(y + r * Math.sin(a + k))}`
    return `<path d="M${p(20, -half)}L${p(len, 0)}L${p(20, half)}Z" fill="${color}"/>`
  }).join("")}</g>`

/** 角のまわりのぼんやりした光（これも止めておく） */
const cornerGlow = (x, y, r, color, opacity) =>
  `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${f(r * 0.7)}" fill="${color}" opacity="${f(opacity)}" filter="url(#hblur)"/>`

/** 光の粒（ふちの近くでゆっくり昇って消える） */
const risingDust = (t, w, n, color, seed) => {
  const r = rng(seed)
  return Array.from({ length: n }, () => {
    const corner = r()
    const x0 = corner < 0.5 ? r() * w * 0.22 : w - r() * w * 0.22
    const y0 = H - r() * 140
    const off = r()
    const p = (t + off) % 1
    return `<circle cx="${f(x0 + Math.sin(TAU * (p + off)) * 8)}" cy="${f(y0 - p * 160)}" r="${f(1.6 + r() * 2.4)}" fill="${color}" opacity="${f(Math.sin(Math.PI * p) * 0.9)}"/>`
  }).join("")
}

const baseDefs = (extra = "") => `<defs>
  <filter id="hblur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="28"/></filter>
  <filter id="hglow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="hds" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity=".45"/></filter>
  ${extra}
</defs>`

const svg = (w, rad, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${H}"><clipPath id="hclip">${rrect(w, rad, 0, "")}</clipPath><g clip-path="url(#hclip)">${body}</g></svg>`

/** 止まった絵と動く絵のどちらを描くか */
const layered = (w, rad, layer, defs, base, motion) =>
  svg(w, rad, `${defs}${layer === "motion" ? "" : base}${layer === "base" ? "" : motion}`)

/* ------------------------------------------------------------------ */
/* SSR 金蒔絵の夜桜                                                      */
/* ------------------------------------------------------------------ */

const makie = (t, { w, rad }, layer = "all") => {
  const g = METAL.gold
  const branch = (dir, len, seed) => {
    // dir=1: 左上の角から右へ伸びる / dir=-1: 右下の角から左へ伸びる
    const r = rng(seed)
    const main = `M0 0C${len * 0.3} 26 ${len * 0.62} 34 ${len} 18`
    const twigs = [
      `M${f(len * 0.28)} 20C${f(len * 0.32)} 44 ${f(len * 0.3)} 62 ${f(len * 0.24)} 80`,
      `M${f(len * 0.55)} 30C${f(len * 0.62)} 50 ${f(len * 0.66)} 60 ${f(len * 0.74)} 72`,
      `M${f(len * 0.7)} 28C${f(len * 0.76)} 14 ${f(len * 0.84)} 6 ${f(len * 0.92)} 2`,
    ]
    const spots = [
      [0.12, 14], [0.22, 24], [0.3, 46], [0.24, 78], [0.4, 30], [0.5, 32], [0.58, 46], [0.72, 70],
      [0.66, 28], [0.8, 22], [0.9, 4], [0.97, 18],
    ]
    const flowers = spots
      .map(([k, y], i) => place(len * k, y + (r() - 0.5) * 6, i * 31, 0.62 + r() * 0.34, blossom()))
      .join("")
    const buds = Array.from({ length: 6 }, (_, i) => `<circle cx="${f(len * (0.15 + i * 0.15))}" cy="${f(18 + r() * 30)}" r="4" fill="#ff8fb4" stroke="#c2185b" stroke-width=".8"/>`).join("")
    return `<g transform="${dir > 0 ? "translate(-14 30)" : `translate(${w + 14} ${H - 30}) scale(-1 -1)`}">
      <path d="${main}" stroke="#2a160a" stroke-width="11" fill="none" stroke-linecap="round"/>
      <path d="${main}" stroke="#4a2a14" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="${main}" stroke="${g[3]}" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".7" transform="translate(0 -2)"/>
      ${twigs.map((d) => `<path d="${d}" stroke="#4a2a14" stroke-width="4" fill="none" stroke-linecap="round"/>`).join("")}
      ${buds}${flowers}</g>`
  }
  // 金の桜は辺に沿って少しだけ（角に多め）
  const goldSpots = [0.01, 0.035, 0.12, 0.2, 0.3, 0.42, 0.5, 0.535, 0.62, 0.7, 0.8, 0.92]
  const golds = goldSpots
    .map((s, i) => {
      const [x, y] = perimeter(w, 12, s)
      return place(x, y, i * 40, i % 3 === 0 ? 0.5 : 0.36, goldBlossom("url(#hmkG)", g[1]))
    })
    .join("")
  const r = rng(91)
  const petals = Array.from({ length: 18 }, (_, i) => {
    const off = r()
    const p = (t + off) % 1
    const left = i % 3 !== 2
    const x0 = left ? 20 + r() * w * 0.26 : w - 20 - r() * w * 0.2
    const y = -20 + p * (H + 40)
    return place(x0 + Math.sin(TAU * (p + off)) * 18 + p * 30, y, p * 360 + off * 360, 0.75, looseP, `opacity="${f(Math.min(1, Math.sin(Math.PI * p) * 1.4) * 0.9)}"`)
  }).join("")
  const moon = [w - 92, 74]
  return layered(
    w,
    rad,
    layer,
    baseDefs(lg("petal", ["#fff3f7", "#ffc1d6", "#ff8fb4"]) + lg("hmkG", ["#fffadd", "#ffe58c", "#e9bd42", "#b9860e"]) + flowGrad("hmkBand", [g[1], g[3], g[5], g[3], g[2], g[4], g[1]], 0, w) + bezelDef(g) + PEARL_DEF + '<radialGradient id="hmkM" cx=".4" cy=".4"><stop offset="0" stop-color="#fffbe8"/><stop offset=".7" stop-color="#ffe7a0"/><stop offset="1" stop-color="#f2c45a"/></radialGradient>'),
    `${cornerGlow(70, 50, 150, "#ffb3cf", 0.45)}${cornerGlow(w - 70, H - 50, 150, "#ffd76a", 0.4)}
    ${cornerRays(t, 0, 0, 100, 170, 8, "#fff0f6", 0.22)}${cornerRays(t, w, H, -80, -10, 8, "#fff3d0", 0.2)}
    <circle cx="${moon[0]}" cy="${moon[1]}" r="44" fill="#fff4c8" opacity=".5" filter="url(#hglow)"/>
    <circle cx="${moon[0]}" cy="${moon[1]}" r="34" fill="url(#hmkM)"/>
    <circle cx="${moon[0] - 10}" cy="${moon[1] + 6}" r="6" fill="#f0cf78" opacity=".45"/><circle cx="${moon[0] + 9}" cy="${moon[1] - 9}" r="4" fill="#f0cf78" opacity=".4"/>
    <g filter="url(#hds)">
      ${rrect(w, rad, 10, `fill="none" stroke="${METAL.onyx[1]}" stroke-width="22"`)}
      ${rrect(w, rad, 12, `fill="none" stroke="${METAL.onyx[3]}" stroke-width="6" opacity=".6"`)}
      ${rrect(w, rad, 4, `fill="none" stroke="url(#hmkBand)" stroke-width="3"`)}
      ${rrect(w, rad, 20, `fill="none" stroke="url(#hmkBand)" stroke-width="2.4"`)}
      ${golds}
      ${setGem(w / 2, H - 12, 7, g, GEM.pink, t, 0.5)}${setGem(w / 2, 12, 7, g, GEM.pink, t, 0)}
      ${branch(1, 330, 7)}${branch(-1, 250, 13)}
    </g>`,
    `${petals}
    ${glint(moon[0] - 22, moon[1] - 24, 0.9, flash(t, 0.2))}${glint(w / 2, 12, 0.8, flash(t, 0))}${glint(w / 2, H - 12, 0.8, flash(t, 0.5))}
    ${sparkle(w - 170, 40, 0.9, "#fff0f7", Math.max(0, wave(t, 0.3)))}${sparkle(150, H - 40, 0.9, "#fff0f7", Math.max(0, wave(t, 0.8)))}`,
  )
}

/* ------------------------------------------------------------------ */
/* UR 九尾の白狐                                                        */
/* ------------------------------------------------------------------ */

const kyubi = (t, { w, rad }, layer = "all") => {
  const p = METAL.platinum
  let grads = ""
  const tail = (i, n, x, y, d, s, flip) => {
    const tip = prismAt(i / 9)
    const id = `hky${i}`
    grads += `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="-150"><stop offset="0" stop-color="#ffffff"/><stop offset=".45" stop-color="#fffaf4"/><stop offset=".75" stop-color="${mixHex(tip, "#ffffff", 0.4)}"/><stop offset="1" stop-color="${tip}"/></linearGradient>`
    const body = `<g transform="scale(${flip ? -1 : 1} 1)"><path d="M-18 0C-40-30-50-78-34-118-26-138-6-152 14-150 30-148 40-136 34-126 26-134 14-132 12-122 30-110 36-84 30-56 26-32 18-14 18 0Z" fill="url(#${id})" stroke="#a898c8" stroke-width="2" stroke-linejoin="round"/><path d="M-6-14C-20-44-24-80-14-110M8-18C14-46 14-72 8-96M-20-60C-26-74-28-90-24-104" stroke="#e6dcf3" stroke-width="1.6" fill="none" stroke-linecap="round"/></g>`
    return place(x, y, d, s, body)
  }
  // 九本の尾: 右下に 5 本（左上へ扇形）、左上に 4 本（右下へ扇形）。付け根は角の外に隠して、尾の形が全部見えるようにする
  const br = Array.from({ length: 5 }, (_, i) => tail(i, 5, w + 4, H + 4, -6 - i * 19.5, 1.4, i > 2)).join("")
  const tl = Array.from({ length: 4 }, (_, i) => tail(5 + i, 4, -4, -4, 102 + i * 22, 1.3, i < 2)).join("")
  // 狐のお面（右下の尾の付け根）。白い顔に朱の隈取り
  const mask = `<path d="M-30-30L-24-62-6-38H6L24-62 30-30C40-8 30 22 0 40-30 22-40-8-30-30Z" fill="#fff" stroke="#b9a9d6" stroke-width="2.2" stroke-linejoin="round"/><path d="M-24-56L-12-38M24-56L12-38" stroke="#ff6f8f" stroke-width="5" stroke-linecap="round"/><path d="M-24-10C-18-16-10-16-6-11M24-10C18-16 10-16 6-11" stroke="#d6264f" stroke-width="3.6" fill="none" stroke-linecap="round"/><path d="M-22-2L-30 6M22-2L30 6M-20 6L-28 14M20 6L28 14" stroke="#d6264f" stroke-width="2.6" stroke-linecap="round"/><path d="M0-30C-3-26-3-22 0-18 3-22 3-26 0-30Z" fill="#d6264f"/><circle cy="30" r="5" fill="#2a1e3a"/><path d="M-6 22C-2 26 2 26 6 22" stroke="#2a1e3a" stroke-width="2" fill="none"/>`
  // 狐火: 上と下の辺に沿ってゆっくり流れる（1 周で隣の位置へ）
  const fires = Array.from({ length: 8 }, (_, i) => {
    const top = i % 2 === 0
    const slot = w / 4
    const x = ((i >> 1) * slot + (top ? 1 : -1) * t * slot + slot * 0.5 + w) % w
    const y = top ? 44 + wave(t, i / 8) * 8 : H - 44 + wave(t, i / 8) * 8
    const c = prismAt(i / 8 + t)
    const k = 0.85 + 0.15 * Math.sin(TAU * (t * 3 + i / 8))
    // 真ん中ほど薄く（ヘッダー画像を邪魔しない）
    const edge = Math.min(1, Math.abs(x - w / 2) / (w * 0.32))
    // ぼかし（filter）は動く絵を重くするので、薄い丸を重ねて光らせる
    return place(x, y, 0, k * 1.5, `<circle cy="-2" r="20" fill="${c}" opacity=".18"/><circle cy="-2" r="13" fill="${c}" opacity=".25"/><path d="M0-18C8-6 11 6 0 13-11 6-8-6 0-18Z" fill="${c}" opacity=".9"/><path d="M0-8C4-2 5 4 0 8-5 4-4-2 0-8Z" fill="#fff"/>`, `opacity="${f(0.25 + 0.75 * edge)}"`)
  }).join("")
  const corners = [[w - 12, 12], [12, H - 12]].map(([x, y], i) => setGem(x, y, 8, p, GEM.diamond, t, i * 0.5)).join("")
  const stones = [0.2, 0.3, 0.7, 0.8].map((k, i) => setGem(w * k, i < 2 ? H - 12 : 12, 5, p, GEM[["ruby", "topaz", "sapphire", "amethyst"][i]], t, i * 0.2)).join("")
  const base = `
    ${cornerGlow(60, 40, 170, prismAt(0.1), 0.5)}${cornerGlow(w - 60, H - 40, 190, prismAt(0.6), 0.5)}
    ${cornerGlow(w - 40, 30, 110, prismAt(0.35), 0.3)}${cornerGlow(40, H - 30, 110, prismAt(0.85), 0.3)}
    ${cornerRays(t, 0, 0, 100, 170, 10, "#ffffff", 0.3)}${cornerRays(t, w, H, -80, -10, 10, "#ffffff", 0.3)}
    <g filter="url(#hds)">
      ${rrect(w, rad, 10, `fill="none" stroke="${p[0]}" stroke-width="22"`)}
      ${rrect(w, rad, 12, `fill="none" stroke="url(#hkyBand)" stroke-width="10"`)}
      ${rrect(w, rad, 4, `fill="none" stroke="${p[4]}" stroke-width="2"`)}${rrect(w, rad, 20, `fill="none" stroke="${p[4]}" stroke-width="2"`)}
      ${corners}${stones}
      ${tl}${br}
      ${place(w - 78, H - 74, -14, 1.15, mask)}
    </g>`
  const motion = `
    ${risingDust(t, w, 30, "#ffffff", 111)}
    ${fires}
    ${glint(w - 12, 12, 1.4, 0.3 + 0.7 * flash(t, 0))}${glint(12, H - 12, 1.4, 0.3 + 0.7 * flash(t, 0.5))}
    ${sparkle(w * 0.24, 30, 1, "#fff", Math.max(0, wave(t, 0.1)))}${sparkle(w * 0.76, H - 30, 1, "#fff", Math.max(0, wave(t, 0.6)))}
    ${sparkle(w - 60, H * 0.45, 0.9, "#fff", Math.max(0, wave(t, 0.35)))}${sparkle(60, H * 0.55, 0.9, "#fff", Math.max(0, wave(t, 0.85)))}`
  return layered(w, rad, layer, `${baseDefs(flowGrad("hkyBand", [...PRISM, PRISM[0]].map((c) => mixHex(c, "#ffffff", 0.25)), 0, w) + bezelDef(p) + PEARL_DEF)}${grads}`, base, motion)
}

/* ------------------------------------------------------------------ */
/* UR 星海の王冠                                                        */
/* ------------------------------------------------------------------ */

const starCrown = (t, { w, rad }, layer = "all") => {
  const m = METAL.platinum
  const g = METAL.gold
  const r = rng(41)
  // 帯の中を流れる星くず（1 周で 1/40 だけ進むので継ぎ目なし）
  const dust = Array.from({ length: 120 }, () => {
    const s = r()
    const [x, y] = perimeter(w, 12 + (r() - 0.5) * 10, s + t / 40)
    return `<circle cx="${f(x)}" cy="${f(y)}" r="${f(0.6 + r() * 1.5)}" fill="#fff" opacity="${f((0.4 + r() * 0.6) * (0.6 + 0.4 * Math.max(0, wave(t, r()))))}"/>`
  }).join("")
  const saturn = `<circle r="15" fill="url(#hsc1)"/><ellipse rx="27" ry="7" fill="none" stroke="#ffe0a8" stroke-width="3.2" transform="rotate(-22)"/>`
  const blue = `<circle r="12" fill="url(#hsc2)"/><circle cx="-4" cy="-4" r="3.5" fill="#fff" opacity=".4"/>`
  const pink = `<circle r="9" fill="url(#hsc3)"/>`
  // 星座（角の近く）
  const constellationLines = (pts) => `<path d="M${pts.map((q) => q.join(" ")).join("L")}" stroke="${g[4]}" stroke-width="1.4" fill="none" opacity=".55"/>`
  const constellationStars = (pts, phase) =>
    pts
      .map(([x, y], i) => sparkle(x, y, 0.55 + 0.35 * Math.max(0, wave(t, phase + i / pts.length)), "#fff6c8", 0.6 + 0.4 * Math.max(0, wave(t, phase + i / pts.length))))
      .join("")
  const tlStars = [[60, 150], [120, 120], [170, 150], [230, 118], [290, 128]]
  const brStars = [[w - 280, H - 120], [w - 220, H - 150], [w - 160, H - 128], [w - 120, H - 168], [w - 60, H - 150]]
  const shoot = (() => {
    const k = (t - 0.15) / 0.3
    if (k <= 0 || k >= 1) return ""
    const x = w * 0.6 + k * w * 0.3
    const y = 30 + k * 70
    return `<path d="M${f(x)} ${f(y)}L${f(x - 90)} ${f(y - 22)}" stroke="url(#hscTail)" stroke-width="3" stroke-linecap="round" opacity="${f(Math.sin(Math.PI * k))}"/>${sparkle(x, y, 0.8, "#fff", Math.sin(Math.PI * k))}`
  })()
  const crown = `<path d="M-46 14L-52-22-28-2-12-34 0-8 12-34 28-2 52-22 46 14Z" fill="url(#hscCrown)" stroke="${m[1]}" stroke-width="2" stroke-linejoin="round"/><path d="M-46 14H46V24H-46Z" fill="url(#hscCrown)" stroke="${m[1]}" stroke-width="2"/>${[-52, -12, 12, 52].map((x, i) => `<circle cx="${x}" cy="${i === 0 || i === 3 ? -22 : -34}" r="4" fill="${g[4]}" stroke="${g[1]}"/>`).join("")}`
  const base = `
    ${cornerGlow(80, 60, 190, "#7b5cff", 0.55)}${cornerGlow(w - 80, H - 60, 200, "#ff6fd0", 0.45)}
    ${cornerGlow(w - 60, 40, 130, "#4fd0ff", 0.35)}${cornerGlow(60, H - 40, 130, "#b98cff", 0.35)}
    ${cornerRays(t, 0, 0, 100, 170, 10, "#e6dcff", 0.3)}${cornerRays(t, w, H, -80, -10, 10, "#ffe6f6", 0.28)}
    ${constellationLines(tlStars)}${constellationLines(brStars)}
    <g filter="url(#hds)">
      ${rrect(w, rad, 11, `fill="none" stroke="#0a0730" stroke-width="24"`)}
      ${rrect(w, rad, 12, `fill="none" stroke="url(#hscBand)" stroke-width="14"`)}
      ${rrect(w, rad, 3, `fill="none" stroke="url(#hscMetal)" stroke-width="3"`)}${rrect(w, rad, 21, `fill="none" stroke="url(#hscMetal)" stroke-width="3"`)}
    </g>
    <g filter="url(#hds)">
      ${place(92, 78, -8, 2.6, saturn)}
      ${place(w - 96, H - 84, 0, 2.4, blue)}
      ${place(w - 190, 48, 0, 1.7, pink)}
      ${place(196, 52, -6, 1, crown)}
      ${setGem(196, 34, 6, m, GEM.amethyst, t, 0.3)}
      ${place(w - 210, H - 44, 0, 0.9, star5(16, "url(#hscStar)", g[1], 1.4))}
      ${place(48, H - 60, 0, 0.7, star5(16, "url(#hscStar)", g[1], 1.4))}
      ${setGem(w / 2, 12, 6, m, GEM.amethyst, t, 0)}${setGem(w / 2, H - 12, 6, m, GEM.sapphire, t, 0.5)}
    </g>`
  // 帯の中の星くずは、止まった惑星より手前に出るが小さいので目立たない
  const motion = `
    ${risingDust(t, w, 28, "#f0e6ff", 43)}
    ${constellationStars(tlStars, 0)}${constellationStars(brStars, 0.5)}
    ${shoot}${dust}
    ${glint(196, 34, 1.2, 0.3 + 0.7 * flash(t, 0))}${glint(w / 2, 12, 0.9, flash(t, 0.4))}${glint(w / 2, H - 12, 0.9, flash(t, 0.8))}`
  return layered(
    w,
    rad,
    layer,
    `${baseDefs(flowGrad("hscBand", ["#0a0730", "#3b1a8a", "#c0389a", "#1e5ad0", "#3b1a8a", "#0a0730"], 0, w) + flowGrad("hscMetal", [m[2], m[4], m[5], m[3], m[2]], 0, w) + lg("hscStar", ["#fffadd", "#ffe58c", "#e9bd42"]) + lg("hscCrown", [m[5], m[3], m[2], m[4]], 1, 1) + bezelDef(m) + PEARL_DEF +
      '<linearGradient id="hscTail" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient><radialGradient id="hsc1" cx=".35" cy=".3"><stop offset="0" stop-color="#ffe9c4"/><stop offset="1" stop-color="#d27c35"/></radialGradient><radialGradient id="hsc2" cx=".35" cy=".3"><stop offset="0" stop-color="#bff0ff"/><stop offset="1" stop-color="#2a5fd0"/></radialGradient><radialGradient id="hsc3" cx=".35" cy=".3"><stop offset="0" stop-color="#ffe0f2"/><stop offset="1" stop-color="#c0389a"/></radialGradient>')}`,
    base,
    motion,
  )
}

/* ------------------------------------------------------------------ */
/* R 雨上がりのあじさい                                                  */
/* ------------------------------------------------------------------ */

const hydrangeaCluster = (r, colors, seed, n = 26) => {
  const rand = rng(seed)
  return Array.from({ length: n }, () => {
    const a = rand() * TAU
    const d = Math.sqrt(rand()) * r
    const c = colors[Math.floor(rand() * colors.length)]
    return `<g transform="translate(${f(Math.cos(a) * d)} ${f(Math.sin(a) * d)}) rotate(${f(rand() * 90)}) scale(${f(1.3 + rand() * 0.5)})"><path d="M0 0C-3-4-3-8 0-9 3-8 3-4 0 0 4-3 8-3 9 0 8 3 4 3 0 0 3 4 3 8 0 9-3 8-3 4 0 0-4 3-8 3-9 0-8-3-4-3 0 0Z" fill="${c}" stroke="#fff" stroke-opacity=".55" stroke-width=".6"/><circle r="1.4" fill="#fff"/></g>`
  }).join("")
}

const hLeaf = (fill) => `<path d="M0 0C14-14 44-16 62 0 44 16 14 14 0 0Z" fill="${fill}" stroke="#2f7a46" stroke-width="1.4"/><path d="M4 0H56" stroke="#2f7a46" stroke-width="1.2" opacity=".7"/>`

const hydrangea = (t, { w, rad }, layer = "all") => {
  const blue = ["#8fb4ff", "#b39dff", "#a8d8ff", "#7f9cff"]
  const pink = ["#ffa8d4", "#d9a8ff", "#ffc6e4", "#c9a8ff"]
  const corner = (x, y, s, flip) => `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${flip ? -s : s})">
    ${place(70, 18, 20, 1.2, hLeaf("#5fbf7a"))}${place(20, 70, 70, 1.1, hLeaf("#4fae6a"))}${place(118, 6, -6, 0.9, hLeaf("#6fcf8a"))}
    ${place(40, 34, 0, 1, hydrangeaCluster(46, blue, 11))}${place(116, 24, 0, 1, hydrangeaCluster(34, pink, 12, 18))}${place(18, 108, 0, 1, hydrangeaCluster(32, blue.slice(1), 13, 16))}</g>`
  const r = rng(21)
  const drops = Array.from({ length: 26 }, () => {
    const off = r()
    const p = (t + off) % 1
    const x = r() < 0.5 ? 20 + r() * w * 0.25 : w - 20 - r() * w * 0.25
    const y = -10 + p * (H + 20)
    return `<path transform="translate(${f(x)} ${f(y)})" d="M0-7C3-2 5 1 5 3A5 5 0 0 1-5 3C-5 1-3-2 0-7Z" fill="#cfeaff" stroke="#fff" stroke-width=".9" opacity="${f(Math.sin(Math.PI * p) * 0.8)}"/>`
  }).join("")
  const base = `
    ${cornerGlow(60, 40, 150, "#b8c8ff", 0.45)}${cornerGlow(w - 60, H - 40, 150, "#ffc6e4", 0.4)}
    <g filter="url(#hds)">
      ${rrect(w, rad, 10, `fill="none" stroke="#e8f4ec" stroke-width="16"`)}
      ${rrect(w, rad, 10, `fill="none" stroke="#7fc890" stroke-width="4"`)}
      ${rrect(w, rad, 3, `fill="none" stroke="#bfe6ff" stroke-width="2"`)}${rrect(w, rad, 18, `fill="none" stroke="#bfe6ff" stroke-width="2"`)}
      ${corner(-10, -10, 1.75, false)}${corner(w + 10, H + 10, 1.75, true)}
    </g>`
  const motion = `${drops}
    ${sparkle(w * 0.3, 26, 0.9, "#fff", Math.max(0, wave(t, 0.1)))}${sparkle(w * 0.7, H - 26, 0.9, "#fff", Math.max(0, wave(t, 0.6)))}
    ${sparkle(w - 40, 60, 0.8, "#fff", Math.max(0, wave(t, 0.35)))}${sparkle(40, H - 60, 0.8, "#fff", Math.max(0, wave(t, 0.85)))}`
  return layered(w, rad, layer, baseDefs(), base, motion)
}

/* ------------------------------------------------------------------ */
/* SR 夜空の花火                                                        */
/* ------------------------------------------------------------------ */

const fireworkBurst = (k, color, n, size) => {
  if (k <= 0 || k >= 1) return ""
  const r0 = size * Math.sqrt(k)
  const o = k < 0.15 ? k / 0.15 : (1 - k) / 0.85
  return `<g opacity="${f(o)}">${Array.from({ length: n }, (_, i) => {
    const a = (i * TAU) / n
    const x1 = Math.cos(a) * r0 * 0.5
    const y1 = Math.sin(a) * r0 * 0.5
    const x2 = Math.cos(a) * r0
    const y2 = Math.sin(a) * r0 + k * 10
    return `<path d="M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}" stroke="${color}" stroke-width="3.4" stroke-linecap="round"/><circle cx="${f(x2)}" cy="${f(y2)}" r="3" fill="#fff"/>`
  }).join("")}<circle r="${f(6 * (1 - k))}" fill="#fff"/></g>`
}

const fireworks = (t, { w, rad }, layer = "all") => {
  const g = METAL.gold
  const shows = [
    [0.08, 0.3, 0, "#ff6f9a", 12, 80], [0.2, 0.18, 0.25, "#ffd36b", 10, 60], [0.14, 0.62, 0.5, "#6fd8ff", 12, 70],
    [0.92, 0.28, 0.12, "#b98cff", 12, 80], [0.8, 0.16, 0.4, "#7ff0b0", 10, 56], [0.86, 0.6, 0.7, "#ff8fe0", 12, 66],
  ]
  const fx = shows
    .map(([kx, ky, ph, c, n, size]) => {
      const k = (t + ph) % 1
      return `<g transform="translate(${f(w * kx)} ${f(H * ky)}) scale(1.4)">${fireworkBurst(k / 0.8, c, n, size)}</g>`
    })
    .join("")
  const r = rng(31)
  const stars = Array.from({ length: 40 }, () => {
    const x = r() < 0.5 ? r() * w * 0.3 : w - r() * w * 0.3
    return `<circle cx="${f(x)}" cy="${f(r() * H * 0.5)}" r="${f(0.8 + r() * 1.4)}" fill="#fff" opacity="${f(0.3 + 0.5 * r())}"/>`
  }).join("")
  const base = `
    <rect width="${w}" height="${H * 0.42}" fill="url(#hfwSky)"/>
    ${stars}
    <g filter="url(#hds)">
      ${rrect(w, rad, 10, `fill="none" stroke="#0c1a4a" stroke-width="22"`)}
      ${rrect(w, rad, 10, `fill="none" stroke="url(#hfwBand)" stroke-width="10"`)}
      ${rrect(w, rad, 3, `fill="none" stroke="${g[3]}" stroke-width="2"`)}${rrect(w, rad, 19, `fill="none" stroke="${g[3]}" stroke-width="2"`)}
      ${setGem(w / 2, 10, 6, g, GEM.sapphire, t, 0)}${setGem(w / 2, H - 10, 6, g, GEM.ruby, t, 0.5)}
    </g>`
  // ぼかし（filter）は動く絵を重くするので使わない
  const motion = `${fx}
    ${glint(w / 2, 10, 0.8, flash(t, 0))}${glint(w / 2, H - 10, 0.8, flash(t, 0.5))}`
  return layered(
    w,
    rad,
    layer,
    baseDefs(flowGrad("hfwBand", ["#0c1a4a", "#28125a", "#5a2a8a", "#28125a", "#0c1a4a"], 0, w) + bezelDef(g) + '<linearGradient id="hfwSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c1a4a" stop-opacity=".55"/><stop offset="1" stop-color="#0c1a4a" stop-opacity="0"/></linearGradient>'),
    base,
    motion,
  )
}

/* ------------------------------------------------------------------ */
/* SSR 金の天球儀                                                       */
/* ------------------------------------------------------------------ */

const armillary = (t, { w, rad }, layer = "all") => {
  const g = METAL.gold
  const sphere = (s) => {
    const orbit = (tilt, ry) => `<ellipse rx="70" ry="${ry}" transform="rotate(${tilt})" fill="none" stroke="${g[1]}" stroke-width="7"/><ellipse rx="70" ry="${ry}" transform="rotate(${tilt})" fill="none" stroke="url(#harG)" stroke-width="4.6"/>`
    return `<g transform="scale(${s})"><circle r="70" fill="url(#harGlass)"/>${orbit(-28, 22)}${orbit(32, 18)}${orbit(90, 26)}<circle r="70" fill="none" stroke="${g[1]}" stroke-width="8"/><circle r="70" fill="none" stroke="url(#harG)" stroke-width="5"/><circle r="15" fill="url(#harS)"/>${Array.from({ length: 12 }, (_, i) => `<path d="M0-18L3-25 0-32-3-25Z" fill="${g[4]}" transform="rotate(${i * 30})"/>`).join("")}<path d="M0 70V110M-30 110H30" stroke="${g[1]}" stroke-width="9" stroke-linecap="round"/><path d="M0 70V110M-30 110H30" stroke="url(#harG)" stroke-width="5" stroke-linecap="round"/></g>`
  }
  const ticks = (x0, x1, y) =>
    Array.from({ length: Math.floor((x1 - x0) / 14) }, (_, i) => `<path d="M${x0 + i * 14} ${y - (i % 5 ? 3 : 6)}V${y + (i % 5 ? 3 : 6)}" stroke="${g[3]}" stroke-width="${i % 5 ? 1 : 1.8}"/>`).join("")
  const zodiac = [0.3, 0.4, 0.5, 0.6, 0.7].map((k, i) => place(w * k, 11, 0, 0.42, star5(14, i % 2 ? g[4] : "#fff", g[1], 1.2))).join("")
  const r = rng(51)
  const stars = Array.from({ length: 34 }, () => {
    const x = r() < 0.5 ? 30 + r() * w * 0.28 : w - 30 - r() * w * 0.28
    const y = 30 + r() * (H - 60)
    return [x, y, r()]
  })
  const base = `
    ${cornerGlow(110, 100, 200, "#4a5cff", 0.5)}${cornerGlow(w - 90, H - 80, 190, "#8a5cff", 0.45)}
    ${cornerRays(t, 0, 0, 100, 170, 10, "#fff3c8", 0.22)}${cornerRays(t, w, H, -80, -10, 10, "#e6dcff", 0.22)}
    <g filter="url(#hds)">
      ${rrect(w, rad, 11, `fill="none" stroke="#0d1640" stroke-width="24"`)}
      ${rrect(w, rad, 3, `fill="none" stroke="url(#harBand)" stroke-width="3.4"`)}${rrect(w, rad, 21, `fill="none" stroke="url(#harBand)" stroke-width="3"`)}
      ${ticks(w * 0.25, w * 0.75, H - 11)}${zodiac}
      ${place(118, 112, -10, 1.05, sphere(1))}
      ${place(w - 86, H - 82, 0, 1.6, `<circle r="26" fill="url(#harS)"/>${Array.from({ length: 16 }, (_, i) => `<path d="M0-30L4-40 0-52-4-40Z" fill="${g[4]}" stroke="${g[2]}" stroke-width=".8" transform="rotate(${i * 22.5})"/>`).join("")}<circle r="26" fill="none" stroke="${g[2]}" stroke-width="2"/>`)}
      ${setGem(w - 12, 12, 7, g, GEM.sapphire, t, 0.2)}${setGem(12, H - 12, 7, g, GEM.sapphire, t, 0.7)}
    </g>`
  const motion = `
    ${stars.map(([x, y, ph]) => sparkle(x, y, 0.45, "#fff6c8", Math.max(0, wave(t, ph)))).join("")}
    ${risingDust(t, w, 24, "#ffe9a8", 53)}
    ${glint(118, 112, 1.3, 0.3 + 0.7 * flash(t, 0))}${glint(w - 86, H - 82, 1.5, 0.3 + 0.7 * flash(t, 0.5))}`
  return layered(
    w,
    rad,
    layer,
    baseDefs(flowGrad("harBand", [g[2], g[4], g[5], g[3], g[2]], 0, w) + lg("harG", [g[5], g[3], g[2], g[4]], 1, 1) + bezelDef(g) + '<radialGradient id="harGlass" cx=".4" cy=".35"><stop offset="0" stop-color="#3a4cff" stop-opacity=".35"/><stop offset="1" stop-color="#0d1640" stop-opacity=".55"/></radialGradient><radialGradient id="harS" cx=".4" cy=".35"><stop offset="0" stop-color="#fffbe0"/><stop offset=".6" stop-color="#ffd76a"/><stop offset="1" stop-color="#d98a12"/></radialGradient>'),
    base,
    motion,
  )
}

/* ------------------------------------------------------------------ */
/* ぴくたーちゃん                                                        */
/* ------------------------------------------------------------------ */

const PICTOR_COLORS = ["#ff8a1f", "#1f6fd0", "#16b8a0", "#ffd23f", "#ff5fa2", "#7a5cff"]

const paintDot = (x, y, r, c, o = 1) =>
  `<g opacity="${f(o)}"><circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${c}"/><circle cx="${f(x - r * 0.3)}" cy="${f(y - r * 0.35)}" r="${f(r * 0.3)}" fill="#fff" opacity=".7"/></g>`

/** パレットと筆 */
const palette = `<path d="M-60 0C-60-40-20-58 16-52 52-46 70-20 64 8 58 34 30 30 22 44 14 58-10 62-30 52-52 42-60 22-60 0Z" fill="#f3d9b1" stroke="#9a6a3a" stroke-width="3"/><ellipse cx="6" cy="22" rx="12" ry="9" fill="#fff" stroke="#9a6a3a" stroke-width="2.4"/>${[
  [-38, -10, "#ff8a1f"], [-20, -34, "#ffd23f"], [10, -38, "#16b8a0"], [38, -22, "#1f6fd0"], [44, 6, "#ff5fa2"], [-36, 20, "#7a5cff"],
]
  .map(([x, y, c]) => `<path d="M${x - 9} ${y}C${x - 9} ${y - 10} ${x + 9} ${y - 10} ${x + 9} ${y}C${x + 10} ${y + 8} ${x - 9} ${y + 9} ${x - 9} ${y}Z" fill="${c}"/><circle cx="${x - 3}" cy="${y - 3}" r="2.4" fill="#fff" opacity=".7"/>`)
  .join("")}`

const brush = (tip) =>
  `<path d="M-5 0H5L4 90Q0 98-4 90Z" fill="#c9773a" stroke="#7a3e14" stroke-width="1.8"/><path d="M-7-16H7V2H-7Z" fill="#d3dcea" stroke="#56647d" stroke-width="1.6"/><path d="M-7-16C-9-30-4-46 0-54 4-46 9-30 7-16Z" fill="#3a2a1e"/><path d="M-5-26C-5-38-2-46 0-51 2-46 5-38 5-26Z" fill="${tip}"/>`

const pictorPaint = (t, { w, rad }, layer = "all") => {
  const r = rng(61)
  // 筆で描いたふち: 色ごとに区切った太い線を、少しずつずらして重ねる
  const strokes = PICTOR_COLORS.slice(0, 4)
    .map((c, i) => rrect(w, rad, 9 + (i % 2) * 6, `fill="none" stroke="${c}" stroke-width="11" stroke-linecap="round" stroke-dasharray="${180 + i * 23} ${120 + i * 17}" stroke-dashoffset="${i * 131}" opacity=".92"`))
    .join("")
  const splats = Array.from({ length: 40 }, (_, i) => {
    const s = r()
    const [x, y] = perimeter(w, 14 + (r() - 0.5) * 36, s)
    return paintDot(x, y, 2 + r() * 4, PICTOR_COLORS[i % PICTOR_COLORS.length], 0.85)
  }).join("")
  const floaters = Array.from({ length: 16 }, (_, i) => {
    const off = i / 16
    const p = (t + off) % 1
    const x0 = i % 2 ? 40 + (i * 37) % (w * 0.25) : w - 40 - (i * 41) % (w * 0.25)
    const y0 = H - 30 - (i * 23) % 120
    return paintDot(x0 + Math.sin(TAU * (p + off)) * 8, y0 - p * 120, 4 + (i % 3), PICTOR_COLORS[i % PICTOR_COLORS.length], Math.sin(Math.PI * p) * 0.95)
  }).join("")
  const base = `
    ${cornerGlow(70, 50, 140, "#ffd9a8", 0.45)}${cornerGlow(w - 70, H - 50, 160, "#a8e6ff", 0.45)}
    <g filter="url(#hds)">
      ${rrect(w, rad, 12, `fill="none" stroke="#fffaf2" stroke-width="26"`)}
      ${strokes}${splats}
      ${place(84, 70, -18, 1.1, palette)}
      ${place(150, 92, 34, 0.9, brush("#ff8a1f"))}${place(170, 80, 52, 0.8, brush("#16b8a0"))}
    </g>
    ${pictorChan("hello", w - 120, H + 4, 226)}`
  const motion = `${floaters}
    ${sparkle(w * 0.3, 30, 1, "#fff", Math.max(0, wave(t, 0.1)))}${sparkle(w * 0.7, H - 30, 1, "#fff", Math.max(0, wave(t, 0.6)))}
    ${sparkle(w - 250, H - 140, 0.9, "#ffd23f", Math.max(0, wave(t, 0.35)))}${sparkle(230, 40, 0.9, "#ffd23f", Math.max(0, wave(t, 0.85)))}`
  return layered(w, rad, layer, baseDefs(pictorOutlineDef("pcOut", 4)), base, motion)
}

const pictorLove = (t, { w, rad }, layer = "all") => {
  const m = METAL.rose
  const hearts = [0.05, 0.12, 0.2, 0.3, 0.42, 0.5, 0.55, 0.62, 0.7, 0.8, 0.92, 0.97]
    .map((s, i) => {
      const [x, y] = perimeter(w, 12, s)
      return place(x, y, (i % 3 - 1) * 14, i % 3 === 0 ? 0.6 : 0.42, heart(i % 2 ? "url(#hplH)" : "url(#hplH2)"))
    })
    .join("")
  const r = rng(71)
  const rising = Array.from({ length: 18 }, (_, i) => {
    const off = r()
    const p = (t + off) % 1
    const x0 = i % 3 === 2 ? 40 + r() * w * 0.2 : w - 40 - r() * w * 0.24
    const y0 = H - r() * 80
    return place(x0 + Math.sin(TAU * (p + off)) * 10, y0 - p * 200, 0, 0.35 + r() * 0.25, heart(i % 2 ? "#ff8fb1" : "#ffc6da"), `opacity="${f(Math.sin(Math.PI * p) * 0.9)}"`)
  }).join("")
  const base = `
    ${cornerGlow(60, 40, 160, "#ffb3cf", 0.5)}${cornerGlow(w - 60, H - 40, 190, "#ff8fb1", 0.5)}
    ${cornerRays(t, 0, 0, 100, 170, 8, "#fff0f6", 0.25)}${cornerRays(t, w, H, -80, -10, 8, "#fff0f6", 0.25)}
    <g filter="url(#hds)">
      ${rrect(w, rad, 10, `fill="none" stroke="${m[1]}" stroke-width="22"`)}
      ${rrect(w, rad, 10, `fill="none" stroke="url(#hplBand)" stroke-width="16"`)}
      ${rrect(w, rad, 3, `fill="none" stroke="${m[4]}" stroke-width="2"`)}${rrect(w, rad, 19, `fill="none" stroke="${m[4]}" stroke-width="2"`)}
      ${hearts}
      ${setGem(w / 2, 10, 7, m, GEM.pink, t, 0)}${setGem(w / 2, H - 10, 7, m, GEM.pink, t, 0.5)}
    </g>
    ${pictorChan("wow", 96, 158, 150, { rot: -6 })}
    ${pictorChan("love", w - 118, H + 4, 226)}`
  const motion = `${rising}
    ${glint(w / 2, 10, 0.9, flash(t, 0))}${glint(w / 2, H - 10, 0.9, flash(t, 0.5))}
    ${sparkle(w * 0.25, 28, 1, "#fff", Math.max(0, wave(t, 0.2)))}${sparkle(w * 0.75, H - 28, 1, "#fff", Math.max(0, wave(t, 0.7)))}`
  return layered(
    w,
    rad,
    layer,
    baseDefs(flowGrad("hplBand", [m[2], m[4], m[5], m[3], m[2]], 0, w) + bezelDef(m) + pictorOutlineDef("pcOut", 4) + lg("hplH", ["#ffd0e0", "#ff6f9a", "#e2386b"]) + lg("hplH2", ["#ffe6f0", "#ff9fc2", "#ff6f9a"])),
    base,
    motion,
  )
}

const pictorRainbow = (t, { w, rad }, layer = "all") => {
  const p = METAL.platinum
  const stones = [0.1, 0.22, 0.38, 0.62, 0.78, 0.9].map((k, i) => setGem(w * k, i < 3 ? 12 : H - 12, 6, p, GEM[["ruby", "topaz", "emerald", "sapphire", "amethyst", "pink"][i]], t, i / 6)).join("")
  const r = rng(81)
  const confetti = Array.from({ length: 34 }, (_, i) => {
    const off = r()
    const k = (t + off) % 1
    const x0 = r() < 0.5 ? 30 + r() * w * 0.3 : w - 30 - r() * w * 0.3
    return `<rect x="-6" y="-3" width="12" height="6" rx="1.5" fill="${prismAt(r())}" transform="translate(${f(x0 + Math.sin(TAU * (k + off)) * 14)} ${f(-10 + k * (H + 20))}) rotate(${f(k * 720 + i * 40)})" opacity="${f(Math.min(1, Math.sin(Math.PI * k) * 1.5))}"/>`
  }).join("")
  const stars = [[w * 0.2, 40, 18], [w * 0.8, H - 44, 18], [w - 60, 60, 14], [260, H - 40, 12], [w * 0.36, 26, 10], [w * 0.64, H - 26, 10]]
    .map(([x, y, s], i) => place(x, y, 0, 0.85 + 0.2 * Math.sin(TAU * (t * 2 + i / 6)), star5(s, prismAt(i / 6 + t), "#fff", 2)))
    .join("")
  const base = `
    ${cornerGlow(60, 40, 180, prismAt(0.1), 0.55)}${cornerGlow(w - 60, H - 40, 200, prismAt(0.6), 0.55)}
    ${cornerGlow(w - 40, 30, 120, prismAt(0.35), 0.35)}${cornerGlow(40, H - 30, 120, prismAt(0.85), 0.35)}
    ${cornerRays(t, 0, 0, 100, 170, 10, "#ffffff", 0.32)}${cornerRays(t, w, H, -80, -10, 10, "#ffffff", 0.32)}
    <g filter="url(#hds)">
      ${rrect(w, rad, 10, `fill="none" stroke="${p[0]}" stroke-width="22"`)}
      ${rrect(w, rad, 10, `fill="none" stroke="url(#hprBand)" stroke-width="14"`)}
      ${rrect(w, rad, 3, `fill="none" stroke="${p[4]}" stroke-width="2"`)}${rrect(w, rad, 18, `fill="none" stroke="${p[4]}" stroke-width="2"`)}
      ${stones}
    </g>
    ${pictorChan("thanks", 104, 172, 164, { rot: -6 })}
    ${pictorChan("nice", w - 122, H + 4, 232)}`
  const motion = `
    ${risingDust(t, w, 28, "#ffffff", 83)}
    ${confetti}${stars}
    ${glint(w * 0.22, 12, 1, flash(t, 0))}${glint(w * 0.78, H - 12, 1, flash(t, 0.5))}`
  return layered(w, rad, layer, `${baseDefs(flowGrad("hprBand", [...PRISM, PRISM[0]].map((c) => mixHex(c, "#ffffff", 0.2)), 0, w) + bezelDef(p) + pictorOutlineDef("pcOut", 4))}`, base, motion)
}

export const HEADER_FRAMES = [
  { slug: "gacha-ssr-makie", rarity: "SSR", frames: 24, frameMs: 150, name: "金蒔絵の夜桜", description: "漆黒と金のふちに、角から伸びる夜桜の枝と満月", draw: makie },
  { slug: "gacha-ur-kyubi", rarity: "UR", frames: 24, frameMs: 150, name: "九尾の白狐", description: "左上と右下の角から広がる九本の尾と、ふちを流れる狐火", draw: kyubi },
  { slug: "gacha-ur-star-crown", rarity: "UR", frames: 24, frameMs: 150, name: "星海の王冠", description: "星雲の流れるふちに、惑星と白金の王冠、角の星座", draw: starCrown },
  { slug: "gacha-r-hydrangea", rarity: "R", frames: 24, frameMs: 150, name: "雨上がりのあじさい", description: "角に咲く青と桃色のあじさいと、落ちる雨つぶ", draw: hydrangea },
  { slug: "gacha-sr-fireworks", rarity: "SR", frames: 24, frameMs: 150, name: "夜空の花火", description: "夜色のふちと、上の角で次々ひらく花火", draw: fireworks },
  { slug: "gacha-sr-pictor-paint", rarity: "SR", frames: 24, frameMs: 150, name: "ぴくたーちゃんのお絵かき", description: "絵の具で描いたふちとパレット、右下で手をふるぴくたーちゃん", draw: pictorPaint },
  { slug: "gacha-ssr-armillary", rarity: "SSR", frames: 24, frameMs: 150, name: "金の天球儀", description: "左上の金の天球儀と右下の太陽、星座の目盛りのふち", draw: armillary },
  { slug: "gacha-ssr-pictor-love", rarity: "SSR", frames: 24, frameMs: 150, name: "ぴくたーちゃんのだいすき", description: "ローズゴールドのハートのふちと、ふたりのぴくたーちゃん", draw: pictorLove },
  { slug: "gacha-ur-pictor-rainbow", rarity: "UR", frames: 24, frameMs: 150, name: "きらめくぴくたーちゃん", description: "虹色のふちと紙吹雪、ふたりのぴくたーちゃん", draw: pictorRainbow },
]
