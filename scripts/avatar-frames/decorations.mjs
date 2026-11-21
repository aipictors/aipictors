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

/* ------------------------------------------------------------------ */
/* ショートケーキ                                                        */
/* ------------------------------------------------------------------ */

const strawberry = (s = 1) =>
  `<g transform="scale(${f(s)})"><path d="M0 26C-18 18-26 0-22-12-18-22-6-22 0-18 6-22 18-22 22-12 26 0 18 18 0 26Z" fill="url(#berry)" stroke="#9c0f2b" stroke-width="2" stroke-linejoin="round"/>${[[-10, -6], [0, -9], [10, -6], [-13, 4], [-4, 2], [6, 2], [14, 4], [-7, 12], [3, 12], [0, 20]]
    .map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="1.4" ry="2.1" fill="#ffe7a1"/>`)
    .join("")}<ellipse cx="-11" cy="-8" rx="4.5" ry="7" fill="#fff" opacity=".45" transform="rotate(28 -11 -8)"/><path d="M0-17L-14-25-6-17-17-15-4-13 0-8 4-13 17-15 6-17 14-25Z" fill="#3fae4a" stroke="#1d6b28" stroke-width="1.6" stroke-linejoin="round"/><path d="M0-17V-28" stroke="#1d6b28" stroke-width="3" stroke-linecap="round"/></g>`

/** 絞ったホイップクリーム */
const whip = (s = 1) =>
  `<g transform="scale(${f(s)})"><path d="M-24 10C-34 8-32-6-22-6-28-16-16-24-8-18-8-30 8-32 10-20 18-28 30-20 24-10 34-8 34 8 24 10Z" fill="url(#cream)" stroke="#e3cfae" stroke-width="2" stroke-linejoin="round"/><path d="M-20-2C-12-8-4-8 2-14M-4 6C4 0 12 0 18-6" stroke="#e8d6b8" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M-14-12C-10-16-6-16-3-14" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/></g>`

/** 苺の断面（クリームの層に入っている） */
const berrySlice = (s = 1) =>
  `<g transform="scale(${f(s)})"><path d="M0 11C-9 9-13 2-12-4-11-9-5-11 0-9 5-11 11-9 12-4 13 2 9 9 0 11Z" fill="#e8324f" stroke="#a5122d" stroke-width="1.2"/><path d="M0 7C-5 5-7 1-6-3-4-5-2-5 0-4 2-5 4-5 6-3 7 1 5 5 0 7Z" fill="#ffb1bd"/></g>`

/** ショートケーキの一切れ（横から。切り口にスポンジ・クリーム・苺の層） */
const cakeSlice = (s = 1) => {
  // 切り口（平行四辺形）を先端 (-42) から奥 (34) へ。上から クリーム・スポンジ・苺入りクリーム・スポンジ
  const band = (y0, y1) => `M-42 ${f(y0 + 8)}L34 ${f(y0 - 8)}V${f(y1 - 8)}L-42 ${f(y1 + 8)}Z`
  const halves = [-28, -10, 8, 24]
    .map((x) => `<g transform="translate(${x} ${f(9 - (x + 4) * 0.21)}) rotate(-12)"><path d="M-6 4C-6-4-3-7 0-7 3-7 6-4 6 4Z" fill="#e8324f" stroke="#a5122d" stroke-width="1"/><path d="M-3 4C-3-1-1-3 0-3 1-3 3-1 3 4Z" fill="#ffb1bd"/></g>`)
    .join("")
  return `<g transform="scale(${f(s)})">
    <path d="M-42-14L34-30 46-38 34-30Z" fill="none"/>
    <path d="M-42-12L34-28 50-36Z" fill="#fffaf2" stroke="#e0c9a6" stroke-width="2" stroke-linejoin="round"/>
    <path d="M34-28L50-36V0L34 8Z" fill="#f2d9a6" stroke="#d9b57a" stroke-width="2" stroke-linejoin="round"/>
    <path d="${band(-20, -12)}" fill="#fffaf2"/>
    <path d="${band(-12, 2)}" fill="url(#sponge)"/>
    <path d="${band(2, 14)}" fill="#fff8ee"/>${halves}
    <path d="${band(14, 28)}" fill="url(#sponge)"/>
    <path d="${band(-20, 28)}" fill="none" stroke="#d9b57a" stroke-width="2" stroke-linejoin="round"/>
    ${Array.from({ length: 9 }, (_, i) => `<circle cx="${-36 + i * 8.5}" cy="${f(-2 - (i * 8.5 - 6) * 0.21 + (i % 2) * 5)}" r="1" fill="#c98d2e" opacity=".6"/>`).join("")}
    <g transform="translate(30 -34)">${whip(0.55)}</g>
    <g transform="translate(30 -48)">${strawberry(0.7)}</g>
  </g>`
}

const sweetsDefs = (extra = "") =>
  defs(
    lg("berry", ["#ff6b7f", "#e0213f", "#b5122e"]) +
      `<radialGradient id="cream" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#ffffff"/><stop offset=".7" stop-color="#fffaf0"/><stop offset="1" stop-color="#f6e7cf"/></radialGradient>` +
      lg("sponge", ["#ffe6a3", "#f3c766", "#e9b14e"]) +
      extra,
  )

const shortcake = (t) => {
  const slices = Array.from({ length: 16 }, (_, i) => {
    const d = i * 22.5 + 11
    const [x, y] = polar(221, d)
    return place(x, y, d, 0.62, berrySlice())
  }).join("")
  const crumbs = Array.from({ length: 60 }, (_, i) => {
    const [x, y] = polar(i % 2 ? 233.5 : 230.5, i * 6 + 3)
    return `<circle cx="${x}" cy="${y}" r="1.1" fill="#d99a3a" opacity=".55"/>`
  }).join("")
  const top = Array.from({ length: 16 }, (_, i) => {
    const d = i * 22.5
    const [x, y] = polar(242, d)
    return place(x, y, d, 1.05, whip())
  }).join("")
  const berries = Array.from({ length: 8 }, (_, i) => {
    const d = i * 45 + 22.5
    if (d === 157.5) return ""
    const bob = wave(t, i / 8) * 2.5
    return place(...polar(258 + bob, d), d + wave(t, i / 4) * 8, 1.15, strawberry())
  }).join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${sweetsDefs()}<g filter="url(#ds)">
    ${ring(226, 30, "#e0c9a6")}${ring(232, 14, "url(#sponge)")}${crumbs}${ring(220, 13, "#fffaf0")}${slices}
    ${ring(213.5, 4, "url(#sponge)")}${ring(240.5, 2, "#fffaf0")}
    ${top}${berries}
    ${place(...polar(268, 150), -16, 1.3, cakeSlice())}
  </g>
  ${twinkles(t, [[268, 320, 1, 0], [262, 60, 0.8, 0.35], [266, 200, 0.9, 0.65]], "#fff")}</svg>`
}

const shortcakeHeaps = (t) => {
  const slices = [
    [262, 328, -24, 1.25], [266, 32, 18, 1.15], [266, 92, 4, 1.1], [264, 148, -10, 1.25],
    [266, 210, 12, 1.1], [266, 268, -14, 1.15],
  ]
    .map(([r, d, rot, s], i) => place(...polar(r, d), rot + wave(t, i / 6) * 6, s, cakeSlice()))
    .join("")
  const fill = Array.from({ length: 18 }, (_, i) => {
    const d = i * 20 + 10
    return place(...polar(240, d), d, 0.95, whip())
  }).join("")
  const berries = Array.from({ length: 12 }, (_, i) => {
    const d = i * 30 + 2
    return place(...polar((i % 2 ? 250 : 262) + wave(t * 2, i / 12) * 3, d), wave(t, i / 6) * 16, i % 2 ? 0.85 : 1.05, strawberry())
  }).join("")
  // 輪からアイコンの縁へ少しだけ垂れるクリーム
  const drips = Array.from({ length: 18 }, (_, i) => {
    const d = i * 20 + 4
    const len = 6 + ((i * 7) % 5) * 2.4 + wave(t, i / 18) * 1.2
    const [x, y] = polar(214, d)
    return `<g transform="translate(${x} ${y}) rotate(${d + 180})"><path d="M-6 -4C-6 ${f(len * 0.6)} -4 ${f(len)} 0 ${f(len)} 4 ${f(len)} 6 ${f(len * 0.6)} 6 -4Z" fill="#fffaf0" stroke="#e3cfae" stroke-width="1.4"/></g>`
  }).join("")
  const sprinkles = Array.from({ length: 22 }, (_, i) => {
    const d = i * 16.4 + 6
    const r = 276 + (i % 3) * 10
    const [x, y] = polar(r, d)
    const c = ["#ff8fbd", "#ffd36b", "#9fe3ff", "#b7f0a8", "#ffffff"][i % 5]
    return `<rect x="${f(x - 5)}" y="${f(y - 1.6)}" width="10" height="3.2" rx="1.6" fill="${c}" transform="rotate(${f(d * 2 + t * 180)} ${x} ${y})" opacity=".9"/>`
  }).join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${sweetsDefs(lg("pinkband", ["#ffd6e5", "#ff9fc0"]))}
  <g mask="url(#behind)">${sprinkles}</g>
  <g filter="url(#ds)">
    ${ring(226, 22, "#e3cfae")}${ring(226, 19, "url(#pinkband)")}${ring(226, 2, "#fff", 'stroke-dasharray="2 9" stroke-linecap="round" opacity=".9"')}
    ${drips}${fill}${berries}${slices}
  </g>
  ${twinkles(t, [[284, 0, 1, 0.1], [284, 120, 0.9, 0.45], [284, 240, 0.9, 0.8]], "#fff")}</svg>`
}

/* ------------------------------------------------------------------ */
/* かわいい                                                             */
/* ------------------------------------------------------------------ */

const star5 = (r, fill, stroke = "none", sw = 0) => {
  const pts = Array.from({ length: 10 }, (_, i) => polar(i % 2 ? r * 0.48 : r, i * 36, 0, 0).join(" ")).join("L")
  return `<path d="M${pts}Z" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`
}

const cloud = (fill = "#fff") =>
  `<path d="M-34 12C-48 12-48-6-34-6-34-20-14-24-8-14-2-28 22-26 22-10 36-12 40 12 26 12Z" fill="${fill}" stroke="#d9c8f0" stroke-width="2" stroke-linejoin="round"/>`

const yumekawa = (t) => {
  const stars = [[244, 30, 15, "#fff1a6"], [250, 112, 11, "#ffd0ec"], [246, 200, 13, "#c9f1ff"], [250, 252, 10, "#fff1a6"], [244, 300, 12, "#e4d4ff"], [258, 160, 8, "#fff"], [258, 64, 8, "#fff"]]
    .map(([r, d, s, c], i) => place(...polar(r + wave(t, i / 7) * 3, d), d + t * 72 * (i % 2 ? 1 : -1), 1, star5(s, c, "#b58ad8", 1.6)))
    .join("")
  const clouds = [[248, 228, 1.05], [250, 128, 0.9], [252, 338, 0.85]]
    .map(([r, d, s], i) => place(...polar(r, d + wave(t, i / 3) * 3), 0, s, cloud()))
    .join("")
  const minis = Array.from({ length: 6 }, (_, i) => place(...polar(236, i * 60 + 88), 0, 0.32, heart(i % 2 ? "url(#yk2)" : "url(#yk1)"))).join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs(
    lg("ykr", ["#ffc8e8", "#d8c4ff", "#b9ecff", "#c8ffe6", "#fff4b8", "#ffc8e8"], 1, 1) + lg("yk1", ["#ffd0ec", "#ff8fc8"]) + lg("yk2", ["#e2d6ff", "#a98cff"]) + lg("moon", ["#fff8c9", "#ffd36b"]),
  )}<g filter="url(#ds)">
    ${ring(226, 17, "url(#ykr)")}${ring(226, 17, "none", 'stroke="#fff" stroke-opacity=".6" stroke-width="2"')}
    ${ring(226, 3, "#fff", 'stroke-dasharray="1 10" stroke-linecap="round"')}
    ${clouds}${stars}${minis}
    <g transform="translate(${pp(252, 334)}) rotate(${f(-20 + wave(t) * 5)})"><path d="M10-30C-14-30-26-6-20 12-12 32 14 36 28 22 8 26-8 14-8-4-8-18 0-26 10-30Z" fill="url(#moon)" stroke="#d9a93a" stroke-width="2"/><circle cx="-6" cy="6" r="2" fill="#7a5b2a"/><path d="M-12 14Q-7 18-2 14" stroke="#7a5b2a" stroke-width="1.8" fill="none" stroke-linecap="round"/><ellipse cx="-12" cy="10" rx="3" ry="2" fill="#ff9fc2" opacity=".8"/></g>
  </g>${twinkles(t, [[268, 80, 0.9, 0], [268, 180, 0.8, 0.3], [268, 280, 0.9, 0.6], [230, 20, 0.6, 0.85]], "#fff")}</svg>`
}

const bearEars = (t) => {
  const tilt = wave(t) * 2.5
  const ear = (s) =>
    `<g transform="translate(${C} ${C}) rotate(${f(s * (38 + tilt))}) translate(0 -${R + 8})"><circle r="52" fill="url(#bear)" stroke="#6b4426" stroke-width="4"/><circle r="29" cy="4" fill="url(#bearIn)"/></g>`
  const paw = (s) =>
    `<g transform="scale(${s})"><ellipse cy="6" rx="15" ry="13" fill="#ffb0c8" stroke="#6b4426" stroke-width="2.4"/>${[[-14, -10], [-5, -16], [5, -16], [14, -10]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5.4" fill="#ffb0c8" stroke="#6b4426" stroke-width="2"/>`).join("")}</g>`
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs(
    lg("bear", ["#d8a575", "#a8703f"]) + lg("bearIn", ["#ffd0dc", "#f6a5ba"]) + lg("rib", ["#ffa5c6", "#e13a7c"]) + lg("dots", ["#fff7ef", "#ffe4d0"]),
  )}<g filter="url(#ds)"><g mask="url(#behind)">${ear(-1)}${ear(1)}</g>
    ${ring(224, 14, "#c08a57")}${ring(224, 10, "url(#dots)")}
    ${Array.from({ length: 36 }, (_, i) => {
      const [x, y] = polar(224, i * 10 + 5)
      return `<circle cx="${x}" cy="${y}" r="2.2" fill="${i % 2 ? "#ff9fc0" : "#c08a57"}"/>`
    }).join("")}
    <g transform="translate(${pp(234, 322)}) rotate(${f(-38 + wave(t, 0.25) * 6)}) scale(.62)"><path d="M0 0C-16-30-56-30-56 0-56 28-16 28 0 0ZM0 0C16-30 56-30 56 0 56 28 16 28 0 0Z" fill="url(#rib)" stroke="#a81f55" stroke-width="3"/><path d="M-6 6L-22 44-10 40-4 52 4 8ZM6 6L22 44 10 40 4 52-4 8Z" fill="url(#rib)" stroke="#a81f55" stroke-width="2.5"/><rect x="-11" y="-13" width="22" height="26" rx="8" fill="#ff6ba2" stroke="#a81f55" stroke-width="3"/></g>
    ${place(...polar(240, 140), 140 - 180 + wave(t, 0.5) * 6, 1, paw(1))}${place(...polar(240, 220), 220 - 180 - wave(t, 0.5) * 6, 1, paw(1))}
    ${place(...polar(244, 180), 0, 0.5 + wave(t * 2) * 0.04, heart("url(#rib)"))}
  </g>${twinkles(t, [[262, 300, 0.8, 0.1], [262, 60, 0.8, 0.6], [250, 100, 0.6, 0.35]], "#fff")}</svg>`
}

const garland = (t) => {
  // 上半分に旗とハートのガーランドを 2 本かける
  const string = (from, to, sag, phase) => {
    const n = 7
    let path = ""
    const pts = []
    for (let i = 0; i <= n; i++) {
      const d = from + ((to - from) * i) / n
      const k = Math.sin((Math.PI * i) / n)
      const [x, y] = polar(246 - k * sag + wave(t, phase + i / n) * 1.5, d)
      pts.push([x, y, d])
      path += `${i === 0 ? "M" : "L"}${x} ${y}`
    }
    return { path, pts }
  }
  const colors = ["#ff9fc2", "#ffd36b", "#9fe3ff", "#c6b2ff", "#a8ecc4"]
  const flags = (s, offset) =>
    s.pts
      .slice(0, -1)
      .map(([x, y, d], i) => {
        const [x2, y2] = s.pts[i + 1]
        const mx = (x + x2) / 2
        const my = (y + y2) / 2
        const ang = (Math.atan2(y2 - y, x2 - x) * 180) / Math.PI
        const sway = wave(t * 2, (i + offset) / 7) * 6
        const c = colors[(i + offset) % colors.length]
        return i % 2 === 0
          ? `<g transform="translate(${f(mx)} ${f(my)}) rotate(${f(ang + sway)})"><path d="M-15 0H15L0 26Z" fill="${c}" stroke="#fff" stroke-width="2" stroke-linejoin="round"/><circle cy="9" r="3" fill="#fff" opacity=".8"/></g>`
          : `<g transform="translate(${f(mx)} ${f(my + 10)}) rotate(${f(ang + sway)}) scale(.5)">${heart(`url(#gh${i % 3})`)}</g>`
      })
      .join("")
  const a = string(-74, 74, 0, 0)
  const b = string(106, 254, 0, 0.5)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs(
    lg("gh0", ["#ffd0ec", "#ff6fa5"]) + lg("gh1", ["#fff3b0", "#ffbe3d"]) + lg("gh2", ["#d6f3ff", "#5cc6f2"]) + lg("gring", ["#fff0f7", "#ffe1ee"]),
  )}<g filter="url(#ds)">
    ${ring(225, 12, "url(#gring)")}${ring(225, 12, "none", 'stroke="#ffb3cf" stroke-width="2"')}
    ${Array.from({ length: 24 }, (_, i) => place(...polar(225, i * 15 + 7.5), i * 15, 0.18, star5(30, colors[i % 5]))).join("")}
    <path d="${a.path}" stroke="#d58fb0" stroke-width="2" fill="none"/>${flags(a, 0)}
    <path d="${b.path}" stroke="#d58fb0" stroke-width="2" fill="none"/>${flags(b, 3)}
    ${[[-74, "#ff9fc2"], [74, "#9fe3ff"], [106, "#ffd36b"], [254, "#c6b2ff"]].map(([d, c]) => place(...polar(246, d), 0, 0.5, star5(22, c, "#fff", 3))).join("")}
  </g>${twinkles(t, [[270, 0, 0.9, 0], [270, 180, 0.9, 0.5], [262, 90, 0.7, 0.25], [262, 270, 0.7, 0.75]], "#fff")}</svg>`
}

