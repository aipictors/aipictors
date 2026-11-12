/**
 * アイコンの装飾（SVG）。座標は 512px の中央にアイコン（半径 213px）が来るように描き、
 * 書き出すときは上下左右に 60 ずつ広げる（耳や翼がアイコンの外へはみ出せるように）。
 * 画面ではアイコンの 148.4%（632 / 426）の大きさで重ねる。
 * t は 0〜1 のループの位置。最初と最後が同じ絵になるように作る
 */

const C = 256
const R = 213
const TAU = Math.PI * 2

const f = (n) => Number(n.toFixed(2))

/** 上を 0 度、時計回りの極座標 */
const polar = (r, deg, cx = C, cy = C) => {
  const a = ((deg - 90) * Math.PI) / 180
  return [f(cx + r * Math.cos(a)), f(cy + r * Math.sin(a))]
}

const wave = (t, phase = 0) => Math.sin(TAU * (t + phase))

/** 決まった乱数（同じ絵を作り直せるように） */
const rng = (seed) => {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
}

const defs = (extra = "") => `<defs>
  <filter id="glow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="glow2" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="14" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3"/></filter>
  <mask id="behind" maskUnits="userSpaceOnUse" x="-60" y="-60" width="632" height="632"><rect x="-60" y="-60" width="632" height="632" fill="#fff"/><circle cx="256" cy="256" r="213" fill="#000"/></mask>
  <filter id="ds" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="3" stdDeviation="3.5" flood-color="#000" flood-opacity=".42"/></filter>
  ${extra}
</defs>`

const lg = (id, stops, x2 = 0, y2 = 1) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops
    .map((c, i) => `<stop offset="${i / (stops.length - 1)}" stop-color="${c}"/>`)
    .join("")}</linearGradient>`

const rg = (id, stops) =>
  `<radialGradient id="${id}">${stops
    .map((c, i) => `<stop offset="${i / (stops.length - 1)}" stop-color="${c}"/>`)
    .join("")}</radialGradient>`

const place = (x, y, rot, s, body, extra = "") =>
  `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(${f(s)})" ${extra}>${body}</g>`

/** 円周に沿った帯 */
const ring = (r, w, stroke, extra = "") =>
  `<circle cx="${C}" cy="${C}" r="${r}" fill="none" stroke="${stroke}" stroke-width="${w}" ${extra}/>`

/** 円弧 */
const arc = (r, from, to) => {
  const [x1, y1] = polar(r, from)
  const [x2, y2] = polar(r, to)
  const large = Math.abs(to - from) > 180 ? 1 : 0
  return `M${x1} ${y1}A${r} ${r} 0 ${large} 1 ${x2} ${y2}`
}

const sparkle = (x, y, s, fill = "#fff", opacity = 1) =>
  `<path transform="translate(${f(x)} ${f(y)}) scale(${f(s)})" d="M0-10C1.2-2.2 2.2-1.2 10 0 2.2 1.2 1.2 2.2 0 10-1.2 2.2-2.2 1.2-10 0-2.2-1.2-1.2-2.2 0-10Z" fill="${fill}" opacity="${f(opacity)}"/>`

/** きらめき（時間で点滅） */
const twinkles = (t, points, fill = "#fff") =>
  points
    .map(([r, deg, s, phase]) => {
      const [x, y] = polar(r, deg)
      const k = Math.max(0, wave(t, phase))
      return k <= 0.02 ? "" : sparkle(x, y, s * (0.5 + k * 0.7), fill, k)
    })
    .join("")

/* ------------------------------------------------------------------ */
/* 部品                                                                */
/* ------------------------------------------------------------------ */

const blossom = (fill = "url(#petal)", core = "#ffd36b") => {
  const petal =
    "M0 0C-11-8-14-23-7-33-4-37-1-34 0-30 1-34 4-37 7-33 14-23 11-8 0 0Z"
  return `${[0, 72, 144, 216, 288]
    .map((a) => `<path d="${petal}" transform="rotate(${a})" fill="${fill}" stroke="#d9638f" stroke-width=".8" stroke-opacity=".5"/>`)
    .join("")}<circle r="7.5" fill="#e0487f"/>${[0, 40, 80, 120, 160, 200, 240, 280, 320]
    .map((a) => {
      const [x, y] = polar(13, a, 0, 0)
      return `<path d="M0 0L${x} ${y}" stroke="#c2185b" stroke-width="1"/><circle cx="${x}" cy="${y}" r="1.7" fill="${core}"/>`
    })
    .join("")}`
}

const looseP =
  '<path d="M0-12C-8-8-9 3-1 12 0 10 0 10 1 12 9 3 8-8 0-12Z" fill="url(#petal)"/>'

const maple = (fill) =>
  `<path d="M0 26L2 11 15 16 11 7 26 2 18-3 22-14 11-11 9-20 3-11 0-30-3-11-9-20-11-11-22-14-18-3-26 2-11 7-15 16-2 11Z" fill="${fill}" stroke="#7a1f0c" stroke-width=".8" stroke-linejoin="round"/><path d="M0 26V-20M0 2L14 -6M0 2L-14 -6M0 9L10 7M0 9L-10 7" stroke="#7a1f0c" stroke-opacity=".55" stroke-width="1" fill="none"/>`

const rose = (a, b, c) => `<circle r="29" fill="${a}"/>
  <path d="M-27-6C-20-30 16-34 27-12 17-24-14-22-27-6Z" fill="${b}"/>
  <path d="M27 6C22 28-14 34-27 12-14 24 14 22 27 6Z" fill="${b}"/>
  <path d="M-20 3C-22-16 4-24 18-11 7-16-10-13-20 3Z" fill="${c}"/>
  <path d="M19 1C21 17-3 24-17 13-5 15 9 13 19 1Z" fill="${c}"/>
  <path d="M-11 1C-11-11 6-14 12-5 5-9-5-7-11 1Z" fill="${b}"/>
  <path d="M10 2C9 11-4 13-9 6-3 8 4 7 10 2Z" fill="${b}"/>
  <path d="M-4-1C-3-6 4-6 5-1 2-3-1-3-4-1Z" fill="${c}"/><circle r="2.4" fill="${a}"/>`

const leaf = (fill) =>
  `<path d="M0 0C10-9 27-10 38 0 27 10 10 9 0 0Z" fill="${fill}"/><path d="M2 0H34" stroke="#000" stroke-opacity=".25" stroke-width="1"/>`

const snowflake = (stroke) => {
  const arm = `<path d="M0 0V-30M0-12L-8-20M0-12L8-20M0-22L-5-27M0-22L5-27" stroke="${stroke}" stroke-width="3" stroke-linecap="round" fill="none"/>`
  return [0, 60, 120, 180, 240, 300]
    .map((a) => `<g transform="rotate(${a})">${arm}</g>`)
    .join("")
}

const bubble = (r) =>
  `<circle r="${r}" fill="url(#bub)" stroke="#d6f6ff" stroke-opacity=".85" stroke-width="1.4"/><ellipse cx="${f(-r * 0.35)}" cy="${f(-r * 0.4)}" rx="${f(r * 0.28)}" ry="${f(r * 0.17)}" fill="#fff" opacity=".9" transform="rotate(-30 ${f(-r * 0.35)} ${f(-r * 0.4)})"/>`

const heart = (fill) =>
  `<path d="M0 22C-30 2-30-20-14-22-6-23 0-15 0-12 0-15 6-23 14-22 30-20 30 2 0 22Z" fill="${fill}" stroke="#fff" stroke-opacity=".55" stroke-width="1.5"/><ellipse cx="-11" cy="-11" rx="6" ry="3.6" fill="#fff" opacity=".65" transform="rotate(-30 -11 -11)"/>`

const feather = (fill, stroke = "#c6d3e8") =>
  `<path d="M0 0C-12-16-16-44-6-64 6-48 10-20 0 0Z" fill="${fill}" stroke="${stroke}" stroke-width="1"/><path d="M0 0C-2-20-4-40-5-58" stroke="${stroke}" stroke-width="1" fill="none"/>`

const gem = (a, b) =>
  `<path d="M0-13L11-3 0 13-11-3Z" fill="${a}" stroke="#5a3a00" stroke-width="1"/><path d="M0-13L4-3 0 13-4-3ZM-11-3H11" fill="${b}" stroke="#fff" stroke-opacity=".4" stroke-width=".6"/>`

const butterfly = (t, a, b, phase = 0) => {
  const flap = 0.55 + 0.45 * Math.abs(Math.cos(TAU * (t * 2 + phase)))
  const wing = `<path d="M0 0C10-30 44-38 50-16 53-3 30 6 0 3Z" fill="url(#${a})" stroke="#2a1040" stroke-width="1.6"/><path d="M0 4C14 8 36 12 34 28 31 42 8 30 0 8Z" fill="url(#${b})" stroke="#2a1040" stroke-width="1.6"/><circle cx="34" cy="-14" r="5" fill="#fff" opacity=".7"/><circle cx="20" cy="20" r="3.4" fill="#fff" opacity=".65"/>`
  return `<g transform="scale(${f(flap)} 1)">${wing}</g><g transform="scale(${f(-flap)} 1)">${wing}</g><path d="M0-14C4-6 4 12 0 22-4 12-4-6 0-14Z" fill="#1d0b2c"/><path d="M0-14C-3-22-8-26-12-27M0-14C3-22 8-26 12-27" stroke="#1d0b2c" stroke-width="1.6" fill="none" stroke-linecap="round"/>`
}

const goldfish = (t, body, fin, phase = 0) => {
  const sway = wave(t * 2, phase) * 14
  return `<path d="M-30 0C-52-${f(26 + sway)}-72-${f(20 + sway)}-82-${f(8 + sway)}-68-${f(sway)}-68 ${f(sway * 0.3)}-82 ${f(10 - sway)}-72 ${f(22 - sway)}-50 ${f(24 - sway)}-30 0Z" fill="${fin}" opacity=".85"/>
  <ellipse cx="0" cy="0" rx="36" ry="19" fill="${body}" stroke="#7a1500" stroke-opacity=".4"/>
  <path d="M-16-16C-6-34 14-30 16-16Z" fill="${fin}" opacity=".9"/>
  <path d="M-3 16C-1 28 12 30 12 15Z" fill="${fin}" opacity=".85"/>
  <path d="M-22-8C-14-14-6-14 2-8M-22 2C-14-4-6-4 2 2" stroke="#fff" stroke-opacity=".35" stroke-width="2" fill="none"/>
  <circle cx="22" cy="-5" r="5.2" fill="#fff"/><circle cx="23.5" cy="-5" r="3" fill="#111"/>`
}

/* ------------------------------------------------------------------ */
/* 装飾                                                                */
/* ------------------------------------------------------------------ */

const sakura = (t) => {
  const r = rng(11)
  const petals = Array.from({ length: 9 }, (_, i) => {
    const phase = i / 9
    const p = (t + phase) % 1
    const x0 = 30 + r() * 452
    const x = x0 + Math.sin(TAU * (p + phase)) * 26
    const y = -20 + p * 552
    // アイコンの顔の上には落とさない
    if (Math.hypot(x - C, y - C) < 195) return ""
    return place(x, y, p * 720 + i * 40, 0.85 + r() * 0.4, looseP, 'opacity=".95"')
  }).join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs(
    lg("petal", ["#fff3f7", "#ffc1d6", "#ff8fb4"]) + lg("bark", ["#7b4a35", "#3f2318"]),
  )}
  <g filter="url(#ds)">
    <path d="${arc(232, 205, 372)}" fill="none" stroke="url(#bark)" stroke-width="13" stroke-linecap="round"/>
    <path d="${arc(232, 372, 388)}" fill="none" stroke="url(#bark)" stroke-width="6" stroke-linecap="round"/>
    <path d="M${polar(232, 268).join(" ")}Q${polar(258, 278).join(" ")} ${polar(250, 292).join(" ")}" fill="none" stroke="url(#bark)" stroke-width="6" stroke-linecap="round"/>
    <path d="M${polar(232, 330).join(" ")}Q${polar(252, 338).join(" ")} ${polar(246, 350).join(" ")}" fill="none" stroke="url(#bark)" stroke-width="5" stroke-linecap="round"/>
    ${[
      [232, 212, 0.95], [240, 236, 1.2], [226, 258, 0.9], [250, 292, 1.05],
      [228, 306, 1.25], [246, 350, 1.0], [226, 334, 0.8], [234, 372, 1.3], [226, 28, 0.95],
    ]
      .map(([rr, d, s], i) => {
        const [x, y] = polar(rr, d)
        return place(x, y, i * 37 + wave(t, i / 9) * 4, s, blossom())
      })
      .join("")}
    ${[[250, 256, 0.5], [246, 318, 0.5], [244, 42, 0.5]]
      .map(([rr, d, s], i) => {
        const [x, y] = polar(rr, d)
        return place(x, y, i * 60, s, '<circle r="11" fill="#ff9dbd" stroke="#d9638f"/>')
      })
      .join("")}
  </g>${petals}</svg>`
}

const momiji = (t) => {
  const colors = ["url(#m1)", "url(#m2)", "url(#m3)"]
  const falling = Array.from({ length: 7 }, (_, i) => {
    const phase = i / 7
    const p = (t + phase) % 1
    const x = 60 + (i * 61) % 400 + Math.sin(TAU * (p + phase)) * 22
    const y = -24 + p * 560
    if (Math.hypot(x - C, y - C) < 200) return ""
    return place(x, y, p * 540 + i * 33, 0.7, maple(colors[i % 3]))
  }).join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs(
    lg("m1", ["#ff7a2f", "#d81e05"]) + lg("m2", ["#ffc531", "#f0651a"]) + lg("m3", ["#e8341c", "#8a0f12"]) + lg("bark", ["#6b3f2a", "#34180f"]),
  )}<g filter="url(#ds)">
    <path d="${arc(234, 40, 170)}" fill="none" stroke="url(#bark)" stroke-width="11" stroke-linecap="round"/>
    ${[[240, 44, 1.3, 0], [226, 66, 1.05, 1], [246, 88, 1.25, 2], [226, 108, 1.0, 0], [244, 130, 1.3, 1], [228, 150, 1.05, 2], [240, 170, 1.2, 0], [254, 24, 0.75, 2]]
      .map(([rr, d, s, c], i) => {
        const [x, y] = polar(rr, d)
        return place(x, y, d + 40 + wave(t, i / 8) * 7, s, maple(colors[c]))
      })
      .join("")}</g>${falling}</svg>`
}

