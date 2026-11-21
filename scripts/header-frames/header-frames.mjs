/**
 * プロフィールのヘッダーの枠（SVG）。ヘッダー画像の上に重ねる。
 * 真ん中は空けて、飾りはふちと角に集める（その人のヘッダー画像を隠さないように）。
 * 比率はスマホ 5:2（1000×400）と PC 3:1（1200×400）の 2 枚を作る。どちらも高さは 400 で、
 * 角の飾りは同じ大きさ・同じ位置に置き、横に長い分だけ辺が伸びる（引き伸ばさないので絵がゆがまない）。
 * t は 0〜1 のループの位置。最初と最後が同じ絵になるように作る
 *
 * 軽くするために 2 枚に分ける。base は止まった絵（ふち・角の飾り）、motion は動くものだけ。
 * 動きは派手にせず、帯の上をぼんやりしたグラデーションの光がゆっくり流れるだけにする（softGlow）。
 * 画面では base の上に motion を重ねる。motion はほとんど透明なので、動く絵でも軽くなる。
 * layer に "base" / "motion" / "all" を渡す（all は確認用の 1 枚絵）
 */
import { PARTS } from "../avatar-frames/decorations.mjs"
import {
  PICTOR_CHAN_OFF,
  pictorChan,
  pictorOutlineDef,
} from "../avatar-frames/pictor-chan.mjs"

const {
  f,
  rng,
  place,
  heart,
  blossom,
  goldBlossom,
  star5,
  setGem,
  bezelDef,
  PEARL_DEF,
  METAL,
  GEM,
  PRISM,
  prismAt,
  mixHex,
  lg,
  TAU,
} = PARTS

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
    .map(
      (c, i) =>
        `<stop offset="${f(i / (stops.length - 1))}" stop-color="${c}"/>`,
    )
    .join("")}</linearGradient>`
}

/** 枠の外周（角を丸めない四角）の上の位置 s（0〜1）の座標 */
const perimeter = (w, inset, s) => {
  const iw = w - inset * 2
  const ih = H - inset * 2
  const total = (iw + ih) * 2
  let d = (((s % 1) + 1) % 1) * total
  if (d < iw) return [inset + d, inset]
  d -= iw
  if (d < ih) return [w - inset, inset + d]
  d -= ih
  if (d < iw) return [w - inset - d, H - inset]
  d -= iw
  return [inset, H - inset - d]
}

const baseDefs = (extra = "") => `<defs>
  <filter id="hds" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity=".45"/></filter>
  ${extra}
</defs>`

const svg = (w, rad, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${H}"><clipPath id="hclip">${rrect(w, rad, 0, "")}</clipPath><g clip-path="url(#hclip)">${body}</g></svg>`

/** 止まった絵と動く絵のどちらを描くか */
/**
 * 帯の上をゆっくり流れるぼんやりした光（グラデーション）。colors の色が順に淡く現れて、1 ループで 1 周期ずれる。
 * ぼかし（filter）は使わず、透明度のグラデーションでぼんやりさせる（動く絵を軽くするため）
 */
const softGlow = (
  id,
  t,
  { w, rad },
  colors,
  { inset = 13, width = 26, opacity = 0.32 } = {},
) => {
  const span = w * 0.75
  const stops = [
    ["#fff", 0, 0],
    ...colors.map((c, i) => [c, (i + 1) / (colors.length + 1), opacity]),
    ["#fff", 1, 0],
  ]
  const grad = `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${f(span)}" y2="${f(span * 0.3)}" spreadMethod="repeat" gradientTransform="translate(${f(t * span)} 0)">${stops
    .map(
      ([c, o, a]) =>
        `<stop offset="${f(o)}" stop-color="${c}" stop-opacity="${f(a)}"/>`,
    )
    .join("")}</linearGradient>`
  return `<defs>${grad}</defs>${rrect(w, rad, inset, `fill="none" stroke="url(#${id})" stroke-width="${width}"`)}`
}

const layered = (w, rad, layer, defs, base, motion) =>
  svg(
    w,
    rad,
    `${defs}${layer === "motion" ? "" : base}${layer === "base" ? "" : motion}`,
  )

/* ------------------------------------------------------------------ */
/* SSR・UR の彫金の帯                                                    */
/* ------------------------------------------------------------------ */

/** 角の唐草の金具（左上の角の形。ほかの角は裏返して使う）。内側へは 40px ほどまで */
const cornerPiece = (id, m, jewel, t, phase, ur) => {
  const curl = "M60 5C74 3 84 13 80 24C77 32 65 31 66 23C67 18 73 18 73 22"
  const metal = (d, wd) =>
    `<path d="${d}" fill="none" stroke="${m[0]}" stroke-width="${wd + 2.6}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="url(#${id}F)" stroke-width="${wd}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${m[5]}" stroke-width="${f(wd * 0.22)}" stroke-linecap="round" opacity=".8" transform="translate(-.6 -.8)"/>`
  const half = `${metal(curl, 4.6)}${metal("M44 26C50 30 52 36 48 41", 3)}`
  const plate = `<path d="M0 0H62C56 10 46 14 36 15 32 24 24 32 15 36 14 46 10 56 0 62Z" fill="url(#${id}F)" stroke="${m[0]}" stroke-width="1.8"/><path d="M8 8H50C46 12 40 14 32 14 28 22 22 28 14 32 13 40 11 46 8 50Z" fill="none" stroke="${m[5]}" stroke-width="1" opacity=".7"/>`
  const small = ur
    ? `${setGem(50, 9, 3.4, m, GEM.diamond, t, phase + 0.3)}${setGem(9, 50, 3.4, m, GEM.diamond, t, phase + 0.6)}`
    : `${pearlDot(50, 9, 3.2)}${pearlDot(9, 50, 3.2)}`
  return `${half}<g transform="matrix(0 1 1 0 0 0)">${half}</g>${plate}${small}${setGem(22, 22, ur ? 10 : 8.5, m, jewel, t, phase)}`
}