/* ------------------------------------------------------------------ */
/* かっこいい                                                           */
/* ------------------------------------------------------------------ */

const STEEL = ["#0d1117", "#2a313c", "#566170", "#9aa6b5", "#dfe6ee", "#ffffff"]

/** 金属のとげ（外向き）。k は光の当たり具合 */
const spike = (len, w, k) =>
  `<path d="M${-w} 0L0 ${-len}L${w} 0Z" fill="${STEEL[0]}" stroke="${STEEL[0]}" stroke-width="2.4" stroke-linejoin="round"/><path d="M${-w} 0L0 ${-len}L0 0Z" fill="${ramp(STEEL, 0.55 + 0.45 * k)}"/><path d="M${w} 0L0 ${-len}L0 0Z" fill="${ramp(STEEL, 0.15 + 0.3 * k)}"/>`

const chromeSpikes = (t) => {
  const shift = wave(t) * 14
  const spikes = Array.from({ length: 16 }, (_, i) => {
    const d = i * 22.5
    const long = i % 2 === 0
    const k = 0.5 + 0.5 * Math.cos(((d + 45 - shift) * Math.PI) / 90)
    return place(...polar(236, d), d, 1, spike(long ? 54 : 32, long ? 14 : 10, k))
  }).join("")
  const rivets = Array.from({ length: 32 }, (_, i) => {
    const d = i * 11.25 + 5.6
    const [x, y] = polar(226, d)
    return `<circle cx="${x}" cy="${y}" r="3.2" fill="${STEEL[1]}"/><circle cx="${f(x - 0.8)}" cy="${f(y - 0.8)}" r="1.9" fill="${STEEL[4]}"/>`
  }).join("")
  const sweep = (t * 360) % 360
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs(
    `<linearGradient id="crimson" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff5252"/><stop offset="1" stop-color="#8a0010"/></linearGradient>`,
  )}<g filter="url(#ds)">
    ${spikes}
    ${ring(226, 26, STEEL[0])}${metalBand(226, 24, STEEL, { shift })}
    ${ring(226, 4, "url(#crimson)")}${rivets}
    ${ring(213.6, 2, STEEL[0])}${ring(239, 2, STEEL[0])}
  </g>
  <path d="${arc(226, sweep - 8, sweep + 8)}" stroke="#fff" stroke-width="20" fill="none" opacity=".5" filter="url(#soft)"/>
  ${glint(...polar(276, sweep), 0.9, 0.9)}</svg>`
}

/** 炎の羽根 */
const fireFeather = (len, w) =>
  `<path d="M0 0C${-w} ${f(-len * 0.3)} ${f(-w * 0.6)} ${f(-len * 0.8)} 0 ${-len}C${f(w * 0.6)} ${f(-len * 0.8)} ${w} ${f(-len * 0.3)} 0 0Z" fill="url(#fire)" stroke="#7a1300" stroke-width="1.6" stroke-linejoin="round"/><path d="M0 -4C${f(-w * 0.4)} ${f(-len * 0.3)} ${f(-w * 0.25)} ${f(-len * 0.65)} 0 ${f(-len * 0.82)}C${f(w * 0.25)} ${f(-len * 0.65)} ${f(w * 0.4)} ${f(-len * 0.3)} 0 -4Z" fill="url(#fireIn)"/>`

const phoenix = (t) => {
  const flap = wave(t) * 5
  const wing = (side) => {
    const rows = [
      Array.from({ length: 9 }, (_, i) => [i * 15 - 10, 170 - i * 11, -8 + i * 12, 20]),
      Array.from({ length: 8 }, (_, i) => [i * 15 - 2, 112 - i * 7, 4 + i * 12, 15]),
    ]
    return `<g transform="translate(${C + side * 206} ${C - 34}) scale(${side} 1) rotate(${f(flap)})">${rows
      .flatMap((row, ri) =>
        row.map(([y, len, rot, w], i) =>
          place(0, y - 40, 20 + rot, 1, fireFeather(len * (1 + 0.04 * wave(t * 2, i / 8 + ri)), w)),
        ),
      )
      .join("")}</g>`
  }
  const tail = [-26, -9, 9, 26]
    .map((rot, i) => place(C + rot * 0.6, 470, 180 + rot + wave(t, i / 4) * 5, 1, fireFeather(78 - Math.abs(rot), 14)))
    .join("")
  const embers = Array.from({ length: 12 }, (_, i) => {
    const p = (t + i / 12) % 1
    const d = i % 2 ? 60 + i * 9 : 300 - i * 9
    const [x0, y0] = polar(246, d)
    const r = 2.4 + (i % 3)
    return `<circle cx="${f(x0 + Math.sin(TAU * (p + i * 0.3)) * 8)}" cy="${f(y0 - p * 90)}" r="${f(r * (1 - p * 0.5))}" fill="${i % 3 ? "#ffd166" : "#ff7b1c"}" opacity="${f(1 - p)}"/>`
  }).join("")
  const crest = `<g transform="translate(${C} ${C - R - 8})">${[-24, -8, 8, 24].map((rot, i) => place(0, 4, rot + wave(t * 2, i / 4) * 4, 0.8, fireFeather(52 - Math.abs(rot) * 0.6, 11))).join("")}</g>`
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs(
    `<linearGradient id="fire" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff3d00"/><stop offset=".55" stop-color="#ff8a00"/><stop offset="1" stop-color="#ffe066"/></linearGradient>` +
      `<linearGradient id="fireIn" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffb03a"/><stop offset="1" stop-color="#fff6c2"/></linearGradient>` +
      lg("ember", ["#ffe27a", "#ff7b1c", "#c4170c", "#ff7b1c", "#ffe27a"], 1, 1),
  )}
  <g mask="url(#behind)"><g filter="url(#glow)">${wing(-1)}${wing(1)}${tail}${crest}</g></g>
  <g filter="url(#ds)">${ring(224, 14, "#5a0b00")}${ring(224, 11, "url(#ember)")}${ring(224, 2, "#fff3c4", `stroke-dasharray="18 14" stroke-dashoffset="${f(-t * 128)}" opacity=".85"`)}</g>
  ${embers}</svg>`
}

/** 刀（刃先は上、刃の長さ len）。白い反射が刃を走る */
const katana = (k, id, len = 270) =>
  `<g><path d="M-6 0L-6-${len - 38}C-6-${len - 24} 0-${len - 8} 6-${len}L6 0Z" fill="#d9e1ea" stroke="#1b2129" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M1 0L1-${len - 34}C1-${len - 22} 4-${len - 10} 6-${len}L6 0Z" fill="url(#${id})"/>
    <path d="M-3-6V-${len - 42}" stroke="#8b97a6" stroke-width="1.2"/>
    <path d="M-4-${len - 30}C-2-${len - 20} 2-${len - 12} 5-${len - 4}" stroke="#fff" stroke-width="1.6" fill="none" opacity="${f(0.4 + 0.6 * k)}"/>
    <ellipse cx="0" cy="4" rx="22" ry="7" fill="#c9a24a" stroke="#4a3200" stroke-width="2"/>
    <rect x="-7" y="10" width="14" height="76" rx="3" fill="#1d1d26" stroke="#000" stroke-width="2"/>
    ${Array.from({ length: 6 }, (_, i) => `<path d="M-7 ${16 + i * 12}L7 ${22 + i * 12}M7 ${16 + i * 12}L-7 ${22 + i * 12}" stroke="#b3122a" stroke-width="2.4"/>`).join("")}
    <rect x="-8" y="84" width="16" height="7" rx="2" fill="#c9a24a" stroke="#4a3200" stroke-width="1.6"/></g>`

const crossedBlades = (t) => {
  const p = (t * 2) % 1
  const shine = (id, phase) => {
    const q = (p + phase) % 1
    const y = 1 - q * 1.6
    return `<linearGradient id="${id}" x1="0" y1="1" x2="0" y2="0"><stop offset="${f(Math.max(0, y - 0.12))}" stop-color="#aeb9c6"/><stop offset="${f(Math.min(1, Math.max(0, y)))}" stop-color="#ffffff"/><stop offset="${f(Math.min(1, Math.max(0, y + 0.12)))}" stop-color="#aeb9c6"/></linearGradient>`
  }
  const blade = (side, id) => `<g transform="translate(${pp(250, 180 - side * 45)}) rotate(${side * -45}) scale(1.35 1)">${katana(flash(t, side > 0 ? 0 : 0.5), id, 560)}</g>`
  const slash = (q) =>
    q > 0.35
      ? ""
      : `<path d="${arc(258, 300 + q * 300, 330 + q * 300)}" stroke="#fff" stroke-width="${f(6 * (1 - q / 0.35))}" fill="none" stroke-linecap="round" opacity="${f(1 - q / 0.35)}"/>`
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs(
    shine("bl1", 0) + shine("bl2", 0.5) + lg("steelR", ["#3a4250", "#11151b"]) + lg("redR", ["#ff3b4f", "#8a0012"]),
  )}<g filter="url(#ds)"><g mask="url(#behind)">${blade(-1, "bl1")}${blade(1, "bl2")}</g>
    ${ring(226, 18, "url(#steelR)")}${ring(226, 18, "none", 'stroke="#000" stroke-width="1"')}
    ${ring(226, 3, "url(#redR)")}
    ${[0, 90, 180, 270].map((d) => `<g transform="translate(${pp(226, d)}) rotate(${d})"><path d="M0-14L10 0 0 14-10 0Z" fill="#c9a24a" stroke="#4a3200" stroke-width="1.6"/><circle r="3" fill="#b3122a"/></g>`).join("")}
  </g>${slash(p)}${slash((p + 0.5) % 1)}</svg>`
}

/* ------------------------------------------------------------------ */
/* スペシャル（プレミアムコインだけで買える枠）                           */
/* プラン限定のプレミアムと同じ描き方（縁取りなし・陰影と映り込み）で、     */
/* 翼・大粒の色石・光の粒を足して一段上に見せる                            */
/* ------------------------------------------------------------------ */

const GEM = {
  ...JEWEL,
  emerald: ["#022b1a", "#07623a", "#16a35f", "#6fe0a4", "#e3fff0"],
  amethyst: ["#22063d", "#4b1683", "#8a43d6", "#c99bff", "#f4ebff"],
  topaz: ["#3d2200", "#8a5300", "#e39b12", "#ffd36b", "#fff6dc"],
}

/** 金属の羽根（根元が細く、先が丸い）。k は光の当たり具合 */
const metalFeather = (stops, len, w, k) =>
  `<path d="M0 0C${-w} ${f(-len * 0.25)} ${-w} ${f(-len * 0.85)} 0 ${-len}C${w} ${f(-len * 0.85)} ${w} ${f(-len * 0.25)} 0 0Z" fill="${stops[0]}"/><path d="M0 -1.5C${f(-w + 1.6)} ${f(-len * 0.25)} ${f(-w + 1.6)} ${f(-len * 0.84)} 0 ${f(-len + 2)}Z" fill="${ramp(stops, 0.45 + 0.5 * k)}"/><path d="M0 -1.5C${f(w - 1.6)} ${f(-len * 0.25)} ${f(w - 1.6)} ${f(-len * 0.84)} 0 ${f(-len + 2)}Z" fill="${ramp(stops, 0.2 + 0.32 * k)}"/><path d="M0-2V${f(-len + 6)}" stroke="${ramp(stops, 0.85 + 0.15 * k)}" stroke-width="1.2" opacity=".85"/>`

/** 金の翼（右向き。side=-1 で左右反転）。光が根元から先へ流れる */
const goldWing = (t, side, stops) => {
  const flap = wave(t) * 3
  const rows = [
    { n: 10, len: 150, w: 15, y0: -96, dy: 21, rot0: -28, drot: 11.5, x: 6 },
    { n: 9, len: 104, w: 13, y0: -78, dy: 20, rot0: -12, drot: 11, x: 0 },
    { n: 7, len: 62, w: 11, y0: -58, dy: 19, rot0: 6, drot: 11, x: -4 },
  ]
  const feathers = rows
    .map((row, ri) =>
      Array.from({ length: row.n }, (_, i) => {
        const j = row.n - 1 - i
        const k = 0.5 + 0.5 * Math.sin(TAU * (t - j / row.n - ri * 0.15))
        const len = row.len * (1 - j * 0.045)
        return place(row.x, row.y0 + j * row.dy, row.rot0 + j * row.drot, 1, metalFeather(stops, len, row.w, k))
      }).join(""),
    )
    .join("")
  return `<g transform="translate(${C + side * 214} ${C - 18}) scale(${side} 1) rotate(${f(28 + flap)})">${feathers}</g>`
}

/** 光の粒（ゆっくり昇って消える） */
const risingDust = (t, n, { r = 240, rise = 110, color = "#fff3c4", spread = 1, seed = 3 } = {}) => {
  const rand = rng(seed)
  return Array.from({ length: n }, (_, i) => {
    const d = rand() * 360
    const off = rand()
    const size = 1.4 + rand() * 2.2
    const p = (t + off) % 1
    const [x0, y0] = polar(r + rand() * 30 * spread, d)
    const o = Math.sin(Math.PI * p)
    return `<circle cx="${f(x0 + Math.sin(TAU * (p + off)) * 6)}" cy="${f(y0 - p * rise)}" r="${f(size)}" fill="${color}" opacity="${f(o)}"/>`
  }).join("")
}