const thornRose = (t) => {
  const thorns = Array.from({ length: 26 }, (_, i) => {
    const d = (i * 360) / 26
    const [x, y] = polar(226 + (i % 2) * 4, d)
    return place(x, y, d + (i % 2 ? 40 : -40), 1, '<path d="M-5 0L0-17 5 0Z" fill="#22101f" stroke="#55304f" stroke-width="1"/>')
  }).join("")
  const roses = [[232, 322, 1.3], [244, 352, 0.9], [232, 145, 1.35], [246, 172, 0.85], [226, 248, 0.9], [232, 60, 0.82]]
    .map(([rr, d, s], i) => {
      const [x, y] = polar(rr, d)
      const pulse = 1 + wave(t, i / 6) * 0.025
      return place(x, y, i * 50, s * pulse, rose("#5d0620", "#a10f35", "#d8294f"))
    })
    .join("")
  const leaves = [[252, 305, 200], [252, 338, 300], [254, 128, 20], [252, 162, 130], [244, 232, 160], [246, 76, 60]]
    .map(([rr, d, rot]) => {
      const [x, y] = polar(rr, d)
      return place(x, y, rot, 1, leaf("#1f3a2c"))
    })
    .join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs()}
  <g filter="url(#ds)">
    ${ring(227, 9, "#22101f")}${ring(231, 3, "#4a2a45", 'stroke-dasharray="28 12"')}
    ${thorns}${leaves}${roses}
  </g>
  ${twinkles(t, [[244, 8, 1.1, 0], [240, 98, 0.8, 0.35], [244, 205, 0.9, 0.6], [246, 290, 0.8, 0.8]], "#ff9fb7")}</svg>`
}

const crescent = (t) => {
  const stars = [[235, 40, 1.2, 0], [246, 72, 0.8, 0.2], [238, 110, 1.0, 0.45], [246, 150, 0.7, 0.7], [240, 190, 1.2, 0.1], [248, 232, 0.8, 0.55], [236, 268, 1.0, 0.3], [246, 298, 0.8, 0.85], [234, 332, 1.2, 0.6]]
  const [mx, my] = polar(208, 18)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs(
    lg("night", ["#2a3a8c", "#1a1b56", "#5234a8"], 1, 1) + lg("moon", ["#fff6c9", "#ffd25e", "#e39a1e"], 1, 1) + lg("cloud", ["#eef0ff", "#a8aee8"]),
  )}
  ${ring(228, 16, "url(#night)")}${ring(219, 2, "#ffe18a", 'opacity=".8"')}${ring(237, 2, "#ffe18a", 'opacity=".55"')}
  <g filter="url(#glow)">${place(mx, my, 10 + wave(t) * 3, 1.25, '<path d="M4-50A50 50 0 1 0 44 26 40 40 0 1 1 4-50Z" fill="url(#moon)" stroke="#a96a06" stroke-opacity=".4"/>')}</g>
  ${place(...polar(234, 208), 0, 1.15 + 0, `<g transform="translate(${f(wave(t) * 4)} 0)"><path d="M-46 12C-52-6-30-12-24-6-20-24 8-26 12-8 26-16 44-6 38 12Z" fill="url(#cloud)" stroke="#fff" stroke-opacity=".6"/></g>`)}
  ${place(...polar(240, 150), 0, 0.8, `<g transform="translate(${f(wave(t, 0.5) * 5)} 0)"><path d="M-46 12C-52-6-30-12-24-6-20-24 8-26 12-8 26-16 44-6 38 12Z" fill="url(#cloud)" stroke="#fff" stroke-opacity=".6"/></g>`)}
  ${twinkles(t, stars, "#fff4b8")}</svg>`
}

const snow = (t) => {
  const flakes = [[236, 340, 1.5, "#dff6ff"], [240, 30, 0.95, "#fff"], [236, 80, 1.25, "#bfe9ff"], [240, 150, 0.95, "#fff"], [232, 196, 1.5, "#dff6ff"], [242, 245, 0.95, "#bfe9ff"], [234, 292, 1.15, "#fff"]]
    .map(([rr, d, s, c], i) => {
      const [x, y] = polar(rr, d)
      return place(x, y, t * 60 * (i % 2 ? 1 : -1), s, snowflake(c), 'filter="url(#glow)"')
    })
    .join("")
  const falling = Array.from({ length: 12 }, (_, i) => {
    const p = (t + i / 12) % 1
    const x = 24 + (i * 89) % 464 + Math.sin(TAU * (p + i / 5)) * 12
    const y = -10 + p * 532
    if (Math.hypot(x - C, y - C) < 212) return ""
    return `<circle cx="${f(x)}" cy="${f(y)}" r="${2.5 + (i % 3)}" fill="#fff" opacity=".9"/>`
  }).join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs(
    lg("ice", ["#f1fbff", "#7fd1f5", "#2d7fd3", "#d5f2ff"], 1, 1),
  )}${ring(226, 12, "url(#ice)", 'filter="url(#ds)"')}${ring(226, 2, "#fff", 'stroke-dasharray="5 14" opacity=".9"')}${flakes}${falling}</svg>`
}

const bubbles = (t) => {
  const items = Array.from({ length: 22 }, (_, i) => {
    const r0 = rng(100 + i)
    const speed = i % 3 === 0 ? 2 : 1
    const p = (t * speed + i / 22) % 1
    const side = i % 2 ? 1 : -1
    const y = 520 - p * 540
    const baseX = C + side * (Math.sqrt(Math.max(0, 238 ** 2 - (y - C) ** 2)) || 0)
    const x = baseX + Math.sin(TAU * (p * 2 + r0())) * 10
    const s = 6 + r0() * 16
    return place(x, y, 0, 1, bubble(f(s)), `opacity="${f(Math.min(1, (1 - p) * 4, p * 8))}"`)
  }).join("")
  const weed = (d, h, ph) => {
    const [x, y] = polar(252, d)
    const sway = wave(t, ph) * 10
    return `<path d="M${x} ${y}C${f(x - 10 + sway)} ${f(y - h * 0.35)} ${f(x + 12 + sway)} ${f(y - h * 0.65)} ${f(x + sway * 1.5)} ${f(y - h)}" stroke="url(#weed)" stroke-width="9" fill="none" stroke-linecap="round"/>`
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs(
    lg("sea", ["#92f3ff", "#1fa9e6", "#0b4fa8"], 0, 1) + rg("bub", ["#ffffff22", "#bff3ff44", "#79dcff99"]) + lg("weed", ["#49e0a8", "#0a7d6a"]),
  )}${ring(226, 12, "url(#sea)", 'opacity=".95"')}${ring(226, 3, "#fff", 'opacity=".55" stroke-dasharray="44 22"')}
  <g filter="url(#ds)">${weed(155, 60, 0)}${weed(166, 82, 0.3)}${weed(180, 58, 0.6)}${weed(194, 86, 0.15)}${weed(206, 62, 0.45)}</g>${items}</svg>`
}

const ears = (outer, inner, stroke, extra = "", eye = "") => (t) => {
  const tilt = wave(t) * 3
  const ear = (s) =>
    `<g transform="translate(${C} ${C}) rotate(${f(s * (41 + tilt))}) translate(0 -${R + 2}) scale(${s} 1)">
      <path d="M-64 30C-52-30-42-72-24-82-4-92 28-56 56 26Z" fill="${outer}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M-36 20C-30-22-24-50-14-58 0-64 18-38 32 18Z" fill="${inner}"/>
    </g>`
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs(
    lg("catO", outer === "url(#catO)" ? extra.split("|") : ["#000", "#000"]) +
      lg("bell", ["#fff3a8", "#f6c026", "#b57e08"], 1, 1),
  )}<g filter="url(#ds)"><g mask="url(#behind)">${ear(-1)}${ear(1)}</g>
    ${ring(222, 9, "#e02f55")}${ring(222, 2, "#fff", 'opacity=".55" stroke-dasharray="3 9"')}
    ${place(C, 480, wave(t) * 8, 1, `<g transform="translate(0 6)"><circle r="23" fill="url(#bell)" stroke="#8a5a00" stroke-width="2.5"/><path d="M-20 -3H20" stroke="#8a5a00" stroke-width="3"/><circle cy="9" r="4.5" fill="#6b4300"/><path d="M0 9V21" stroke="#6b4300" stroke-width="2.5"/><ellipse cx="-8" cy="-11" rx="5.5" ry="3.5" fill="#fff" opacity=".8" transform="rotate(-30 -8 -11)"/></g>`)}
  </g>${eye}${twinkles(t, [[250, 300, 0.9, 0], [250, 60, 0.9, 0.5]], "#fff")}</svg>`
}

const catPink = ears("url(#catO)", "#ff9fc2", "#c96b92", "#fff0f6|#ffc4dd")
const catBlack = ears("url(#catO)", "#6e5b95", "#0d0a16", "#3a3550|#0f0c1a")
const catWhite = ears("url(#catO)", "#ffc2d4", "#a9a9bd", "#ffffff|#dfe3ee")

const bunny = (t) => {
  const ear = (side, droop) => {
    const sway = wave(t, side > 0 ? 0.3 : 0) * 2
    return `<g transform="translate(${C} ${C}) rotate(${f(side * (22 + sway))}) translate(0 -${R - 2})">
      <path d="M-30 30C-44-40-34-126-4-132 30-132 40-40 30 30Z" fill="url(#bun)" stroke="#caa9c2" stroke-width="3.5"/>
      <path d="M-14 22C-24-30-18-98-3-110 14-108 22-34 14 22Z" fill="url(#bunIn)"/>
      ${droop ? "" : ""}</g>`
  }
  const bowY = C - R - 4
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-30 -80 572 672" preserveAspectRatio="xMidYMid meet">${defs(
    lg("bun", ["#ffffff", "#f6e5f0"]) + lg("bunIn", ["#ffc4d8", "#ff94b9"]) + lg("rib", ["#ff8fb8", "#e4447f"]),
  )}<g filter="url(#ds)"><g mask="url(#behind)">${ear(-1)}${ear(1)}</g>
    ${place(C, bowY + 18, 0, 1, '<path d="M0 0C-16-30-56-30-56 0-56 28-16 28 0 0ZM0 0C16-30 56-30 56 0 56 28 16 28 0 0Z" fill="url(#rib)" stroke="#a81f55" stroke-width="2.5"/><rect x="-11" y="-13" width="22" height="26" rx="8" fill="#ff6ba2" stroke="#a81f55" stroke-width="2.5"/>')}
  </g></svg>`
}

const ribbon = (t) => {
  const lace = Array.from({ length: 56 }, (_, i) => {
    const [x, y] = polar(238, (i * 360) / 56)
    return `<circle cx="${x}" cy="${y}" r="7.5" fill="#fff" stroke="#f3b6cd" stroke-width="1"/>`
  }).join("")
  const sway = wave(t) * 3
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs(
    lg("rib", ["#ffa5c6", "#e13a7c"], 0, 1) + lg("rib2", ["#ff7fae", "#b81f5b"], 0, 1),
  )}<g filter="url(#ds)">${lace}${ring(226, 16, "url(#rib)")}${ring(226, 2, "#fff", 'stroke-dasharray="7 7" opacity=".9"')}
    <g transform="translate(${C} 42) rotate(${f(sway)})">
      <path d="M-14 14C-30 60-60 70-76 104L-48 96-36 122C-20 86-2 60 6 18Z" fill="url(#rib2)" stroke="#8d1442" stroke-width="2"/>
      <path d="M14 14C30 60 60 70 76 104L48 96 36 122C20 86 2 60-6 18Z" fill="url(#rib2)" stroke="#8d1442" stroke-width="2"/>
      <path d="M-8 0C-40-46-106-46-106 0-106 46-40 46-8 0Z" fill="url(#rib)" stroke="#8d1442" stroke-width="2.5"/>
      <path d="M8 0C40-46 106-46 106 0 106 46 40 46 8 0Z" fill="url(#rib)" stroke="#8d1442" stroke-width="2.5"/>
      <path d="M-20-2C-44-22-84-24-88-2-70-14-44-12-20-2ZM20-2C44-22 84-24 88-2 70-14 44-12 20-2Z" fill="#fff" opacity=".35"/>
      <rect x="-20" y="-21" width="40" height="42" rx="13" fill="url(#rib2)" stroke="#8d1442" stroke-width="2.5"/>
      <path d="M-11-11C-3-15 5-15 11-11" stroke="#fff" stroke-width="3" fill="none" opacity=".55" stroke-linecap="round"/>
    </g></g></svg>`
}

const hearts = (t) => {
  const fixed = [[228, 318, 1.15, "url(#h1)"], [240, 345, 0.72, "url(#h2)"], [232, 42, 0.78, "url(#h2)"], [234, 150, 1.25, "url(#h1)"], [244, 124, 0.68, "url(#h2)"], [232, 228, 0.85, "url(#h1)"]]
    .map(([rr, d, s, c], i) => {
      const [x, y] = polar(rr, d)
      return place(x, y, (i % 2 ? 1 : -1) * 15, s * (1 + wave(t * 2, i / 6) * 0.09), heart(c))
    })
    .join("")
  const rising = Array.from({ length: 7 }, (_, i) => {
    const p = (t + i / 7) % 1
    const d = i % 2 ? 70 + i * 6 : 288 - i * 6
    const [x0, y0] = polar(236, d)
    return place(x0 + Math.sin(TAU * p) * 7, y0 - p * 56, 0, 0.32 + (i % 3) * 0.1, heart("url(#h2)"), `opacity="${f(1 - p)}"`)
  }).join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs(
    lg("h1", ["#ff8ab5", "#ee1f6e"]) + lg("h2", ["#ffc7dc", "#ff6fa5"]) + lg("hr", ["#ffb3cf", "#d9307a", "#ffb3cf"], 1, 1),
  )}${ring(226, 7, "url(#hr)", 'filter="url(#ds)"')}<g filter="url(#ds)">${fixed}</g>${rising}</svg>`
}

const sweets = (t) => {
  const donut = `<circle r="30" fill="#c98a4b"/><path d="M-27-9C-30-27 26-32 28-7 32 9 22 13 18 22 9 18 8 28-2 27-11 26-13 18-24 16-30 9-29 0-27-9Z" fill="#ff8fbd"/><circle r="10" fill="#7a4a23"/><circle r="9" fill="none" stroke="#000" stroke-opacity=".2"/>${[[-16, -14, "#fff5a8", 30], [10, -18, "#a4f0ff", -30], [18, 4, "#fff", 70], [-20, 6, "#b6ffb0", 10], [2, 19, "#ffd36b", 110]].map(([x, y, c, r]) => `<rect x="${x}" y="${y}" width="9" height="3" rx="1.5" fill="${c}" transform="rotate(${r} ${x} ${y})"/>`).join("")}`
  const macaron = (a, b) => `<path d="M-26-3C-26-20 26-20 26-3Z" fill="${a}"/><rect x="-25" y="-3" width="50" height="6" rx="3" fill="#fff7e6"/><path d="M-26 3C-26 20 26 20 26 3Z" fill="${b}"/><path d="M-17-11C-9-15 2-15 8-12" stroke="#fff" stroke-opacity=".6" stroke-width="3" fill="none" stroke-linecap="round"/>`
  const candy = `<path d="M-22 0L-44-16-40 0-44 16ZM22 0L44-16 40 0 44 16Z" fill="#7dd9ff" stroke="#2c8fc0" stroke-width="1.5"/><circle r="22" fill="#fff"/><path d="M0 0C-4-16 12-22 20-8ZM0 0C16-4 22 12 8 20ZM0 0C4 16-12 22-20 8ZM0 0C-16 4-22-12-8-20Z" fill="#ff6f9f"/>`
  const cream = `<path d="M-32 18C-44 4-26-8-20-8-26-24-8-30-2-22-2-40 26-34 18-16 32-16 42 6 30 18Z" fill="#fffaf0" stroke="#e6cfae" stroke-width="2"/><circle cx="2" cy="-30" r="11" fill="#e8173f"/><path d="M2-40C4-50 10-54 16-54" stroke="#3f8a3a" stroke-width="2.5" fill="none"/><ellipse cx="-2" cy="-34" rx="3.5" ry="2.2" fill="#fff" opacity=".8"/>`
  const items = [
    [236, 322, 1.2, donut], [238, 28, 0.9, macaron("#ffb5d0", "#ff93bb")], [242, 62, 0.95, candy],
    [232, 118, 1.05, macaron("#b8f0d8", "#7fe0bb")], [234, 158, 1.15, donut], [236, 205, 1.0, cream],
    [240, 250, 0.9, candy], [234, 285, 0.95, macaron("#d5c2ff", "#b597ff")],
  ]
    .map(([rr, d, s, body], i) => {
      const [x, y] = polar(rr, d)
      return place(x, y, d * 0.4 + wave(t, i / 8) * 7, s, body)
    })
    .join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs(
    lg("sw", ["#fff0f7", "#ffd0e6", "#bff0ff", "#fff0c2"], 1, 1),
  )}${ring(226, 12, "url(#sw)", 'filter="url(#ds)"')}${ring(226, 2, "#ff8fbd", 'stroke-dasharray="4 11" stroke-linecap="round"')}<g filter="url(#ds)">${items}</g></svg>`
}

const angel = (t) => {
  const flap = wave(t) * 4
  const wing = (side) => {
    const layers = [
      Array.from({ length: 7 }, (_, i) => [70 + i * 4, -8 + i * 17, -58 + i * 15, 1.4]),
      Array.from({ length: 6 }, (_, i) => [52 + i * 3, 2 + i * 15, -42 + i * 16, 0.95]),
    ]
    return `<g transform="translate(${C + side * 214} ${C - 10}) scale(${side} 1) rotate(${f(flap)})">${layers
      .flatMap((l, li) =>
        l.map(([x, y, r, s]) =>
          place(x - 66, y - 44, r + 52, s, feather(li ? "url(#wing2)" : "url(#wing)")),
        ),
      )
      .join("")}</g>`
  }
  const haloY = 26 + wave(t) * 4
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-40 -30 592 592">${defs(
    lg("wing", ["#ffffff", "#dfe8f7"]) + lg("wing2", ["#ffffff", "#eef4ff"]) + lg("halo", ["#fff8c9", "#ffcf4a", "#fff8c9"], 1, 0),
  )}<g filter="url(#ds)"><g mask="url(#behind)">${wing(-1)}${wing(1)}</g></g>
  ${ring(226, 4, "#ffe9a0", 'opacity=".95" filter="url(#glow)"')}
  <g filter="url(#glow2)"><ellipse cx="${C}" cy="${f(haloY)}" rx="92" ry="21" fill="none" stroke="url(#halo)" stroke-width="12"/></g>
  ${twinkles(t, [[262, 30, 1.2, 0], [262, 330, 1.2, 0.5], [250, 180, 0.9, 0.25]], "#fff3b0")}</svg>`
}

