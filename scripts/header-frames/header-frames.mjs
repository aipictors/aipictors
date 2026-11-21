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
import { PICTOR_CHAN_OFF, pictorChan, pictorOutlineDef } from "../avatar-frames/pictor-chan.mjs"

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

/** ふちの帯に沿ってゆっくり流れる粒（内側には出さない）。draw(x, y, i, k) で 1 つ描く */
const bandFlow = (t, w, n, seed, draw, inset = 12, spread = 8) => {
  const r = rng(seed)
  return Array.from({ length: n }, (_, i) => {
    const s0 = r()
    const off = (r() - 0.5) * spread
    const [x, y] = perimeter(w, inset + off, s0 + t / n)
    return draw(x, y, i, Math.max(0, wave(t, r())))
  }).join("")
}

const baseDefs = (extra = "") => `<defs>
  <filter id="hds" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity=".45"/></filter>
  ${extra}
</defs>`

const svg = (w, rad, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${H}"><clipPath id="hclip">${rrect(w, rad, 0, "")}</clipPath><g clip-path="url(#hclip)">${body}</g></svg>`

/** 止まった絵と動く絵のどちらを描くか */
const layered = (w, rad, layer, defs, base, motion) =>
  svg(w, rad, `${defs}${layer === "motion" ? "" : base}${layer === "base" ? "" : motion}`)

/* ------------------------------------------------------------------ */
/* SSR・UR の彫金の帯                                                    */
/* ------------------------------------------------------------------ */

/** 角の唐草の金具（左上の角の形。ほかの角は裏返して使う）。内側へは 40px ほどまで */
const cornerPiece = (id, m, jewel, t, phase, ur) => {
  const curl = `M60 5C74 3 84 13 80 24C77 32 65 31 66 23C67 18 73 18 73 22`
  const metal = (d, wd) => `<path d="${d}" fill="none" stroke="${m[0]}" stroke-width="${wd + 2.6}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="url(#${id}F)" stroke-width="${wd}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${m[5]}" stroke-width="${f(wd * 0.22)}" stroke-linecap="round" opacity=".8" transform="translate(-.6 -.8)"/>`
  const half = `${metal(curl, 4.6)}${metal("M44 26C50 30 52 36 48 41", 3)}`
  const plate = `<path d="M0 0H62C56 10 46 14 36 15 32 24 24 32 15 36 14 46 10 56 0 62Z" fill="url(#${id}F)" stroke="${m[0]}" stroke-width="1.8"/><path d="M8 8H50C46 12 40 14 32 14 28 22 22 28 14 32 13 40 11 46 8 50Z" fill="none" stroke="${m[5]}" stroke-width="1" opacity=".7"/>`
  const small = ur ? `${setGem(50, 9, 3.4, m, GEM.diamond, t, phase + 0.3)}${setGem(9, 50, 3.4, m, GEM.diamond, t, phase + 0.6)}` : `${pearlDot(50, 9, 3.2)}${pearlDot(9, 50, 3.2)}`
  return `${half}<g transform="matrix(0 1 1 0 0 0)">${half}</g>${plate}${small}${setGem(22, 22, ur ? 10 : 8.5, m, jewel, t, phase)}`
}

const pearlDot = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fffaf3" stroke="#a8948a" stroke-width=".8"/><circle cx="${f(x - r * 0.3)}" cy="${f(y - r * 0.35)}" r="${f(r * 0.32)}" fill="#fff"/>`

const CORNER_AT = (w) => [
  "",
  `translate(${w} 0) scale(-1 1)`,
  `translate(${w} ${H}) scale(-1 -1)`,
  `translate(0 ${H}) scale(1 -1)`,
]

/**
 * 彫金の帯。inlay は帯の真ん中の象嵌（エナメルや虹色）、corners は唐草の金具を付ける角（0 左上・1 右上・2 右下・3 左下）、
 * gems は帯に並べる宝石 [位置 0〜1（上の辺は 0〜0.5、下の辺は 0.5〜1）, 宝石]。ur で虹のふちと宝石が増える
 */
const luxe = (id, t, { w, rad }, m, { inlay, inlayWidth = 7, corners = [0, 1, 2, 3], cornerJewel, gems = [], ur = false, halo }) => {
  const c = 13
  const defs = `${flowGrad(`${id}B`, [m[1], m[3], m[5], m[3], m[2], m[4], m[5], m[2], m[1]], 0, w)}${lg(`${id}F`, [m[5], m[4], m[3], m[2]], 1, 1)}${bezelDef(m)}`
  const at = CORNER_AT(w)
  const gemAt = ([k, jewel], i) => {
    const x = k < 0.5 ? w * (k * 2) : w * ((k - 0.5) * 2)
    const y = k < 0.5 ? c : H - c
    return [x, y, jewel, i]
  }
  const placed = gems.map(gemAt)
  const base = `<g filter="url(#hds)">
      ${rrect(w, rad, c, `fill="none" stroke="${m[0]}" stroke-width="25"`)}
      ${rrect(w, rad, c, `fill="none" stroke="url(#${id}B)" stroke-width="21"`)}
      ${rrect(w, rad, c - 8.6, `fill="none" stroke="${m[5]}" stroke-width="1.3" opacity=".9"`)}${rrect(w, rad, c + 8.6, `fill="none" stroke="${m[0]}" stroke-width="1.3" opacity=".75"`)}
      ${rrect(w, rad, c, `fill="none" stroke="${m[0]}" stroke-width="${inlayWidth + 3}"`)}
      ${rrect(w, rad, c, `fill="none" stroke="${inlay}" stroke-width="${inlayWidth}"`)}
      ${rrect(w, rad, c - inlayWidth / 2 - 1, `fill="none" stroke="${m[5]}" stroke-width=".9"`)}${rrect(w, rad, c + inlayWidth / 2 + 1, `fill="none" stroke="${m[4]}" stroke-width=".9"`)}
      ${rrect(w, rad, c + 15.5, `fill="none" stroke="${m[0]}" stroke-width="4.4" stroke-dasharray="0 7" stroke-linecap="round"`)}
      ${rrect(w, rad, c + 15.5, `fill="none" stroke="${m[4]}" stroke-width="3" stroke-dasharray="0 7" stroke-linecap="round"`)}
      ${halo ? rrect(w, rad, 1.6, `fill="none" stroke="${halo}" stroke-width="3.2"`) : ""}
      ${placed.map(([x, y, jewel, i]) => setGem(x, y, ur ? 6 : 5.4, m, GEM[jewel], t, i / Math.max(1, placed.length))).join("")}
      ${corners.map((k) => `<g transform="${at[k]}">${cornerPiece(id, m, GEM[cornerJewel], t, k / 4, ur)}</g>`).join("")}
    </g>`
  // 帯を流れる光（2 本。pathLength を 1000 にして 1 周で 1000 進める）
  const sweep = [[130, 15, 0.1], [64, 9, 0.2], [22, 3, ur ? 0.75 : 0.6]]
    .map(([len, sw, o]) => rrect(w, rad, c, `pathLength="1000" fill="none" stroke="#fff" stroke-width="${sw}" stroke-linecap="round" stroke-dasharray="${len} ${500 - len}" stroke-dashoffset="${f(-(t * 1000) + len / 2)}" opacity="${o}"`))
    .join("")
  const glints = [
    ...placed.map(([x, y, , i]) => glint(x, y, ur ? 0.75 : 0.6, flash(t, i / Math.max(1, placed.length) + 0.1))),
    ...corners.map((k) => {
      const x = k === 1 || k === 2 ? w - 22 : 22
      const y = k >= 2 ? H - 22 : 22
      return glint(x, y, ur ? 1.1 : 0.9, flash(t, k / 4 + 0.05))
    }),
  ].join("")
  return { defs, base, motion: `${sweep}${glints}` }
}

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
    return `<g transform="${dir > 0 ? "translate(-8 14) scale(.5)" : `translate(${w + 8} ${H - 14}) scale(-.5 -.5)`}">
      <path d="${main}" stroke="#2a160a" stroke-width="11" fill="none" stroke-linecap="round"/>
      <path d="${main}" stroke="#4a2a14" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="${main}" stroke="${g[3]}" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".7" transform="translate(0 -2)"/>
      ${twigs.map((d) => `<path d="${d}" stroke="#4a2a14" stroke-width="4" fill="none" stroke-linecap="round"/>`).join("")}
      ${buds}${flowers}</g>`
  }
  // 金の桜は辺に沿って少しだけ（角に多め）
  const goldSpots = [0.058, 0.321, 0.44, 0.558, 0.821, 0.94]
  const golds = goldSpots
    .map((s, i) => {
      const [x, y] = perimeter(w, 12, s)
      return place(x, y, i * 40, i % 3 === 0 ? 0.5 : 0.36, goldBlossom("url(#hmkG)", g[1]))
    })
    .join("")
  const petals = bandFlow(t, w, 14, 91, (x, y, i, k) => place(x, y, t * 360 + i * 47, 0.6, looseP, `opacity="${f(0.5 + 0.5 * k)}"`))
  const moon = [w / 2, 14]
  const lx = luxe("hmkL", t, { w, rad }, g, { inlay: METAL.onyx[1], inlayWidth: 8, corners: [1, 3], cornerJewel: "ruby", gems: [[0.16, "pink"], [0.34, "pink"], [0.66, "pink"], [0.84, "pink"]] })
  return layered(
    w,
    rad,
    layer,
    baseDefs(lg("petal", ["#fff3f7", "#ffc1d6", "#ff8fb4"]) + lg("hmkG", ["#fffadd", "#ffe58c", "#e9bd42", "#b9860e"]) + flowGrad("hmkBand", [g[1], g[3], g[5], g[3], g[2], g[4], g[1]], 0, w) + bezelDef(g) + PEARL_DEF + '<radialGradient id="hmkM" cx=".4" cy=".4"><stop offset="0" stop-color="#fffbe8"/><stop offset=".7" stop-color="#ffe7a0"/><stop offset="1" stop-color="#f2c45a"/></radialGradient>' + lx.defs),
    `${lx.base}<g filter="url(#hds)">
      ${golds}
      ${setGem(w / 2, H - 13, 7, g, GEM.pink, t, 0.5)}
      ${branch(1, 330, 7)}${branch(-1, 250, 13)}
      <circle cx="${moon[0]}" cy="${moon[1]}" r="23" fill="${g[0]}"/><circle cx="${moon[0]}" cy="${moon[1]}" r="21.5" fill="url(#bz-${g[2].slice(1)})"/><circle cx="${moon[0]}" cy="${moon[1]}" r="17" fill="${METAL.onyx[1]}"/>
      <circle cx="${moon[0]}" cy="${moon[1]}" r="13" fill="url(#hmkM)"/>
      <circle cx="${moon[0] - 4}" cy="${moon[1] + 3}" r="2.4" fill="#f0cf78" opacity=".45"/><circle cx="${moon[0] + 4}" cy="${moon[1] - 4}" r="1.6" fill="#f0cf78" opacity=".4"/>
    </g>`,
    `${lx.motion}${petals}
    ${glint(moon[0] - 8, moon[1] - 8, 0.7, flash(t, 0.2))}${glint(w / 2, H - 13, 0.8, flash(t, 0.5))}`,
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
  const br = Array.from({ length: 5 }, (_, i) => tail(i, 5, w + 2, H + 2, -6 - i * 19.5, 0.5, i > 2)).join("")
  const tl = Array.from({ length: 4 }, (_, i) => tail(5 + i, 4, -2, -2, 102 + i * 22, 0.46, i < 2)).join("")
  // 狐のお面（右下の尾の付け根）。白い顔に朱の隈取り
  const mask = `<path d="M-30-30L-24-62-6-38H6L24-62 30-30C40-8 30 22 0 40-30 22-40-8-30-30Z" fill="#fff" stroke="#b9a9d6" stroke-width="2.2" stroke-linejoin="round"/><path d="M-24-56L-12-38M24-56L12-38" stroke="#ff6f8f" stroke-width="5" stroke-linecap="round"/><path d="M-24-10C-18-16-10-16-6-11M24-10C18-16 10-16 6-11" stroke="#d6264f" stroke-width="3.6" fill="none" stroke-linecap="round"/><path d="M-22-2L-30 6M22-2L30 6M-20 6L-28 14M20 6L28 14" stroke="#d6264f" stroke-width="2.6" stroke-linecap="round"/><path d="M0-30C-3-26-3-22 0-18 3-22 3-26 0-30Z" fill="#d6264f"/><circle cy="30" r="5" fill="#2a1e3a"/><path d="M-6 22C-2 26 2 26 6 22" stroke="#2a1e3a" stroke-width="2" fill="none"/>`
  // 狐火: 上と下の辺に沿ってゆっくり流れる（1 周で隣の位置へ）
  const fires = Array.from({ length: 8 }, (_, i) => {
    const top = i % 2 === 0
    const slot = w / 4
    const x = ((i >> 1) * slot + (top ? 1 : -1) * t * slot + slot * 0.5 + w) % w
    const y = top ? 12 + wave(t, i / 8) * 2 : H - 12 + wave(t, i / 8) * 2
    const c = prismAt(i / 8 + t)
    const k = 0.85 + 0.15 * Math.sin(TAU * (t * 3 + i / 8))
    // 真ん中ほど薄く（ヘッダー画像を邪魔しない）
    const edge = Math.min(1, Math.abs(x - w / 2) / (w * 0.32))
    // ぼかし（filter）は動く絵を重くするので、薄い丸を重ねて光らせる
    return place(x, y, 0, k * 0.7, `<circle cy="-2" r="20" fill="${c}" opacity=".18"/><circle cy="-2" r="13" fill="${c}" opacity=".25"/><path d="M0-18C8-6 11 6 0 13-11 6-8-6 0-18Z" fill="${c}" opacity=".9"/><path d="M0-8C4-2 5 4 0 8-5 4-4-2 0-8Z" fill="#fff"/>`, `opacity="${f(0.25 + 0.75 * edge)}"`)
  }).join("")
  const lx = luxe("hkyL", t, { w, rad }, p, { inlay: "url(#hkyBand)", inlayWidth: 8, corners: [1, 3], cornerJewel: "diamond", ur: true, halo: "url(#hkyBand)", gems: [[0.2, "ruby"], [0.32, "topaz"], [0.5 + 0.18, "sapphire"], [0.5 + 0.3, "amethyst"], [0.5 + 0.42, "emerald"]] })
  const base = `${lx.base}
    <g filter="url(#hds)">
      ${tl}${br}
      ${place(w - 34, H - 34, -14, 0.5, mask)}
    </g>`
  const motion = `${lx.motion}
    ${fires}
    ${sparkle(w - 12, H * 0.45, 0.7, "#fff", Math.max(0, wave(t, 0.35)))}${sparkle(12, H * 0.55, 0.7, "#fff", Math.max(0, wave(t, 0.85)))}`
  return layered(w, rad, layer, `${baseDefs(flowGrad("hkyBand", [...PRISM, PRISM[0]].map((c) => mixHex(c, "#ffffff", 0.25)), 0, w) + bezelDef(p) + PEARL_DEF + lx.defs)}${grads}`, base, motion)
}

/* ------------------------------------------------------------------ */
/* UR 星海の王冠                                                        */
/* ------------------------------------------------------------------ */

const starCrown = (t, { w, rad }, layer = "all") => {
  const m = METAL.platinum
  const g = METAL.gold
  const r = rng(41)
  // 帯の中を流れる星くず（1 周で 1/40 だけ進むので継ぎ目なし）
  const dust = Array.from({ length: 90 }, () => {
    const s = r()
    const [x, y] = perimeter(w, 13 + (r() - 0.5) * 7, s + t / 40)
    return `<circle cx="${f(x)}" cy="${f(y)}" r="${f(0.6 + r() * 1.5)}" fill="#fff" opacity="${f((0.4 + r() * 0.6) * (0.6 + 0.4 * Math.max(0, wave(t, r()))))}"/>`
  }).join("")
  const saturn = `<circle r="15" fill="url(#hsc1)"/><ellipse rx="27" ry="7" fill="none" stroke="#ffe0a8" stroke-width="3.2" transform="rotate(-22)"/>`
  const blue = `<circle r="12" fill="url(#hsc2)"/><circle cx="-4" cy="-4" r="3.5" fill="#fff" opacity=".4"/>`
  const pink = `<circle r="9" fill="url(#hsc3)"/>`
  const crown = `<path d="M-46 14L-52-22-28-2-12-34 0-8 12-34 28-2 52-22 46 14Z" fill="url(#hscCrown)" stroke="${m[1]}" stroke-width="2" stroke-linejoin="round"/><path d="M-46 14H46V24H-46Z" fill="url(#hscCrown)" stroke="${m[1]}" stroke-width="2"/>${[-52, -12, 12, 52].map((x, i) => `<circle cx="${x}" cy="${i === 0 || i === 3 ? -22 : -34}" r="4" fill="${g[4]}" stroke="${g[1]}"/>`).join("")}`
  const lx = luxe("hscL", t, { w, rad }, m, { inlay: "url(#hscBand)", inlayWidth: 10, corners: [1, 3], cornerJewel: "amethyst", ur: true, halo: "url(#hscHalo)", gems: [[0.34, "sapphire"], [0.84, "amethyst"], [0.6, "pink"]] })
  const base = `${lx.base}
    <g filter="url(#hds)">
      ${place(34, 30, -8, 1.3, saturn)}
      ${place(w - 30, H - 30, 0, 1.3, blue)}
      ${place(w - 150, 12, 0, 1, pink)}
      ${place(150, 14, 0, 0.5, crown)}
      ${setGem(150, 5, 4, m, GEM.amethyst, t, 0.3)}
      ${place(w - 150, H - 12, 0, 0.6, star5(16, "url(#hscStar)", g[1], 1.4))}
    </g>`
  // 帯の中の星くずは、止まった惑星より手前に出るが小さいので目立たない
  const motion = `${lx.motion}
    ${dust}
    ${glint(150, 5, 0.8, 0.3 + 0.7 * flash(t, 0))}`
  return layered(
    w,
    rad,
    layer,
    `${baseDefs(flowGrad("hscBand", ["#0a0730", "#3b1a8a", "#c0389a", "#1e5ad0", "#3b1a8a", "#0a0730"], 0, w) + flowGrad("hscMetal", [m[2], m[4], m[5], m[3], m[2]], 0, w) + lg("hscStar", ["#fffadd", "#ffe58c", "#e9bd42"]) + lg("hscCrown", [m[5], m[3], m[2], m[4]], 1, 1) + bezelDef(m) + PEARL_DEF + lx.defs + flowGrad("hscHalo", ["#7b5cff", "#ff6fd0", "#4fd0ff", "#7b5cff"], 0, w) +
      '<radialGradient id="hsc1" cx=".35" cy=".3"><stop offset="0" stop-color="#ffe9c4"/><stop offset="1" stop-color="#d27c35"/></radialGradient><radialGradient id="hsc2" cx=".35" cy=".3"><stop offset="0" stop-color="#bff0ff"/><stop offset="1" stop-color="#2a5fd0"/></radialGradient><radialGradient id="hsc3" cx=".35" cy=".3"><stop offset="0" stop-color="#ffe0f2"/><stop offset="1" stop-color="#c0389a"/></radialGradient>')}`,
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
  const drops = bandFlow(t, w, 16, 21, (x, y, i, k) => `<path transform="translate(${f(x)} ${f(y)})" d="M0-7C3-2 5 1 5 3A5 5 0 0 1-5 3C-5 1-3-2 0-7Z" fill="#cfeaff" stroke="#fff" stroke-width=".9" opacity="${f(0.3 + 0.6 * k)}"/>`)
  const base = `
    <g filter="url(#hds)">
      ${rrect(w, rad, 10, `fill="none" stroke="#e8f4ec" stroke-width="16"`)}
      ${rrect(w, rad, 10, `fill="none" stroke="#7fc890" stroke-width="4"`)}
      ${rrect(w, rad, 3, `fill="none" stroke="#bfe6ff" stroke-width="2"`)}${rrect(w, rad, 18, `fill="none" stroke="#bfe6ff" stroke-width="2"`)}
      ${corner(-6, -6, 0.62, false)}${corner(w + 6, H + 6, 0.62, true)}
    </g>`
  const motion = `${drops}
    ${sparkle(w * 0.3, 10, 0.8, "#fff", Math.max(0, wave(t, 0.1)))}${sparkle(w * 0.7, H - 10, 0.8, "#fff", Math.max(0, wave(t, 0.6)))}`
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
    [0.0, 0, 0, "#ff6f9a", 12, 80], [0.08, 0, 0.25, "#ffd36b", 10, 70], [0.2, 0, 0.5, "#6fd8ff", 12, 80], [0.33, 0, 0.75, "#ff8fe0", 12, 70],
    [0.5, 0, 0.12, "#b98cff", 12, 80], [0.58, 0, 0.4, "#7ff0b0", 10, 70], [0.7, 0, 0.62, "#ffd36b", 12, 80], [0.83, 0, 0.88, "#6fd8ff", 12, 70],
  ]
  const fx = shows
    .map(([kx, ky, ph, c, n, size]) => {
      const k = (t + ph) % 1
      const [x, y] = perimeter(w, 10, kx)
      return `<g transform="translate(${f(x)} ${f(y)}) scale(.42)">${fireworkBurst(k / 0.8, c, n, size)}</g>`
    })
    .join("")
  const r = rng(31)
  const stars = Array.from({ length: 60 }, () => {
    const [x, y] = perimeter(w, 10 + (r() - 0.5) * 8, r())
    return `<circle cx="${f(x)}" cy="${f(y)}" r="${f(0.6 + r() * 1.1)}" fill="#fff" opacity="${f(0.4 + 0.5 * r())}"/>`
  }).join("")
  const base = `
    <g filter="url(#hds)">
      ${rrect(w, rad, 10, `fill="none" stroke="#0c1a4a" stroke-width="22"`)}
      ${rrect(w, rad, 10, `fill="none" stroke="url(#hfwBand)" stroke-width="10"`)}
      ${rrect(w, rad, 3, `fill="none" stroke="${g[3]}" stroke-width="2"`)}${rrect(w, rad, 19, `fill="none" stroke="${g[3]}" stroke-width="2"`)}
      ${setGem(w / 2, 10, 6, g, GEM.sapphire, t, 0)}${setGem(w / 2, H - 10, 6, g, GEM.ruby, t, 0.5)}
    </g>${stars}`
  // ぼかし（filter）は動く絵を重くするので使わない
  const motion = `${fx}
    ${glint(w / 2, 10, 0.8, flash(t, 0))}${glint(w / 2, H - 10, 0.8, flash(t, 0.5))}`
  return layered(
    w,
    rad,
    layer,
    baseDefs(flowGrad("hfwBand", ["#0c1a4a", "#28125a", "#5a2a8a", "#28125a", "#0c1a4a"], 0, w) + bezelDef(g)),
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
  const zodiac = [0.3, 0.4, 0.5, 0.6, 0.7].map((k, i) => place(w * k, 13, 0, 0.36, star5(14, i % 2 ? g[4] : "#fff", g[1], 1.2))).join("")
  const r = rng(51)
  const stars = Array.from({ length: 14 }, () => [...perimeter(w, 13, r()), r()])
  const lx = luxe("harL", t, { w, rad }, g, { inlay: "#0d1640", inlayWidth: 10, corners: [1, 3], cornerJewel: "sapphire", gems: [[0.08, "sapphire"], [0.42, "sapphire"], [0.58, "sapphire"], [0.92, "sapphire"]] })
  const base = `${lx.base}
    <g filter="url(#hds)">
      ${ticks(w * 0.3, w * 0.7, H - 13)}${zodiac}
      ${place(46, 40, -10, 0.42, sphere(1))}
      ${place(w - 36, H - 36, 0, 0.6, `<circle r="26" fill="url(#harS)"/>${Array.from({ length: 16 }, (_, i) => `<path d="M0-30L4-40 0-52-4-40Z" fill="${g[4]}" stroke="${g[2]}" stroke-width=".8" transform="rotate(${i * 22.5})"/>`).join("")}<circle r="26" fill="none" stroke="${g[2]}" stroke-width="2"/>`)}
    </g>`
  const motion = `${lx.motion}
    ${stars.map(([x, y, ph]) => sparkle(x, y, 0.4, "#fff6c8", Math.max(0, wave(t, ph)))).join("")}
    ${glint(46, 40, 0.7, 0.3 + 0.7 * flash(t, 0))}${glint(w - 36, H - 36, 0.8, 0.3 + 0.7 * flash(t, 0.5))}`
  return layered(
    w,
    rad,
    layer,
    baseDefs(lx.defs + lg("harG", [g[5], g[3], g[2], g[4]], 1, 1) + bezelDef(g) + '<radialGradient id="harGlass" cx=".4" cy=".35"><stop offset="0" stop-color="#3a4cff" stop-opacity=".35"/><stop offset="1" stop-color="#0d1640" stop-opacity=".55"/></radialGradient><radialGradient id="harS" cx=".4" cy=".35"><stop offset="0" stop-color="#fffbe0"/><stop offset=".6" stop-color="#ffd76a"/><stop offset="1" stop-color="#d98a12"/></radialGradient>'),
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
    const [x, y] = perimeter(w, 14 + (r() - 0.5) * 16, s)
    return paintDot(x, y, 2 + r() * 4, PICTOR_COLORS[i % PICTOR_COLORS.length], 0.85)
  }).join("")
  const floaters = bandFlow(t, w, 12, 62, (x, y, i, k) => paintDot(x, y, 3.5 + (i % 3), PICTOR_COLORS[i % PICTOR_COLORS.length], 0.4 + 0.55 * k), 14, 10)
  const base = `
    <g filter="url(#hds)">
      ${rrect(w, rad, 12, `fill="none" stroke="#fffaf2" stroke-width="26"`)}
      ${strokes}${splats}
      ${place(40, 32, -18, 0.5, palette)}
      ${place(84, 22, 64, 0.42, brush("#ff8a1f"))}${place(96, 14, 76, 0.38, brush("#16b8a0"))}
    </g>
    ${pictorChan("hello", w - 60, H + 2, 104)}`
  const motion = `${floaters}
    ${sparkle(w * 0.3, 14, 0.8, "#fff", Math.max(0, wave(t, 0.1)))}${sparkle(w * 0.7, H - 14, 0.8, "#fff", Math.max(0, wave(t, 0.6)))}`
  return layered(w, rad, layer, baseDefs(pictorOutlineDef("pcOut", 4)), base, motion)
}

const pictorLove = (t, { w, rad }, layer = "all") => {
  const m = METAL.rose
  const hearts = [].map((s) => s)
    .map((s, i) => {
      const [x, y] = perimeter(w, 12, s)
      return place(x, y, (i % 3 - 1) * 14, i % 3 === 0 ? 0.6 : 0.42, heart(i % 2 ? "url(#hplH)" : "url(#hplH2)"))
    })
    .join("")
  const rising = bandFlow(t, w, 10, 71, (x, y, i, k) => place(x, y, 0, 0.3, heart(i % 2 ? "#ff8fb1" : "#ffe6f0"), `opacity="${f(0.3 + 0.7 * k)}"`), 10, 4)
  const lx = luxe("hplL", t, { w, rad }, m, { inlay: "url(#hplIn)", inlayWidth: 7, corners: PICTOR_CHAN_OFF ? [0, 1, 2, 3] : [0, 1, 3], cornerJewel: "pink", gems: [[0.15, "ruby"], [0.35, "ruby"], [0.6, "ruby"], [0.9, "ruby"]] })
  const base = `${lx.base}
    <g filter="url(#hds)">
      ${place(w / 2, 13, 0, 0.62, heart("url(#hplH)"))}${hearts}
    </g>
    ${pictorChan("love", w - 58, H + 2, 104)}`
  const motion = `${lx.motion}${rising}
    ${glint(w / 2, 9, 0.8, flash(t, 0.35))}`
  return layered(
    w,
    rad,
    layer,
    baseDefs(lx.defs + flowGrad("hplIn", ["#b3184a", "#e2386b", "#ff8fb1", "#e2386b", "#b3184a"], 0, w) + pictorOutlineDef("pcOut", 4) + lg("hplH", ["#ffd0e0", "#ff6f9a", "#e2386b"]) + lg("hplH2", ["#ffe6f0", "#ff9fc2", "#ff6f9a"])),
    base,
    motion,
  )
}

const pictorRainbow = (t, { w, rad }, layer = "all") => {
  const p = METAL.platinum
  const lx = luxe("hprL", t, { w, rad }, p, { inlay: "url(#hprBand)", inlayWidth: 8, corners: PICTOR_CHAN_OFF ? [0, 1, 2, 3] : [0, 1, 3], cornerJewel: "diamond", ur: true, halo: "url(#hprBand)", gems: [[0.11, "ruby"], [0.19, "topaz"], [0.27, "emerald"], [0.35, "sapphire"], [0.5 + 0.2, "amethyst"], [0.5 + 0.3, "pink"], [0.5 + 0.4, "ruby"]] })
  const confetti = bandFlow(t, w, 14, 81, (x, y, i, k) => `<rect x="-5" y="-2.5" width="10" height="5" rx="1.5" fill="${prismAt(i / 14)}" transform="translate(${f(x)} ${f(y)}) rotate(${f(t * 720 + i * 40)})" opacity="${f(0.4 + 0.6 * k)}"/>`, 11, 12)
  const stars = [[w * 0.86, 13, 11]]
    .map(([x, y, s], i) => place(x, y, 0, 0.85 + 0.2 * Math.sin(TAU * (t * 2 + i / 6)), star5(s, prismAt(i / 6 + t), "#fff", 2)))
    .join("")
  const base = `${lx.base}
    ${pictorChan("thanks", w - 128, H + 2, 84, { rot: -4 })}
    ${pictorChan("nice", w - 56, H + 2, 104)}`
  const motion = `${lx.motion}
    ${confetti}${stars}`
  return layered(w, rad, layer, `${baseDefs(flowGrad("hprBand", [...PRISM, PRISM[0]].map((c) => mixHex(c, "#ffffff", 0.2)), 0, w) + lx.defs + pictorOutlineDef("pcOut", 4))}`, base, motion)
}

/* ------------------------------------------------------------------ */
/* 控えめな枠（細いふちに小さな飾りがひとつ。アイコン枠の同じ名前のものとそろう）    */
/* ------------------------------------------------------------------ */

const hairline = (t, { w, rad }, layer = "all") => {
  const [x, y] = perimeter(w, 12, t)
  const base = `<g filter="url(#hds)">
      ${rrect(w, rad, 12, `fill="none" stroke="#fff" stroke-width="3"`)}${rrect(w, rad, 20, `fill="none" stroke="#fff" stroke-width="1" opacity=".55"`)}
    </g>`
  const motion = `<circle cx="${f(x)}" cy="${f(y)}" r="4" fill="#fff" filter="url(#hds)"/>`
  return layered(w, rad, layer, baseDefs(), base, motion)
}

const oneStar = (t, { w, rad }, layer = "all") => {
  const g = METAL.gold
  const x = w - 60
  const y = 12
  const base = `<g filter="url(#hds)">
      ${rrect(w, rad, 12, `fill="none" stroke="${g[1]}" stroke-width="4"`)}${rrect(w, rad, 12, `fill="none" stroke="${g[3]}" stroke-width="2.4"`)}
    </g>`
  const motion = `<g filter="url(#hds)">${place(x, y, 12, 0.9 + 0.12 * wave(t), star5(17, "url(#h1s)", g[1], 1.4))}</g>${glint(x, y, 0.8, flash(t, 0.15))}`
  return layered(w, rad, layer, baseDefs(lg("h1s", [g[4], g[3], g[2]])), base, motion)
}

const silverMoon = (t, { w, rad }, layer = "all") => {
  const m = METAL.silver
  const x = w - 52
  const y = 14
  const moon = '<path d="M0-18A18 18 0 1 0 0 18A22 22 0 0 1 0-18Z" fill="url(#hsm)" stroke="#5c6876" stroke-width="1.2"/>'
  const base = `<g filter="url(#hds)">
      ${rrect(w, rad, 12, `fill="none" stroke="${m[0]}" stroke-width="7"`)}${rrect(w, rad, 12, `fill="none" stroke="url(#hsmBand)" stroke-width="5"`)}
      ${place(x, y, 18, 1.1, moon)}${place(x - 40, y - 2, 0, 1, star5(6, "#fff", m[1], 1))}${place(x + 38, y + 30, 0, 1, star5(5, "#fff", m[1], 1))}
    </g>`
  const motion = `${sparkle(x - 70, y - 2, 0.5, "#fff", Math.max(0, wave(t, 0.3)))}${sparkle(x + 38, y + 60, 0.45, "#fff", Math.max(0, wave(t, 0.75)))}`
  return layered(w, rad, layer, baseDefs(lg("hsm", [m[5], m[4], m[2]], 1, 1) + flowGrad("hsmBand", [m[2], m[4], m[5], m[3], m[1]], 0, w)), base, motion)
}

export const HEADER_FRAMES = [
  { slug: "gacha-ssr-makie", rarity: "SSR", frames: 24, frameMs: 150, name: "金蒔絵の夜桜", description: "漆黒と金のふちに、角の小さな夜桜の枝と満月", draw: makie },
  { slug: "gacha-ur-kyubi", rarity: "UR", frames: 24, frameMs: 150, name: "九尾の白狐", description: "角にのぞく九本の尾と狐の面、ふちを流れる狐火", draw: kyubi },
  { slug: "gacha-ur-star-crown", rarity: "UR", frames: 24, frameMs: 150, name: "星海の王冠", description: "星雲の流れるふちに、角の惑星と小さな白金の王冠", draw: starCrown },
  { slug: "gacha-r-hydrangea", rarity: "R", frames: 24, frameMs: 150, name: "雨上がりのあじさい", description: "角に咲く青と桃色のあじさいと、落ちる雨つぶ", draw: hydrangea },
  { slug: "gacha-sr-fireworks", rarity: "SR", frames: 24, frameMs: 150, name: "夜空の花火", description: "夜色のふちの上で次々ひらく小さな花火", draw: fireworks },
  { slug: "gacha-sr-pictor-paint", rarity: "SR", pictor: true, frames: 24, frameMs: 150, name: "ぴくたーちゃんのお絵かき", description: "絵の具で描いたふちとパレット、右下で手をふるぴくたーちゃん", draw: pictorPaint },
  { slug: "gacha-ssr-armillary", rarity: "SSR", frames: 24, frameMs: 150, name: "金の天球儀", description: "角の小さな金の天球儀と太陽、目盛りのふち", draw: armillary },
  { slug: "gacha-ssr-pictor-love", rarity: "SSR", pictor: true, frames: 24, frameMs: 150, name: "ぴくたーちゃんのだいすき", description: "ローズゴールドのハートのふちと、右下のぴくたーちゃん", draw: pictorLove },
  { slug: "gacha-ur-pictor-rainbow", rarity: "UR", pictor: true, frames: 24, frameMs: 150, name: "きらめくぴくたーちゃん", description: "虹色のふちと紙吹雪、右下にふたりのぴくたーちゃん", draw: pictorRainbow },
  { slug: "gacha-n-hairline", rarity: "N", frames: 24, frameMs: 150, name: "ほそ線リング", description: "白い細い二重線と、ふちをゆっくりめぐる小さな粒", draw: hairline },
  { slug: "gacha-r-one-star", rarity: "R", frames: 24, frameMs: 150, name: "ひとつ星", description: "細い金のふちに、小さな星がひとつ", draw: oneStar },
  { slug: "gacha-sr-silver-moon", rarity: "SR", frames: 24, frameMs: 150, name: "銀の三日月", description: "細い銀のふちに、右上の小さな三日月と星", draw: silverMoon },
]