/** 輪のまわりを回る光の粒（尾を引く） */
const orbiters = (t, n, r, colors) =>
  Array.from({ length: n }, (_, i) => {
    // 1 周で 2 つ先の位置へ（色は 2 つおきなので継ぎ目が出ない）
    const d = (i * 360) / n + t * (720 / n) * (i % 2 ? 1 : -1)
    const trail = Array.from({ length: 6 }, (_, j) => {
      const [x, y] = polar(r, d - (i % 2 ? 1 : -1) * j * 2.6)
      return `<circle cx="${x}" cy="${y}" r="${f(3.4 - j * 0.5)}" fill="${colors[i % colors.length]}" opacity="${f(0.95 - j * 0.15)}"/>`
    }).join("")
    const [x, y] = polar(r, d)
    return `${trail}${glint(x, y, 0.42, 0.95)}`
  }).join("")

const specialSeraph = (t) => {
  const m = METAL.gold
  const p = METAL.platinum
  const shift = wave(t) * 14
  const halo = `<g transform="translate(${C} -6)"><ellipse rx="84" ry="19" fill="none" stroke="#fff3c4" stroke-width="14" opacity=".55" filter="url(#glow2)"/><ellipse rx="84" ry="19" fill="none" stroke="${m[1]}" stroke-width="9"/><ellipse rx="84" ry="19" fill="none" stroke="url(#haloG)" stroke-width="6.5"/>${Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * TAU + t * TAU * (1 / 12) * 2
    const x = Math.cos(a) * 84
    const y = Math.sin(a) * 19
    const front = Math.sin(a) > 0
    return `<circle cx="${f(x)}" cy="${f(y)}" r="${front ? 3.4 : 2.4}" fill="#fff" opacity="${front ? 1 : 0.55}"/>`
  }).join("")}</g>`
  return `<svg xmlns="http://www.w3.org/2000/svg" ${PLAN_VIEW}>${planDefs([m, p], AURORA_DEF + rayDef("rayS", "#fff1b8") + lg("haloG", ["#fffadd", "#ffe58c", "#e9bd42", "#ffe58c", "#fffadd"], 1, 0))}
  ${auroraGlow(t, ["#ffe27a", "#fff6d8", "#ffb84d", "#fff1a8"], { r: 262, w: 54, opacity: 0.85 })}
  ${lightRays(t, 24, "rayS", { long: 318, short: 290, opacity: 0.85 })}
  <g mask="url(#behind)">${risingDust(t, 26, { r: 236, rise: 120, color: "#fff3c4", seed: 7 })}</g>
  <g filter="url(#ds)">
    <g mask="url(#behind)">${goldWing(t, -1, m)}${goldWing(t, 1, m)}</g>
    ${ring(224, 32, m[0])}${metalBand(224, 30, m, { shift })}
    ${pave(224, 6, 44, m, GEM.diamond, t)}
    ${milgrain(243, 2.8, 96, m, shift)}${milgrain(205.5, 2.2, 90, m, shift)}
    ${[60, 120, 240, 300].map((d, i) => setGem(...polar(224, d), 13, m, i % 2 ? GEM.sapphire : GEM.ruby, t, i * 0.25)).join("")}
    ${setGem(...polar(250, 180), 18, m, GEM.diamond, t, 0.5, 0.86)}
    ${place(...polar(262, 0), 0, 1.25, fleur(m))}${setGem(...polar(240, 0), 22, p, GEM.diamond, t, 0, 0.9)}
  </g>
  ${halo}
  ${glint(...polar(240, 0), 1.8, 0.35 + 0.65 * flash(t, 0))}
  ${[60, 120, 240, 300].map((d, i) => glint(...polar(224, d), 0.9, flash(t, 0.2 + i * 0.2))).join("")}
  ${glint(...polar(250, 180), 1.1, flash(t, 0.55))}
  ${twinkles(t, [[300, 40, 1, 0.1], [300, 320, 1, 0.6], [292, 140, 0.8, 0.35], [292, 220, 0.8, 0.85]], "#fff6d8")}</svg>`
}

const specialJewels = (t) => {
  const m = METAL.gold
  const p = METAL.platinum
  const shift = wave(t) * 14
  const order = ["ruby", "topaz", "emerald", "ice", "sapphire", "amethyst", "pink", "diamond"]
  const stones = Array.from({ length: 16 }, (_, i) => {
    const d = i * 22.5 + 11.25
    if (d > 330 || d < 30) return ""
    const big = i % 2 === 0
    return setGem(...polar(big ? 228 : 226, d), big ? 12.5 : 8.5, i % 2 ? p : m, GEM[order[i % order.length]], t, i * 0.13)
  }).join("")
  const rainbow = ["#ff6b8a", "#ffc94d", "#6ff0a8", "#5ec8ff", "#a98cff", "#ff8fe0"]
  const crownStones = { centerJewel: GEM.emerald, accent: p }
  return `<svg xmlns="http://www.w3.org/2000/svg" ${PLAN_VIEW}>${planDefs([m, p], AURORA_DEF + rayDef("rayJ", "#ffffff"))}
  ${auroraGlow(t, rainbow, { r: 260, w: 50, opacity: 0.85 })}
  ${lightRays(t, 32, "rayJ", { long: 312, short: 288, opacity: 0.75 })}
  <g mask="url(#behind)">${risingDust(t, 20, { r: 246, rise: 80, color: "#ffffff", seed: 11 })}</g>
  <g filter="url(#ds)">
    ${[-1, 1].map((dir) => laurelBranch(dir, m, { r: 258, from: 14, to: 128, pairs: 10, size: 1.1, flow: t })).join("")}
    ${ring(226, 38, m[0])}${metalBand(240, 9, m, { shift, layers: 3 })}${metalBand(212, 9, m, { shift, layers: 3 })}
    ${ring(226, 19, p[1])}${metalBand(226, 18, p, { shift: -shift })}
    ${milgrain(246.5, 2.6, 100, m, shift)}
    ${stones}
    ${setGem(...polar(254, 180), 20, m, GEM.ruby, t, 0.5, 0.86)}
    ${tiara(m, GEM.diamond, t, crownStones)}
    ${[-1, 1].map((s) => setGem(C + s * 30, -22, 7, p, GEM[s > 0 ? "sapphire" : "amethyst"], t, 0.3 + s * 0.1)).join("")}
  </g>
  ${orbiters(t, 6, 268, ["#ff9fe0", "#7fe0ff"])}
  ${glint(C, 0, 1.5, 0.35 + 0.65 * flash(t, 0))}${glint(C, -43, 1, flash(t, 0.35))}
  ${glint(C - 65, -33, 0.8, flash(t, 0.55))}${glint(C + 65, -33, 0.8, flash(t, 0.8))}
  ${glint(...polar(254, 180), 1.2, flash(t, 0.5))}</svg>`
}

/** 宝石の花（花びらは色石、芯は真珠） */
const gemFlower = (t, jewel, metal, size, phase) => {
  const petals = Array.from({ length: 6 }, (_, i) => {
    const a = i * 60
    const k = 0.5 + 0.5 * Math.sin(TAU * (t + phase) + i * 1.3)
    return `<g transform="rotate(${a})"><path d="M0 -3C${f(-size * 0.55)} ${f(-size * 0.5)} ${f(-size * 0.45)} ${f(-size * 1.1)} 0 ${f(-size * 1.18)}C${f(size * 0.45)} ${f(-size * 1.1)} ${f(size * 0.55)} ${f(-size * 0.5)} 0 -3Z" fill="${metal[0]}"/><path d="M0 -4C${f(-size * 0.42)} ${f(-size * 0.5)} ${f(-size * 0.36)} ${f(-size * 1.0)} 0 ${f(-size * 1.07)}Z" fill="${ramp(jewel, 0.45 + 0.5 * k)}"/><path d="M0 -4C${f(size * 0.42)} ${f(-size * 0.5)} ${f(size * 0.36)} ${f(-size * 1.0)} 0 ${f(-size * 1.07)}Z" fill="${ramp(jewel, 0.2 + 0.35 * k)}"/></g>`
  }).join("")
  return `${petals}${size >= 30 ? setGem(0, 0, size * 0.3, METAL.gold, GEM.diamond, t, phase) : pearl(0, 0, size * 0.36)}`
}

const specialBloom = (t) => {
  const m = METAL.rose
  const g = METAL.gold
  const shift = wave(t) * 12
  const flowers = [
    [0, GEM.pink, 40, 250], [28, GEM.amethyst, 27, 248], [-28, GEM.amethyst, 27, 248], [54, GEM.pink, 22, 246], [-54, GEM.pink, 22, 246],
    [78, GEM.ice, 18, 244], [-78, GEM.ice, 18, 244], [102, GEM.pink, 18, 244], [-102, GEM.pink, 18, 244], [126, GEM.amethyst, 20, 246], [-126, GEM.amethyst, 20, 246],
    [152, GEM.ice, 24, 248], [-152, GEM.ice, 24, 248], [180, GEM.pink, 32, 250],
  ]
    .map(([d, jewel, size, r], i) => place(...polar(r, d), d + wave(t, i / 14) * 4, 1, gemFlower(t, jewel, m, size, i * 0.11)))
    .join("")
  const leaves = Array.from({ length: 24 }, (_, i) => {
    const d = i * 15 + 7.5
    const k = 0.5 + 0.5 * Math.sin(TAU * (t - i / 24))
    return place(...polar(244, d), d + (i % 2 ? 50 : -50), 0.62, `<path d="M0 0C10-10 27-11 39 0 27 11 10 10 0 0Z" fill="${GEM.emerald[0]}"/><path d="M1.5 0C11-8.6 26-9.4 37 0Z" fill="${ramp(GEM.emerald, 0.5 + 0.45 * k)}"/><path d="M1.5 0C11 8.6 26 9.4 37 0Z" fill="${ramp(GEM.emerald, 0.2 + 0.3 * k)}"/>`)
  }).join("")
  const pearls = Array.from({ length: 60 }, (_, i) => pearl(...polar(236.5, i * 6 + 3), 3.2)).join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" ${PLAN_VIEW}>${planDefs([m, g], AURORA_DEF + rayDef("rayB", "#ffe6f2"))}
  ${auroraGlow(t, ["#ffb3d9", "#e3c4ff", "#ffd9a8", "#c4f0ff"], { r: 258, w: 46, opacity: 0.75 })}
  ${lightRays(t, 20, "rayB", { long: 304, short: 284, opacity: 0.65 })}
  <g mask="url(#behind)">${risingDust(t, 18, { r: 246, rise: 70, color: "#ffe9f4", seed: 5 })}</g>
  <g filter="url(#ds)">
    ${ring(223, 26, g[0])}${metalBand(223, 24, g, { shift })}${ring(223, 13, m[0])}${metalBand(223, 12, m, { shift: -shift, layers: 3 })}
    ${pave(223, 4.4, 52, m, GEM.diamond, t)}
    ${ring(209.5, 2, g[4], 'opacity=".9"')}
    ${leaves}${pearls}${flowers}
  </g>
  ${glint(...polar(246, 0), 1.3, 0.3 + 0.7 * flash(t, 0))}${glint(...polar(246, 180), 1.1, flash(t, 0.5))}
  ${twinkles(t, [[284, 60, 0.9, 0.2], [284, 300, 0.9, 0.7], [280, 130, 0.8, 0.45], [280, 230, 0.8, 0.95]], "#fff0f7")}</svg>`
}

/* ------------------------------------------------------------------ */
/* ガチャ限定（N・R・SR・SSR・UR）                                         */
/* 見た目でレア度が分かるように、上のレア度ほど光（オーラ・光の筋・粒）を足す */
/* N: 光なし / R: きらめき少し / SR: きらめき＋淡い光 / SSR: オーラ＋光の筋 / UR: 虹のオーラ＋光の筋＋昇る粒 */
/* ------------------------------------------------------------------ */

/** stops（暗→明 6 色）を 1 色から作る */
const tone = (hex) => [mixHex("#000000", hex, 0.25), mixHex("#000000", hex, 0.55), mixHex("#000000", hex, 0.82), hex, mixHex(hex, "#ffffff", 0.55), mixHex(hex, "#ffffff", 0.9)]

/* ---- N ---- */

const gachaDots = (t) => {
  const shift = t * 360
  const dots = Array.from({ length: 24 }, (_, i) => {
    const [x, y] = polar(226, i * 15 + shift / 24)
    return `<circle cx="${x}" cy="${y}" r="${i % 2 ? 4.2 : 6.4}" fill="#fff" opacity=".95"/>`
  }).join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" ${PLAN_VIEW}>${defs(lg("gnd", ["#ffb3cf", "#ffd6a8", "#b8e6ff", "#d6c4ff", "#ffb3cf"], 1, 1))}<g filter="url(#ds)">
    ${ring(226, 24, "url(#gnd)")}${ring(238, 1.6, "#fff", 'opacity=".7"')}${ring(214, 1.6, "#fff", 'opacity=".7"')}${dots}
  </g></svg>`
}