const devil = (t) => {
  const horn = (s) =>
    `<g transform="translate(${C} ${C}) rotate(${f(s * 34)}) translate(0 -${R}) scale(${s} 1)">
      <path d="M-26 22C-30-34 -6-74 42-96 14-62 22-20 28 22Z" fill="url(#horn)" stroke="#2c0406" stroke-width="3"/>
      <path d="M-14-20C2-16 12-16 22-22M-18 0C0 4 14 4 26-2" stroke="#2c0406" stroke-opacity=".65" stroke-width="2.5" fill="none"/></g>`
  const bat = (side) => {
    const flap = wave(t) * 5
    return `<g transform="translate(${C + side * 214} ${C + 34}) scale(${side} 1) rotate(${f(flap)})">
      <path d="M-22-10C8-60 44-82 70-78 64-56 76-44 86-38 66-34 62-14 68 2 48-6 34 6 34 26 18 14-4 20-22 34Z" fill="url(#bat)" stroke="#16030a" stroke-width="3" stroke-linejoin="round"/>
      <path d="M-22-10L70-78M-22 8L68 2M-22 22L34 26" stroke="#16030a" stroke-opacity=".7" stroke-width="2"/></g>`
  }
  const tailSway = wave(t) * 8
  const [tx, ty] = polar(226, 150)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-40 -40 592 592">${defs(
    lg("horn", ["#ff5a3a", "#8a0a12", "#2b0508"]) + lg("bat", ["#5d0f22", "#1e0510"]) + lg("dr", ["#ff3b3b", "#4a0512", "#ff3b3b"], 1, 1),
  )}<g filter="url(#ds)"><g mask="url(#behind)">${bat(-1)}${bat(1)}</g>${ring(226, 7, "url(#dr)")}<g mask="url(#behind)">${horn(-1)}${horn(1)}</g>
    <path d="M${tx} ${ty}C${f(tx + 40)} ${f(ty + 18)} ${f(tx + 22 + tailSway)} ${f(ty + 62)} ${f(tx + 54 + tailSway)} ${f(ty + 66)}" stroke="#7a0a18" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path transform="translate(${f(tx + 54 + tailSway)} ${f(ty + 66)}) rotate(20)" d="M-3-12L24 0-3 12 3 0Z" fill="#c8102a" stroke="#2c0406" stroke-width="2"/>
  </g>${ring(226, 2, "#ff8a6b", `opacity="${f(0.45 + wave(t) * 0.3)}" filter="url(#glow)"`)}</svg>`
}

const crown = (t) => {
  const laurel = (side) =>
    Array.from({ length: 9 }, (_, i) => {
      const d = 180 + side * (10 + i * 15)
      const [x, y] = polar(232, d)
      const rot = d - 90 + (side > 0 ? 28 : -28) + (side > 0 ? 180 : 0)
      return place(x, y, rot, 0.85, leaf("url(#gold)"))
    }).join("")
  const sweep = ((t * 1.3) % 1) * 300 - 90
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-20 -60 552 592">${defs(
    lg("gold", ["#fff6b8", "#ffcb36", "#b87a06", "#ffe37a"], 1, 1) + lg("velvet", ["#cf1d48", "#6b0a2a"]) +
      `<clipPath id="cr"><path d="M-92 40L-112-44-62-8-34-66 0-22 34-66 62-8 112-44 92 40Z"/></clipPath>`,
  )}<g filter="url(#ds)">
    ${ring(226, 7, "url(#gold)")}${laurel(-1)}${laurel(1)}
    ${place(...polar(240, 180), 0, 1, `<path d="M-5-8H5L14 16-0 8-14 16Z" fill="url(#velvet)" stroke="#6b4a00"/>${gem("#ff5a7a", "#ffc0cf").replace("<path", '<path transform="translate(0 -14) scale(.9)"')}`)}
    <g transform="translate(${C} 34) rotate(-7)">
      <path d="M-92 40C-40 26 40 26 92 40L88 8C40-6-40-6-88 8Z" fill="url(#velvet)"/>
      <path d="M-92 40L-112-44-62-8-34-66 0-22 34-66 62-8 112-44 92 40C40 26-40 26-92 40Z" fill="url(#gold)" stroke="#6b4a00" stroke-width="3.5" stroke-linejoin="round"/>
      <g clip-path="url(#cr)"><rect x="${f(sweep - 12)}" y="-90" width="24" height="170" fill="#fff" opacity=".32" transform="rotate(20 ${f(sweep)} 0)"/></g>
      <path d="M-90 28C-40 15 40 15 90 28" stroke="#7a5200" stroke-width="3" fill="none"/>
      ${[[-112, -44, "#ff4f73"], [-34, -66, "#4fc3ff"], [34, -66, "#4fc3ff"], [112, -44, "#ff4f73"]].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="9" fill="${c}" stroke="#6b4a00" stroke-width="2.5"/><circle cx="${x - 3}" cy="${y - 3}" r="2.6" fill="#fff"/>`).join("")}
      ${place(0, -2, 0, 1.25, gem("#2fd38f", "#b5ffe0"))}${place(-52, 8, 0, 0.8, gem("#ff4f73", "#ffc0cf"))}${place(52, 8, 0, 0.8, gem("#ff4f73", "#ffc0cf"))}
    </g></g>
    ${twinkles(t, [[248, 340, 1.2, 0], [248, 20, 1.1, 0.5], [252, 60, 0.8, 0.25], [250, 300, 0.8, 0.75]], "#fff6c0")}</svg>`
}

const magicCircle = (t) => {
  const runes = "ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ".split("")
  const outer = runes
    .map((ch, i) => {
      const [x, y] = polar(237, (i * 360) / runes.length)
      return `<text x="${x}" y="${y}" transform="rotate(${(i * 360) / runes.length} ${x} ${y})" font-size="19" text-anchor="middle" dominant-baseline="central" fill="#e2d4ff" font-family="serif">${ch}</text>`
    })
    .join("")
  const star = [0, 60, 120, 180, 240, 300].map((d) => polar(226, d))
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs()}
  ${ring(237, 30, "#160a3a", 'opacity=".88"')}
  <g filter="url(#glow)" transform="rotate(${f(t * 60)} ${C} ${C})">
    ${ring(250, 3, "#b98cff")}${ring(224, 3, "#b98cff")}${outer}
    ${Array.from({ length: 6 }, (_, i) => {
      const [x, y] = polar(237, i * 60 + 7.5)
      return `<circle cx="${x}" cy="${y}" r="5" fill="#fff" />`
    }).join("")}
  </g>
  <g filter="url(#glow)" transform="rotate(${f(-t * 120)} ${C} ${C})" opacity=".85">
    ${[0, 60, 120, 180, 240, 300].map((d) => `<path d="${arc(250, d + 8, d + 52)}" fill="none" stroke="${d % 120 ? "#ff9df0" : "#7fd4ff"}" stroke-width="3" stroke-dasharray="10 7"/>`).join("")}
    ${star.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="8" fill="#1b0f3d" stroke="#fff" stroke-width="2.5"/>`).join("")}
  </g>
  <g opacity="${f(0.45 + wave(t * 2) * 0.25)}">${ring(250, 7, "#8b5cff", 'filter="url(#soft)"')}</g>
  </svg>`
}

const flames = (t) => {
  const tongue = (d, h, ph, fill, w = 24) => {
    const a = wave(t * 2, ph)
    const b = wave(t * 3, ph + 0.3)
    const hh = h * (1 + 0.13 * b)
    return place(...polar(218, d), d, 1, `<path d="M-${w} 12C-${w} -${f(hh * 0.3)} ${f(-8 + a * 7)} -${f(hh * 0.55)} ${f(a * 11)} -${f(hh)} ${f(6 + a * 3)} -${f(hh * 0.62)} ${w} -${f(hh * 0.3)} ${w} 12Z" fill="${fill}"/>`)
  }
  const n = 26
  const back = Array.from({ length: n }, (_, i) => {
    const d = (i * 360) / n
    // 下の方を高く
    const h = 40 + 34 * Math.max(0, Math.cos(((d - 180) * Math.PI) / 180)) + (i % 3) * 9
    return tongue(d, h, i * 0.37, "url(#f1)", 26)
  }).join("")
  const mid = Array.from({ length: n }, (_, i) => {
    const d = ((i + 0.5) * 360) / n
    const h = 26 + 26 * Math.max(0, Math.cos(((d - 180) * Math.PI) / 180)) + (i % 2) * 7
    return tongue(d, h, i * 0.61 + 0.2, "url(#f2)", 18)
  }).join("")
  const front = Array.from({ length: n }, (_, i) => {
    const d = (i * 360) / n
    return tongue(d, 13 + (i % 2) * 7, i * 0.83 + 0.5, "#fff3b0", 11)
  }).join("")
  const sparks = Array.from({ length: 10 }, (_, i) => {
    const p = (t * 2 + i / 10) % 1
    const d = (i * 73) % 360
    const [x, y] = polar(240 + p * 18, d)
    return `<circle cx="${x}" cy="${f(y - p * 26)}" r="2.6" fill="#ffe27a" opacity="${f(1 - p)}"/>`
  }).join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs(
    `<linearGradient id="f1" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff4d0d"/><stop offset="1" stop-color="#c70f00" stop-opacity=".85"/></linearGradient>
     <linearGradient id="f2" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffc41f"/><stop offset="1" stop-color="#ff6a00"/></linearGradient>`,
  )}<g filter="url(#glow)">${back}${mid}${front}</g>${ring(214, 6, "#ffcf54", 'opacity=".85"')}${sparks}</svg>`
}

const lightning = (t) => {
  const frame = Math.floor(t * 12)
  const bolt = (from, span, seed, width, color) => {
    const r = rng(seed + frame * 97)
    const steps = 12
    let d = ""
    for (let i = 0; i <= steps; i++) {
      const deg = from + (span * i) / steps
      const rr = 234 + (i === 0 || i === steps ? 0 : (r() - 0.5) * 34)
      const [x, y] = polar(rr, deg)
      d += `${i ? "L" : "M"}${x} ${y}`
    }
    return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linejoin="round" stroke-linecap="round"/>`
  }
  const spike = (d, h, seed) => {
    const r = rng(seed + frame * 13)
    const [x0, y0] = polar(232, d)
    const [x1, y1] = polar(232 + h * 0.5, d + (r() - 0.5) * 14)
    const [x2, y2] = polar(232 + h, d + (r() - 0.5) * 18)
    return `<path d="M${x0} ${y0}L${x1} ${y1} ${x2} ${y2}" fill="none" stroke="#e8fbff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs(
    lg("el", ["#a5f3ff", "#2d6dff", "#a970ff"], 1, 1),
  )}${ring(230, 26, "#070b2c", 'opacity=".8"')}${ring(226, 8, "url(#el)", 'opacity=".85"')}
  <g filter="url(#glow2)">${bolt(0, 130, 3, 5, "#7fdfff")}${bolt(120, 130, 5, 5, "#9fa8ff")}${bolt(240, 125, 7, 5, "#7fdfff")}</g>
  <g filter="url(#glow)">${bolt(0, 130, 3, 2.5, "#fff")}${bolt(120, 130, 5, 2.5, "#fff")}${bolt(240, 125, 7, 2.5, "#fff")}
  ${[30, 95, 165, 215, 290, 340].map((d, i) => spike(d, 16 + (i % 3) * 9, i + 21)).join("")}</g></svg>`
}

const iceShards = (t) => {
  const r = rng(47)
  const shards = Array.from({ length: 28 }, (_, i) => {
    const d = (i * 360) / 28 + (r() - 0.5) * 5
    const up = Math.max(0, Math.cos((d * Math.PI) / 180))
    const h = 24 + r() * 28 + up * 22
    const w = 9 + r() * 9
    return place(...polar(220, d), d + (r() - 0.5) * 12, 1, `<path d="M-${f(w)} 8L${f(-w * 0.15)} -${f(h)} ${f(w)} 8Z" fill="url(#sh)" stroke="#e8fbff" stroke-width="1.2" stroke-linejoin="round"/><path d="M${f(-w * 0.15)} -${f(h)}L${f(w * 0.2)} 8 ${f(w)} 8Z" fill="#fff" opacity=".28"/>`)
  }).join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs(
    lg("sh", ["#e6fbff", "#6ccdf5", "#1f6fc2"]) + lg("ice", ["#f1fbff", "#59b9ee", "#1b5fb0"], 1, 1),
  )}<g filter="url(#ds)">${shards}${ring(222, 9, "url(#ice)")}</g>
  ${twinkles(t, [[262, 0, 1.3, 0], [250, 62, 0.9, 0.2], [252, 128, 0.9, 0.42], [252, 205, 0.9, 0.62], [254, 278, 1.0, 0.82]], "#fff")}</svg>`
}

const neon = (t) => {
  const flick = (ph) => {
    const k = (t + ph) % 1
    return k > 0.62 && k < 0.65 ? 0.35 : k > 0.7 && k < 0.72 ? 0.5 : 1
  }
  const glitch = Array.from({ length: 5 }, (_, i) => {
    const fr = Math.floor(t * 8)
    const r = rng(9 + fr * 7 + i * 31)
    if (r() < 0.45) return ""
    const d = r() * 360
    const [x, y] = polar(240, d)
    return `<rect x="${x}" y="${y}" width="${f(16 + r() * 40)}" height="3.5" fill="${i % 2 ? "#00f0ff" : "#ff2bd6"}" opacity=".85"/>`
  }).join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs()}
  ${ring(233, 34, "#0b0d24", 'opacity=".82"')}
  <g transform="rotate(${f(t * 360)} ${C} ${C})" filter="url(#glow)" opacity="${flick(0)}">
    <path d="${arc(232, 0, 170)}" fill="none" stroke="#ff2bd6" stroke-width="7" stroke-linecap="round"/>
    <path d="${arc(232, 190, 350)}" fill="none" stroke="#00f0ff" stroke-width="7" stroke-linecap="round"/>
  </g>
  <g transform="rotate(${f(-t * 360)} ${C} ${C})" filter="url(#glow)" opacity="${flick(0.3)}">
    <path d="${arc(246, 40, 120)}" fill="none" stroke="#00f0ff" stroke-width="3.5" stroke-linecap="round"/>
    <path d="${arc(246, 220, 300)}" fill="none" stroke="#ff2bd6" stroke-width="3.5" stroke-linecap="round"/>
  </g>${ring(218, 2, "#fff", 'opacity=".5"')}${glitch}</svg>`
}

const hud = (t) => {
  const ticks = Array.from({ length: 72 }, (_, i) => {
    const d = i * 5
    const long = i % 6 === 0
    const [x1, y1] = polar(long ? 232 : 238, d)
    const [x2, y2] = polar(246, d)
    return `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="#5cffc8" stroke-width="${long ? 3 : 1.5}" opacity="${long ? 1 : 0.65}"/>`
  }).join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs()}
  ${ring(235, 40, "#04141a", 'opacity=".85"')}
  <g filter="url(#glow)">
    <g transform="rotate(${f(t * 120)} ${C} ${C})">${ticks}</g>
    <g transform="rotate(${f(-t * 240)} ${C} ${C})">
      <path d="${arc(224, 15, 75)}" fill="none" stroke="#28e0ff" stroke-width="8"/>
      <path d="${arc(224, 135, 195)}" fill="none" stroke="#28e0ff" stroke-width="8"/>
      <path d="${arc(224, 255, 315)}" fill="none" stroke="#28e0ff" stroke-width="8"/>
    </g>
    ${[45, 135, 225, 315].map((d) => place(...polar(256, d), d, 1, '<path d="M-20 8V-8H-6M20 8V-8H6" fill="none" stroke="#fff" stroke-width="3.5"/>')).join("")}
    <circle cx="${polar(224, t * 360)[0]}" cy="${polar(224, t * 360)[1]}" r="6" fill="#fff"/>
  </g>
  <g font-family="Menlo, monospace" font-size="15" font-weight="700" fill="#5cffc8" text-anchor="middle">
    <text x="${C}" y="501" opacity="${f(0.6 + wave(t * 2) * 0.4)}">SYNC ${String(Math.floor(t * 100)).padStart(2, "0")}%</text>
  </g></svg>`
}