const pearlDot = (x, y, r) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="#fffaf3" stroke="#a8948a" stroke-width=".8"/><circle cx="${f(x - r * 0.3)}" cy="${f(y - r * 0.35)}" r="${f(r * 0.32)}" fill="#fff"/>`

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
const luxe = (
  id,
  t,
  { w, rad },
  m,
  {
    inlay,
    inlayWidth = 7,
    corners = [0, 1, 2, 3],
    cornerJewel,
    gems = [],
    ur = false,
    halo,
  },
) => {
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
  return { defs, base }
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
      [0.12, 14],
      [0.22, 24],
      [0.3, 46],
      [0.24, 78],
      [0.4, 30],
      [0.5, 32],
      [0.58, 46],
      [0.72, 70],
      [0.66, 28],
      [0.8, 22],
      [0.9, 4],
      [0.97, 18],
    ]
    const flowers = spots
      .map(([k, y], i) =>
        place(
          len * k,
          y + (r() - 0.5) * 6,
          i * 31,
          0.62 + r() * 0.34,
          blossom(),
        ),
      )
      .join("")
    const buds = Array.from(
      { length: 6 },
      (_, i) =>
        `<circle cx="${f(len * (0.15 + i * 0.15))}" cy="${f(18 + r() * 30)}" r="4" fill="#ff8fb4" stroke="#c2185b" stroke-width=".8"/>`,
    ).join("")
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
      return place(
        x,
        y,
        i * 40,
        i % 3 === 0 ? 0.5 : 0.36,
        goldBlossom("url(#hmkG)", g[1]),
      )
    })
    .join("")
  const moon = [w / 2, 14]
  const lx = luxe("hmkL", t, { w, rad }, g, {
    inlay: METAL.onyx[1],
    inlayWidth: 8,
    corners: [1, 3],
    cornerJewel: "ruby",
    gems: [
      [0.16, "pink"],
      [0.34, "pink"],
      [0.66, "pink"],
      [0.84, "pink"],
    ],
  })
  return layered(
    w,
    rad,
    layer,
    baseDefs(
      `${lg("petal", ["#fff3f7", "#ffc1d6", "#ff8fb4"]) + lg("hmkG", ["#fffadd", "#ffe58c", "#e9bd42", "#b9860e"]) + flowGrad("hmkBand", [g[1], g[3], g[5], g[3], g[2], g[4], g[1]], 0, w) + bezelDef(g) + PEARL_DEF}<radialGradient id="hmkM" cx=".4" cy=".4"><stop offset="0" stop-color="#fffbe8"/><stop offset=".7" stop-color="#ffe7a0"/><stop offset="1" stop-color="#f2c45a"/></radialGradient>${lx.defs}`,
    ),
    `${lx.base}<g filter="url(#hds)">
      ${golds}
      ${setGem(w / 2, H - 13, 7, g, GEM.pink, t, 0.5)}
      ${branch(1, 330, 7)}${branch(-1, 250, 13)}
      <circle cx="${moon[0]}" cy="${moon[1]}" r="23" fill="${g[0]}"/><circle cx="${moon[0]}" cy="${moon[1]}" r="21.5" fill="url(#bz-${g[2].slice(1)})"/><circle cx="${moon[0]}" cy="${moon[1]}" r="17" fill="${METAL.onyx[1]}"/>
      <circle cx="${moon[0]}" cy="${moon[1]}" r="13" fill="url(#hmkM)"/>
      <circle cx="${moon[0] - 4}" cy="${moon[1] + 3}" r="2.4" fill="#f0cf78" opacity=".45"/><circle cx="${moon[0] + 4}" cy="${moon[1] - 4}" r="1.6" fill="#f0cf78" opacity=".4"/>
    </g>`,
    softGlow("hmkG2", t, { w, rad }, ["#fff4c8", "#ffe08a", "#fff4c8"]),
  )
}

/* ------------------------------------------------------------------ */
/* UR 九尾の白狐                                                        */
/* ------------------------------------------------------------------ */

const kyubi = (t, { w, rad }, layer = "all") => {
  const p = METAL.platinum
  let grads = ""
  const tail = (i, _n, x, y, d, s, flip) => {
    const tip = prismAt(i / 9)
    const id = `hky${i}`
    grads += `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="-150"><stop offset="0" stop-color="#ffffff"/><stop offset=".45" stop-color="#fffaf4"/><stop offset=".75" stop-color="${mixHex(tip, "#ffffff", 0.4)}"/><stop offset="1" stop-color="${tip}"/></linearGradient>`
    const body = `<g transform="scale(${flip ? -1 : 1} 1)"><path d="M-18 0C-40-30-50-78-34-118-26-138-6-152 14-150 30-148 40-136 34-126 26-134 14-132 12-122 30-110 36-84 30-56 26-32 18-14 18 0Z" fill="url(#${id})" stroke="#a898c8" stroke-width="2" stroke-linejoin="round"/><path d="M-6-14C-20-44-24-80-14-110M8-18C14-46 14-72 8-96M-20-60C-26-74-28-90-24-104" stroke="#e6dcf3" stroke-width="1.6" fill="none" stroke-linecap="round"/></g>`
    return place(x, y, d, s, body)
  }
  // 九本の尾: 右下に 5 本（左上へ扇形）、左上に 4 本（右下へ扇形）。付け根は角の外に隠して、尾の形が全部見えるようにする
  const br = Array.from({ length: 5 }, (_, i) =>
    tail(i, 5, w + 2, H + 2, -6 - i * 19.5, 0.5, i > 2),
  ).join("")
  const tl = Array.from({ length: 4 }, (_, i) =>
    tail(5 + i, 4, -2, -2, 102 + i * 22, 0.46, i < 2),
  ).join("")
  // 狐のお面（右下の尾の付け根）。白い顔に朱の隈取り
  const mask = `<path d="M-30-30L-24-62-6-38H6L24-62 30-30C40-8 30 22 0 40-30 22-40-8-30-30Z" fill="#fff" stroke="#b9a9d6" stroke-width="2.2" stroke-linejoin="round"/><path d="M-24-56L-12-38M24-56L12-38" stroke="#ff6f8f" stroke-width="5" stroke-linecap="round"/><path d="M-24-10C-18-16-10-16-6-11M24-10C18-16 10-16 6-11" stroke="#d6264f" stroke-width="3.6" fill="none" stroke-linecap="round"/><path d="M-22-2L-30 6M22-2L30 6M-20 6L-28 14M20 6L28 14" stroke="#d6264f" stroke-width="2.6" stroke-linecap="round"/><path d="M0-30C-3-26-3-22 0-18 3-22 3-26 0-30Z" fill="#d6264f"/><circle cy="30" r="5" fill="#2a1e3a"/><path d="M-6 22C-2 26 2 26 6 22" stroke="#2a1e3a" stroke-width="2" fill="none"/>`
  const lx = luxe("hkyL", t, { w, rad }, p, {
    inlay: "url(#hkyBand)",
    inlayWidth: 8,
    corners: [1, 3],
    cornerJewel: "diamond",
    ur: true,
    halo: "url(#hkyBand)",
    gems: [
      [0.2, "ruby"],
      [0.32, "topaz"],
      [0.5 + 0.18, "sapphire"],
      [0.5 + 0.3, "amethyst"],
      [0.5 + 0.42, "emerald"],
    ],
  })
  const base = `${lx.base}
    <g filter="url(#hds)">
      ${tl}${br}
      ${place(w - 34, H - 34, -14, 0.5, mask)}
    </g>`
  const motion = softGlow(
    "hkyG",
    t,
    { w, rad },
    ["#ffd0e0", "#fff0b8", "#c8f4ff", "#e6d4ff"],
    { opacity: 0.38 },
  )
  return layered(
    w,
    rad,
    layer,
    `${baseDefs(
      flowGrad(
        "hkyBand",
        [...PRISM, PRISM[0]].map((c) => mixHex(c, "#ffffff", 0.25)),
        0,
        w,
      ) +
        bezelDef(p) +
        PEARL_DEF +
        lx.defs,
    )}${grads}`,
    base,
    motion,
  )
}