const gachaStardust = (t) => {
  const stars = Array.from({ length: 12 }, (_, i) => {
    const d = i * 30 + 15
    const k = 0.75 + 0.25 * wave(t, i / 12)
    return place(...polar(226, d), d, k, star5(i % 3 === 0 ? 14 : 9.5, i % 3 === 0 ? "#ffe17a" : "#ffffff", "#1b2a5c", 1.2))
  }).join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" ${PLAN_VIEW}>${defs(lg("gns", ["#1b2a5c", "#2d4a9a", "#1b2a5c"], 1, 1))}<g filter="url(#ds)">
    ${ring(226, 22, "url(#gns)")}${ring(226, 22, "none", 'stroke="#8fb0ff" stroke-opacity=".5" stroke-width="1.5"')}${stars}
  </g></svg>`
}

const gachaCandy = (t) => {
  const n = 36
  const stripes = Array.from({ length: n }, (_, i) => {
    const a = i * (360 / n) + t * (720 / n)
    return `<path d="${arc(226, f(a), f(a + 360 / n / 2))}" stroke="${i % 2 ? "#ff5f7e" : "#5fc8ff"}" stroke-width="22" fill="none"/>`
  }).join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" ${PLAN_VIEW}>${defs()}<g filter="url(#ds)">
    ${ring(226, 24, "#fff")}<g opacity=".92">${stripes}</g>
    ${ring(226, 22, "none", 'stroke="#fff" stroke-opacity=".35" stroke-width="6"')}${ring(237.5, 1.4, "#fff")}${ring(214.5, 1.4, "#fff")}
  </g></svg>`
}

/* ---- R ---- */

const cloverLeaf = (fill) =>
  `<path d="M0 0C-4-8-14-14-14-22-14-28-8-30-4-28-2-27 0-25 0-23 0-25 2-27 4-28 8-30 14-28 14-22 14-14 4-8 0 0Z" fill="${fill}" stroke="#1d6b2e" stroke-width="1.4" stroke-linejoin="round"/><path d="M0-2V-20" stroke="#1d6b2e" stroke-opacity=".45" stroke-width="1.2"/>`

const clover = (n, fill) => `${Array.from({ length: n }, (_, i) => `<g transform="rotate(${(i * 360) / n})">${cloverLeaf(fill)}</g>`).join("")}<circle r="3" fill="#2e8a40"/>`

const gachaClover = (t) => {
  const items = Array.from({ length: 10 }, (_, i) => {
    const d = i * 36 + 18
    return place(...polar(232, d), d + wave(t, i / 10) * 8, 0.9, clover(3, i % 2 ? "url(#gcl1)" : "url(#gcl2)"))
  }).join("")
  const lucky = place(...polar(244, 0), wave(t) * 10, 1.6, clover(4, "url(#gcl3)"))
  return `<svg xmlns="http://www.w3.org/2000/svg" ${PLAN_VIEW}>${defs(lg("gcl1", ["#9be38f", "#3fae4a"]) + lg("gcl2", ["#b9f0a0", "#5cbf52"]) + lg("gcl3", ["#d8ffb0", "#5fd36a", "#2f9e3d"]) + lg("gclr", ["#e8ffd8", "#a8e39a"], 1, 1))}<g filter="url(#ds)">
    ${ring(226, 14, "url(#gclr)")}${ring(226, 14, "none", 'stroke="#3fae4a" stroke-width="1.6"')}${items}${lucky}
  </g>${twinkles(t, [[262, 18, 0.8, 0], [262, 342, 0.7, 0.5]], "#fffbe0")}</svg>`
}

const gachaShootingStar = (t) => {
  const comets = Array.from({ length: 3 }, (_, i) => {
    const d = i * 120 + t * 120
    const trail = Array.from({ length: 18 }, (_, j) => {
      const [x, y] = polar(246, d - j * 2.6)
      return `<circle cx="${x}" cy="${y}" r="${f(9 - j * 0.45)}" fill="${j < 4 ? "#fff6c8" : j < 10 ? "#bfe2ff" : "#8fb8ff"}" opacity="${f(1 - j / 18)}"/>`
    }).join("")
    return `${trail}${place(...polar(246, d), d, 1, star5(19, "#fff1a0", "#e8b93a", 2))}`
  }).join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" ${PLAN_VIEW}>${defs(lg("gss", ["#0f1d4a", "#24408f", "#0f1d4a"], 1, 1))}<g filter="url(#ds)">
    ${ring(225, 20, "url(#gss)")}${ring(225, 3, "#fff", 'stroke-dasharray="1 9" stroke-linecap="round" opacity=".8"')}${ring(236, 1.4, "#8fb8ff", 'opacity=".7"')}
  </g><g filter="url(#glow)">${comets}</g>
  ${twinkles(t, [[262, 60, 0.7, 0.1], [262, 200, 0.7, 0.45], [262, 300, 0.7, 0.8]], "#fff")}</svg>`
}

const sunflower = (s, phase, t) => {
  const petals = Array.from({ length: 14 }, (_, i) => `<path d="M0-9C-5-16-5-27 0-32 5-27 5-16 0-9Z" transform="rotate(${f(i * (360 / 14))})" fill="url(#gsf)" stroke="#c9840c" stroke-width=".8"/>`).join("")
  return `<g transform="scale(${f(s)}) rotate(${f(wave(t, phase) * 6)})">${petals}<circle r="11" fill="#6b3e12"/><circle r="11" fill="none" stroke="#3d2207" stroke-width="2" stroke-dasharray="1.5 2.5"/><circle cx="-3" cy="-3" r="3.5" fill="#8a5420"/></g>`
}

const gachaSunflower = (t) => {
  const flowers = [0, 52, -52, 104, -104, 156, -156, 180]
    .map((d, i) => place(...polar(i === 0 ? 246 : 240, d), d, 1, sunflower(i === 0 ? 1.45 : d === 180 ? 0.9 : 1, i / 8, t)))
    .join("")
  const leaves = Array.from({ length: 14 }, (_, i) => place(...polar(236, i * 25.7 + 13), i * 25.7 + 13 + (i % 2 ? 60 : -60), 0.75, leaf("#5cbf52"))).join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" ${PLAN_VIEW}>${defs(lg("gsf", ["#ffe680", "#ffb81f"]) + lg("gsfr", ["#8fd16b", "#4f9e3a"], 1, 1))}<g filter="url(#ds)">
    ${ring(226, 12, "url(#gsfr)")}${leaves}${flowers}
  </g>${twinkles(t, [[268, 0, 0.8, 0.2], [262, 120, 0.6, 0.6]], "#fffbe0")}</svg>`
}

/* ---- SR ---- */

/** 六角柱の結晶（先がとがる）。上向き */
const crystal = (len, w, stops, k) =>
  `<path d="M${-w} 0V${f(-len * 0.72)}L0 ${-len}L${w} ${f(-len * 0.72)}V0Z" fill="${stops[0]}"/><path d="M${f(-w + 1.5)} -1V${f(-len * 0.72)}L0 ${f(-len + 3)}V-1Z" fill="${ramp(stops, 0.45 + 0.5 * k)}"/><path d="M${f(w - 1.5)} -1V${f(-len * 0.72)}L0 ${f(-len + 3)}V-1Z" fill="${ramp(stops, 0.2 + 0.3 * k)}"/><path d="M${f(-w * 0.4)} -4V${f(-len * 0.7)}" stroke="#fff" stroke-width="1.4" opacity="${f(0.3 + 0.6 * k)}"/>`

const gachaAmethyst = (t) => {
  const st = GEM.amethyst.concat(["#ffffff"])
  const cluster = (d, s, seed) => {
    const r = rng(seed)
    return place(...polar(228, d), d, s, Array.from({ length: 5 }, (_, i) => {
      const k = 0.5 + 0.5 * Math.sin(TAU * t + i * 1.9 + seed)
      return place((i - 2) * 9, 0, (i - 2) * 16 + (r() - 0.5) * 8, 1, crystal(42 + r() * 34 - Math.abs(i - 2) * 10, 7 + r() * 3, st, k))
    }).join(""))
  }
  const clusters = [[0, 1.25, 3], [45, 0.8, 5], [-45, 0.8, 7], [100, 0.95, 9], [-100, 0.95, 11], [150, 0.75, 13], [-150, 0.75, 15], [180, 1, 17]]
    .map(([d, s, seed]) => cluster(d, s, seed))
    .join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" ${PLAN_VIEW}>${planDefs([METAL.silver], AURORA_DEF)}
  ${auroraGlow(t, ["#b48cff", "#e0b8ff", "#8a5cff"], { r: 250, w: 30, opacity: 0.45 })}
  <g filter="url(#ds)">
    <g mask="url(#behind)">${clusters}</g>
    ${ring(224, 20, METAL.silver[0])}${metalBand(224, 18, METAL.silver, { shift: wave(t) * 12 })}
    ${pave(224, 3.8, 36, METAL.silver, GEM.amethyst, t)}
  </g>
  ${glint(...polar(270, 0), 1.1, flash(t, 0))}${glint(...polar(262, 100), 0.8, flash(t, 0.4))}${glint(...polar(262, 260), 0.8, flash(t, 0.7))}</svg>`
}

const gachaConstellation = (t) => {
  // 星座の形（輪のまわりに 4 つ）。点は [半径, 角度]
  const groups = [
    [[262, -24], [278, -12], [270, 2], [284, 14], [272, 26]],
    [[264, 62], [282, 74], [270, 86], [290, 96], [276, 110], [262, 100]],
    [[268, 150], [286, 162], [272, 176], [288, 190], [270, 204]],
    [[264, 246], [284, 256], [270, 270], [288, 282], [274, 298], [262, 288]],
  ]
  const rot = t * 30
  const lines = groups
    .map((g, gi) => {
      const pts = g.map(([r, d]) => polar(r, d + rot))
      const k = 0.55 + 0.45 * wave(t, gi / 4)
      return `<path d="M${pts.map((p) => p.join(" ")).join("L")}" stroke="#ffe7a0" stroke-width="2.6" fill="none" opacity="${f(k)}"/>${pts.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i % 2 ? 4.2 : 5.8}" fill="#fff7d6"/>`).join("")}`
    })
    .join("")
  const r = rng(21)
  const dust = Array.from({ length: 60 }, () => {
    const [x, y] = polar(214 + r() * 26, r() * 360 - rot * 2)
    return `<circle cx="${x}" cy="${y}" r="${f(0.6 + r() * 1.4)}" fill="#fff" opacity="${f(0.4 + r() * 0.6)}"/>`
  }).join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" ${PLAN_VIEW}>${planDefs([METAL.gold], AURORA_DEF + lg("gcn", ["#0b1238", "#2a1d6e", "#123a7a", "#0b1238"], 1, 1))}
  ${auroraGlow(t, ["#6a7bff", "#b47bff", "#5ad1ff"], { r: 258, w: 36, opacity: 0.5 })}
  <g filter="url(#ds)">
    ${ring(226, 30, "url(#gcn)")}${dust}
    ${metalBand(242, 4, METAL.gold, { shift: wave(t) * 12, layers: 2 })}${metalBand(210, 4, METAL.gold, { shift: wave(t) * 12, layers: 2 })}
    ${Array.from({ length: 12 }, (_, i) => `<path d="M${pp(242, i * 30)}L${pp(250, i * 30)}" stroke="${METAL.gold[4]}" stroke-width="2"/>`).join("")}
  </g>
  <g filter="url(#glow)" mask="url(#behind)">${lines}</g>
  ${twinkles(t, [[226, 30, 0.8, 0.1], [226, 130, 0.8, 0.4], [226, 230, 0.8, 0.7], [226, 330, 0.8, 0.9]], "#fff7d6")}</svg>`
}

const gachaStainedGlass = (t) => {
  const colors = ["#e8344e", "#f6a623", "#f4d03f", "#2ecc71", "#2f80ed", "#9b51e0"]
  const n = 24
  const glass = Array.from({ length: n }, (_, i) => {
    const a0 = (i * 360) / n
    const k = 0.5 + 0.5 * wave(t, i / n)
    const c = mixHex(colors[i % colors.length], "#ffffff", 0.1 + 0.35 * k)
    return `<path d="M${pp(208, a0)}A208 208 0 0 1 ${pp(208, a0 + 360 / n)}L${pp(246, a0 + 360 / n)}A246 246 0 0 0 ${pp(246, a0)}Z" fill="${c}" opacity=".92"/>`
  }).join("")
  const lead = Array.from({ length: n }, (_, i) => `<path d="M${pp(207, (i * 360) / n)}L${pp(247, (i * 360) / n)}" stroke="#2b2230" stroke-width="3.2"/>`).join("")
  const petals = Array.from({ length: 12 }, (_, i) => {
    const d = i * 30 + 15
    return place(...polar(227, d), d, 1, `<path d="M0-13C7-7 7 7 0 13-7 7-7-7 0-13Z" fill="#fff" opacity="${f(0.35 + 0.4 * flash(t, i / 12))}" stroke="#2b2230" stroke-width="2.4"/>`)
  }).join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" ${PLAN_VIEW}>${planDefs([METAL.gold], AURORA_DEF)}
  ${auroraGlow(t, colors.slice(0, 5), { r: 256, w: 28, opacity: 0.4 })}
  <g filter="url(#ds)">
    ${ring(227, 44, "#2b2230")}${glass}${lead}${petals}
    ${ring(227, 46, "none", `stroke="${METAL.gold[2]}" stroke-width="0"`)}
    ${metalBand(249, 5, METAL.gold, { shift: wave(t) * 12, layers: 2 })}${metalBand(205, 5, METAL.gold, { shift: wave(t) * 12, layers: 2 })}
  </g>
  ${twinkles(t, [[227, 0, 0.9, 0], [227, 120, 0.8, 0.33], [227, 240, 0.8, 0.66]], "#fff")}</svg>`
}

/* ---- SSR ---- */

const gachaIceQueen = (t) => {
  const m = METAL.platinum
  const ice = tone("#8fdcff")
  const shards = [0, 22, -22, 42, -42, 62, -62, 140, -140, 165, -165, 180]
    .map((d, i) => {
      const len = d === 0 ? 0 : Math.abs(d) < 50 ? 70 - Math.abs(d) * 0.6 : 48
      const k = 0.5 + 0.5 * Math.sin(TAU * t + i * 1.7)
      return len === 0 ? "" : place(...polar(232, d), d, 1, crystal(len, 9, ice, k))
    })
    .join("")
  const flakes = [90, 270, 115, 245].map((d, i) => place(...polar(268, d), t * 60 * (i % 2 ? 1 : -1), 0.7, snowflake("#e8f8ff"))).join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" ${PLAN_VIEW}>${planDefs([m], AURORA_DEF + rayDef("rayI", "#dff6ff"))}
  ${auroraGlow(t, ["#7fe7ff", "#9fb8ff", "#c9f4ff", "#6fd6ff"], { r: 258, w: 46, opacity: 0.8 })}
  ${lightRays(t, 20, "rayI", { long: 304, short: 282, opacity: 0.7 })}
  <g mask="url(#behind)">${risingDust(t, 14, { r: 240, rise: 80, color: "#e8f8ff", seed: 13 })}</g>
  <g filter="url(#ds)">
    <g mask="url(#behind)">${shards}</g>
    ${ring(224, 26, m[0])}${iridescentBand(224, 18, ["#bff0ff", "#8fd0ff", "#d8ccff", "#a8f0ff"], { shift: wave(t) * 40 })}
    ${milgrain(238.5, 2.2, 90, m, wave(t) * 12)}${milgrain(209.5, 2, 84, m, wave(t) * 12)}
    ${setGem(...polar(248, 180), 14, m, JEWEL.ice, t, 0.4, 0.86)}
    ${tiara(m, JEWEL.ice, t, { centerJewel: JEWEL.diamond })}
  </g>
  ${flakes}
  ${glint(C, 0, 1.3, 0.3 + 0.7 * flash(t, 0))}${glint(C - 65, -33, 0.8, flash(t, 0.4))}${glint(C + 65, -33, 0.8, flash(t, 0.75))}
  ${glint(...polar(248, 180), 1, flash(t, 0.55))}</svg>`
}

const gear = (r, teeth, stops, rot) => {
  const pts = Array.from({ length: teeth * 4 }, (_, i) => {
    const a = (i * 360) / (teeth * 4) + rot
    const rr = i % 4 < 2 ? r : r * 0.8
    return polar(rr, a, 0, 0).join(" ")
  }).join("L")
  return `<path d="M${pts}Z" fill="${stops[2]}" stroke="${stops[0]}" stroke-width="1.6" stroke-linejoin="round"/><circle r="${f(r * 0.62)}" fill="${stops[3]}" stroke="${stops[1]}" stroke-width="1.4"/><circle r="${f(r * 0.5)}" fill="none" stroke="${stops[4]}" stroke-width="1"/>${[0, 72, 144, 216, 288].map((a) => `<path d="M0 0L${polar(r * 0.55, a + rot, 0, 0).join(" ")}" stroke="${stops[1]}" stroke-width="${f(r * 0.12)}"/>`).join("")}<circle r="${f(r * 0.16)}" fill="${stops[1]}"/><circle r="${f(r * 0.08)}" fill="${stops[5]}"/>`
}

const gachaClockwork = (t) => {
  const m = METAL.gold
  const b = METAL.rose
  const turn = t * 360
  const gears = [
    [262, 30, 50, 14, 1], [256, 66, 32, 10, -1.6], [264, -34, 42, 12, -1.2], [256, -68, 28, 8, 2],
    [260, 150, 42, 12, 1], [258, -150, 38, 11, -1.2], [260, 114, 28, 8, -2], [260, -112, 30, 9, 1.8],
  ]
    .map(([r, d, size, teeth, dir], i) => place(...polar(r, d), 0, 1, gear(size, teeth, i % 2 ? b : m, (turn * dir) / teeth)))
    .join("")
  const numerals = ["XII", "I", "II", "III", "IIII", "V", "VI", "VII", "VIII", "IX", "X", "XI"]
    .map((s, i) => {
      const [x, y] = polar(225, i * 30)
      return `<text x="${x}" y="${y}" font-family="Georgia, serif" font-size="15" font-weight="700" fill="${m[0]}" text-anchor="middle" dominant-baseline="central" transform="rotate(${i * 30} ${x} ${y})">${s}</text>`
    })
    .join("")
  const hand = (len, w, deg) => `<g transform="translate(${C} ${C}) rotate(${f(deg)})"><path d="M${-w} -${R + 6}L0 -${R + 6 + len}L${w} -${R + 6}Z" fill="${m[3]}" stroke="${m[0]}" stroke-width="1.2"/></g>`
  return `<svg xmlns="http://www.w3.org/2000/svg" ${PLAN_VIEW}>${planDefs([m, b], AURORA_DEF + rayDef("rayC", "#ffe7a0"))}
  ${auroraGlow(t, ["#ffd76a", "#ffb15c", "#fff0b8"], { r: 260, w: 44, opacity: 0.65 })}
  ${lightRays(t, 16, "rayC", { long: 300, short: 280, opacity: 0.6 })}
  <g filter="url(#ds)">
    <g mask="url(#behind)">${gears}</g>
    ${ring(225, 30, m[0])}${ring(225, 24, "#f6ecd2")}${numerals}
    ${metalBand(240, 6, m, { shift: wave(t) * 12, layers: 2 })}${metalBand(210, 6, m, { shift: wave(t) * 12, layers: 2 })}
    ${hand(26, 5, turn)}${hand(18, 6, turn / 12)}
    ${[0, 90, 180, 270].map((d, i) => setGem(...polar(240, d), 7, m, [GEM.ruby, GEM.sapphire, GEM.emerald, GEM.topaz][i], t, i * 0.25)).join("")}
  </g>
  ${[0, 90, 180, 270].map((d, i) => glint(...polar(240, d), 0.8, flash(t, i * 0.25))).join("")}
  ${twinkles(t, [[290, 40, 0.8, 0.15], [290, 320, 0.8, 0.65]], "#fff4c8")}</svg>`
}

const shell = (fill) =>
  `<path d="M0 6C-16 4-24-8-20-18-14-28 14-28 20-18 24-8 16 4 0 6Z" fill="${fill}" stroke="#c9849a" stroke-width="1.4"/>${[-14, -7, 0, 7, 14].map((x) => `<path d="M0 4L${x} -24" stroke="#c9849a" stroke-width="1.2" opacity=".7"/>`).join("")}<path d="M-6 6H6L4 12H-4Z" fill="${fill}" stroke="#c9849a" stroke-width="1.2"/>`

const gachaPearlSea = (t) => {
  const m = METAL.platinum
  const pearls = Array.from({ length: 56 }, (_, i) => pearl(...polar(239, i * (360 / 56)), 3.6)).join("")
  const starfish = (fill) => `<path d="M${Array.from({ length: 10 }, (_, i) => polar(i % 2 ? 9 : 22, i * 36, 0, 0).join(" ")).join("L")}Z" fill="${fill}" stroke="#d06a4a" stroke-width="1.6" stroke-linejoin="round"/>${Array.from({ length: 5 }, (_, i) => `<circle cx="${polar(12, i * 72, 0, 0)[0]}" cy="${polar(12, i * 72, 0, 0)[1]}" r="1.6" fill="#fff3e0"/>`).join("")}`
  const stars = [[120, 1], [-120, 1], [78, 0.75], [-78, 0.75]]
    .map(([d, s], i) => place(...polar(248, d), d + wave(t, i / 4) * 10, s, starfish("url(#gsh3)")))
    .join("")
  const shells = [[0, 1.6, "url(#gsh1)"], [36, 1, "url(#gsh2)"], [-36, 1, "url(#gsh2)"], [160, 1, "url(#gsh2)"], [-160, 1, "url(#gsh2)"], [180, 1.2, "url(#gsh1)"]]
    .map(([d, s, fill]) => place(...polar(250, d), d, s, shell(fill)))
    .join("")
  const rise = Array.from({ length: 12 }, (_, i) => {
    const p = (t + i / 12) % 1
    const [x, y] = polar(262 + (i % 3) * 8, i * 30 + 15)
    return `<circle cx="${x}" cy="${f(y - p * 60)}" r="${f(3 + (i % 3) * 1.6)}" fill="none" stroke="#dffaff" stroke-width="1.6" opacity="${f(Math.sin(Math.PI * p))}"/>`
  }).join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" ${PLAN_VIEW}>${planDefs([m], AURORA_DEF + rayDef("rayP", "#d6fff6") + lg("gsh1", ["#fff4f7", "#ffc4d6"]) + lg("gsh2", ["#fffaf0", "#ffe0c4"]) + lg("gsh3", ["#ffc38a", "#ff8a5c"]))}
  ${auroraGlow(t, ["#4fe8cf", "#58b8ff", "#b6f5ff", "#7fd0ff"], { r: 258, w: 46, opacity: 0.75 })}
  ${lightRays(t, 18, "rayP", { long: 300, short: 280, opacity: 0.6 })}
  <g mask="url(#behind)">${rise}</g>
  <g filter="url(#ds)">
    <g>${stars}</g>
    ${ring(224, 24, m[0])}${iridescentBand(224, 18, ["#7ff0d8", "#7fc8ff", "#c9b8ff", "#ffc8e8"], { shift: wave(t) * 40 })}
    ${pearls}${shells}
    ${place(...polar(250, 0), 0, 1, pearl(0, -2, 9))}
  </g>
  ${glint(...polar(252, 0), 1.2, 0.3 + 0.7 * flash(t, 0))}${glint(...polar(250, 180), 0.9, flash(t, 0.5))}
  ${twinkles(t, [[226, 90, 0.8, 0.2], [226, 270, 0.8, 0.7]], "#fff")}</svg>`
}