const goldfishes = (t) => {
  const fish = (deg, s, body, fin, ph) => {
    const d = deg + t * 360
    const [x, y] = polar(232 + wave(t, ph) * 5, d)
    return place(x, y, d, s, goldfish(t, body, fin, ph))
  }
  const ripples = [[0, 0.2], [0.5, 0.65]].map(([ph, d]) => {
    const p = (t + ph) % 1
    const [x, y] = polar(244, d * 360)
    return `<ellipse cx="${x}" cy="${y}" rx="${f(6 + p * 20)}" ry="${f(3 + p * 9)}" fill="none" stroke="#e6faff" stroke-width="2" opacity="${f(1 - p)}"/>`
  }).join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs(
    lg("water", ["#b6f0ff", "#2fa6d8", "#135d9f"], 1, 1) + lg("fb", ["#ff8a3c", "#e0240f"]) + lg("fw", ["#fff7ee", "#ff6a3c"]) + lg("fn", ["#ffe3c7", "#ff5a2c"]),
  )}${ring(232, 34, "url(#water)", 'opacity=".62"')}${ring(216, 2, "#e6faff", 'opacity=".9"')}${ring(249, 2, "#e6faff", 'opacity=".9"')}${ripples}
  <g filter="url(#ds)">${fish(0, 1.05, "url(#fb)", "url(#fn)", 0)}${fish(120, 0.9, "url(#fw)", "url(#fn)", 0.3)}${fish(240, 1.05, "url(#fb)", "url(#fn)", 0.6)}</g>
  ${[60, 180, 300].map((d) => place(...polar(236, d + t * 180), 0, 1, '<ellipse rx="13" ry="7" fill="#3fb36f" stroke="#1d6b40"/><path d="M0 0L13-4" stroke="#1d6b40"/>')).join("")}</svg>`
}

const wafuu = (t) => {
  const waves = Array.from({ length: 30 }, (_, i) => {
    const d = (i * 360) / 30
    const [x, y] = polar(232, d)
    return place(x, y, d, 1, '<path d="M-17 11A17 17 0 0 1 17 11" fill="#17305e" stroke="#e5c15c" stroke-width="2"/><path d="M-10 11A10 10 0 0 1 10 11" fill="none" stroke="#e5c15c" stroke-width="1.6"/>')
  }).join("")
  const fan = `<path d="M0 34L-62-22A84 84 0 0 1 62-22Z" fill="url(#fan)" stroke="#7a1320" stroke-width="2.5"/>${[-44, -29, -15, 0, 15, 29, 44].map((a) => `<path d="M0 34L${f(Math.sin((a * Math.PI) / 180) * 84)} ${f(34 - Math.cos((a * Math.PI) / 180) * 84)}" stroke="#7a1320" stroke-opacity=".65" stroke-width="1.4"/>`).join("")}<circle cy="-16" r="14" fill="#e8172f"/><circle cy="30" r="5" fill="#e5c15c" stroke="#7a1320"/>`
  const tassel = (x, ph) => {
    const s = wave(t, ph) * 5
    return `<path d="M${x} 0C${x} 12 ${x + s} 20 ${x + s} 34" stroke="#e8172f" stroke-width="3" fill="none"/><circle cx="${x + s}" cy="36" r="6" fill="#e5c15c" stroke="#7a1320"/><path d="M${x + s - 5} 40L${x + s - 8} 66H${x + s + 8}L${x + s + 5} 40Z" fill="#e8172f"/>`
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs(
    lg("fan", ["#fff8ea", "#f6dfa6"]) + lg("gold", ["#fff0b0", "#d8a431", "#fff0b0"], 1, 1),
  )}<g filter="url(#ds)">${ring(231, 26, "#17305e")}${waves}${ring(217, 4, "url(#gold)")}${ring(245, 4, "url(#gold)")}
    ${place(...polar(233, 322), -38, 0.9, fan)}${place(...polar(240, 150), 0, 1, tassel(-14, 0) + tassel(14, 0.4))}
    ${place(...polar(238, 135), 0, 1, '<path d="M-28 0H28M-28 7H28M-28-7H28" stroke="#e8172f" stroke-width="4" stroke-linecap="round"/><circle r="11" fill="#fff" stroke="#e5c15c" stroke-width="3"/>')}
  </g>${twinkles(t, [[250, 20, 1, 0], [250, 240, 0.9, 0.5]], "#ffe9a0")}</svg>`
}

const palette = (t) => {
  const paints = ["#ff4d6d", "#ffa21f", "#ffe14d", "#35d07f", "#2ab7ff", "#7c5cff", "#ff5cc8"]
  const blobs = Array.from({ length: 40 }, (_, i) => {
    const r = rng(300 + i)
    const d = (i * 360) / 40
    const c = paints[i % 7]
    const [x, y] = polar(226 + r() * 16, d)
    return `<circle cx="${x}" cy="${y}" r="${f(11 + r() * 12)}" fill="${c}"/>`
  }).join("")
  const drips = [[100, "#2ab7ff", 0], [132, "#35d07f", 0.2], [170, "#ffe14d", 0.4], [205, "#ffa21f", 0.6], [235, "#ff4d6d", 0.8]]
    .map(([d, c, ph]) => {
      const [x, y] = polar(236, d)
      const l = 14 + (wave(t, ph) + 1) * 11
      return `<path d="M${x} ${y}V${f(y + l)}" stroke="${c}" stroke-width="7" stroke-linecap="round"/>`
    })
    .join("")
  const pal = `<path d="M-52 4C-58-34-14-52 22-44 56-36 66-6 48 6 34 14 22 6 12 16 2 26 16 40-2 44-30 50-48 30-52 4Z" fill="url(#wood)" stroke="#5a3214" stroke-width="3"/><ellipse cx="-30" cy="24" rx="0" ry="0"/>${[[-30, -6, "#ff4d6d"], [-14, -26, "#ffe14d"], [12, -30, "#35d07f"], [34, -16, "#2ab7ff"], [-30, 18, "#7c5cff"]].map(([x, y, c]) => `<ellipse cx="${x}" cy="${y}" rx="9.5" ry="8" fill="${c}" stroke="#000" stroke-opacity=".2"/>`).join("")}<circle cx="-6" cy="24" r="8" fill="#a06a35" stroke="#5a3214" stroke-width="2"/>`
  const brushRot = 36 + wave(t) * 6
  const brush = `<rect x="-5" y="-70" width="10" height="66" rx="4" fill="#d8312f" stroke="#7a1414" stroke-width="1.5"/><rect x="-6" y="-8" width="12" height="16" fill="#c9ced6" stroke="#5a6068"/><path d="M-6 8C-9 24-3 32 0 40 3 32 9 24 6 8Z" fill="#2ab7ff" stroke="#0d5e88" stroke-width="1.2"/>`
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs(
    lg("wood", ["#e6b77a", "#b57b3f"]),
  )}<mask id="hole"><rect width="512" height="512" fill="#fff"/><circle cx="${C}" cy="${C}" r="212" fill="#000"/></mask>
  <g filter="url(#ds)"><g mask="url(#hole)">${blobs}</g><g mask="url(#hole)">${drips}</g>
  ${place(...polar(226, 138), -12, 1.05, pal)}${place(...polar(232, 322), brushRot - 80, 1.05, brush)}</g></svg>`
}

const galaxy = (t) => {
  const r = rng(77)
  const dust = Array.from({ length: 110 }, () => {
    const d = r() * 360
    const rr = 216 + r() * 36
    const [x, y] = polar(rr, d + t * 90)
    return `<circle cx="${x}" cy="${y}" r="${f(0.8 + r() * 1.9)}" fill="#fff" opacity="${f(0.35 + r() * 0.65)}"/>`
  }).join("")
  const planet = (rr, d, size, body) => {
    const [x, y] = polar(rr, d)
    return place(x, y, 0, size, body)
  }
  const saturn = `<circle r="17" fill="url(#pl1)"/><ellipse rx="29" ry="7.5" fill="none" stroke="#ffe0a8" stroke-width="3.5" transform="rotate(-22)"/><path d="M-13-10A17 17 0 0 1 13-10" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="2.5"/>`
  const earth = `<circle r="15" fill="url(#pl2)"/><path d="M-8-8C-2-12 4-6 0-2-6 2-9-3-8-8ZM3 3C8 1 11 6 7 9 3 11 1 6 3 3Z" fill="#6fe39a"/>`
  const moon = `<circle r="10" fill="url(#pl3)"/><circle cx="-3" cy="-2" r="2.3" fill="#8f9bb8"/><circle cx="3" cy="4" r="1.6" fill="#8f9bb8"/>`
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs(
    `<radialGradient id="pl1" cx=".35" cy=".3"><stop offset="0" stop-color="#ffe9c4"/><stop offset="1" stop-color="#d27c35"/></radialGradient>
     <radialGradient id="pl2" cx=".35" cy=".3"><stop offset="0" stop-color="#9fe2ff"/><stop offset="1" stop-color="#1b58c9"/></radialGradient>
     <radialGradient id="pl3" cx=".35" cy=".3"><stop offset="0" stop-color="#f2f5ff"/><stop offset="1" stop-color="#7f8bab"/></radialGradient>` +
      lg("neb", ["#1c0f52", "#7a29c8", "#e34bb0", "#2b6fe0", "#1c0f52"], 1, 1),
  )}<g transform="rotate(${f(t * 360)} ${C} ${C})">${ring(233, 38, "url(#neb)", 'opacity=".9"')}</g>${ring(233, 46, "url(#neb)", 'opacity=".4" filter="url(#soft)"')}${dust}
  ${ring(214, 1.5, "#fff", 'opacity=".5"')}${ring(252, 1.5, "#fff", 'opacity=".5"')}
  <g filter="url(#ds)">${planet(234, 40 + t * 360, 1.15, saturn)}${planet(234, 170 + t * 360, 1, earth)}${planet(234, 280 + t * 360, 1, moon)}</g></svg>`
}

const butterflies = (t) => {
  const vine = `<path d="${arc(228, 0, 360)}" fill="none" stroke="#3f8a54" stroke-width="5"/>${Array.from({ length: 22 }, (_, i) => {
    const d = (i * 360) / 22
    return place(...polar(230, d), d + (i % 2 ? 40 : 140), 0.6, leaf("#4fb36d"))
  }).join("")}`
  const flowers = [[236, 30], [232, 110], [238, 192], [230, 258], [236, 322]]
    .map(([rr, d], i) => place(...polar(rr, d), i * 30, 0.52, blossom(i % 2 ? "url(#fw)" : "url(#petal)")))
    .join("")
  const fly = (rr, d, s, a, b, ph) => {
    const [x, y] = polar(rr + wave(t, ph) * 7, d + wave(t, ph + 0.25) * 6)
    return place(x, y, d * 0.1 + wave(t, ph) * 8, s, butterfly(t, a, b, ph))
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-14 -14 540 540">${defs(
    lg("petal", ["#fff3f7", "#ffc1d6", "#ff8fb4"]) + lg("fw", ["#fffbe6", "#ffe68a", "#ffc23c"]) +
      lg("bf1", ["#7be8ff", "#3b6bff", "#8f3bff"], 1, 1) + lg("bf2", ["#c0a0ff", "#7a2fd6"], 1, 1) +
      lg("bf3", ["#ffe27a", "#ff7a2f", "#e8173f"], 1, 1) + lg("bf4", ["#ffb35c", "#c93a0d"], 1, 1),
  )}<g filter="url(#ds)">${vine}${flowers}${fly(240, 328, 0.92, "bf1", "bf2", 0)}${fly(238, 62, 0.62, "bf3", "bf4", 0.3)}${fly(240, 150, 0.84, "bf3", "bf4", 0.6)}${fly(244, 232, 0.55, "bf1", "bf2", 0.8)}</g></svg>`
}

const inkBrush = (t) => {
  const r = rng(555)
  const strokes = Array.from({ length: 34 }, (_, i) => {
    const d = (i * 360) / 34
    const w = 5 + r() * 19
    const inner = 222 + r() * 6
    return `<path d="${arc(inner + r() * 12, d, d + 14 + r() * 8)}" fill="none" stroke="#111" stroke-width="${f(w)}" stroke-linecap="round" opacity="${f(0.75 + r() * 0.25)}"/>`
  }).join("")
  const splats = Array.from({ length: 34 }, () => {
    const [x, y] = polar(240 + r() * 20, r() * 360)
    return `<circle cx="${x}" cy="${y}" r="${f(1 + r() * 4.4)}" fill="#111"/>`
  }).join("")
  const seal = `<rect x="-29" y="-29" width="58" height="58" rx="7" fill="#c8102e" stroke="#7d0a1c" stroke-width="2"/><rect x="-23" y="-23" width="46" height="46" rx="3" fill="none" stroke="#fff" stroke-width="2.5"/><text y="1.5" text-anchor="middle" dominant-baseline="central" font-family="'Hiragino Mincho ProN', serif" font-size="30" font-weight="700" fill="#fff">絵</text>`
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs()}
  <mask id="hole"><rect width="512" height="512" fill="#fff"/><circle cx="${C}" cy="${C}" r="211" fill="#000"/></mask>
  <g mask="url(#hole)">${strokes}${splats}</g>
  <g filter="url(#ds)">${place(...polar(232, 138), -8 + wave(t) * 2, 1.05, seal)}</g></svg>`
}


/* ------------------------------------------------------------------ */
/* コインの枠のために足した装飾                                         */
/* ------------------------------------------------------------------ */

/** 色だけ変えた別の枠を作る */
const recolor = (draw, colors) => (t) => {
  let svg = draw(t)
  for (const [from, to] of Object.entries(colors)) {
    svg = svg.replaceAll(from, to)
  }
  return svg
}

const fallenAngel = recolor(angel, {
  '"#ffffff"': '"#3b3650"',
  "#dfe8f7": "#14111f",
  "#eef4ff": "#1e1a2e",
  "#c6d3e8": "#6f648f",
  "#fff8c9": "#ffb0c8",
  "#ffcf4a": "#d0184f",
  "#ffe9a0": "#a01040",
  "#fff3b0": "#ff6f96",
})