/* ------------------------------------------------------------------ */
/* UR 星海の王冠                                                        */
/* ------------------------------------------------------------------ */

const starCrown = (t, { w, rad }, layer = "all") => {
  const m = METAL.platinum
  const g = METAL.gold
  const saturn = `<circle r="15" fill="url(#hsc1)"/><ellipse rx="27" ry="7" fill="none" stroke="#ffe0a8" stroke-width="3.2" transform="rotate(-22)"/>`
  const blue = `<circle r="12" fill="url(#hsc2)"/><circle cx="-4" cy="-4" r="3.5" fill="#fff" opacity=".4"/>`
  const pink = `<circle r="9" fill="url(#hsc3)"/>`
  const crown = `<path d="M-46 14L-52-22-28-2-12-34 0-8 12-34 28-2 52-22 46 14Z" fill="url(#hscCrown)" stroke="${m[1]}" stroke-width="2" stroke-linejoin="round"/><path d="M-46 14H46V24H-46Z" fill="url(#hscCrown)" stroke="${m[1]}" stroke-width="2"/>${[-52, -12, 12, 52].map((x, i) => `<circle cx="${x}" cy="${i === 0 || i === 3 ? -22 : -34}" r="4" fill="${g[4]}" stroke="${g[1]}"/>`).join("")}`
  const lx = luxe("hscL", t, { w, rad }, m, {
    inlay: "url(#hscBand)",
    inlayWidth: 10,
    corners: [1, 3],
    cornerJewel: "amethyst",
    ur: true,
    halo: "url(#hscHalo)",
    gems: [
      [0.34, "sapphire"],
      [0.84, "amethyst"],
      [0.6, "pink"],
    ],
  })
  const base = `${lx.base}
    <g filter="url(#hds)">
      ${place(34, 30, -8, 1.3, saturn)}
      ${place(w - 30, H - 30, 0, 1.3, blue)}
      ${place(w - 150, 12, 0, 1, pink)}
      ${place(150, 14, 0, 0.5, crown)}
      ${setGem(150, 5, 4, m, GEM.amethyst, t, 0.3)}
      ${place(w - 150, H - 12, 0, 0.6, star5(16, "url(#hscStar)", g[1], 1.4))}
    </g>`
  const motion = softGlow(
    "hscG",
    t,
    { w, rad },
    ["#e6d4ff", "#ffd0f0", "#c8e8ff"],
    { opacity: 0.38 },
  )
  return layered(
    w,
    rad,
    layer,
    `${baseDefs(
      flowGrad(
        "hscBand",
        ["#0a0730", "#3b1a8a", "#c0389a", "#1e5ad0", "#3b1a8a", "#0a0730"],
        0,
        w,
      ) +
        flowGrad("hscMetal", [m[2], m[4], m[5], m[3], m[2]], 0, w) +
        lg("hscStar", ["#fffadd", "#ffe58c", "#e9bd42"]) +
        lg("hscCrown", [m[5], m[3], m[2], m[4]], 1, 1) +
        bezelDef(m) +
        PEARL_DEF +
        lx.defs +
        flowGrad(
          "hscHalo",
          ["#7b5cff", "#ff6fd0", "#4fd0ff", "#7b5cff"],
          0,
          w,
        ) +
        '<radialGradient id="hsc1" cx=".35" cy=".3"><stop offset="0" stop-color="#ffe9c4"/><stop offset="1" stop-color="#d27c35"/></radialGradient><radialGradient id="hsc2" cx=".35" cy=".3"><stop offset="0" stop-color="#bff0ff"/><stop offset="1" stop-color="#2a5fd0"/></radialGradient><radialGradient id="hsc3" cx=".35" cy=".3"><stop offset="0" stop-color="#ffe0f2"/><stop offset="1" stop-color="#c0389a"/></radialGradient>',
    )}`,
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

const hLeaf = (fill) =>
  `<path d="M0 0C14-14 44-16 62 0 44 16 14 14 0 0Z" fill="${fill}" stroke="#2f7a46" stroke-width="1.4"/><path d="M4 0H56" stroke="#2f7a46" stroke-width="1.2" opacity=".7"/>`

const hydrangea = (t, { w, rad }, layer = "all") => {
  const blue = ["#8fb4ff", "#b39dff", "#a8d8ff", "#7f9cff"]
  const pink = ["#ffa8d4", "#d9a8ff", "#ffc6e4", "#c9a8ff"]
  const corner = (
    x,
    y,
    s,
    flip,
  ) => `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${flip ? -s : s})">
    ${place(70, 18, 20, 1.2, hLeaf("#5fbf7a"))}${place(20, 70, 70, 1.1, hLeaf("#4fae6a"))}${place(118, 6, -6, 0.9, hLeaf("#6fcf8a"))}
    ${place(40, 34, 0, 1, hydrangeaCluster(46, blue, 11))}${place(116, 24, 0, 1, hydrangeaCluster(34, pink, 12, 18))}${place(18, 108, 0, 1, hydrangeaCluster(32, blue.slice(1), 13, 16))}</g>`
  const base = `
    <g filter="url(#hds)">
      ${rrect(w, rad, 10, `fill="none" stroke="#e8f4ec" stroke-width="16"`)}
      ${rrect(w, rad, 10, `fill="none" stroke="#7fc890" stroke-width="4"`)}
      ${rrect(w, rad, 3, `fill="none" stroke="#bfe6ff" stroke-width="2"`)}${rrect(w, rad, 18, `fill="none" stroke="#bfe6ff" stroke-width="2"`)}
      ${corner(-6, -6, 0.62, false)}${corner(w + 6, H + 6, 0.62, true)}
    </g>`
  const motion = softGlow("hhyG", t, { w, rad }, ["#d8e6ff", "#ffe0f0"], {
    inset: 10,
    width: 20,
  })
  return layered(w, rad, layer, baseDefs(), base, motion)
}

/* ------------------------------------------------------------------ */
/* SR 夜空の花火                                                        */
/* ------------------------------------------------------------------ */

const fireworks = (t, { w, rad }, layer = "all") => {
  const g = METAL.gold
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
  const motion = softGlow(
    "hfwG",
    t,
    { w, rad },
    ["#ffc8dc", "#fff0b8", "#c8ecff"],
    { inset: 10, width: 22 },
  )
  return layered(
    w,
    rad,
    layer,
    baseDefs(
      flowGrad(
        "hfwBand",
        ["#0c1a4a", "#28125a", "#5a2a8a", "#28125a", "#0c1a4a"],
        0,
        w,
      ) + bezelDef(g),
    ),
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
    const orbit = (tilt, ry) =>
      `<ellipse rx="70" ry="${ry}" transform="rotate(${tilt})" fill="none" stroke="${g[1]}" stroke-width="7"/><ellipse rx="70" ry="${ry}" transform="rotate(${tilt})" fill="none" stroke="url(#harG)" stroke-width="4.6"/>`
    return `<g transform="scale(${s})"><circle r="70" fill="url(#harGlass)"/>${orbit(-28, 22)}${orbit(32, 18)}${orbit(90, 26)}<circle r="70" fill="none" stroke="${g[1]}" stroke-width="8"/><circle r="70" fill="none" stroke="url(#harG)" stroke-width="5"/><circle r="15" fill="url(#harS)"/>${Array.from({ length: 12 }, (_, i) => `<path d="M0-18L3-25 0-32-3-25Z" fill="${g[4]}" transform="rotate(${i * 30})"/>`).join("")}<path d="M0 70V110M-30 110H30" stroke="${g[1]}" stroke-width="9" stroke-linecap="round"/><path d="M0 70V110M-30 110H30" stroke="url(#harG)" stroke-width="5" stroke-linecap="round"/></g>`
  }
  const ticks = (x0, x1, y) =>
    Array.from(
      { length: Math.floor((x1 - x0) / 14) },
      (_, i) =>
        `<path d="M${x0 + i * 14} ${y - (i % 5 ? 3 : 6)}V${y + (i % 5 ? 3 : 6)}" stroke="${g[3]}" stroke-width="${i % 5 ? 1 : 1.8}"/>`,
    ).join("")
  const zodiac = [0.3, 0.4, 0.5, 0.6, 0.7]
    .map((k, i) =>
      place(w * k, 13, 0, 0.36, star5(14, i % 2 ? g[4] : "#fff", g[1], 1.2)),
    )
    .join("")
  const lx = luxe("harL", t, { w, rad }, g, {
    inlay: "#0d1640",
    inlayWidth: 10,
    corners: [1, 3],
    cornerJewel: "sapphire",
    gems: [
      [0.08, "sapphire"],
      [0.42, "sapphire"],
      [0.58, "sapphire"],
      [0.92, "sapphire"],
    ],
  })
  const base = `${lx.base}
    <g filter="url(#hds)">
      ${ticks(w * 0.3, w * 0.7, H - 13)}${zodiac}
      ${place(46, 40, -10, 0.42, sphere(1))}
      ${place(w - 36, H - 36, 0, 0.6, `<circle r="26" fill="url(#harS)"/>${Array.from({ length: 16 }, (_, i) => `<path d="M0-30L4-40 0-52-4-40Z" fill="${g[4]}" stroke="${g[2]}" stroke-width=".8" transform="rotate(${i * 22.5})"/>`).join("")}<circle r="26" fill="none" stroke="${g[2]}" stroke-width="2"/>`)}
    </g>`
  const motion = softGlow("harG2", t, { w, rad }, [
    "#fff4c8",
    "#ffe08a",
    "#fff4c8",
  ])
  return layered(
    w,
    rad,
    layer,
    baseDefs(
      `${lx.defs + lg("harG", [g[5], g[3], g[2], g[4]], 1, 1) + bezelDef(g)}<radialGradient id="harGlass" cx=".4" cy=".35"><stop offset="0" stop-color="#3a4cff" stop-opacity=".35"/><stop offset="1" stop-color="#0d1640" stop-opacity=".55"/></radialGradient><radialGradient id="harS" cx=".4" cy=".35"><stop offset="0" stop-color="#fffbe0"/><stop offset=".6" stop-color="#ffd76a"/><stop offset="1" stop-color="#d98a12"/></radialGradient>`,
    ),
    base,
    motion,
  )
}

/* ------------------------------------------------------------------ */
/* ぴくたーちゃん                                                        */
/* ------------------------------------------------------------------ */

const PICTOR_COLORS = [
  "#ff8a1f",
  "#1f6fd0",
  "#16b8a0",
  "#ffd23f",
  "#ff5fa2",
  "#7a5cff",
]

const paintDot = (x, y, r, c, o = 1) =>
  `<g opacity="${f(o)}"><circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${c}"/><circle cx="${f(x - r * 0.3)}" cy="${f(y - r * 0.35)}" r="${f(r * 0.3)}" fill="#fff" opacity=".7"/></g>`

/** パレットと筆 */
const palette = `<path d="M-60 0C-60-40-20-58 16-52 52-46 70-20 64 8 58 34 30 30 22 44 14 58-10 62-30 52-52 42-60 22-60 0Z" fill="#f3d9b1" stroke="#9a6a3a" stroke-width="3"/><ellipse cx="6" cy="22" rx="12" ry="9" fill="#fff" stroke="#9a6a3a" stroke-width="2.4"/>${[
  [-38, -10, "#ff8a1f"],
  [-20, -34, "#ffd23f"],
  [10, -38, "#16b8a0"],
  [38, -22, "#1f6fd0"],
  [44, 6, "#ff5fa2"],
  [-36, 20, "#7a5cff"],
]
  .map(
    ([x, y, c]) =>
      `<path d="M${x - 9} ${y}C${x - 9} ${y - 10} ${x + 9} ${y - 10} ${x + 9} ${y}C${x + 10} ${y + 8} ${x - 9} ${y + 9} ${x - 9} ${y}Z" fill="${c}"/><circle cx="${x - 3}" cy="${y - 3}" r="2.4" fill="#fff" opacity=".7"/>`,
  )
  .join("")}`

const brush = (tip) =>
  `<path d="M-5 0H5L4 90Q0 98-4 90Z" fill="#c9773a" stroke="#7a3e14" stroke-width="1.8"/><path d="M-7-16H7V2H-7Z" fill="#d3dcea" stroke="#56647d" stroke-width="1.6"/><path d="M-7-16C-9-30-4-46 0-54 4-46 9-30 7-16Z" fill="#3a2a1e"/><path d="M-5-26C-5-38-2-46 0-51 2-46 5-38 5-26Z" fill="${tip}"/>`

const pictorPaint = (t, { w, rad }, layer = "all") => {
  const r = rng(61)
  // 筆で描いたふち: 色ごとに区切った太い線を、少しずつずらして重ねる
  const strokes = PICTOR_COLORS.slice(0, 4)
    .map((c, i) =>
      rrect(
        w,
        rad,
        9 + (i % 2) * 6,
        `fill="none" stroke="${c}" stroke-width="11" stroke-linecap="round" stroke-dasharray="${180 + i * 23} ${120 + i * 17}" stroke-dashoffset="${i * 131}" opacity=".92"`,
      ),
    )
    .join("")
  const splats = Array.from({ length: 40 }, (_, i) => {
    const s = r()
    const [x, y] = perimeter(w, 14 + (r() - 0.5) * 16, s)
    return paintDot(
      x,
      y,
      2 + r() * 4,
      PICTOR_COLORS[i % PICTOR_COLORS.length],
      0.85,
    )
  }).join("")
  const base = `
    <g filter="url(#hds)">
      ${rrect(w, rad, 12, `fill="none" stroke="#fffaf2" stroke-width="26"`)}
      ${strokes}${splats}
      ${place(40, 32, -18, 0.5, palette)}
      ${place(84, 22, 64, 0.42, brush("#ff8a1f"))}${place(96, 14, 76, 0.38, brush("#16b8a0"))}
    </g>
    ${pictorChan("hello", w - 60, H + 2, 104)}`
  const motion = softGlow(
    "hppG",
    t,
    { w, rad },
    ["#ffe0b8", "#c8f0e8", "#d8e4ff"],
    { inset: 12, width: 24 },
  )
  return layered(
    w,
    rad,
    layer,
    baseDefs(pictorOutlineDef("pcOut", 4)),
    base,
    motion,
  )
}

const pictorLove = (t, { w, rad }, layer = "all") => {
  const m = METAL.rose
  const hearts = []
    .map((s) => s)
    .map((s, i) => {
      const [x, y] = perimeter(w, 12, s)
      return place(
        x,
        y,
        ((i % 3) - 1) * 14,
        i % 3 === 0 ? 0.6 : 0.42,
        heart(i % 2 ? "url(#hplH)" : "url(#hplH2)"),
      )
    })
    .join("")
  const lx = luxe("hplL", t, { w, rad }, m, {
    inlay: "url(#hplIn)",
    inlayWidth: 7,
    corners: PICTOR_CHAN_OFF ? [0, 1, 2, 3] : [0, 1, 3],
    cornerJewel: "pink",
    gems: [
      [0.15, "ruby"],
      [0.35, "ruby"],
      [0.6, "ruby"],
      [0.9, "ruby"],
    ],
  })
  const base = `${lx.base}
    <g filter="url(#hds)">
      ${place(w / 2, 13, 0, 0.62, heart("url(#hplH)"))}${hearts}
    </g>
    ${pictorChan("love", w - 58, H + 2, 104)}`
  const motion = softGlow("hplG", t, { w, rad }, [
    "#ffe0ec",
    "#ffc8dc",
    "#ffe0ec",
  ])
  return layered(
    w,
    rad,
    layer,
    baseDefs(
      lx.defs +
        flowGrad(
          "hplIn",
          ["#b3184a", "#e2386b", "#ff8fb1", "#e2386b", "#b3184a"],
          0,
          w,
        ) +
        pictorOutlineDef("pcOut", 4) +
        lg("hplH", ["#ffd0e0", "#ff6f9a", "#e2386b"]) +
        lg("hplH2", ["#ffe6f0", "#ff9fc2", "#ff6f9a"]),
    ),
    base,
    motion,
  )
}

const pictorRainbow = (t, { w, rad }, layer = "all") => {
  const p = METAL.platinum
  const lx = luxe("hprL", t, { w, rad }, p, {
    inlay: "url(#hprBand)",
    inlayWidth: 8,
    corners: PICTOR_CHAN_OFF ? [0, 1, 2, 3] : [0, 1, 3],
    cornerJewel: "diamond",
    ur: true,
    halo: "url(#hprBand)",
    gems: [
      [0.11, "ruby"],
      [0.19, "topaz"],
      [0.27, "emerald"],
      [0.35, "sapphire"],
      [0.5 + 0.2, "amethyst"],
      [0.5 + 0.3, "pink"],
      [0.5 + 0.4, "ruby"],
    ],
  })
  const base = `${lx.base}
    ${pictorChan("thanks", w - 128, H + 2, 84, { rot: -4 })}
    ${pictorChan("nice", w - 56, H + 2, 104)}`
  const motion = softGlow(
    "hprG",
    t,
    { w, rad },
    ["#ffd0e0", "#fff0b8", "#c8f4ff", "#e6d4ff"],
    { opacity: 0.38 },
  )
  return layered(
    w,
    rad,
    layer,
    `${baseDefs(
      flowGrad(
        "hprBand",
        [...PRISM, PRISM[0]].map((c) => mixHex(c, "#ffffff", 0.2)),
        0,
        w,
      ) +
        lx.defs +
        pictorOutlineDef("pcOut", 4),
    )}`,
    base,
    motion,
  )
}

/* ------------------------------------------------------------------ */
/* 控えめな枠（細いふちに小さな飾りがひとつ。アイコン枠の同じ名前のものとそろう）    */
/* ------------------------------------------------------------------ */

const hairline = (t, { w, rad }, layer = "all") => {
  const base = `<g filter="url(#hds)">
      ${rrect(w, rad, 12, `fill="none" stroke="#fff" stroke-width="3"`)}${rrect(w, rad, 20, `fill="none" stroke="#fff" stroke-width="1" opacity=".55"`)}
    </g>`
  const motion = softGlow("hhlG", t, { w, rad }, ["#ffffff"], {
    inset: 14,
    width: 14,
    opacity: 0.35,
  })
  return layered(w, rad, layer, baseDefs(), base, motion)
}

const oneStar = (t, { w, rad }, layer = "all") => {
  const g = METAL.gold
  const x = w - 60
  const y = 12
  const base = `<g filter="url(#hds)">
      ${rrect(w, rad, 12, `fill="none" stroke="${g[1]}" stroke-width="4"`)}${rrect(w, rad, 12, `fill="none" stroke="${g[3]}" stroke-width="2.4"`)}
      ${place(x, y, 12, 1, star5(17, "url(#h1s)", g[1], 1.4))}
    </g>`
  const motion = softGlow("h1sG", t, { w, rad }, ["#fff4c8"], {
    inset: 12,
    width: 14,
    opacity: 0.4,
  })
  return layered(
    w,
    rad,
    layer,
    baseDefs(lg("h1s", [g[4], g[3], g[2]])),
    base,
    motion,
  )
}

const silverMoon = (t, { w, rad }, layer = "all") => {
  const m = METAL.silver
  const x = w - 52
  const y = 14
  const moon =
    '<path d="M0-18A18 18 0 1 0 0 18A22 22 0 0 1 0-18Z" fill="url(#hsm)" stroke="#5c6876" stroke-width="1.2"/>'
  const base = `<g filter="url(#hds)">
      ${rrect(w, rad, 12, `fill="none" stroke="${m[0]}" stroke-width="7"`)}${rrect(w, rad, 12, `fill="none" stroke="url(#hsmBand)" stroke-width="5"`)}
      ${place(x, y, 18, 1.1, moon)}${place(x - 40, y - 2, 0, 1, star5(6, "#fff", m[1], 1))}${place(x + 38, y + 30, 0, 1, star5(5, "#fff", m[1], 1))}
    </g>`
  const motion = softGlow("hsmG", t, { w, rad }, ["#ffffff"], {
    inset: 12,
    width: 16,
    opacity: 0.38,
  })
  return layered(
    w,
    rad,
    layer,
    baseDefs(
      lg("hsm", [m[5], m[4], m[2]], 1, 1) +
        flowGrad("hsmBand", [m[2], m[4], m[5], m[3], m[1]], 0, w),
    ),
    base,
    motion,
  )
}

/* ------------------------------------------------------------------ */
/* 追加の N・R・SR（アイコン枠の同じ名前の枠とおそろい）                    */
/* ------------------------------------------------------------------ */

/** 枠の外周に沿って、間隔 gap ごとの点（角はよけない） */
const alongEdge = (w, inset, gap) => {
  const total = (w - inset * 2 + H - inset * 2) * 2
  const n = Math.round(total / gap)
  return Array.from({ length: n }, (_, i) => perimeter(w, inset, i / n))
}

/** 四隅と、上下の辺の真ん中（飾りを置く場所）。角は丸めて切れないように corner だけ内側へ */
const accentPoints = (w, inset, corner = inset + 10) => [
  [corner, corner],
  [w - corner, corner],
  [w - corner, H - corner],
  [corner, H - corner],
  [w / 2, inset],
  [w / 2, H - inset],
]

const heartDots = (t, { w, rad }, layer = "all") => {
  const dots = alongEdge(w, 13, 22)
    .map(([x, y]) => `<circle cx="${f(x)}" cy="${f(y)}" r="2.6" fill="#ff9fc0"/>`)
    .join("")
  const hearts = accentPoints(w, 15)
    .map(([x, y], i) => place(x, y, 0, i < 4 ? 0.62 : 0.5, heart(i % 2 ? "#ffa3c2" : "#ff6f9f")))
    .join("")
  const base = `<g filter="url(#hds)">
      ${rrect(w, rad, 13, `fill="none" stroke="#fff" stroke-width="10" opacity=".92"`)}${dots}${hearts}
    </g>`
  const motion = softGlow("hhdG", t, { w, rad }, ["#ffc2d8"], { inset: 13, width: 14, opacity: 0.4 })
  return layered(w, rad, layer, baseDefs(), base, motion)
}

const cloudEdge = (t, { w, rad }, layer = "all") => {
  const puffs = alongEdge(w, 12, 46)
    .map(([x, y], i) => `<circle cx="${f(x)}" cy="${f(y)}" r="${12 + (i % 3) * 4}" fill="#fff"/>`)
    .join("")
  const base = `<g filter="url(#hds)">
      ${rrect(w, rad, 12, `fill="none" stroke="#e9f4ff" stroke-width="20"`)}${puffs}${rrect(w, rad, 26, `fill="none" stroke="#bcd9f5" stroke-width="2"`)}
    </g>`
  const motion = softGlow("hclG", t, { w, rad }, ["#ffffff", "#d6ecff"], { inset: 13, width: 22, opacity: 0.45 })
  return layered(w, rad, layer, baseDefs(), base, motion)
}

const stitchEdge = (t, { w, rad }, layer = "all") => {
  const base = `<g filter="url(#hds)">
      ${rrect(w, rad, 13, `fill="none" stroke="#f2c9a0" stroke-width="18"`)}
      ${rrect(w, rad, 7, `fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="8 7" stroke-linecap="round"`)}${rrect(w, rad, 19, `fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="8 7" stroke-linecap="round"`)}
      ${place(w / 2, 14, 0, 1, star5(22, "#ffe08a", "#c9905c", 2))}${place(w / 2 - 44, 14, 0, 1, star5(10, "#fff", "#c9905c", 1.2))}${place(w / 2 + 44, 14, 0, 1, star5(10, "#fff", "#c9905c", 1.2))}
    </g>`
  const motion = softGlow("hstG", t, { w, rad }, ["#fff4dc"], { inset: 13, width: 16, opacity: 0.4 })
  return layered(w, rad, layer, baseDefs(), base, motion)
}

const berry = `<path d="M0 18C-14 10-16-6-10-12-4-16 4-16 10-12 16-6 14 10 0 18Z" fill="#ff4f6d" stroke="#c22a48" stroke-width="1.4"/><path d="M-9-12L-4-6 0-13 4-6 9-12 4-17-4-17Z" fill="#5fae4c"/>${[
  [-5, -3],
  [4, -2],
  [-1, 5],
  [6, 6],
  [-7, 6],
]
  .map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="1.2" ry="1.8" fill="#ffe08a"/>`)
  .join("")}`

const strawberryEdge = (t, { w, rad }, layer = "all") => {
  const berries = accentPoints(w, 16)
    .map(([x, y], i) => place(x, y, i % 2 ? 18 : -18, 1.15, berry))
    .join("")
  const flowers = [w / 4, (w * 3) / 4]
    .flatMap((x) => [place(x, 14, 0, 0.42, blossom("#fff", "#ffd36b")), place(x, H - 14, 0, 0.42, blossom("#fff", "#ffd36b"))])
    .join("")
  const base = `<g filter="url(#hds)">
      ${rrect(w, rad, 13, `fill="none" stroke="#ffd3de" stroke-width="16"`)}${rrect(w, rad, 13, `fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="1 10" stroke-linecap="round"`)}
      ${flowers}${berries}
    </g>`
  const motion = softGlow("hsbG", t, { w, rad }, ["#ffe3ea"], { inset: 13, width: 18, opacity: 0.4 })
  return layered(w, rad, layer, baseDefs(), base, motion)
}

const bowKnot = (fill, dark) =>
  `<path d="M0 0C-8-12-26-16-28-4-30 8-12 10 0 0Z" fill="${fill}" stroke="${dark}" stroke-width="1.4"/><path d="M0 0C8-12 26-16 28-4 30 8 12 10 0 0Z" fill="${fill}" stroke="${dark}" stroke-width="1.4"/><path d="M-2 2L-10 22-4 19 0 24 2 3ZM2 2L10 22 4 19 0 24-2 3Z" fill="${fill}" stroke="${dark}" stroke-width="1.2"/><circle r="5" fill="${dark}"/>`

const bowsEdge = (t, { w, rad }, layer = "all") => {
  const colors = [
    ["#ff9fbf", "#d4567f"],
    ["#9fd2ff", "#4c8fd0"],
    ["#ffe08a", "#c99a2a"],
    ["#c7a8ff", "#8a5fd6"],
  ]
  const bows = accentPoints(w, 16, 22)
    .slice(0, 4)
    .map(([x, y], i) => place(x, y, [-45, 45, 135, -135][i], 0.95, bowKnot(...colors[i])))
    .join("")
  const base = `<g filter="url(#hds)">
      ${rrect(w, rad, 13, `fill="none" stroke="#fff6f9" stroke-width="9"`)}${rrect(w, rad, 13, `fill="none" stroke="#ffc2d6" stroke-width="3.5"`)}${bows}
    </g>`
  const motion = softGlow("hbwG", t, { w, rad }, ["#ffe0ec", "#e0f0ff"], { inset: 13, width: 12, opacity: 0.4 })
  return layered(w, rad, layer, baseDefs(), base, motion)
}

const auroraEdge = (t, { w, rad }, layer = "all") => {
  const m = METAL.silver
  const stars = alongEdge(w, 13, 140)
    .map(([x, y], i) => place(x, y, 0, 1, star5(i % 2 ? 3.5 : 5, "#fff")))
    .join("")
  const base = `<g filter="url(#hds)">
      ${rrect(w, rad, 13, `fill="none" stroke="url(#hauB)" stroke-width="20"`)}
      ${rrect(w, rad, 3, `fill="none" stroke="${m[3]}" stroke-width="2.4"`)}${rrect(w, rad, 23, `fill="none" stroke="${m[3]}" stroke-width="2.4"`)}${stars}
    </g>`
  const motion = softGlow("hauG", t, { w, rad }, ["#56f0b8", "#5fc8ff", "#b48cff", "#ff8fd0"], {
    inset: 13,
    width: 20,
    opacity: 0.55,
  })
  return layered(w, rad, layer, baseDefs(lg("hauB", ["#0b1840", "#123a6a", "#2a1b5c"], 1, 1)), base, motion)
}

export const HEADER_FRAMES = [
  {
    slug: "gacha-ssr-makie",
    rarity: "SSR",
    frames: 24,
    frameMs: 150,
    name: "金蒔絵の夜桜",
    description: "漆黒と金のふちに、角の小さな夜桜の枝と満月",
    draw: makie,
  },
  {
    slug: "gacha-ur-kyubi",
    rarity: "UR",
    frames: 24,
    frameMs: 150,
    name: "九尾の白狐",
    description: "角にのぞく九本の尾と狐の面、ふちを流れる狐火",
    draw: kyubi,
  },
  {
    slug: "gacha-ur-star-crown",
    rarity: "UR",
    frames: 24,
    frameMs: 150,
    name: "星海の王冠",
    description: "星雲の流れるふちに、角の惑星と小さな白金の王冠",
    draw: starCrown,
  },
  {
    slug: "gacha-r-hydrangea",
    rarity: "R",
    frames: 24,
    frameMs: 150,
    name: "雨上がりのあじさい",
    description: "角に咲く青と桃色のあじさいと、落ちる雨つぶ",
    draw: hydrangea,
  },
  {
    slug: "gacha-sr-fireworks",
    rarity: "SR",
    frames: 24,
    frameMs: 150,
    name: "夜空の花火",
    description: "夜色のふちの上で次々ひらく小さな花火",
    draw: fireworks,
  },
  {
    slug: "gacha-sr-pictor-paint",
    rarity: "SR",
    pictor: true,
    frames: 24,
    frameMs: 150,
    name: "ぴくたーちゃんのお絵かき",
    description: "絵の具で描いたふちとパレット、右下で手をふるぴくたーちゃん",
    draw: pictorPaint,
  },
  {
    slug: "gacha-ssr-armillary",
    rarity: "SSR",
    frames: 24,
    frameMs: 150,
    name: "金の天球儀",
    description: "角の小さな金の天球儀と太陽、目盛りのふち",
    draw: armillary,
  },
  {
    slug: "gacha-ssr-pictor-love",
    rarity: "SSR",
    pictor: true,
    frames: 24,
    frameMs: 150,
    name: "ぴくたーちゃんのだいすき",
    description: "ローズゴールドのハートのふちと、右下のぴくたーちゃん",
    draw: pictorLove,
  },
  {
    slug: "gacha-ur-pictor-rainbow",
    rarity: "UR",
    pictor: true,
    frames: 24,
    frameMs: 150,
    name: "きらめくぴくたーちゃん",
    description: "虹色のふちと紙吹雪、右下にふたりのぴくたーちゃん",
    draw: pictorRainbow,
  },
  {
    slug: "gacha-n-hairline",
    rarity: "N",
    frames: 24,
    frameMs: 150,
    name: "ほそ線リング",
    description: "白い細い二重線と、ふちをゆっくりめぐる小さな粒",
    draw: hairline,
  },
  {
    slug: "gacha-n-one-star",
    rarity: "N",
    frames: 24,
    frameMs: 150,
    name: "ひとつ星",
    description: "細い金のふちに、小さな星がひとつ",
    draw: oneStar,
  },
  {
    slug: "gacha-r-silver-moon",
    rarity: "R",
    frames: 24,
    frameMs: 150,
    name: "銀の三日月",
    description: "細い銀のふちに、右上の小さな三日月と星",
    draw: silverMoon,
  },
  {
    slug: "gacha-n-heart-dots",
    rarity: "N",
    frames: 24,
    frameMs: 150,
    name: "ハートの点線",
    description: "白いふちにピンクの点線と、角と上下のハート",
    draw: heartDots,
  },
  {
    slug: "gacha-n-cloud",
    rarity: "N",
    frames: 24,
    frameMs: 150,
    name: "ふわふわ雲",
    description: "もこもこの白い雲でできたふち",
    draw: cloudEdge,
  },
  {
    slug: "gacha-n-stitch",
    rarity: "N",
    frames: 24,
    frameMs: 150,
    name: "星のステッチ",
    description: "ステッチの入った布のふちと、上の真ん中の星",
    draw: stitchEdge,
  },
  {
    slug: "gacha-r-strawberry",
    rarity: "R",
    frames: 24,
    frameMs: 150,
    name: "いちごミルク",
    description: "ミルク色のふちに、角と上下のいちごと白い花",
    draw: strawberryEdge,
  },
  {
    slug: "gacha-r-bows",
    rarity: "R",
    frames: 24,
    frameMs: 150,
    name: "リボン結び",
    description: "四隅に四色のリボンを結んだ細いふち",
    draw: bowsEdge,
  },
  {
    slug: "gacha-sr-aurora",
    rarity: "SR",
    frames: 24,
    frameMs: 150,
    name: "オーロラ",
    description: "夜色のふちを流れるオーロラの光と小さな星",
    draw: auroraEdge,
  },
]