/* ---- UR ---- */

const PRISM = ["#ff5e7e", "#ffb347", "#ffe66b", "#6ff0a8", "#5ec8ff", "#8a7bff", "#ff8fe0"]

/** 虹の翼（右向き。side=-1 で左右反転）。羽根ごとに色が移り、色が根元から先へ流れる */
const prismWing = (t, side) => {
  const flap = wave(t) * 3
  const rows = [
    { n: 10, len: 156, w: 15, y0: -98, dy: 21, rot0: -30, drot: 11.5, x: 6 },
    { n: 9, len: 108, w: 13, y0: -80, dy: 20, rot0: -14, drot: 11, x: 0 },
    { n: 7, len: 64, w: 11, y0: -60, dy: 19, rot0: 4, drot: 11, x: -4 },
  ]
  const feathers = rows
    .map((row, ri) =>
      Array.from({ length: row.n }, (_, i) => {
        const j = row.n - 1 - i
        const hue = ((j / row.n + ri * 0.12 + t) % 1) * PRISM.length
        const base = mixHex(PRISM[Math.floor(hue) % PRISM.length], PRISM[(Math.floor(hue) + 1) % PRISM.length], hue - Math.floor(hue))
        const k = 0.5 + 0.5 * Math.sin(TAU * (t - j / row.n - ri * 0.15))
        return place(row.x, row.y0 + j * row.dy, row.rot0 + j * row.drot, 1, metalFeather(tone(base), row.len * (1 - j * 0.045), row.w, k))
      }).join(""),
    )
    .join("")
  return `<g transform="translate(${C + side * 214} ${C - 18}) scale(${side} 1) rotate(${f(28 + flap)})">${feathers}</g>`
}

const gachaPrismSeraph = (t) => {
  const p = METAL.platinum
  const halo = `<g transform="translate(${C} -8)"><ellipse rx="88" ry="20" fill="none" stroke="#fff" stroke-width="16" opacity=".5" filter="url(#glow2)"/><ellipse rx="88" ry="20" fill="none" stroke="${p[1]}" stroke-width="9"/><ellipse rx="88" ry="20" fill="none" stroke="url(#gurH)" stroke-width="6.5"/>${Array.from({ length: 14 }, (_, i) => {
    const a = (i / 14) * TAU + t * TAU * (2 / 14)
    const front = Math.sin(a) > 0
    return `<circle cx="${f(Math.cos(a) * 88)}" cy="${f(Math.sin(a) * 20)}" r="${front ? 3.6 : 2.4}" fill="#fff" opacity="${front ? 1 : 0.55}"/>`
  }).join("")}</g>`
  const stones = Array.from({ length: 7 }, (_, i) => setGem(...polar(224, 180 + (i - 3) * 22), i === 3 ? 13 : 8, p, GEM[["ruby", "topaz", "emerald", "diamond", "sapphire", "amethyst", "pink"][i]], t, i * 0.13)).join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" ${PLAN_VIEW}>${planDefs([p], AURORA_DEF + rayDef("rayU", "#ffffff") + lg("gurH", PRISM.concat([PRISM[0]]), 1, 0))}
  ${auroraGlow(t, PRISM, { r: 262, w: 56, opacity: 0.9 })}
  ${lightRays(t, 32, "rayU", { long: 322, short: 292, opacity: 0.85 })}
  <g mask="url(#behind)">${risingDust(t, 30, { r: 236, rise: 130, color: "#ffffff", seed: 31 })}</g>
  <g filter="url(#ds)">
    <g mask="url(#behind)">${prismWing(t, -1)}${prismWing(t, 1)}</g>
    ${ring(224, 32, p[0])}${iridescentBand(224, 24, PRISM, { shift: t * 360 })}
    ${milgrain(242, 2.6, 96, p, wave(t) * 12)}${milgrain(206, 2.2, 90, p, wave(t) * 12)}
    ${stones}
    ${place(...polar(262, 0), 0, 1.25, fleur(p))}${setGem(...polar(240, 0), 22, p, GEM.diamond, t, 0, 0.9)}
  </g>
  ${halo}
  ${orbiters(t, 6, 274, ["#ff9fe0", "#7fe0ff", "#ffe66b"])}
  ${glint(...polar(240, 0), 1.9, 0.4 + 0.6 * flash(t, 0))}
  ${glint(...polar(224, 180), 1.2, flash(t, 0.5))}
  ${twinkles(t, [[304, 40, 1, 0.1], [304, 320, 1, 0.6], [296, 140, 0.9, 0.35], [296, 220, 0.9, 0.85]], "#fff")}</svg>`
}

const gachaStarCrown = (t) => {
  const m = METAL.platinum
  const g = METAL.gold
  const r = rng(41)
  const dust = Array.from({ length: 90 }, () => {
    const [x, y] = polar(208 + r() * 34, r() * 360 + t * 45)
    return `<circle cx="${x}" cy="${y}" r="${f(0.7 + r() * 1.6)}" fill="#fff" opacity="${f(0.4 + r() * 0.6)}"/>`
  }).join("")
  const planet = (d, size, body) => place(...polar(272, d), 0, size * 1.5, body)
  const saturn = `<circle r="15" fill="url(#gup1)"/><ellipse rx="27" ry="7" fill="none" stroke="#ffe0a8" stroke-width="3.2" transform="rotate(-22)"/>`
  const blue = `<circle r="12" fill="url(#gup2)"/><circle cx="-4" cy="-4" r="3.5" fill="#fff" opacity=".4"/>`
  const pink = `<circle r="9" fill="url(#gup3)"/>`
  const turn = t * 120
  const stars = [-22, 22].map((dx, i) => place(C + dx * 3.1, -48 + Math.abs(dx) * 0.5, wave(t, i / 2) * 8, 0.9, star5(14, "url(#gupS)", g[1], 1.4))).join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" ${PLAN_VIEW}>${planDefs([m, g], AURORA_DEF + rayDef("rayX", "#e6dcff") + lg("gun", ["#0a0730", "#3b1a8a", "#c0389a", "#1e5ad0", "#0a0730"], 1, 1) + lg("gupS", ["#fffadd", "#ffe58c", "#e9bd42"]) +
    '<radialGradient id="gup1" cx=".35" cy=".3"><stop offset="0" stop-color="#ffe9c4"/><stop offset="1" stop-color="#d27c35"/></radialGradient><radialGradient id="gup2" cx=".35" cy=".3"><stop offset="0" stop-color="#bff0ff"/><stop offset="1" stop-color="#2a5fd0"/></radialGradient><radialGradient id="gup3" cx=".35" cy=".3"><stop offset="0" stop-color="#ffe0f2"/><stop offset="1" stop-color="#c0389a"/></radialGradient>')}
  ${auroraGlow(t, ["#7b5cff", "#ff6fd0", "#4fd0ff", "#b98cff", "#ffd36b"], { r: 262, w: 56, opacity: 0.9 })}
  ${lightRays(t, 32, "rayX", { long: 322, short: 292, opacity: 0.8 })}
  <g mask="url(#behind)">${risingDust(t, 26, { r: 240, rise: 120, color: "#f0e6ff", seed: 43 })}</g>
  <g transform="rotate(${f(t * 360)} ${C} ${C})">${ring(225, 36, "url(#gun)")}</g>${dust}
  <g filter="url(#ds)">
    ${metalBand(244, 6, m, { shift: wave(t) * 12, layers: 2 })}${metalBand(206, 6, m, { shift: wave(t) * 12, layers: 2 })}
    ${milgrain(249, 2.2, 100, g, wave(t) * 12)}
    ${planet(80 + turn, 1.1, saturn)}${planet(200 + turn, 1, blue)}${planet(320 + turn, 1, pink)}
    ${setGem(...polar(248, 180), 16, m, GEM.amethyst, t, 0.4, 0.86)}
    ${tiara(m, GEM.diamond, t, { centerJewel: GEM.amethyst, accent: g })}
    ${stars}
  </g>
  ${orbiters(t, 8, 262, ["#ff9fe0", "#7fe0ff", "#fff1a0", "#b98cff"])}
  ${glint(C, 0, 1.6, 0.4 + 0.6 * flash(t, 0))}${glint(C, -43, 1, flash(t, 0.3))}
  ${glint(C - 65, -33, 0.85, flash(t, 0.55))}${glint(C + 65, -33, 0.85, flash(t, 0.8))}
  ${glint(...polar(248, 180), 1.1, flash(t, 0.5))}</svg>`
}

/* ---- 追加分（N・R・SR・SSR・UR） ---- */

/** ゆがんだ円（m 回くり返すので 360 / m 回すとつながる） */
const wobblyRing = (r, amp, m, phase) =>
  `M${Array.from({ length: 91 }, (_, i) => {
    const d = i * 4
    return pp(r + amp * Math.sin((d * m * Math.PI) / 180 + phase) + amp * 0.4 * Math.sin((d * m * 2 * Math.PI) / 180 + phase * 2), d)
  }).join("L")}Z`

const bow = (fill, dark) =>
  `<path d="M-3 2L-12 22-6 20-3 25ZM3 2L12 22 6 20 3 25Z" fill="${fill}" stroke="${dark}" stroke-width="1.4" stroke-linejoin="round"/><path d="M0 0C-10-12-28-14-28 0-28 14-10 12 0 0ZM0 0C10-12 28-14 28 0 28 14 10 12 0 0Z" fill="${fill}" stroke="${dark}" stroke-width="1.6"/><path d="M-6-2C-12-6-20-7-22-2M6-2C12-6 20-7 22-2" stroke="${dark}" stroke-opacity=".45" stroke-width="1.2" fill="none"/><circle r="6.5" fill="${dark}"/><circle cx="-2" cy="-2" r="2" fill="#fff" opacity=".6"/>`

/* N */