const blueFlames = recolor(flames, {
  "#ff4d0d": "#1442ff",
  "#c70f00": "#2b0bb0",
  "#ffc41f": "#4fdcff",
  "#ff6a00": "#1d7dff",
  "#fff3b0": "#e6fbff",
  "#ffcf54": "#8fe6ff",
  "#ffe27a": "#b8f2ff",
})

const silverCrown = recolor(crown, {
  "#fff6b8": "#ffffff",
  "#ffcb36": "#c9d3df",
  "#b87a06": "#6d7a8a",
  "#ffe37a": "#eef3f8",
  "#6b4a00": "#39434f",
  "#7a5200": "#4a5563",
  "#cf1d48": "#2a4fb8",
  "#6b0a2a": "#10245f",
  "#fff6c0": "#e6f4ff",
})

const fox = (t) => {
  const tilt = wave(t) * 3
  const ear = (s) =>
    `<g transform="translate(${C} ${C}) rotate(${f(s * (35 + tilt))}) translate(0 -${R}) scale(${s} 1)">
      <path d="M-50 28C-44-30-26-84 8-116 26-74 44-30 50 28Z" fill="url(#foxO)" stroke="#7a3208" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M-24 22C-20-20-8-52 8-76 18-46 28-14 30 22Z" fill="#fff4e6"/>
      <path d="M8-116C14-102 20-90 24-78 12-84 0-84-10-78-4-92 2-104 8-116Z" fill="#2a1408"/></g>`
  const mask = `<path d="M0-34C24-34 34-14 30 8 26 26 12 36 0 38-12 36-26 26-30 8-34-14-24-34 0-34Z" fill="#fff" stroke="#b7b2a8" stroke-width="2"/>
    <path d="M-30-22L-40-44-16-34ZM30-22L40-44 16-34Z" fill="#fff" stroke="#b7b2a8" stroke-width="2"/>
    <path d="M-22-6C-16-14-8-14-4-6M22-6C16-14 8-14 4-6" stroke="#111" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <path d="M-20-14L-6-22M20-14L6-22" stroke="#d8182c" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M-5 18L0 24 5 18Z" fill="#111"/><circle cy="-22" r="4" fill="#d8182c"/><path d="M-14 6L-24 10M14 6L24 10" stroke="#d8182c" stroke-width="2" stroke-linecap="round"/>`
  const fires = [[254, 72, 0], [262, 96, 0.35], [254, 262, 0.6], [262, 288, 0.85]]
    .map(([rr, d, ph]) => place(...polar(rr, d), 0, 1 + wave(t, ph) * 0.14, '<path d="M0 14C-12 6-10-8 0-18 10-8 12 6 0 14Z" fill="#7fe4ff" opacity=".9"/><path d="M0 12C-5 6-5-2 0-8 5-2 5 6 0 12Z" fill="#fff"/>', 'filter="url(#glow)"'))
    .join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs(
    lg("foxO", ["#ff9d3d", "#e2610f"]) + lg("cord", ["#e8172f", "#8d0a1a", "#e8172f"], 1, 1),
  )}<g filter="url(#ds)"><g mask="url(#behind)">${ear(-1)}${ear(1)}</g>
    ${ring(224, 6, "url(#cord)")}${place(...polar(232, 142), -14 + wave(t) * 3, 1.15, mask)}
  </g>${fires}</svg>`
}

const oni = (t) => {
  const horn = (s) =>
    `<g transform="translate(${C} ${C}) rotate(${f(s * 26)}) translate(0 -${R - 4}) scale(${s} 1)">
      <path d="M-30 26C-26-30-12-66 10-98 22-60 30-20 30 26Z" fill="url(#oniH)" stroke="#5a2a00" stroke-width="3"/>
      <path d="M-27 2C-8 8 12 8 30 2M-21-24C-6-18 8-18 25-24M-12-50C-3-46 6-46 17-50" stroke="#5a2a00" stroke-opacity=".6" stroke-width="3" fill="none"/></g>`
  const stripes = Array.from({ length: 30 }, (_, i) => {
    const d = (i * 360) / 30
    return place(...polar(232, d), d + 12, 1, '<path d="M-5-14C-1-6 1 4-3 14L6 14C9 4 7-6 3-14Z" fill="#17120c"/>')
  }).join("")
  const heat = 0.6 + wave(t) * 0.25
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs(
    lg("oniH", ["#fff2b0", "#f1b12b", "#b5540c"]) + lg("tora", ["#ffd23f", "#f39a12"]),
  )}<g filter="url(#ds)"><g mask="url(#behind)">${horn(-1)}${horn(1)}</g>${ring(232, 28, "url(#tora)")}${stripes}${ring(218, 3, "#17120c")}${ring(246, 3, "#17120c")}</g>
  ${ring(250, 5, "#ff3b1f", `opacity="${f(heat)}" filter="url(#glow)"`)}</svg>`
}

const witch = (t) => {
  const stars = [[244, 82, 1, 0], [250, 130, 0.8, 0.2], [244, 188, 1, 0.45], [250, 236, 0.8, 0.65], [244, 290, 1, 0.85]]
  const sway = wave(t) * 2
  const bats = [0, 0.5].map((ph) => {
    const p = (t + ph) % 1
    const [x, y] = polar(262, 90 + p * 180)
    const flap = 0.55 + 0.45 * Math.abs(Math.cos(TAU * (t * 3 + ph)))
    return place(x, y, 0, 0.62, `<g transform="scale(1 ${f(flap)})"><path d="M0 2C-8-8-22-10-34-2-26 0-24 8-22 10-16 4-10 6-4 10L0 6 4 10C10 6 16 4 22 10 24 8 26 0 34-2 22-10 8-8 0 2Z" fill="#16102a"/></g><circle r="5.5" cy="1" fill="#16102a"/>`)
  }).join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs(
    lg("hat", ["#5a2d9c", "#2a1158"]) + lg("gold", ["#fff0a8", "#d9a11f"]) + lg("wr", ["#7b42c9", "#2a1158", "#ff7a2f"], 1, 1),
  )}<g filter="url(#ds)">${ring(226, 7, "url(#wr)")}
    <g transform="translate(${C - 12} 44) rotate(${f(-11 + sway)})">
      <path d="M-124 34C-74 8 74 8 124 34 74 58-74 58-124 34Z" fill="#2a1158" stroke="#16082f" stroke-width="3"/>
      <path d="M-64 26C-46-34-18-70 8-98 22-110 42-106 58-92 32-92 34-62 40-40 48-12 58 8 64 26 24 38-24 38-64 26Z" fill="url(#hat)" stroke="#16082f" stroke-width="3" stroke-linejoin="round"/>
      <path d="M-64 26C-24 38 24 38 64 26L58 6C24 18-24 18-58 6Z" fill="#ff7a2f" stroke="#16082f" stroke-width="2"/>
      <rect x="-15" y="4" width="30" height="26" rx="4" fill="none" stroke="url(#gold)" stroke-width="6"/>
    </g></g>${bats}${twinkles(t, stars, "#ffd86b")}</svg>`
}

const santa = (t) => {
  const pom = wave(t) * 6
  const r = rng(91)
  const snowfall = Array.from({ length: 12 }, (_, i) => {
    const p = (t + i / 12) % 1
    const x = 10 + r() * 492
    const y = -30 + p * 572
    if (Math.hypot(x - C, y - C) < 214) return ""
    return `<circle cx="${f(x + Math.sin(TAU * (p + i / 7)) * 9)}" cy="${f(y)}" r="${f(2.5 + r() * 2.5)}" fill="#fff" stroke="#c9dcef" stroke-width=".6"/>`
  }).join("")
  const holly = '<path d="M0 0C-8-10-24-12-34-6-28-2-28 4-32 8-22 8-16 12-12 18-6 12-2 6 0 0ZM0 0C8-10 24-12 34-6 28-2 28 4 32 8 22 8 16 12 12 18 6 12 2 6 0 0Z" fill="#1f8a4c" stroke="#0d4d2a" stroke-width="1.5"/><circle cy="-3" cx="-7" r="7" fill="#e8172f"/><circle cy="-3" cx="7" r="7" fill="#e8172f"/><circle cy="7" r="7" fill="#e8172f"/>'
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs(
    lg("hat", ["#ff4b4b", "#b50d1c"]) + lg("sn", ["#ffffff", "#d7e6f5"]),
  )}<g filter="url(#ds)">${ring(226, 14, "#e8172f", 'stroke-dasharray="24 24"')}${ring(226, 14, "#fff", 'stroke-dasharray="24 24" stroke-dashoffset="24"')}
    ${place(...polar(232, 150), 0, 1.05, holly)}
    <g transform="translate(${C - 20} 42) rotate(-13)">
      <path d="M-98 34C-82-34-26-82 30-78 78-74 110-40 ${f(128 + pom)} 6 ${f(92 + pom)}-20 62-24 48-6 76 2 96 12 98 34 44 46-44 46-98 34Z" fill="url(#hat)" stroke="#7a0a14" stroke-width="3" stroke-linejoin="round"/>
      <path d="M-110 28C-112 12-98 6-90 8-56 22 56 22 96 8 108 6 118 14 114 30 110 48 96 50 88 48 50 60-50 60-90 48-100 50-108 44-110 28Z" fill="url(#sn)" stroke="#b9cbdd" stroke-width="2"/>
      <circle cx="${f(130 + pom)}" cy="12" r="19" fill="url(#sn)" stroke="#b9cbdd" stroke-width="2"/>
    </g></g>${snowfall}</svg>`
}

const headphones = (t) => {
  const beat = 1 + wave(t * 2) * 0.05
  const cup = (s) =>
    `<g transform="translate(${C + s * 224} ${C + 8}) scale(${s} 1)">
      <rect x="-20" y="-50" width="22" height="100" rx="11" fill="#20242e" stroke="#0c0e13" stroke-width="2"/>
      <rect x="-2" y="-62" width="44" height="124" rx="20" fill="url(#cup)" stroke="#0c0e13" stroke-width="3"/>
      <g transform="translate(20 0) scale(${f(beat)})"><circle r="23" fill="#10131b" stroke="#ff2f92" stroke-width="4"/><circle r="11" fill="url(#led)"/></g></g>`
  const bars = (d, ph) =>
    [0, 1, 2, 3].map((i) => {
      const [x, y] = polar(262, d + i * 7)
      const h = 12 + (wave(t * 2, ph + i * 0.21) + 1) * 12
      return `<rect x="${f(x - 3)}" y="${f(y - h)}" width="6" height="${f(h)}" rx="3" fill="${i % 2 ? "#29d3ff" : "#ff2f92"}"/>`
    }).join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs(
    lg("cup", ["#4a5166", "#1b1f2a"]) + lg("band", ["#2b3040", "#6a7390", "#2b3040"], 1, 0) + rg("led", ["#ffffff", "#ff2f92"]),
  )}<g filter="url(#ds)"><path d="${arc(242, 278, 442)}" fill="none" stroke="url(#band)" stroke-width="22" stroke-linecap="round"/><path d="${arc(242, 290, 430)}" fill="none" stroke="#ff2f92" stroke-width="3" stroke-dasharray="3 10" stroke-linecap="round"/>${cup(-1)}${cup(1)}</g>
  <g filter="url(#glow)">${bars(122, 0)}${bars(212, 0.5)}</g></svg>`
}

const notes = (t) => {
  const note = (fill) =>
    `<path d="M6-34V8" stroke="${fill}" stroke-width="4"/><ellipse cx="-2" cy="10" rx="10" ry="7.5" fill="${fill}" transform="rotate(-20 -2 10)"/><path d="M6-34C16-30 24-24 22-10 20-18 14-22 6-22Z" fill="${fill}"/>`
  const beam = (fill) =>
    `<path d="M-14-26L18-34V6M-14-26V14" stroke="${fill}" stroke-width="4" fill="none"/><path d="M-14-26L18-34V-24L-14-16Z" fill="${fill}"/><ellipse cx="-22" cy="15" rx="9.5" ry="7" fill="${fill}" transform="rotate(-20 -22 15)"/><ellipse cx="10" cy="7" rx="9.5" ry="7" fill="${fill}" transform="rotate(-20 10 7)"/>`
  const colors = ["#ff4d8d", "#29b6ff", "#ffb31f", "#7c5cff", "#2fd38f"]
  const items = Array.from({ length: 10 }, (_, i) => {
    const d = (i * 36 + t * 36) % 360
    const body = i % 2 ? note(colors[i % 5]) : beam(colors[i % 5])
    return place(...polar(240 + wave(t * 2, i / 10) * 8, d), wave(t, i / 10) * 14, 0.95, body, 'filter="url(#ds)"')
  }).join("")
  const staff = [-8, -4, 0, 4, 8].map((o) => ring(228 + o, 1.6, "#6f7bb5", 'opacity=".85"')).join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs()}${staff}${items}</svg>`
}

