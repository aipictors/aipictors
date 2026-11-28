import { beforeEach, describe, expect, test } from "bun:test"
import {
  buildClsExtra,
  CLS_TARGET_MAX,
  createClsGate,
  estimatesFor,
  isSampledSession,
  noteClsRoute,
  resetClsRoutesForTest,
  routeAt,
  selectorFor,
  truncateSelector,
} from "~/utils/cls-attribution"

describe("createClsGate", () => {
  test("閾値未満は送らない・閾値ちょうどは送る", () => {
    const gate = createClsGate(0.05)
    expect(gate("a", 0.049)).toBe(false)
    expect(gate("a", 0.05)).toBe(true)
  })

  test("同じ計測は 1 回だけ、別の計測は別に送る", () => {
    const gate = createClsGate(0.05)
    expect(gate("a", 0.2)).toBe(true)
    expect(gate("a", 0.3)).toBe(false)
    expect(gate("b", 0.1)).toBe(true)
  })

  test("閾値未満で報告されたあと伸びたら送る", () => {
    const gate = createClsGate(0.05)
    expect(gate("a", 0.01)).toBe(false)
    expect(gate("a", 0.12)).toBe(true)
  })

  test("NaN は送らない", () => {
    expect(createClsGate()("a", Number.NaN)).toBe(false)
  })
})

describe("isSampledSession", () => {
  test("同じセッションは同じ結果", () => {
    for (const sid of ["abc123def", "zz99yy88", "q1w2e3r4t5"]) {
      expect(isSampledSession(sid, 0.2)).toBe(isSampledSession(sid, 0.2))
    }
  })

  test("0 と 1", () => {
    expect(isSampledSession("abc123def", 0)).toBe(false)
    expect(isSampledSession("abc123def", 1)).toBe(true)
  })

  test("おおよそ指定の割合になる", () => {
    let sampled = 0
    const total = 20000
    for (let i = 0; i < total; i++) {
      if (isSampledSession(`s${i.toString(36)}x`, 0.2)) sampled++
    }
    expect(sampled / total).toBeGreaterThan(0.18)
    expect(sampled / total).toBeLessThan(0.22)
  })

  test("セッション ID がなければ乱数で決める", () => {
    expect(isSampledSession("", 0.2, () => 0.1)).toBe(true)
    expect(isSampledSession("", 0.2, () => 0.5)).toBe(false)
  })
})

describe("truncateSelector", () => {
  test("短ければそのまま", () => {
    expect(truncateSelector("main>div.grid")).toBe("main>div.grid")
  })

  test("長ければ後ろを残して上限ちょうどにする", () => {
    const long = `${"div.a>".repeat(60)}img.thumb`
    const cut = truncateSelector(long)
    expect(cut.length).toBe(CLS_TARGET_MAX)
    expect(cut.startsWith("…")).toBe(true)
    expect(cut.endsWith("img.thumb")).toBe(true)
  })
})

describe("buildClsExtra", () => {
  test("値を丸めて短いキーで入れる", () => {
    const x = JSON.parse(
      buildClsExtra({
        target: "main>div",
        largestShiftValue: 0.123456,
        largestShiftTime: 1234.56,
        navigationType: "navigate",
        viewportWidth: 390,
        sampleRate: 0.2,
        estimates: [[2400, 1830, "a"]],
      }),
    )
    expect(x).toEqual({
      t: "main>div",
      v: 0.1235,
      at: 1235,
      nt: "navigate",
      vw: 390,
      sr: 20,
      cv: [[2400, 1830, "a"]],
    })
  })

  test("300 文字に収める（セレクタを縮め、要素側を残す）", () => {
    const json = buildClsExtra({
      target: `${"section.long-class-name>".repeat(20)}img.target`,
      largestShiftValue: 0.3,
      largestShiftTime: 100,
      navigationType: "back-forward-cache",
      viewportWidth: 1920,
      sampleRate: 0.2,
      estimates: [
        [2400, 1830, "a"],
        [1000, 1200, "b"],
        [1000, 1200, "b"],
        [1000, 1200, "i"],
      ],
    })
    expect(json.length).toBeLessThanOrEqual(300)
    const x = JSON.parse(json)
    expect(x.t.endsWith("img.target")).toBe(true)
    expect(x.cv.length).toBeGreaterThan(0)
  })
})

describe("routeAt", () => {
  beforeEach(() => resetClsRoutesForTest())

  test("ずれた時刻に表示していたルート", () => {
    noteClsRoute("/r", 0)
    noteClsRoute("/r/posts/1", 5000)
    noteClsRoute("/r", 9000)
    expect(routeAt(100, "/now")).toBe("/r")
    expect(routeAt(6000, "/now")).toBe("/r/posts/1")
    expect(routeAt(9500, "/now")).toBe("/r")
  })

  test("記録や時刻がなければ fallback", () => {
    expect(routeAt(100, "/now")).toBe("/now")
    noteClsRoute("/r", 0)
    expect(routeAt(undefined, "/now")).toBe("/now")
  })
})

describe("selectorFor / estimatesFor", () => {
  test("記号つきのクラスを除き、id で止め、見積もりの印を付ける", () => {
    document.body.innerHTML = `
      <div id="app"><main class="flex md:flex-row">
        <div data-cih="2400" class="w-[320px] grid gap-2"><img class="thumb rounded-md shadow"></div>
      </main></div>`
    const img = document.querySelector("img")
    expect(selectorFor(img)).toBe(
      "#app>main.flex>div.grid.gap-2[data-cih=2400]>img.thumb.rounded-md",
    )
  })

  test("見積もりと実際の高さ・ずれた要素との位置", () => {
    document.body.innerHTML = `
      <section data-cih="2400"><p id="inside">a</p></section>
      <footer id="after">b</footer>
      <section data-cih="1000"></section>`
    const estimates = estimatesFor(document.getElementById("after"))
    expect(estimates.map(([est, , pos]) => [est, pos])).toEqual([
      [2400, "a"],
      [1000, "b"],
    ])
    const inside = estimatesFor(document.getElementById("inside"))
    expect(inside[0]?.[2]).toBe("i")
    expect(typeof inside[0]?.[1]).toBe("number")
  })

  test("いちばん近い祖先を先頭に入れる（ページの後ろのほうでも）", () => {
    document.body.innerHTML = `
      <section data-cih="10"></section><section data-cih="20"></section>
      <section data-cih="30"></section><section data-cih="40"></section>
      <section data-cih="2400"><div data-cih="1000"><img id="t"></div></section>`
    const estimates = estimatesFor(document.getElementById("t"))
    expect(estimates.length).toBe(4)
    expect(estimates[0]?.[0]).toBe(1000)
    expect(estimates[0]?.[2]).toBe("i")
    expect(estimates.slice(1).map(([est]) => est)).toEqual([10, 20, 30])
  })
})