const gachaGingham = (t) => {
  const n = 40
  const rot = t * (720 / n)
  const stripes = Array.from({ length: n / 2 }, (_, i) => {
    const a = i * (720 / n) + rot
    return `<path d="${arc(226, f(a), f(a + 360 / n))}" stroke="#ff8fb1" stroke-opacity=".45" stroke-width="24" fill="none"/>`
  }).join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" ${PLAN_VIEW}>${defs()}<g filter="url(#ds)">
    ${ring(226, 24, "#fff")}${stripes}${ring(226, 8, "#ff8fb1", 'stroke-opacity=".45"')}
    ${ring(238, 1.8, "#ff8fb1")}${ring(214, 1.8, "#ff8fb1")}
    ${place(...polar(242, 0), wave(t) * 5, 1.6, bow("#ffa9c4", "#e2628c"))}
  </g></svg>`
}

const lemonSlice = (r) =>
  `<circle r="${r}" fill="#ffe066" stroke="#f2b705" stroke-width="2.6"/><circle r="${f(r * 0.78)}" fill="#fff4b8"/>${Array.from({ length: 8 }, (_, i) => `<path d="M0 0L${polar(r * 0.78, i * 45, 0, 0).join(" ")}" stroke="#ffe066" stroke-width="2.2"/>`).join("")}<circle r="${f(r * 0.14)}" fill="#ffe066"/>`

const gachaLemon = (t) => {
  const slices = Array.from({ length: 8 }, (_, i) => {
    const d = i * 45 + t * 45
    return place(...polar(228, d), d * 2, i % 2 ? 0.95 : 1.2, lemonSlice(15))
  }).join("")
  const r = rng(51)
  const fizz = Array.from({ length: 16 }, (_, i) => {
    const p = (t + r()) % 1
    const [x, y] = polar(244 + r() * 14, i * 22.5 + 11)
    return `<circle cx="${x}" cy="${f(y - p * 26)}" r="${f(2.4 + r() * 2.4)}" fill="none" stroke="#fff" stroke-width="1.6" opacity="${f(Math.sin(Math.PI * p))}"/>`
  }).join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" ${PLAN_VIEW}>${defs(lg("gnl", ["#d8fbff", "#9fe9e0", "#d8fbff"], 1, 1))}<g filter="url(#ds)">
    ${ring(226, 22, "url(#gnl)")}${ring(237, 1.6, "#fff")}${ring(215, 1.6, "#fff")}${slices}
  </g>${fizz}</svg>`
}

const gachaCrayon = (t) => {
  const colors = ["#ff6b6b", "#ffb14a", "#ffe04a", "#5fd38a", "#4aa8ff", "#a87bff"]
  const strokes = colors
    .map((c, i) => {
      const rot = t * 45 * (i % 2 ? 1 : -1)
      const d = wobblyRing(216 + i * 4.4, 1.8, 8, i * 1.7)
      return `<g transform="rotate(${f(rot)} ${C} ${C})"><path d="${d}" stroke="${c}" stroke-width="6.5" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".92"/><path d="${d}" stroke="#fff" stroke-width="2" fill="none" stroke-dasharray="2 5" opacity=".45"/></g>`
    })
    .join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" ${PLAN_VIEW}>${defs()}<g filter="url(#ds)">
    ${ring(226, 34, "#fffdf5")}${strokes}
  </g></svg>`
}

/* R */

const cherries = (s = 1) =>
  `<g transform="scale(${s})"><path d="M0-30C-4-18-10-8-12 2M0-30C4-18 9-8 11 4" stroke="#4f8a2b" stroke-width="2.4" fill="none" stroke-linecap="round"/><g transform="translate(0 -30) rotate(-30)">${leaf("#6cc04a")}</g><circle cx="-12" cy="10" r="10.5" fill="url(#gch)" stroke="#8c0f24" stroke-width="1.2"/><circle cx="11" cy="13" r="10.5" fill="url(#gch)" stroke="#8c0f24" stroke-width="1.2"/><ellipse cx="-15.5" cy="6" rx="3.4" ry="2.2" fill="#fff" opacity=".8"/><ellipse cx="7.5" cy="9" rx="3.4" ry="2.2" fill="#fff" opacity=".8"/></g>`

const gachaCherry = (t) => {
  const items = Array.from({ length: 8 }, (_, i) => {
    const d = i * 45
    return place(...polar(i === 0 ? 256 : 252, d), d + 180 + wave(t, i / 8) * 9, i === 0 ? 1.3 : 0.95, cherries())
  }).join("")
  const leaves = Array.from({ length: 16 }, (_, i) => place(...polar(228, i * 22.5 + 11), i * 22.5 + 11 + (i % 2 ? 70 : -70), 0.55, leaf("#7ccf5a"))).join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" ${PLAN_VIEW}>${defs(lg("gchr", ["#fff1f4", "#ffd0da"], 1, 1) + '<radialGradient id="gch" cx=".35" cy=".3"><stop offset="0" stop-color="#ff8a9c"/><stop offset=".6" stop-color="#e3213f"/><stop offset="1" stop-color="#9c0a24"/></radialGradient>')}<g filter="url(#ds)">
    ${ring(226, 16, "url(#gchr)")}${ring(226, 16, "none", 'stroke="#f08aa0" stroke-width="1.6"')}${ring(226, 2, "#f08aa0", 'stroke-dasharray="6 6"')}${leaves}${items}
  </g>${twinkles(t, [[290, 0, 0.8, 0.1], [276, 135, 0.6, 0.55]], "#fff")}</svg>`
}

const paperPlane = `<path d="M0-20L13 15 0 6Z" fill="#dbe9ff" stroke="#3f72b8" stroke-width="1.6" stroke-linejoin="round"/><path d="M0-20L-13 15 0 6Z" fill="#fff" stroke="#3f72b8" stroke-width="1.6" stroke-linejoin="round"/><path d="M0-20V6" stroke="#3f72b8" stroke-width="1.2"/>`

const gachaPaperPlane = (t) => {
  const planes = [0, 1]
    .map((i) => {
      const d = i * 180 + t * 180
      return `<path d="${arc(250, f(d - 70), f(d - 10))}" stroke="#fff" stroke-width="3" stroke-dasharray="7 7" stroke-linecap="round" fill="none" opacity=".95"/>${place(...polar(250, d), d + 90, 1.8, paperPlane)}`
    })
    .join("")
  const clouds = [50, 140, 230, 320]
    .map((d, i) => {
      const [x, y] = polar(262, d)
      return place(x, y + wave(t, i / 4) * 3, 0, 0.7, cloud("#fff"))
    })
    .join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" ${PLAN_VIEW}>${defs(lg("gpp", ["#bfe6ff", "#7cc4ff", "#bfe6ff"], 1, 1))}<g filter="url(#ds)">
    ${ring(226, 20, "url(#gpp)")}${ring(237, 1.6, "#fff")}${ring(215, 1.6, "#fff")}${clouds}${planes}
  </g>${twinkles(t, [[280, 90, 0.7, 0.2], [280, 270, 0.7, 0.7]], "#fff")}</svg>`
}

const ladybug = `<ellipse rx="10" ry="12" fill="#e8322f" stroke="#2a0d0d" stroke-width="1.6"/><path d="M0-12V12" stroke="#2a0d0d" stroke-width="1.4"/><circle cy="-13" r="5.6" fill="#231a1a"/><circle cx="-2" cy="-15" r="1.3" fill="#fff"/><circle cx="2" cy="-15" r="1.3" fill="#fff"/><circle cx="-5" cy="-3" r="2.4" fill="#231a1a"/><circle cx="5" cy="-3" r="2.4" fill="#231a1a"/><circle cx="-4.5" cy="6" r="2.2" fill="#231a1a"/><circle cx="4.5" cy="6" r="2.2" fill="#231a1a"/><ellipse cx="-4" cy="-8" rx="2.4" ry="1.4" fill="#fff" opacity=".55"/>`

const daisy = `${Array.from({ length: 8 }, (_, i) => `<ellipse cy="-8" rx="3.6" ry="7" fill="#fff" stroke="#d8d2c0" stroke-width=".8" transform="rotate(${i * 45})"/>`).join("")}<circle r="4.6" fill="#ffc93c"/>`

const gachaLadybug = (t) => {
  const leaves = Array.from({ length: 18 }, (_, i) => place(...polar(228, i * 20), i * 20 + (i % 2 ? 65 : -65), 0.62, leaf(i % 3 ? "#6cc04a" : "#8bd66a"))).join("")
  const flowers = Array.from({ length: 6 }, (_, i) => place(...polar(242, i * 60 + 30), wave(t, i / 6) * 10, 1.25, daisy)).join("")
  const bugs = [0, 1, 2]
    .map((i) => {
      const d = i * 120 + t * 120
      return place(...polar(226, d), d + 90, 1.5, ladybug)
    })
    .join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" ${PLAN_VIEW}>${defs(lg("glb", ["#a8e08a", "#5fae46"], 1, 1))}<g filter="url(#ds)">
    ${ring(226, 10, "url(#glb)")}${leaves}${flowers}${bugs}
  </g>${twinkles(t, [[270, 0, 0.7, 0.3], [270, 180, 0.6, 0.8]], "#fffbe0")}</svg>`
}

/* SR */

const jellyfish = (t, phase, hue) => {
  const pulse = Math.sin(TAU * (t * 2 + phase))
  const sx = 1 + pulse * 0.08
  const sy = 1 - pulse * 0.1
  const tentacles = [-12, -5, 2, 9, 14]
    .map((x0, i) => {
      const pts = Array.from({ length: 7 }, (_, j) => `${f(x0 * (1 - j * 0.05) + Math.sin(TAU * (t * 2 + phase) + j * 0.9 + i) * (1.5 + j * 0.9))} ${f(3 + j * 6)}`).join(" ")
      return `<polyline points="${pts}" stroke="${hue}" stroke-width="${i % 2 ? 1.6 : 2.4}" fill="none" stroke-linecap="round" opacity=".85"/>`
    })
    .join("")
  return `<g filter="url(#glow)">${tentacles}<g transform="scale(${f(sx)} ${f(sy)})"><path d="M-19 2C-20-26 20-26 19 2 13 6 7 0 0 5-7 0-13 6-19 2Z" fill="${hue}" fill-opacity=".55" stroke="#eaffff" stroke-width="1.6"/><path d="M-11-4C-11-16 11-16 11-4" stroke="#fff" stroke-width="1.6" fill="none" opacity=".7"/><ellipse cx="-6" cy="-12" rx="4" ry="2.4" fill="#fff" opacity=".7"/></g></g>`
}

const gachaJellyfish = (t) => {
  const hues = ["#7ff0ff", "#ff9fe0", "#b9a4ff", "#7ff0ff", "#ffb8d9", "#9fd8ff"]
  const jellies = hues
    .map((h, i) => {
      const d = i * 60 + 30 + wave(t, i / 6) * 6
      return place(...polar(268 + Math.sin(TAU * (t + i / 6)) * 5, d), d, i % 2 ? 1.25 : 1.5, jellyfish(t, i / 6, h))
    })
    .join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" ${PLAN_VIEW}>${planDefs([METAL.silver], AURORA_DEF + lg("gjr", ["#062a4a", "#0e5c82", "#1b3f8a", "#062a4a"], 1, 1))}
  ${auroraGlow(t, ["#4fe0ff", "#b48cff", "#ff8fd8"], { r: 256, w: 34, opacity: 0.45 })}
  <g filter="url(#ds)">
    ${ring(226, 24, "url(#gjr)")}
    ${metalBand(239, 4, METAL.silver, { shift: wave(t) * 12, layers: 2 })}${metalBand(213, 4, METAL.silver, { shift: wave(t) * 12, layers: 2 })}
    ${risingDust(t, 14, { r: 214, rise: 22, color: "#bff6ff", spread: 0.8, seed: 61 })}
  </g>
  <g mask="url(#behind)">${jellies}</g>
  ${twinkles(t, [[226, 0, 0.8, 0.1], [226, 120, 0.8, 0.45], [226, 240, 0.8, 0.8]], "#e6fdff")}</svg>`
}

const lantern = (t, phase, body) => {
  const k = 0.75 + 0.25 * Math.sin(TAU * (t * 2 + phase))
  return `<path d="M0-30V-20" stroke="#3a2a1a" stroke-width="1.6"/><ellipse rx="22" ry="25" fill="${body}" opacity="${f(0.35 * k)}" filter="url(#glow2)"/><ellipse rx="15" ry="18" fill="url(#glt)" stroke="#9c2a12" stroke-width="1.2"/>${[-12, -6, 0, 6, 12].map((y) => `<path d="M${f(-Math.sqrt(1 - (y / 18) ** 2) * 15)} ${y}H${f(Math.sqrt(1 - (y / 18) ** 2) * 15)}" stroke="#9c2a12" stroke-width=".9" opacity=".7"/>`).join("")}<ellipse rx="15" ry="18" fill="#fff6c8" opacity="${f(0.25 * k)}"/><rect x="-8" y="-21" width="16" height="5" rx="1.5" fill="#2b1d12"/><rect x="-8" y="16" width="16" height="5" rx="1.5" fill="#2b1d12"/><path d="M0 21V30M-2 30H2" stroke="#e8b93a" stroke-width="2"/>`
}

const gachaLanterns = (t) => {
  const g = METAL.gold
  const lanterns = Array.from({ length: 8 }, (_, i) => {
    const d = i * 45 + 22.5
    const [x, y] = polar(258, d)
    return place(x, y, wave(t, i / 8) * 6, 1.3, lantern(t, i / 8, "#ffb04a"))
  }).join("")
  const r = rng(71)
  const fireflies = Array.from({ length: 18 }, () => {
    const [x, y] = polar(270 + r() * 30, r() * 360)
    const ph = r()
    const k = Math.max(0, Math.sin(TAU * (t + ph)))
    return `<circle cx="${x}" cy="${y}" r="2.2" fill="#fff3a8" opacity="${f(k)}"/>`
  }).join("")
  const waves = Array.from({ length: 24 }, (_, i) => `<path d="${arc(226, i * 15, i * 15 + 15)}" stroke="${g[3]}" stroke-width="1.4" fill="none" opacity=".55"/>`).join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" ${PLAN_VIEW}>${planDefs([g], AURORA_DEF + lg("gln", ["#1a1240", "#2b1d5c", "#1a1240"], 1, 1) + '<radialGradient id="glt" cx=".45" cy=".4"><stop offset="0" stop-color="#fff2b0"/><stop offset=".55" stop-color="#ff8a3a"/><stop offset="1" stop-color="#d23a1a"/></radialGradient>')}
  ${auroraGlow(t, ["#ff9a4a", "#ffd36b", "#ff6a8a"], { r: 256, w: 32, opacity: 0.45 })}
  <g filter="url(#ds)">
    ${ring(226, 26, "url(#gln)")}${waves}
    ${Array.from({ length: 36 }, (_, i) => `<path d="${arc(226, i * 10 + t * 20, i * 10 + 5 + t * 20)}" stroke="${g[4]}" stroke-width="2" fill="none" opacity=".35"/>`).join("")}
    ${metalBand(241, 4, g, { shift: wave(t) * 12, layers: 2 })}${metalBand(211, 4, g, { shift: wave(t) * 12, layers: 2 })}
    ${arcString()}
  </g>
  ${lanterns}${fireflies}
  ${twinkles(t, [[226, 45, 0.8, 0.2], [226, 225, 0.8, 0.7]], "#fff4c8")}</svg>`
}

/** 提灯をつなぐ紐 */
const arcString = () =>
  Array.from({ length: 8 }, (_, i) => {
    const a = i * 45 + 22.5
    const b = a + 45
    const [x1, y1] = polar(258 - 33, a)
    const [x2, y2] = polar(258 - 33, b)
    const [mx, my] = polar(238, a + 22.5)
    return `<path d="M${x1} ${y1}Q${mx} ${my} ${x2} ${y2}" stroke="#3a2a1a" stroke-width="1.4" fill="none" opacity=".8"/>`
  }).join("")

const gachaCircuit = (t) => {
  const s = METAL.silver
  const r = rng(81)
  const traces = Array.from({ length: 28 }, (_, i) => {
    const d = i * (360 / 28) + r() * 4
    const r1 = 214 + r() * 6
    const r2 = 232 + r() * 8
    const bend = d + (r() > 0.5 ? 5 : -5)
    return `<path d="M${pp(r1, d)}L${pp((r1 + r2) / 2, d)}L${pp((r1 + r2) / 2, bend)}L${pp(r2, bend)}" stroke="#2f6f8f" stroke-width="1.6" fill="none"/><circle cx="${polar(r2, bend)[0]}" cy="${polar(r2, bend)[1]}" r="2.2" fill="#5ad1ff"/>`
  }).join("")
  const pulses = [
    [217, 6, "#5ad1ff", 1],
    [227, 4, "#ff5ad8", -1],
    [237, 6, "#5ad1ff", 1],
  ]
    .map(([rr, n, c, dir]) =>
      Array.from({ length: n }, (_, i) => {
        const a = (i * 360) / n + dir * t * (360 / n)
        return `<path d="${arc(rr, f(a), f(a + 14))}" stroke="${c}" stroke-width="3.4" stroke-linecap="round" fill="none"/>`
      }).join(""),
    )
    .join("")
  const chip = `<rect x="-14" y="-10" width="28" height="20" rx="2" fill="#10202e" stroke="#5ad1ff" stroke-width="1.6"/>${[-9, -3, 3, 9].map((x) => `<path d="M${x}-10V-15M${x} 10V15" stroke="#9fb8c8" stroke-width="1.6"/>`).join("")}<rect x="-7" y="-5" width="14" height="10" fill="#5ad1ff" opacity=".35"/>`
  const chips = [0, 90, 180, 270].map((d, i) => place(...polar(227, d), d, 1, chip.replace('opacity=".35"', `opacity="${f(0.25 + 0.6 * flash(t, i / 4))}"`))).join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" ${PLAN_VIEW}>${planDefs([s], AURORA_DEF)}
  ${auroraGlow(t, ["#4fd0ff", "#ff5ad8", "#7b5cff"], { r: 256, w: 32, opacity: 0.45 })}
  <g filter="url(#ds)">
    ${ring(227, 34, "#0b1724")}${traces}
    ${metalBand(245, 4, s, { shift: wave(t) * 12, layers: 2 })}${metalBand(209, 4, s, { shift: wave(t) * 12, layers: 2 })}
  </g>
  <g filter="url(#glow)">${pulses}</g>${chips}
  ${twinkles(t, [[262, 45, 0.8, 0.1], [262, 165, 0.8, 0.45], [262, 285, 0.8, 0.8]], "#e0f8ff")}</svg>`
}

/* SSR */

const goldBlossom = (fill, core) =>
  `${[0, 72, 144, 216, 288].map((a) => `<path d="M0 0C-11-8-14-23-7-33-4-37-1-34 0-30 1-34 4-37 7-33 14-23 11-8 0 0Z" transform="rotate(${a})" fill="${fill}" stroke="#7d5207" stroke-width="1"/>`).join("")}<circle r="6.5" fill="${core}"/>${[0, 72, 144, 216, 288].map((a) => `<circle cx="${polar(10, a + 36, 0, 0)[0]}" cy="${polar(10, a + 36, 0, 0)[1]}" r="1.6" fill="#fffadd"/>`).join("")}`

const gachaMakie = (t) => {
  const g = METAL.gold
  const blossoms = Array.from({ length: 10 }, (_, i) => {
    const d = i * 36 + 18
    return place(...polar(225, d), d + t * 72, i % 2 ? 0.42 : 0.55, goldBlossom("url(#gmkG)", g[1]))
  }).join("")
  const stream = [0, 1]
    .map((k) => `<path d="${wobblyRing(225 + (k ? 7 : -7), 3, 6, k * 2 + t * TAU)}" stroke="${g[4]}" stroke-width="1.4" fill="none" opacity=".75"/>`)
    .join("")
  const branch = `<path d="M-120 18C-80 0-40-14 0-18 40-14 80 0 120 18M-60 2C-58-14-50-22-40-28M50 2C52-12 60-20 72-24" stroke="#4a2a14" stroke-width="5" fill="none" stroke-linecap="round"/>${[[-96, 8, 0.7], [-64, -4, 0.85], [-38, -24, 0.65], [-20, -14, 0.95], [16, -16, 0.8], [44, -10, 0.9], [70, -22, 0.65], [98, 8, 0.75], [0, -22, 1.1]].map(([x, y, s], i) => place(x, y, i * 23 + wave(t, i / 9) * 6, s * 0.62, blossom())).join("")}`
  const r = rng(91)
  const petals = Array.from({ length: 16 }, () => {
    const off = r()
    const p = (t + off) % 1
    const d = r() * 360
    const [x0, y0] = polar(250 + r() * 40, d)
    return place(x0 + Math.sin(TAU * (p + off)) * 10, y0 + p * 70 - 35, p * 360 + off * 360, 0.7, looseP, `opacity="${f(Math.sin(Math.PI * p))}"`)
  }).join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" ${PLAN_VIEW}>${planDefs([g, METAL.onyx], AURORA_DEF + rayDef("rayM", "#ffe0ec") + lg("petal", ["#fff3f7", "#ffc1d6", "#ff8fb4"]) + lg("gmkG", ["#fffadd", "#ffe58c", "#e9bd42", "#b9860e"]) + '<radialGradient id="gmkM" cx=".4" cy=".4"><stop offset="0" stop-color="#fffbe8"/><stop offset=".7" stop-color="#ffe7a0"/><stop offset="1" stop-color="#f2c45a"/></radialGradient>')}
  ${auroraGlow(t, ["#ffb3cf", "#ffd76a", "#ff8fb4", "#fff0b8"], { r: 258, w: 44, opacity: 0.7 })}
  ${lightRays(t, 18, "rayM", { long: 300, short: 280, opacity: 0.6 })}
  <circle cx="${polar(270, -32)[0]}" cy="${polar(270, -32)[1]}" r="36" fill="#fff4c8" opacity=".55" filter="url(#glow2)"/>
  <circle cx="${polar(270, -32)[0]}" cy="${polar(270, -32)[1]}" r="28" fill="url(#gmkM)"/>
  <g filter="url(#ds)">
    ${ring(225, 34, METAL.onyx[1])}${metalBand(225, 30, METAL.onyx, { shift: wave(t) * 10, layers: 3 })}
    ${stream}${blossoms}
    ${metalBand(243, 6, g, { shift: wave(t) * 12, layers: 2 })}${metalBand(207, 6, g, { shift: wave(t) * 12, layers: 2 })}
    ${setGem(...polar(244, 180), 12, g, GEM.pink, t, 0.5, 0.9)}
    ${place(C, 6, 0, 1, branch)}
  </g>
  ${petals}
  ${glint(...polar(244, 180), 1, flash(t, 0.5))}${glint(C, -16, 1.2, flash(t, 0))}
  ${twinkles(t, [[290, 90, 0.8, 0.25], [290, 270, 0.8, 0.75]], "#fff0f7")}</svg>`
}

const gachaGlassButterfly = (t) => {
  const p = METAL.platinum
  const spots = [[262, 0, 1.15, 0], [258, 52, 0.75, 0.2], [258, -52, 0.75, 0.6], [256, 110, 0.8, 0.35], [256, -110, 0.8, 0.85], [260, 160, 0.7, 0.5], [260, -160, 0.7, 0.1]]
  const flies = spots
    .map(([r, d, s, ph], i) => {
      const bob = Math.sin(TAU * (t + ph)) * 5
      return place(...polar(r + bob, d), d + Math.sin(TAU * (t + ph)) * 8, s * 1.15, butterfly(t, i % 2 ? "gbfA" : "gbfB", i % 2 ? "gbfC" : "gbfD", ph))
    })
    .join("")
  const vine = Array.from({ length: 12 }, (_, i) => place(...polar(236, i * 30 + 15), i * 30 + 15 + (i % 2 ? 60 : -60), 0.6, leaf(i % 2 ? "#bfe8d8" : "#d8d0ff"))).join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" ${PLAN_VIEW}>${planDefs([p], AURORA_DEF + rayDef("rayG", "#f0e6ff") +
    lg("gbfA", ["#c8fff4", "#8fd6ff", "#c9a8ff"], 1, 1) + lg("gbfB", ["#ffe0f4", "#ff9fd8", "#b98cff"], 1, 1) + lg("gbfC", ["#e0fff8", "#9fe9ff"], 1, 1) + lg("gbfD", ["#fff0fa", "#ffc8ec"], 1, 1))}
  ${auroraGlow(t, ["#9ff0ff", "#d8a8ff", "#ffb8e8", "#a8c8ff"], { r: 258, w: 46, opacity: 0.75 })}
  ${lightRays(t, 18, "rayG", { long: 300, short: 280, opacity: 0.6 })}
  <g mask="url(#behind)">${risingDust(t, 12, { r: 240, rise: 70, color: "#f4ecff", seed: 101 })}</g>
  <g filter="url(#ds)">
    ${ring(224, 24, p[0])}${iridescentBand(224, 18, ["#c8f6ff", "#e0c8ff", "#ffd0f0", "#c8e0ff"], { shift: wave(t) * 40 })}
    ${milgrain(238.5, 2.2, 90, p, wave(t) * 12)}${milgrain(209.5, 2, 84, p, wave(t) * 12)}
    ${vine}
    ${setGem(...polar(240, 180), 13, p, GEM.amethyst, t, 0.4, 0.88)}
  </g>
  <g opacity=".9">${flies}</g>
  ${glint(...polar(240, 180), 1, flash(t, 0.55))}${glint(...polar(262, 0), 1.2, 0.3 + 0.7 * flash(t, 0))}
  ${twinkles(t, [[226, 90, 0.8, 0.2], [226, 270, 0.8, 0.7]], "#fff")}</svg>`
}

const gachaSunMoon = (t) => {
  const g = METAL.gold
  const s = METAL.platinum
  const sunAt = polar(262, -48)
  const moonAt = polar(262, 48)
  const sunRays = Array.from({ length: 12 }, (_, i) => `<path d="M-5-30L0-46 5-30Z" fill="${g[3]}" stroke="${g[1]}" stroke-width="1" transform="rotate(${f(i * 30 + t * 30)})"/>`).join("") + Array.from({ length: 12 }, (_, i) => `<path d="M-3-28L0-38 3-28Z" fill="${g[4]}" transform="rotate(${f(i * 30 + 15 - t * 30)})"/>`).join("")
  const sun = `<circle r="40" fill="#ffd36b" opacity=".45" filter="url(#glow2)"/>${sunRays}<circle r="27" fill="url(#gsmS)" stroke="${g[1]}" stroke-width="1.6"/><circle r="20" fill="none" stroke="${g[5]}" stroke-width="1.2" opacity=".7"/>`
  const moon = `<circle r="40" fill="#8fb0ff" opacity=".55" filter="url(#glow2)"/><g transform="rotate(-20) scale(1.25)"><path d="M6-26A26 26 0 1 0 6 26A32 32 0 0 1 6-26Z" fill="url(#gsmM)" stroke="#5a6fa8" stroke-width="1.6"/><circle cx="-12" cy="-6" r="3" fill="#9fb0d8" opacity=".5"/><circle cx="-8" cy="10" r="2.2" fill="#9fb0d8" opacity=".5"/></g>`
  const stars = [[292, 84, 11], [282, 108, 7], [298, 128, 9], [280, 20, 6], [300, 150, 6]].map(([r, d, z], i) => place(...polar(r, d), 0, 0.6 + 0.4 * Math.max(0, wave(t, i / 5)), star5(z, "#f4f7ff", "#7f93d0", 1.2))).join("")
  const flames = [[288, -78], [284, -104], [292, -126], [278, -18]].map(([r, d], i) => place(...polar(r, d), d, 0.6 + 0.3 * Math.max(0, wave(t, i / 4)), `<path d="M0-12C5-4 7 4 0 10-7 4-5-4 0-12Z" fill="#ffb347"/><path d="M0-6C2-2 3 3 0 6-3 3-2-2 0-6Z" fill="#fff3c4"/>`)).join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" ${PLAN_VIEW}>${planDefs([g, s], AURORA_DEF + rayDef("raySM", "#fff6e0") +
    '<radialGradient id="gsmS" cx=".4" cy=".35"><stop offset="0" stop-color="#fffadd"/><stop offset=".6" stop-color="#ffd34a"/><stop offset="1" stop-color="#e08a12"/></radialGradient><radialGradient id="gsmM" cx=".3" cy=".35"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#e4ecff"/><stop offset="1" stop-color="#a8bcf0"/></radialGradient>')}
  ${auroraGlow(t, ["#ffd36b", "#ffb15c", "#a8b8ff", "#d8e2ff"], { r: 258, w: 46, opacity: 0.7 })}
  ${lightRays(t, 20, "raySM", { long: 302, short: 282, opacity: 0.6 })}
  <g filter="url(#ds)">
    ${ring(224, 28, "#1c1a2e")}
    ${metalBand(224, 22, g, { shift: wave(t) * 12, from: 180, to: 360 })}${metalBand(224, 22, s, { shift: wave(t) * 12, from: 0, to: 180 })}
    ${milgrain(238.5, 2.2, 90, g, wave(t) * 12)}${milgrain(209.5, 2, 84, s, wave(t) * 12)}
    ${setGem(...polar(240, 180), 13, s, GEM.sapphire, t, 0.5, 0.88)}${setGem(...polar(240, 0), 11, g, GEM.topaz, t, 0, 0.88)}
  </g>
  ${flames}${stars}
  ${place(...sunAt, 0, 1.15, sun)}${place(...moonAt, 0, 1, moon)}
  ${glint(...polar(240, 180), 1, flash(t, 0.5))}${glint(...polar(240, 0), 1, flash(t, 0))}
  ${twinkles(t, [[226, 90, 0.8, 0.2], [226, 270, 0.8, 0.7]], "#fff")}</svg>`
}