const rainbowClouds = (t) => {
  const bands = ["#ff5a5a", "#ffa43a", "#ffe34d", "#4fd97a", "#3fb8ff", "#8a6bff"]
    .map((c, i) => `<path d="${arc(258 - i * 8, 300, 420)}" fill="none" stroke="${c}" stroke-width="8.5"/>`)
    .join("")
  const cloud = (x, y, s, ph) =>
    place(x + wave(t, ph) * 6, y, 0, s, '<path d="M-60 26C-78 22-78-2-58-6-60-30-26-40-14-22-6-46 34-44 36-16 58-22 74 -2 62 16 58 26 50 28 44 28Z" fill="url(#cl)" stroke="#c9d9ee" stroke-width="2.5"/>')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs(lg("cl", ["#ffffff", "#dbe8f7"]))}
  <g mask="url(#behind)">${bands}</g><g filter="url(#ds)">${cloud(42, 190, 1.15, 0)}${cloud(470, 190, 1.15, 0.5)}${cloud(88, 452, 0.75, 0.25)}${cloud(424, 452, 0.75, 0.75)}</g>
  ${twinkles(t, [[268, 345, 1.3, 0], [268, 15, 1.2, 0.35], [266, 330, 0.8, 0.7], [266, 30, 0.8, 0.55]], "#fff6b0")}</svg>`
}

const dragon = (t) => {
  const start = 96
  const span = 304
  const toRadius = (k) => 238 + Math.sin(k * TAU * 3 - TAU * t) * 8
  const pts = Array.from({ length: 121 }, (_, i) => {
    const k = i / 120
    return polar(toRadius(k), start + span * k)
  })
  const width = (k) => 7 + 25 * Math.sin(Math.min(1, k * 1.15) * Math.PI * 0.6)
  const pass = (extra, color) =>
    pts
      .slice(0, -1)
      .map(([x, y], i) => {
        const [x2, y2] = pts[i + 1]
        return `<path d="M${x} ${y}L${x2} ${y2}" stroke="${color}" stroke-width="${f(width(i / 120) + extra)}" stroke-linecap="round"/>`
      })
      .join("")
  const belly = pts
    .slice(0, -1)
    .map((_, i) => {
      const k = i / 120
      const inner = (kk) => polar(toRadius(kk) - width(kk) * 0.26, start + span * kk)
      const [x, y] = inner(k)
      const [x2, y2] = inner((i + 1) / 120)
      return `<path d="M${x} ${y}L${x2} ${y2}" stroke="#ffd96b" stroke-width="${f(width(k) * 0.4)}" stroke-linecap="round"/>`
    })
    .join("")
  const body = pass(5, "#0a4630") + pass(0, "#1f9a58") + belly
  const scales = pts.filter((_, i) => i % 3 === 0 && i > 6).map(([x, y], i) => {
    const k = (i * 3) / 120
    const a = Math.atan2(y - C, x - C)
    return `<circle cx="${f(x + Math.cos(a) * width(k) * 0.2)}" cy="${f(y + Math.sin(a) * width(k) * 0.2)}" r="${f(width(k) * 0.14)}" fill="#8df0a8" opacity=".85"/>`
  }).join("")
  const spines = pts.filter((_, i) => i % 5 === 2 && i > 10 && i < 116).map(([x, y]) => {
    const a = Math.atan2(y - C, x - C)
    const deg = (a * 180) / Math.PI + 90
    return place(x + Math.cos(a) * 15, y + Math.sin(a) * 15, deg, 1, '<path d="M-7 4L0-15 7 4Z" fill="#c1121f" stroke="#6b0810" stroke-width="1.2"/>')
  }).join("")
  const [hx, hy] = pts[120]
  const headRot = (start + span) % 360
  const head = `<g transform="translate(${hx} ${hy}) rotate(${headRot}) scale(1.5)">
    <path d="M-20-14C-34-30-46-34-58-30-46-24-40-14-34-6Z" fill="#ffd23f" stroke="#7a4c00" stroke-width="1.5"/>
    <path d="M-12-16C-24-36-32-44-46-46-36-34-30-20-26-8Z" fill="#fff0a8" stroke="#7a4c00" stroke-width="1.5"/>
    <path d="M-30 12C-30-14-10-22 12-20 34-18 50-8 56 4 46 8 40 8 36 8 42 16 42 20 36 24 12 28-20 32-30 12Z" fill="url(#head)" stroke="#6b3a00" stroke-width="2"/>
    <path d="M36 8C24 10 10 10-2 8M34 9L30 15M24 10L21 16M14 10L12 16" stroke="#fff" stroke-width="1.8" fill="none"/>
    <circle cx="10" cy="-8" r="6" fill="#fff"/><circle cx="12" cy="-8" r="3.2" fill="#c1121f"/><circle cx="12.6" cy="-9" r="1" fill="#fff"/>
    <circle cx="48" cy="1" r="1.8" fill="#6b3a00"/>
    <path d="M50 6C66 14 ${f(70 + wave(t) * 6)} 28 ${f(58 + wave(t) * 6)} 40M46-2C68-14 ${f(82 + wave(t, 0.3) * 6)}-10 ${f(92 + wave(t, 0.3) * 6)} 2" stroke="#ffe27a" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <path d="M-28 12C-44 2-52 8-58 18-46 16-44 24-48 32-36 26-30 26-24 26Z" fill="#c1121f" stroke="#6b0810" stroke-width="1.5"/></g>`
  const [px, py] = polar(246, start + span + 42 + wave(t) * 3)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs(
    lg("head", ["#b8f07a", "#1f9a58"]) +
      `<radialGradient id="orb" cx=".35" cy=".3"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#9fe6ff"/><stop offset="1" stop-color="#2b63e0"/></radialGradient>`,
  )}<g filter="url(#ds)">${spines}${body}${scales}${head}</g>
  <g filter="url(#glow2)"><circle cx="${px}" cy="${py}" r="${f(15 + wave(t * 2) * 1.5)}" fill="url(#orb)"/></g>
  ${twinkles(t, [[262, 60, 1.1, 0], [262, 140, 0.9, 0.3], [262, 245, 1, 0.6]], "#ffe27a")}</svg>`
}

/* ------------------------------------------------------------------ */
/* プラン限定の枠                                                       */
/* 同じ意匠（金属の輪・宝石・月桂樹）で、ライト → スタンダード → プレミアムと */
/* 素材と手数が上がっていく。コインの王冠（縁取りのある絵）と見分けが付くよう、 */
/* 縁取りの線を使わず、陰影と映り込みで金属と宝石を描く                     */
/* ------------------------------------------------------------------ */

const PLAN_VIEW = 'viewBox="-60 -60 632 632"'

/** 暗い色 → 明るい色 */
const METAL = {
  silver: ["#2b323c", "#5c6876", "#94a1b0", "#cbd4de", "#eef2f6", "#ffffff"],
  rose: ["#4f2620", "#8f4d40", "#c9826c", "#edb49d", "#ffdccd", "#fff6f1"],
  gold: ["#3f2702", "#7d5207", "#b9860e", "#e9bd42", "#ffe58c", "#fffadd"],
  platinum: ["#272f40", "#56647d", "#97a6bd", "#d3dcea", "#f3f7fc", "#ffffff"],
  onyx: ["#020203", "#0b0b10", "#17171f", "#2b2b38", "#55556a", "#b9b9cf"],
}

const JEWEL = {
  sapphire: ["#06164a", "#11389a", "#2c6de2", "#7db3ff", "#e6f1ff"],
  ruby: ["#3a0310", "#8c0a28", "#d91f4b", "#ff7d96", "#ffe4ea"],
  diamond: ["#5b7ca8", "#a4c2e6", "#d9e9fa", "#f5faff", "#ffffff"],
  ice: ["#1d5b8f", "#4c9fd6", "#9fd8f7", "#dff4ff", "#ffffff"],
  pink: ["#5c1232", "#b3386b", "#ee82aa", "#ffc6da", "#fff1f6"],
  black: ["#000000", "#0d0d14", "#23232f", "#5a5a72", "#e9e9f7"],
}

const hexToRgb = (hex) => [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16))

const mixHex = (a, b, k) => {
  const [x, y] = [hexToRgb(a), hexToRgb(b)]
  return `#${x.map((v, i) => Math.round(v + (y[i] - v) * k).toString(16).padStart(2, "0")).join("")}`
}

/** stops の上の位置 k（0〜1）の色 */
const ramp = (stops, k) => {
  const x = Math.min(0.9999, Math.max(0, k)) * (stops.length - 1)
  const i = Math.floor(x)
  return mixHex(stops[i], stops[i + 1], x - i)
}

const pp = (r, deg) => polar(r, deg).join(" ")

/** 左右対称に描く */
const mirror = (body) => `${body}<g transform="translate(512 0) scale(-1 1)">${body}</g>`

/**
 * 金属の輪。断面は丸く（中央が明るく、縁が暗い）、角度ごとに映り込みの明るさを変える。
 * shift を動かすと光沢が流れる
 */
const metalBand = (r, w, stops, { shift = 0, lobes = 2, layers = 5, steps = 72, from = 0, to = 360 } = {}) => {
  const lw = w / layers
  const step = (to - from) / steps
  let out = ""
  for (let j = 0; j < layers; j++) {
    const rr = r - w / 2 + lw * (j + 0.5)
    const profile = Math.sin((Math.PI * (j + 0.5)) / layers)
    for (let i = 0; i < steps; i++) {
      const a0 = from + i * step
      const mid = a0 + step / 2
      const c = 0.5 + 0.5 * Math.cos((lobes * (mid + 45 - shift) * Math.PI) / 180)
      const fine = 0.5 + 0.5 * Math.cos((lobes * 3 * (mid + 20 - shift * 1.6) * Math.PI) / 180)
      const k = 0.06 + 0.3 * profile + (0.52 * c ** 2.4 + 0.12 * fine ** 3) * (0.3 + 0.7 * profile)
      out += `<path d="${arc(f(rr), f(a0), f(Math.min(to, a0 + step + 0.6)))}" stroke="${ramp(stops, k)}" stroke-width="${f(lw + 0.7)}" fill="none"/>`
    }
  }
  return out
}

/** 粒金（輪の縁に並ぶ小さな金属の粒） */
const milgrain = (r, size, count, stops, shift = 0) =>
  Array.from({ length: count }, (_, i) => {
    const d = (i * 360) / count
    const [x, y] = polar(r, d)
    const c = 0.5 + 0.5 * Math.cos((2 * (d + 45 - shift) * Math.PI) / 180)
    return `<circle cx="${x}" cy="${y}" r="${size}" fill="${ramp(stops, 0.3 + 0.6 * c)}"/><circle cx="${f(x - size * 0.3)}" cy="${f(y - size * 0.3)}" r="${f(size * 0.35)}" fill="${stops[5]}" opacity="${f(0.35 + 0.5 * c)}"/>`
  }).join("")

/** ブリリアントカットの宝石（上から見た形）。面ごとの明るさが時間でゆらぐ */
const brilliant = (r, stops, t, phase = 0, n = 8) => {
  const rt = r * 0.56
  let out = `<circle r="${f(r)}" fill="${stops[0]}"/>`
  for (let i = 0; i < n * 2; i++) {
    const a0 = (i * 180) / n
    const a1 = ((i + 1) * 180) / n
    const lit = 0.5 + 0.5 * Math.cos(((a0 + a1) / 2 + 45) * (Math.PI / 180))
    const shimmer = 0.5 + 0.5 * Math.sin(TAU * (t + phase) + i * 2.4)
    const k = 0.12 + 0.3 * lit + 0.55 * shimmer ** 2
    out += `<path d="M${polar(r, a0, 0, 0)}L${polar(r, a1, 0, 0)}L${polar(rt, a1, 0, 0)}L${polar(rt, a0, 0, 0)}Z" fill="${ramp(stops, k)}"/>`
  }
  for (let i = 0; i < n; i++) {
    const a0 = (i * 360) / n
    const a1 = ((i + 1) * 360) / n
    const shimmer = 0.5 + 0.5 * Math.sin(TAU * (t + phase) + i * 1.7 + 1)
    out += `<path d="M0 0L${polar(rt, a0, 0, 0)}L${polar(rt, a1, 0, 0)}Z" fill="${ramp(stops, 0.5 + 0.45 * shimmer)}"/>`
  }
  return `${out}<path d="M${polar(rt * 0.9, 285, 0, 0)}L${polar(rt * 0.9, 345, 0, 0)}L${polar(rt * 0.25, 315, 0, 0)}Z" fill="#fff" opacity=".75"/>`
}

/** 宝石の台座（覆輪）と宝石 */
const setGem = (x, y, r, metal, jewel, t, phase = 0, squash = 1) =>
  `<g transform="translate(${f(x)} ${f(y)})"><g transform="scale(${squash} 1)"><circle r="${f(r + 4.6)}" fill="${metal[0]}"/><circle r="${f(r + 3.8)}" fill="url(#bz-${metal[2].slice(1)})"/><circle r="${f(r + 0.9)}" fill="${metal[0]}"/>${brilliant(r, jewel, t, phase)}</g></g>`

/** 台座の金属（左上が明るい） */
const bezelDef = (metal) =>
  `<linearGradient id="bz-${metal[2].slice(1)}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${metal[5]}"/><stop offset=".45" stop-color="${metal[3]}"/><stop offset="1" stop-color="${metal[1]}"/></linearGradient>`

/** 真珠 */
const pearl = (x, y, r) =>
  `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="url(#pearl)"/><circle cx="${f(x - r * 0.32)}" cy="${f(y - r * 0.36)}" r="${f(r * 0.26)}" fill="#fff" opacity=".95"/>`

const PEARL_DEF =
  '<radialGradient id="pearl" cx=".36" cy=".32" r=".75"><stop offset="0" stop-color="#ffffff"/><stop offset=".45" stop-color="#f6ecef"/><stop offset=".8" stop-color="#cdb9c6"/><stop offset="1" stop-color="#8f7c8f"/></radialGradient>'

/** 彫金の葉（上半分が明るく、下半分が暗い）。k は光の当たり具合 */
const metalLeaf = (stops, k = 0.5) =>
  `<path d="M0 0C10-10 27-11 39 0 27 11 10 10 0 0Z" fill="${stops[0]}"/><path d="M1.5 0C11-8.6 26-9.4 37 0Z" fill="${ramp(stops, 0.5 + 0.42 * k)}"/><path d="M1.5 0C11 8.6 26 9.4 37 0Z" fill="${ramp(stops, 0.24 + 0.3 * k)}"/><path d="M3 0H35" stroke="${ramp(stops, 0.8 + 0.2 * k)}" stroke-width="1" opacity=".8"/>`

/**
 * 月桂樹の枝。下（180 度）から dir の向きへ上っていく。
 * flow は光が枝を上っていく位置（0〜1）
 */
const laurelBranch = (dir, stops, { r = 251, from = 14, to = 150, pairs = 12, size = 1, flow = 0 } = {}) => {
  let out = `<path d="${dir > 0 ? arc(r, 180 + from, 180 + to) : arc(r, 180 - to, 180 - from)}" stroke="${stops[1]}" stroke-width="${f(3.4 * size)}" fill="none" stroke-linecap="round"/>`
  for (let i = pairs - 1; i >= 0; i--) {
    const d = 180 + dir * (from + ((to - from) * (i + 0.5)) / pairs)
    const tangent = d - 90 + 90 * dir
    const s = size * (1 - (0.34 * i) / pairs)
    const k = 0.5 + 0.5 * Math.sin(TAU * (flow - i / pairs))
    const [x, y] = polar(r, d)
    out += place(x, y, tangent - dir * 34, s, metalLeaf(stops, k))
    out += place(x, y, tangent + dir * 30, s * 0.86, metalLeaf(stops, k * 0.8))
  }
  const [tx, ty] = polar(r, 180 + dir * (to + 2))
  return out + place(tx, ty, 180 + dir * (to + 2) - 90 + 90 * dir, size * 0.62, metalLeaf(stops, 0.7))
}

/** 唐草の渦（線で描く金属細工） */
const scroll = (stops, w = 4) => {
  const d = "M0 0C7-15 31-18 38-3 43 9 32 19 23 14 16 10 19 1 26 3"
  return `<path d="${d}" stroke="${stops[0]}" stroke-width="${f(w + 2)}" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${stops[3]}" stroke-width="${w}" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${stops[5]}" stroke-width="${f(w * 0.3)}" fill="none" stroke-linecap="round" opacity=".9" transform="translate(-.6 -.9)"/>`
}

/** 十字に伸びる宝石のきらめき */
const glint = (x, y, s, opacity, fill = "#fff") =>
  opacity <= 0.03
    ? ""
    : `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s)})" opacity="${f(opacity)}"><path d="M0-24C.8-4 4-.8 24 0 4 .8 .8 4 0 24-.8 4-4 .8-24 0-4-.8-.8-4 0-24Z" fill="${fill}"/><path d="M0-9L2-2 9 0 2 2 0 9-2 2-9 0-2-2Z" fill="#fff" transform="rotate(45)"/></g>`

/** きらめきが順番に光る（phase ごとに 1 回ずつ） */
const flash = (t, phase) => Math.max(0, wave(t, phase)) ** 3

/** 百合の紋章（フルール・ド・リス） */
const fleur = (stops) =>
  `<path d="M0-30C7-20 8-8 3 2H-3C-8-8-7-20 0-30ZM-4 2C-8-10-22-14-25-4-27 4-20 8-16 4-17 10-10 10-5 6ZM4 2C8-10 22-14 25-4 27 4 20 8 16 4 17 10 10 10 5 6ZM-9 4H9V9H-9ZM-3 9H3L5 18H-5Z" fill="${stops[0]}" transform="scale(1.08)"/><path d="M0-30C7-20 8-8 3 2H-3C-8-8-7-20 0-30ZM-4 2C-8-10-22-14-25-4-27 4-20 8-16 4-17 10-10 10-5 6ZM4 2C8-10 22-14 25-4 27 4 20 8 16 4 17 10 10 10 5 6ZM-3 9H3L5 18H-5Z" fill="url(#bz-${stops[2].slice(1)})"/><path d="M-9 4H9V9H-9Z" fill="${stops[4]}"/><path d="M0-26C3-18 3-8 0 0" stroke="${stops[5]}" stroke-width="1.4" fill="none" opacity=".8"/>`

/** 王冠（正面）。輪の上に載る。先と胴に宝石が付く。enamel を渡すと胴を七宝で埋める */
const tiara = (metal, jewel, t, { centerJewel = jewel, enamel = null, accent = metal } = {}) => {
  const X = (dx) => f(C + dx)
  const half = (s) => {
    const [ex, ey] = polar(237, 39 * s)
    const e = [ex - C, ey]
    const t1 = [s * 126, 0]
    const v12 = [s * 95, 24]
    const t2 = [s * 65, -34]
    const v23 = [s * 32, 4]
    return { e, t1, v12, t2, v23 }
  }
  const L = half(-1)
  const R = half(1)
  const top = [0, -44]
  const up = (from, to) => `C${X(from[0] + (to[0] - from[0]) * 0.38)} ${f(from[1])} ${X(to[0] - Math.sign(to[0] - from[0]) * 11)} ${f(to[1] + (from[1] - to[1]) * 0.42)} ${X(to[0])} ${f(to[1])}`
  const down = (from, to) => `C${X(from[0] + Math.sign(to[0] - from[0]) * 11)} ${f(from[1] + (to[1] - from[1]) * 0.42)} ${X(from[0] + (to[0] - from[0]) * 0.62)} ${f(to[1])} ${X(to[0])} ${f(to[1])}`
  const d = `M${X(L.e[0])} ${f(L.e[1])}C${X(L.e[0] - 12)} ${f(L.e[1] - 30)} ${X(L.t1[0] - 12)} ${f(L.t1[1] + 30)} ${X(L.t1[0])} ${f(L.t1[1])}${down(L.t1, L.v12)}${up(L.v12, L.t2)}${down(L.t2, L.v23)}${up(L.v23, top)}${down(top, R.v23)}${up(R.v23, R.t2)}${down(R.t2, R.v12)}${up(R.v12, R.t1)}C${X(R.t1[0] + 12)} ${f(R.t1[1] + 30)} ${X(R.e[0] + 12)} ${f(R.e[1] - 30)} ${X(R.e[0])} ${f(R.e[1])}A237 237 0 0 0 ${X(L.e[0])} ${f(L.e[1])}Z`
  const id = `ti-${metal[2].slice(1)}`
  const gradients = `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${X(-150)}" y1="0" x2="${X(150)}" y2="0">${[0.28, 0.6, 0.96, 0.5, 0.78, 1, 0.66, 0.46, 0.92, 0.56, 0.28]
    .map((k, i) => `<stop offset="${i / 10}" stop-color="${ramp(metal, k)}"/>`)
    .join("")}</linearGradient><linearGradient id="${id}-s" gradientUnits="userSpaceOnUse" x1="0" y1="-50" x2="0" y2="75"><stop offset="0" stop-color="#fff" stop-opacity=".4"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></linearGradient><clipPath id="${id}-c"><path d="${d}"/></clipPath>`
  const inner = 'transform="translate(256 62) scale(.86 .8) translate(-256 -62)"'
  const sweep = -190 + ((t * 1.0) % 1) * 520
  const band = `${ring(229, 0, "none")}<path d="${arc(229, -39.6, 39.6)}" stroke="${metal[0]}" stroke-width="21" fill="none"/>${metalBand(229, 19, metal, { from: -39, to: 39, steps: 26, shift: 45, lobes: 1 })}<path d="${arc(238, -39, 39)}" stroke="${accent[4]}" stroke-width="1.5" fill="none"/><path d="${arc(220, -39, 39)}" stroke="${accent[4]}" stroke-width="1.5" fill="none"/>`
  const bandStones = Array.from({ length: 13 }, (_, i) => {
    const a = -33 + i * 5.5
    const [x, y] = polar(229, a)
    return i % 2 === 0
      ? `<g transform="translate(${x} ${y})"><circle r="6.6" fill="${metal[0]}"/>${brilliant(5.5, jewel, t, i * 0.13, 6)}</g>`
      : `<circle cx="${x}" cy="${y}" r="2.6" fill="${accent[4]}" stroke="${accent[0]}" stroke-width=".8"/>`
  }).join("")
  const tipGem = ([dx, y], size, phase) => setGem(C + dx, y + 1, size, metal, jewel, t, phase)
  return `<defs>${gradients}</defs>
    <path d="${d}" fill="${metal[0]}" stroke="${metal[0]}" stroke-width="3.4" stroke-linejoin="round"/>
    <path d="${d}" fill="url(#${id})"/><path d="${d}" fill="url(#${id}-s)"/>
    ${enamel ? `<path d="${d}" fill="${enamel}" ${inner}/>` : `<path d="${d}" fill="none" stroke="${metal[0]}" stroke-width="1.6" opacity=".5" ${inner}/><path d="${d}" fill="none" stroke="${metal[5]}" stroke-width="1.2" opacity=".85" transform="translate(256 63.5) scale(.86 .8) translate(-256 -62)"/>`}
    <g clip-path="url(#${id}-c)"><rect x="${f(C + sweep - 16)}" y="-70" width="32" height="170" fill="#fff" opacity=".4" transform="rotate(18 ${f(C + sweep)} 10)" filter="url(#soft)"/></g>
    ${band}${bandStones}
    ${[L, R].map((h, i) => `${setGem(C + h.t2[0], 12, 7.5, metal, jewel, t, 0.6 + i * 0.2)}${setGem(C + h.t1[0] * 0.93, 40, 5.5, metal, jewel, t, 0.1 + i * 0.2)}`).join("")}
    ${setGem(C, 0, 14, metal, centerJewel, t, 0.4, 0.86)}
    ${tipGem(L.t1, 8.5, 0.2)}${tipGem(R.t1, 8.5, 0.75)}${tipGem(L.t2, 9.5, 0.4)}${tipGem(R.t2, 9.5, 0.9)}${tipGem(top, 11, 0.05)}`
}

const planDefs = (metals, extra = "") => defs(metals.map(bezelDef).join("") + PEARL_DEF + extra)

/* ---- ライト: 細い輪に小さな宝石 ---- */

const planLiteSilver = (t) => {
  const m = METAL.silver
  const shift = wave(t) * 8
  const side = `${place(...polar(243, 168), 100, 0.86, scroll(m, 3.6))}${place(...polar(240, 150), 78, 0.6, scroll(m, 3.6))}${[
    [135, 3.6],
    [129, 2.8],
    [124, 2],
  ]
    .map(([d, r]) => `<circle cx="${polar(236, d)[0]}" cy="${polar(236, d)[1]}" r="${r}" fill="${m[4]}" stroke="${m[0]}" stroke-width=".9"/>`)
    .join("")}`
  const top = `${[
    [0, 5.2],
    [-7, 3.4],
    [7, 3.4],
    [-12.5, 2.2],
    [12.5, 2.2],
  ]
    .map(([d, r]) => `<circle cx="${polar(235 + r * 0.6, d)[0]}" cy="${polar(235 + r * 0.6, d)[1]}" r="${r}" fill="url(#bz-${m[2].slice(1)})" stroke="${m[0]}" stroke-width=".9"/>`)
    .join("")}`
  return `<svg xmlns="http://www.w3.org/2000/svg" ${PLAN_VIEW}>${planDefs([m])}<g filter="url(#ds)">
    ${ring(220, 15.5, m[0])}${metalBand(220, 14, m, { shift })}
    ${ring(233.5, 2.2, m[3])}
    ${mirror(side)}${top}
    ${setGem(...polar(238, 180), 13, m, JEWEL.sapphire, t, 0)}
  </g>
  ${glint(...polar(238, 180), 0.9, flash(t, 0.1))}
  ${twinkles(t, [[236, 315, 0.9, 0.5], [236, 60, 0.7, 0.8]], "#ffffff")}</svg>`
}