/* UR */

const prismAt = (k) => {
  const h = (((k % 1) + 1) % 1) * PRISM.length
  return mixHex(PRISM[Math.floor(h) % PRISM.length], PRISM[(Math.floor(h) + 1) % PRISM.length], h - Math.floor(h))
}

const gachaKyubi = (t) => {
  const p = METAL.platinum
  const tails = Array.from({ length: 9 }, (_, i) => {
    const d = 180 + (i - 4) * 23
    const sway = wave(t, i / 9) * 5
    const tip = prismAt(i / 9 + t)
    const id = `gky${i}`
    const grad = `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="-150"><stop offset="0" stop-color="#ffffff"/><stop offset=".45" stop-color="#fffaf4"/><stop offset=".75" stop-color="${mixHex(tip, "#ffffff", 0.4)}"/><stop offset="1" stop-color="${tip}"/></linearGradient>`
    // ふさふさの尾。先は外側（中心の尾から離れる向き）へ曲げる
    const bend = i < 4 ? -1 : i > 4 ? 1 : 0
    const body = `<g transform="scale(${bend < 0 ? -1 : 1} 1)"><path d="M-18 0C-40-30-50-78-34-118-26-138-6-152 14-150 30-148 40-136 34-126 26-134 14-132 12-122 30-110 36-84 30-56 26-32 18-14 18 0Z" fill="url(#${id})" stroke="#d6cbe6" stroke-width="1.8" stroke-linejoin="round"/><path d="M-6-14C-20-44-24-80-14-110M8-18C14-46 14-72 8-96M-20-60C-26-74-28-90-24-104" stroke="#e6dcf3" stroke-width="1.6" fill="none" stroke-linecap="round"/></g>`
    return { grad, g: place(...polar(218, d), d + sway + bend * 10, i === 4 ? 0.82 : 0.78 - Math.abs(i - 4) * 0.02, body) }
  })
  const ear = (side) => `<g transform="translate(${polar(226, side * 36)[0]} ${polar(226, side * 36)[1]}) rotate(${side * 36}) scale(1.7)"><path d="M-22 8L-3-56Q0-62 3-56L22 8Z" fill="#fff" stroke="#a898c8" stroke-width="1.8" stroke-linejoin="round"/><path d="M-12 4L-1-38Q0-41 1-38L12 4Z" fill="url(#gkyE)"/><path d="M-3-56Q0-62 3-56L6-46-6-46Z" fill="${prismAt(t + (side > 0 ? 0.5 : 0))}"/></g>`
  const fires = Array.from({ length: 6 }, (_, i) => {
    const d = i * 60 + t * 60
    const c = prismAt(i / 6 + t)
    const k = 0.85 + 0.15 * Math.sin(TAU * (t * 3 + i / 6))
    return place(...polar(292, d), 0, k * 1.6, `<path d="M0-18C8-6 11 6 0 13-11 6-8-6 0-18Z" fill="${c}" opacity=".9"/><path d="M0-8C4-2 5 4 0 8-5 4-4-2 0-8Z" fill="#fff"/>`)
  }).join("")
  const stones = Array.from({ length: 5 }, (_, i) => setGem(...polar(224, (i - 2) * 26), i === 2 ? 12 : 7, p, GEM[["ruby", "topaz", "diamond", "sapphire", "amethyst"][i]], t, i * 0.2)).join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" ${PLAN_VIEW}>${planDefs([p], AURORA_DEF + rayDef("rayK", "#ffffff") + tails.map((x) => x.grad).join("") + lg("gkyE", ["#ffd0ec", "#ff9fd8", "#c9a8ff"]))}
  ${auroraGlow(t, PRISM, { r: 262, w: 56, opacity: 0.9 })}
  ${lightRays(t, 32, "rayK", { long: 322, short: 292, opacity: 0.85 })}
  <g mask="url(#behind)">${risingDust(t, 28, { r: 236, rise: 130, color: "#ffffff", seed: 111 })}</g>
  <g filter="url(#ds)">
    <g mask="url(#behind)">${tails.map((x) => x.g).join("")}${ear(-1)}${ear(1)}</g>
    ${ring(224, 30, p[0])}${iridescentBand(224, 22, PRISM, { shift: t * 360 })}
    ${milgrain(240.5, 2.4, 96, p, wave(t) * 12)}${milgrain(207.5, 2.2, 90, p, wave(t) * 12)}
    ${stones}
    ${Array.from({ length: 2 }, (_, i) => place(...polar(240, 180 + (i ? 30 : -30)), 0, 1, `<circle r="9" fill="#fff" stroke="${p[1]}" stroke-width="1.6"/><path d="M-5 0H5M0-5V5" stroke="${prismAt(t + i * 0.5)}" stroke-width="2.4"/>`)).join("")}
  </g>
  <g filter="url(#glow)">${fires}</g>
  ${glint(...polar(224, 0), 1.6, 0.4 + 0.6 * flash(t, 0))}
  ${twinkles(t, [[304, 40, 1, 0.1], [304, 320, 1, 0.6], [300, 90, 0.9, 0.35], [300, 270, 0.9, 0.85]], "#fff")}</svg>`
}

const lotusPetal = (stops, len, w, k) =>
  `<path d="M0 0C${-w} ${f(-len * 0.3)} ${f(-w * 0.8)} ${f(-len * 0.8)} 0 ${-len}C${f(w * 0.8)} ${f(-len * 0.8)} ${w} ${f(-len * 0.3)} 0 0Z" fill="${ramp(stops, 0.35 + 0.45 * k)}" stroke="${stops[1]}" stroke-width="1.2"/><path d="M0 -4C${f(-w * 0.45)} ${f(-len * 0.35)} ${f(-w * 0.35)} ${f(-len * 0.75)} 0 ${f(-len + 6)}" stroke="${stops[5]}" stroke-width="1.6" fill="none" opacity="${f(0.4 + 0.5 * k)}"/><path d="M0-6V${f(-len + 10)}" stroke="${stops[2]}" stroke-width="1" opacity=".6"/>`

const gachaLotus = (t) => {
  const p = METAL.platinum
  const g = METAL.gold
  const outer = Array.from({ length: 16 }, (_, i) => {
    const d = i * 22.5
    const k = 0.5 + 0.5 * Math.sin(TAU * (t - i / 16))
    return place(...polar(214, d), d + wave(t, i / 16) * 2, 1, lotusPetal(tone(prismAt(i / 16 + t * 0.5)), 92, 22, k))
  }).join("")
  const inner = Array.from({ length: 16 }, (_, i) => {
    const d = i * 22.5 + 11.25
    const k = 0.5 + 0.5 * Math.sin(TAU * (t - i / 16 - 0.25))
    return place(...polar(218, d), d, 1, lotusPetal(tone(mixHex(prismAt(i / 16 + t * 0.5 + 0.08), "#ffffff", 0.35)), 64, 17, k))
  }).join("")
  const mandala = `<g transform="rotate(${f(t * 30)} ${C} ${C})">${ring(318, 1.4, g[3], 'opacity=".6"')}${Array.from({ length: 24 }, (_, i) => `<circle cx="${polar(318, i * 15)[0]}" cy="${polar(318, i * 15)[1]}" r="${i % 2 ? 2 : 3.4}" fill="${g[4]}" opacity=".85"/>`).join("")}</g>`
  const topLotus = `${[-60, -30, 30, 60].map((a, i) => `<g transform="rotate(${a})">${lotusPetal(tone(prismAt(i / 4 + t)), 46, 13, 0.6 + 0.4 * flash(t, i / 4))}</g>`).join("")}${[-18, 18].map((a, i) => `<g transform="rotate(${a})">${lotusPetal(tone(mixHex(prismAt(i / 2 + t + 0.3), "#ffffff", 0.3)), 52, 14, 0.8)}</g>`).join("")}${lotusPetal(tone("#ffffff"), 56, 14, 0.9)}`
  const stones = Array.from({ length: 7 }, (_, i) => setGem(...polar(224, 180 + (i - 3) * 22), i === 3 ? 12 : 7.5, g, GEM[["ruby", "topaz", "emerald", "diamond", "sapphire", "amethyst", "pink"][i]], t, i * 0.13)).join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" ${PLAN_VIEW}>${planDefs([p, g], AURORA_DEF + rayDef("rayL", "#ffffff"))}
  ${auroraGlow(t, PRISM, { r: 262, w: 56, opacity: 0.9 })}
  ${lightRays(t, 32, "rayL", { long: 322, short: 292, opacity: 0.8 })}
  ${mandala}
  <g mask="url(#behind)">${risingDust(t, 28, { r: 240, rise: 130, color: "#ffffff", seed: 121 })}</g>
  <g filter="url(#ds)">
    <g mask="url(#behind)">${outer}${inner}</g>
    ${ring(224, 28, g[0])}${iridescentBand(224, 20, PRISM, { shift: t * 360 })}
    ${milgrain(239.5, 2.4, 96, g, wave(t) * 12)}${milgrain(208.5, 2.2, 90, g, wave(t) * 12)}
    ${stones}
    ${place(...polar(238, 0), 0, 1, topLotus)}
    ${setGem(...polar(238, 0), 10, g, GEM.diamond, t, 0, 0.9)}
  </g>
  ${orbiters(t, 6, 278, ["#ff9fe0", "#7fe0ff", "#ffe66b"])}
  ${glint(...polar(238, 0), 1.8, 0.4 + 0.6 * flash(t, 0))}${glint(...polar(224, 180), 1.2, flash(t, 0.5))}
  ${twinkles(t, [[304, 40, 1, 0.1], [304, 320, 1, 0.6], [296, 140, 0.9, 0.35], [296, 220, 0.9, 0.85]], "#fff")}</svg>`
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
  { slug: "shortcake", priceCoins: 800, category: "sweets", name: "いちごのショートケーキ", description: "スポンジとホイップの輪に、苺がたっぷり", draw: shortcake },
  { slug: "shortcake-heaps", priceCoins: 1500, category: "sweets", name: "ショートケーキまみれ", description: "ショートケーキと苺とクリームで埋めつくす", draw: shortcakeHeaps },
  { slug: "yumekawa", priceCoins: 500, category: "cute", name: "ゆめかわ星空", description: "パステルの虹色の輪に、星と雲と三日月", draw: yumekawa },
  { slug: "bear", priceCoins: 500, category: "cute", name: "くま耳リボン", description: "まるいくま耳とリボン、肉球", draw: bearEars },
  { slug: "garland", priceCoins: 300, category: "cute", name: "ハートのガーランド", description: "パステルの旗とハートのガーランド", draw: garland },
  { slug: "chrome-spikes", priceCoins: 1000, category: "cool", name: "クロームスパイク", description: "銀のとげと鋲が並ぶ、重いクロームの輪", draw: chromeSpikes },
  { slug: "phoenix", priceCoins: 2000, category: "cool", name: "紅蓮の不死鳥", description: "燃える翼を広げる不死鳥と舞う火の粉", draw: phoenix },
  { slug: "blades", priceCoins: 1500, category: "cool", name: "双刃", description: "背中で交差する二振りの刀と走る剣閃", draw: crossedBlades },
  { slug: "special-seraph", priceCoins: 10000, premiumCoinsOnly: true, frames: 24, frameMs: 150, category: "special", name: "黄金の天翼", description: "金の翼と光の輪、ダイヤを敷き詰めた金の輪", draw: specialSeraph },
  { slug: "special-jewels", priceCoins: 8000, premiumCoinsOnly: true, frames: 24, frameMs: 150, category: "special", name: "七宝の星冠", description: "八色の宝石と王冠、輪をめぐる虹色の光", draw: specialJewels },
  { slug: "special-bloom", priceCoins: 5000, premiumCoinsOnly: true, frames: 24, frameMs: 150, category: "special", name: "宝石の花冠", description: "色石の花と真珠、エメラルドの葉の花冠", draw: specialBloom },
  { slug: "gacha-n-dots", rarity: "N", frames: 24, frameMs: 150, gachaOnly: true, category: "gacha", name: "水玉リング", description: "パステルの輪にめぐる白い水玉", draw: gachaDots },
  { slug: "gacha-n-stardust", rarity: "N", frames: 24, frameMs: 150, gachaOnly: true, category: "gacha", name: "星くずリング", description: "夜色の輪に小さな星", draw: gachaStardust },
  { slug: "gacha-n-candy", rarity: "N", frames: 24, frameMs: 150, gachaOnly: true, category: "gacha", name: "キャンディストライプ", description: "赤と水色のしましまが回る輪", draw: gachaCandy },
  { slug: "gacha-r-clover", rarity: "R", frames: 24, frameMs: 150, gachaOnly: true, category: "gacha", name: "四つ葉のクローバー", description: "三つ葉の輪のてっぺんに、四つ葉がひとつ", draw: gachaClover },
  { slug: "gacha-r-shooting-star", rarity: "R", frames: 24, frameMs: 150, gachaOnly: true, category: "gacha", name: "流れ星", description: "尾を引いて輪をめぐる三つの流れ星", draw: gachaShootingStar },
  { slug: "gacha-r-sunflower", rarity: "R", frames: 24, frameMs: 150, gachaOnly: true, category: "gacha", name: "ひまわり", description: "葉の輪に咲くひまわり", draw: gachaSunflower },
  { slug: "gacha-sr-amethyst", rarity: "SR", frames: 24, frameMs: 150, gachaOnly: true, category: "gacha", name: "紫水晶の結晶", description: "銀の輪から伸びるアメジストの結晶", draw: gachaAmethyst },
  { slug: "gacha-sr-constellation", rarity: "SR", frames: 24, frameMs: 150, gachaOnly: true, category: "gacha", name: "星座の輪", description: "夜空の輪をめぐる金の星座", draw: gachaConstellation },
  { slug: "gacha-sr-stained-glass", rarity: "SR", frames: 24, frameMs: 150, gachaOnly: true, category: "gacha", name: "ステンドグラス", description: "光が移ろう七色のステンドグラス", draw: gachaStainedGlass },
  { slug: "gacha-ssr-ice-queen", rarity: "SSR", frames: 24, frameMs: 150, gachaOnly: true, category: "gacha", name: "氷晶の女王冠", description: "氷の結晶と白金の王冠、雪とオーロラ", draw: gachaIceQueen },
  { slug: "gacha-ssr-clockwork", rarity: "SSR", frames: 24, frameMs: 150, gachaOnly: true, category: "gacha", name: "時計仕掛けの金環", description: "回る歯車と時計の文字盤、四色の宝石", draw: gachaClockwork },
  { slug: "gacha-ssr-pearl-sea", rarity: "SSR", frames: 24, frameMs: 150, gachaOnly: true, category: "gacha", name: "深海の真珠", description: "真珠と貝殻、ゆれる海藻と立ちのぼる泡", draw: gachaPearlSea },
  { slug: "gacha-ur-prism-seraph", rarity: "UR", frames: 24, frameMs: 150, gachaOnly: true, category: "gacha", name: "虹翼の熾天使", description: "虹色に移ろう翼と光の輪、七色の宝石", draw: gachaPrismSeraph },
  { slug: "gacha-ur-star-crown", rarity: "UR", frames: 24, frameMs: 150, gachaOnly: true, category: "gacha", name: "星海の王冠", description: "めぐる惑星と星雲の輪、白金の王冠", draw: gachaStarCrown },
  { slug: "gacha-n-gingham", rarity: "N", frames: 24, frameMs: 150, gachaOnly: true, category: "gacha", name: "ギンガムチェック", description: "ピンクのチェックの輪と、てっぺんのリボン", draw: gachaGingham },
  { slug: "gacha-n-lemon", rarity: "N", frames: 24, frameMs: 150, gachaOnly: true, category: "gacha", name: "レモンソーダ", description: "ソーダ色の輪をめぐる輪切りのレモンと泡", draw: gachaLemon },
  { slug: "gacha-n-crayon", rarity: "N", frames: 24, frameMs: 150, gachaOnly: true, category: "gacha", name: "クレヨンの輪", description: "六色のクレヨンでぐるぐる描いた輪", draw: gachaCrayon },
  { slug: "gacha-r-cherry", rarity: "R", frames: 24, frameMs: 150, gachaOnly: true, category: "gacha", name: "さくらんぼ", description: "葉の輪にゆれる、ふたつ並びのさくらんぼ", draw: gachaCherry },
  { slug: "gacha-r-paper-plane", rarity: "R", frames: 24, frameMs: 150, gachaOnly: true, category: "gacha", name: "紙飛行機", description: "空色の輪を飛ぶ紙飛行機と雲", draw: gachaPaperPlane },
  { slug: "gacha-r-ladybug", rarity: "R", frames: 24, frameMs: 150, gachaOnly: true, category: "gacha", name: "てんとう虫のお散歩", description: "葉と花の輪を歩くてんとう虫", draw: gachaLadybug },
  { slug: "gacha-sr-jellyfish", rarity: "SR", frames: 24, frameMs: 150, gachaOnly: true, category: "gacha", name: "夜光くらげ", description: "深い海の輪をただよう光るくらげ", draw: gachaJellyfish },
  { slug: "gacha-sr-lanterns", rarity: "SR", frames: 24, frameMs: 150, gachaOnly: true, category: "gacha", name: "夏祭りの提灯", description: "夜空の輪に灯る提灯と蛍", draw: gachaLanterns },
  { slug: "gacha-sr-circuit", rarity: "SR", frames: 24, frameMs: 150, gachaOnly: true, category: "gacha", name: "電脳回路", description: "回路を走る水色と桃色の光", draw: gachaCircuit },
  { slug: "gacha-ssr-makie", rarity: "SSR", frames: 24, frameMs: 150, gachaOnly: true, category: "gacha", name: "金蒔絵の夜桜", description: "漆黒の輪に金の桜、満月と舞う花びら", draw: gachaMakie },
  { slug: "gacha-ssr-glass-butterfly", rarity: "SSR", frames: 24, frameMs: 150, gachaOnly: true, category: "gacha", name: "硝子の蝶", description: "透きとおる蝶が舞う、白金と虹色の輪", draw: gachaGlassButterfly },
  { slug: "gacha-ssr-sun-moon", rarity: "SSR", frames: 24, frameMs: 150, gachaOnly: true, category: "gacha", name: "日輪と月輪", description: "金の太陽と銀の月、半分ずつの金銀の輪", draw: gachaSunMoon },
  { slug: "gacha-ur-kyubi", rarity: "UR", frames: 24, frameMs: 150, gachaOnly: true, category: "gacha", name: "九尾の白狐", description: "虹に染まる九本の尾と狐耳、めぐる狐火", draw: gachaKyubi },
  { slug: "gacha-ur-lotus", rarity: "UR", frames: 24, frameMs: 150, gachaOnly: true, category: "gacha", name: "七彩の蓮華", description: "七色に移ろう蓮の花びらと回る曼荼羅", draw: gachaLotus },
]

export const DECORATIONS = decorations.map((item) => ({
  ...item,
  draw: withCanvas(item.draw),
}))

/** ヘッダーの枠（scripts/header-frames）でも同じ部品を使う */
export const PARTS = { f, rng, wave, place, sparkle, glint, flash, blossom, looseP, goldBlossom, star5, setGem, pearl, bezelDef, PEARL_DEF, METAL, GEM, PRISM, prismAt, mixHex, ramp, lg, TAU }