const planLiteRose = (t) => {
  const m = METAL.rose
  const shift = wave(t) * 8
  const sprig = (flow) => {
    let out = `<path d="${arc(238, 196, 252)}" stroke="${m[1]}" stroke-width="3" fill="none" stroke-linecap="round"/>`
    for (let i = 6; i >= 0; i--) {
      const d = 200 + i * 8
      const k = 0.5 + 0.5 * Math.sin(TAU * (flow - i / 7))
      const [x, y] = polar(238, d)
      out += place(x, y, d - 34, 0.62 - i * 0.03, metalLeaf(m, k))
      out += place(x, y, d + 30, 0.5 - i * 0.03, metalLeaf(m, k * 0.8))
    }
    return `${out}${pearl(...polar(240, 192), 7)}${pearl(...polar(249, 187.5), 4.6)}${pearl(...polar(236, 185.5), 3.6)}`
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" ${PLAN_VIEW}>${planDefs([m])}<g filter="url(#ds)">
    ${ring(220, 14.5, m[0])}${metalBand(220, 13, m, { shift })}
    ${ring(232.5, 2, m[3])}
    ${sprig(t)}<g transform="rotate(180 256 256)">${sprig(t + 0.5)}</g>
    ${setGem(...polar(238, 180), 9, m, JEWEL.pink, t, 0)}${setGem(...polar(238, 0), 9, m, JEWEL.pink, t, 0.5)}
  </g>
  ${glint(...polar(238, 0), 0.75, flash(t, 0.6))}
  ${twinkles(t, [[240, 120, 0.8, 0.2], [240, 300, 0.8, 0.7]], "#fff4ee")}</svg>`
}

/* ---- スタンダード: 厚い金の輪と月桂樹 ---- */

const planStandardLaurel = (t) => {
  const m = METAL.gold
  const shift = wave(t) * 12
  return `<svg xmlns="http://www.w3.org/2000/svg" ${PLAN_VIEW}>${planDefs([m])}<g filter="url(#ds)">
    ${laurelBranch(1, m, { r: 253, size: 1.16, pairs: 11, flow: t })}${laurelBranch(-1, m, { r: 253, size: 1.16, pairs: 11, flow: t })}
    ${ring(224, 25, m[0])}${metalBand(224, 23, m, { shift })}
    ${ring(224, 1.4, m[1], 'opacity=".55"')}
    ${milgrain(237.5, 2.7, 80, m, shift)}
    ${mirror(place(...polar(252, 171), 96, 0.7, scroll(m, 4)))}
    ${place(...polar(250, 0), 0, 1.05, fleur(m))}
    ${setGem(...polar(243, 180), 16, m, JEWEL.ruby, t, 0)}
  </g>
  ${glint(...polar(243, 180), 1.1, flash(t, 0.15))}
  ${twinkles(t, [[262, 300, 1, 0.4], [262, 55, 0.9, 0.65], [258, 250, 0.7, 0.9], [258, 110, 0.7, 0.05]], "#fff3bd")}</svg>`
}

const planStandardSapphire = (t) => {
  const m = METAL.gold
  const shift = wave(t) * 12
  const rope = Array.from({ length: 90 }, (_, i) => {
    const d = i * 4
    const [x, y] = polar(227, d)
    return `<path d="M-5 0H5" transform="translate(${x} ${y}) rotate(${d - 90 + 62})" stroke="${m[0]}" stroke-width="1.5" opacity=".42" stroke-linecap="round"/>`
  }).join("")
  const stone = (d, i) => {
    const flank = [-1, 1]
      .map((s) => place(...polar(246, d + s * 9), d - 90 + 90 + (s > 0 ? 0 : 180), 0.62, `<g transform="scale(1 ${-s})">${scroll(m, 4)}</g>`))
      .join("")
    return `${flank}${setGem(...polar(240, d), 14.5, m, JEWEL.sapphire, t, i * 0.25)}`
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" ${PLAN_VIEW}>${planDefs([m])}<g filter="url(#ds)">
    ${ring(227, 31, m[0])}${metalBand(227, 29, m, { shift, layers: 6 })}
    ${rope}
    ${milgrain(243.5, 2.8, 80, m, shift)}${ring(213.5, 1.6, m[4], 'opacity=".8"')}
    ${[45, 135, 225, 315].map(stone).join("")}
    ${place(...polar(256, 0), 0, 1.15, fleur(m))}${setGem(...polar(247, 0), 5.5, m, JEWEL.sapphire, t, 0.5)}
    ${place(...polar(256, 180), 180, 0.95, fleur(m))}
    ${[90, 270].map((d) => `<g transform="translate(${pp(249, d)}) rotate(${d})"><path d="M0-13L9 0 0 13-9 0Z" fill="${m[0]}"/><path d="M0-11L7.5 0 0 11-7.5 0Z" fill="url(#bz-${m[2].slice(1)})"/></g>`).join("")}
  </g>
  ${[45, 135, 225, 315].map((d, i) => glint(...polar(240, d), 1, flash(t, i * 0.25))).join("")}
  </svg>`
}

/* ---- プレミアム: 白金・ダイヤ・王冠・オーロラ ---- */

/** 輪の外へ広がる多色の光（アイコンの内側には出さない） */
const auroraGlow = (t, colors, { r = 256, w = 42, opacity = 0.8 } = {}) =>
  `<g mask="url(#behind)"><g filter="url(#aur)">${colors
    .map((c, i) => {
      const span = 360 / colors.length
      const mid = i * span + 20 + wave(t, i / colors.length) * 12
      const o = opacity * (0.72 + 0.28 * wave(t, 0.25 + i / colors.length))
      return `<path d="${arc(f(r + wave(t, i * 0.3) * 4), f(mid - span * 0.8), f(mid + span * 0.8))}" stroke="${c}" stroke-width="${w}" fill="none" opacity="${f(o)}"/>`
    })
    .join("")}</g></g>`

const AURORA_DEF =
  '<filter id="aur" filterUnits="userSpaceOnUse" x="-60" y="-60" width="632" height="632"><feGaussianBlur stdDeviation="17"/></filter>'

/** ゆっくり回る光の筋（count は偶数。長短が交互なので 2 本ぶん回ると元に戻る）。先へ行くほど薄くなる */
const lightRays = (t, count, id, { from = 236, long = 312, short = 286, opacity = 0.9 } = {}) => {
  const turn = (t * 720) / count
  return `<g mask="url(#behind)" opacity="${opacity}">${Array.from({ length: count }, (_, i) => {
    const d = (i * 360) / count + turn
    const to = i % 2 === 0 ? long : short
    const half = i % 2 === 0 ? 1.7 : 1.1
    return `<path d="M${pp(from, d - half)}L${pp(to, d)}L${pp(from, d + half)}Z" fill="url(#${id})"/>`
  }).join("")}</g>`
}

const rayDef = (id, color) =>
  `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="256" cy="256" r="312"><stop offset=".74" stop-color="${color}" stop-opacity=".95"/><stop offset=".88" stop-color="${color}" stop-opacity=".45"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`

/** 角度で色が移り変わる輪（オーロラ色の七宝）。shift で色が流れる */
const iridescentBand = (r, w, colors, { shift = 0, layers = 4, steps = 90 } = {}) => {
  const lw = w / layers
  let out = ""
  for (let j = 0; j < layers; j++) {
    const rr = r - w / 2 + lw * (j + 0.5)
    const profile = Math.sin((Math.PI * (j + 0.5)) / layers)
    for (let i = 0; i < steps; i++) {
      const a0 = (i * 360) / steps
      const mid = a0 + 180 / steps
      const pos = ((((mid * 2 + shift + j * 9) % 360) + 360) % 360) / 360
      const x = pos * colors.length
      const base = mixHex(colors[Math.floor(x) % colors.length], colors[(Math.floor(x) + 1) % colors.length], x - Math.floor(x))
      const c = 0.5 + 0.5 * Math.cos((2 * (mid + 45 - shift * 0.4) * Math.PI) / 180)
      const lit = mixHex(base, "#ffffff", 0.15 + 0.55 * c ** 3 * profile)
      out += `<path d="${arc(f(rr), f(a0), f(a0 + 360 / steps + 0.6))}" stroke="${mixHex("#141a33", lit, 0.42 + 0.58 * profile)}" stroke-width="${f(lw + 0.7)}" fill="none"/>`
    }
  }
  return out
}

/** 輪に敷き詰めた小さな宝石（パヴェ） */
const pave = (r, size, count, metal, jewel, t) =>
  Array.from({ length: count }, (_, i) => {
    const d = (i * 360) / count
    const [x, y] = polar(r, d)
    const k = 0.5 + 0.5 * Math.sin(TAU * t + i * 2.1)
    return `<circle cx="${x}" cy="${y}" r="${f(size + 1)}" fill="${metal[0]}"/><circle cx="${x}" cy="${y}" r="${size}" fill="${ramp(jewel, 0.35 + 0.6 * k)}"/><path d="M${f(x - size * 0.7)} ${f(y)}L${x} ${f(y - size * 0.7)}L${f(x + size * 0.7)} ${f(y)}L${x} ${f(y + size * 0.7)}Z" fill="#fff" opacity="${f(0.25 + 0.6 * k)}"/>`
  }).join("")

const planPremiumCrown = (t) => {
  const m = METAL.platinum
  const g = METAL.gold
  const shift = wave(t) * 12
  return `<svg xmlns="http://www.w3.org/2000/svg" ${PLAN_VIEW}>${planDefs([m, g], AURORA_DEF + rayDef("rayW", "#ffffff"))}
  ${auroraGlow(t, ["#55e6d0", "#6aa6ff", "#b48cff", "#ff9bd8"])}
  ${lightRays(t, 16, "rayW")}
  <g filter="url(#ds)">
    ${laurelBranch(1, m, { r: 253, from: 16, to: 132, pairs: 10, size: 1.08, flow: t })}${laurelBranch(-1, m, { r: 253, from: 16, to: 132, pairs: 10, size: 1.08, flow: t })}
    ${ring(224, 27, m[0])}${metalBand(224, 25, m, { shift })}
    ${pave(224, 5.6, 40, m, JEWEL.diamond, t)}
    ${ring(238.4, 2.8, g[0])}${ring(238.4, 1.9, g[4])}${ring(211.4, 1.8, g[4], 'opacity=".9"')}
    ${setGem(...polar(246, 180), 16, m, JEWEL.ice, t, 0.3, 0.86)}
    ${tiara(m, JEWEL.diamond, t, { centerJewel: JEWEL.ice, accent: g })}
  </g>
  ${glint(C, 0, 1.3, flash(t, 0))}${glint(C, -43, 0.9, flash(t, 0.35))}
  ${glint(C - 65, -33, 0.75, flash(t, 0.55))}${glint(C + 65, -33, 0.75, flash(t, 0.8))}
  ${glint(...polar(246, 180), 1.1, flash(t, 0.5))}
  ${twinkles(t, [[226, 70, 0.9, 0.15], [226, 250, 0.9, 0.65], [226, 120, 0.8, 0.4], [226, 300, 0.8, 0.9]])}</svg>`
}

const planPremiumAurora = (t) => {
  const m = METAL.platinum
  const shift = wave(t) * 12
  const colors = ["#3fe0c5", "#4aa3ff", "#8f7bff", "#e58cf0", "#7fd4ff"]
  const star = `<g transform="translate(${C} 8)">${[45, 135, 225, 315, 90, 270, 180, 0]
    .map((a) => {
      const len = a % 90 === 0 ? (a === 0 ? 64 : a === 180 ? 32 : 58) : 36
      const w = a % 90 === 0 ? 9 : 7
      return `<path d="M-${w + 1.6} 0L0-${len + 2}L${w + 1.6} 0Z" transform="rotate(${a})" fill="${m[0]}"/><path d="M-${w} 0L0-${len - 2}L0 0Z" transform="rotate(${a})" fill="${m[5]}"/><path d="M${w} 0L0-${len - 2}L0 0Z" transform="rotate(${a})" fill="${m[2]}"/>`
    })
    .join("")}</g>`
  const side = [
    [24, 11, 249],
    [35.5, 9, 247],
    [45.5, 7.2, 245],
    [54, 5.6, 243],
    [61.5, 4.2, 241],
  ]
    .map(([d, size, r], i) => setGem(...polar(r, d), size, m, i % 2 === 0 ? JEWEL.ice : JEWEL.diamond, t, 0.2 * i))
    .join("")
  const dust = Array.from({ length: 10 }, (_, i) => {
    const d = i * 36 + 12 + t * 36
    const r = 272 + (i % 3) * 9
    return sparkle(...polar(r, d), 0.45 + (i % 2) * 0.25, "#ffffff", 0.35 + 0.6 * Math.max(0, wave(t * 2, i * 0.37)))
  }).join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" ${PLAN_VIEW}>${planDefs([m], AURORA_DEF + rayDef("rayA", "#d9f6ff"))}
  ${auroraGlow(t, ["#4fe8cf", "#6aa6ff", "#b98cff", "#ff9bd8", "#58d8ff"], { r: 258, w: 46, opacity: 0.88 })}
  ${lightRays(t, 24, "rayA", { long: 300, short: 280, opacity: 0.7 })}
  <g mask="url(#behind)">${dust}</g>
  <g filter="url(#ds)">
    ${ring(224, 30, m[0])}${iridescentBand(224, 20, colors, { shift: wave(t) * 40 })}
    ${metalBand(236.5, 5, m, { shift, layers: 2 })}${metalBand(211.5, 5, m, { shift, layers: 2 })}
    ${milgrain(241.5, 2.3, 90, m, shift)}
    ${Array.from({ length: 5 }, (_, i) => mirror(setGem(...polar(224, 78 + i * 20.5), 6.6, m, JEWEL.diamond, t, i * 0.17))).join("")}
    ${mirror(side)}
    ${[-1, 1].map((dir) => laurelBranch(dir, m, { r: 252, from: 10, to: 46, pairs: 4, size: 0.8, flow: t })).join("")}
    ${setGem(...polar(247, 180), 14, m, JEWEL.ice, t, 0.3, 0.86)}
    ${star}${setGem(C, 8, 19, m, JEWEL.diamond, t, 0)}
  </g>
  ${glint(C, 8, 1.7, 0.3 + 0.7 * flash(t, 0))}
  ${glint(...polar(249, 24), 0.8, flash(t, 0.3))}${glint(...polar(249, -24), 0.8, flash(t, 0.7))}
  ${glint(...polar(247, 180), 0.9, flash(t, 0.5))}</svg>`
}

const planPremiumNoir = (t) => {
  const m = METAL.gold
  const o = METAL.onyx
  const shift = wave(t) * 12
  const inlay = Array.from({ length: 24 }, (_, i) => {
    const d = i * 15 + 7.5
    return `<g transform="translate(${pp(225, d)}) rotate(${d})">${i % 2 === 0 ? `<path d="M0-8L5.4 0 0 8-5.4 0Z" fill="url(#bz-${m[2].slice(1)})" stroke="${m[0]}" stroke-width=".7"/>` : `<circle r="2.6" fill="${m[4]}"/>`}</g>`
  }).join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" ${PLAN_VIEW}>${planDefs([m, o], AURORA_DEF + rayDef("rayG", "#ffe7a0"))}
  ${auroraGlow(t, ["#ffd76a", "#ff9f43", "#ffe9a8", "#f6b73c"], { r: 255, w: 38, opacity: 0.62 })}
  ${lightRays(t, 16, "rayG")}
  <g filter="url(#ds)">
    ${laurelBranch(1, m, { r: 254, from: 16, to: 132, pairs: 10, size: 1.08, flow: t })}${laurelBranch(-1, m, { r: 254, from: 16, to: 132, pairs: 10, size: 1.08, flow: t })}
    ${ring(225, 31, m[0])}${metalBand(225, 24, o, { shift })}
    ${metalBand(239.5, 5.5, m, { shift, layers: 2 })}${metalBand(212, 4.5, m, { shift, layers: 2 })}
    ${inlay}
    ${setGem(...polar(247, 180), 16, m, JEWEL.diamond, t, 0.3, 0.86)}
    ${tiara(m, JEWEL.diamond, t, { centerJewel: JEWEL.ruby, enamel: o[1] })}
  </g>
  ${glint(C, 0, 1.2, flash(t, 0), "#fff6d0")}${glint(C, -43, 0.9, flash(t, 0.35))}
  ${glint(C - 65, -33, 0.75, flash(t, 0.55))}${glint(C + 65, -33, 0.75, flash(t, 0.8))}
  ${glint(...polar(247, 180), 1, flash(t, 0.5), "#fff6d0")}
  ${twinkles(t, [[268, 80, 0.9, 0.15], [268, 250, 0.9, 0.65], [268, 110, 0.8, 0.4], [268, 290, 0.8, 0.9]], "#ffe9a8")}</svg>`
}

const CANVAS_VIEW_BOX = 'viewBox="-60 -60 632 632"'

const withCanvas = (draw) => (t) =>
  draw(t).replace(/viewBox="[^"]*"( preserveAspectRatio="[^"]*")?/, CANVAS_VIEW_BOX)

const decorations = [
  { slug: "sakura", category: "nature", name: "満開の桜", description: "枝に咲く桜と、舞い散る花びら", draw: sakura },
  { slug: "momiji", category: "nature", name: "紅葉の枝", description: "赤と黄金のもみじが舞う秋の枝", draw: momiji },
  { slug: "snow", category: "nature", name: "雪の結晶", description: "ゆっくり回る結晶と降る雪", draw: snow },
  { slug: "crescent", category: "nature", name: "三日月の夜", description: "金の三日月と瞬く星、夜の雲", draw: crescent },
  { slug: "bubbles", category: "nature", name: "海の泡", description: "ゆれる海藻と立ちのぼる泡", draw: bubbles },
  { slug: "butterflies", category: "nature", name: "蝶の庭", description: "花のつるを舞う色とりどりの蝶", draw: butterflies },
  { slug: "cat-pink", category: "cute", name: "ねこ耳 ピンク", description: "やわらかいピンクのねこ耳と肉球", draw: catPink },
  { slug: "cat-black", category: "cute", name: "ねこ耳 くろ", description: "夜色のねこ耳と肉球", draw: catBlack },
  { slug: "cat-white", category: "cute", name: "ねこ耳 しろ", description: "ふわふわの白いねこ耳と肉球", draw: catWhite },
  { slug: "bunny", priceCoins: 300, category: "cute", name: "うさ耳リボン", description: "長いうさ耳とピンクのリボン", draw: bunny },
  { slug: "ribbon", category: "cute", name: "おおきなリボン", description: "レースの縁どりと大きなリボン", draw: ribbon },
  { slug: "hearts", category: "cute", name: "ときめきハート", description: "鼓動するハートと立ちのぼるハート", draw: hearts },
  { slug: "sweets", priceCoins: 300, category: "cute", name: "おかしの国", description: "ドーナツとマカロン、キャンディ", draw: sweets },
  { slug: "angel", priceCoins: 1000, category: "fantasy", name: "天使の翼", description: "光る輪と、はばたく白い翼", draw: angel },
  { slug: "devil", priceCoins: 1000, category: "fantasy", name: "小悪魔", description: "赤い角とコウモリの翼、しっぽ", draw: devil },
  { slug: "crown", priceCoins: 1500, category: "fantasy", name: "黄金の王冠", description: "宝石の王冠と月桂樹の輪", draw: crown },
  { slug: "magic", priceCoins: 800, category: "fantasy", name: "魔法陣", description: "ルーン文字が回る光の魔法陣", draw: magicCircle },
  { slug: "thorn-rose", priceCoins: 800, category: "fantasy", name: "いばらの薔薇", description: "深紅の薔薇といばらのつる", draw: thornRose },
  { slug: "flames", priceCoins: 1000, category: "element", name: "業火", description: "下から燃えあがる炎と火の粉", draw: flames },
  { slug: "lightning", priceCoins: 1000, category: "element", name: "迅雷", description: "アイコンを走る青白い稲妻", draw: lightning },
  { slug: "ice-shards", priceCoins: 800, category: "element", name: "氷の棘", description: "突きだす氷の結晶ときらめき", draw: iceShards },
  { slug: "galaxy", category: "element", name: "銀河", description: "星雲の輪をめぐる惑星たち", draw: galaxy },
  { slug: "neon", category: "cyber", name: "ネオンリング", description: "ピンクと水色のネオンとノイズ", draw: neon },
  { slug: "hud", category: "cyber", name: "サイバーHUD", description: "回る目盛りと照準のインターフェース", draw: hud },
  { slug: "goldfish", priceCoins: 500, category: "wa", name: "金魚鉢", description: "水の輪を泳ぐ金魚と水草", draw: goldfishes },
  { slug: "wafuu", priceCoins: 500, category: "wa", name: "青海波と扇", description: "金の青海波に、扇と飾り紐", draw: wafuu },
  { slug: "ink", category: "wa", name: "墨と落款", description: "力強い筆の跡と朱の落款", draw: inkBrush },
  { slug: "palette", priceCoins: 300, category: "creator", name: "絵の具とパレット", description: "したたる絵の具とパレット、絵筆", draw: palette },
  { slug: "fox", priceCoins: 500, category: "wa", name: "狐耳と狐面", description: "狐の耳と面、ゆらめく狐火", draw: fox },
  { slug: "oni", priceCoins: 500, category: "wa", name: "鬼の角", description: "金の二本角と虎柄の輪", draw: oni },
  { slug: "santa", priceCoins: 300, category: "cute", name: "サンタ帽", description: "赤い帽子と柊、降る雪", draw: santa },
  { slug: "notes", priceCoins: 300, category: "cute", name: "めぐる音符", description: "五線譜をめぐるカラフルな音符", draw: notes },
  { slug: "rainbow", priceCoins: 500, category: "nature", name: "虹と雲", description: "雲にかかる七色の虹", draw: rainbowClouds },
  { slug: "witch", priceCoins: 800, category: "fantasy", name: "魔女の帽子", description: "とんがり帽子と飛ぶコウモリ", draw: witch },
  { slug: "headphones", priceCoins: 500, category: "cyber", name: "ヘッドホン", description: "光るヘッドホンと波打つ音", draw: headphones },
  { slug: "crown-silver", priceCoins: 1000, category: "fantasy", name: "白銀の王冠", description: "青いベルベットの白銀の王冠", draw: silverCrown },
  { slug: "fallen-angel", priceCoins: 1500, category: "fantasy", name: "堕天使の翼", description: "黒い翼と赤く光る輪", draw: fallenAngel },
  { slug: "blue-flames", priceCoins: 1500, category: "element", name: "蒼炎", description: "青く燃えあがる炎", draw: blueFlames },
  { slug: "dragon", priceCoins: 3000, category: "fantasy", name: "昇り龍", description: "アイコンに巻きつく龍と光の玉", draw: dragon },
  { slug: "plan-lite-silver", requiredPassType: "LITE", frames: 24, frameMs: 150, category: "plan", name: "銀細工の輪", description: "細い銀の輪に唐草とサファイアをひと粒", draw: planLiteSilver },
  { slug: "plan-lite-rose", requiredPassType: "LITE", frames: 24, frameMs: 150, category: "plan", name: "ローズゴールドの小枝", description: "ローズゴールドの輪に小枝と真珠、ピンクの宝石", draw: planLiteRose },
  { slug: "plan-standard-laurel", requiredPassType: "STANDARD", frames: 24, frameMs: 150, category: "plan", name: "黄金の月桂冠", description: "彫金の厚い金の輪を月桂樹が囲み、ルビーが光る", draw: planStandardLaurel },
  { slug: "plan-standard-sapphire", requiredPassType: "STANDARD", frames: 24, frameMs: 150, category: "plan", name: "蒼玉の金環", description: "縄目を刻んだ金の輪に四つのサファイアと百合の紋章", draw: planStandardSapphire },
  { slug: "plan-premium-crown", requiredPassType: "PREMIUM", frames: 24, frameMs: 150, category: "plan", name: "白金とダイヤの王冠", description: "ダイヤを敷き詰めた白金の輪と王冠、オーロラの光", draw: planPremiumCrown },
  { slug: "plan-premium-aurora", requiredPassType: "PREMIUM", frames: 24, frameMs: 150, category: "plan", name: "極光の星冠", description: "オーロラ色に移ろう輪と、頂に輝く星のダイヤ", draw: planPremiumAurora },
  { slug: "plan-premium-noir", requiredPassType: "PREMIUM", frames: 24, frameMs: 150, category: "plan", name: "漆黒と黄金の王冠", description: "漆黒の輪に金の月桂樹と王冠、深紅のルビー", draw: planPremiumNoir },
]

export const DECORATIONS = decorations.map((item) => ({
  ...item,
  draw: withCanvas(item.draw),
}))
