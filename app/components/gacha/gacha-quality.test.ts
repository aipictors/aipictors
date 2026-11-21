import { describe, expect, test } from "bun:test"
import {
  estimateMbps,
  pickGachaQuality,
} from "~/components/gacha/gacha-quality"

/** bytes を ms で読んだファイル */
const sample = (bytes: number, ms: number) => ({
  transferSize: bytes,
  duration: ms,
})

describe("回線の速さの見積もり", () => {
  test("小さいファイルとキャッシュは使わない", () => {
    expect(estimateMbps([sample(1000, 10), sample(0, 100)])).toBeNull()
  })

  test("速いほうの半分の真ん中", () => {
    // 1MB を 1 秒 = 8Mbps、1MB を 2 秒 = 4Mbps、1MB を 8 秒 = 1Mbps
    expect(
      estimateMbps([
        sample(1_000_000, 1000),
        sample(1_000_000, 2000),
        sample(1_000_000, 8000),
      ]),
    ).toBeCloseTo(8, 6)
  })
})

describe("演出の重さ", () => {
  test("データセーバー・2G はカードだけ", () => {
    expect(pickGachaQuality({ connection: { saveData: true } })).toBe("card")
    expect(pickGachaQuality({ connection: { effectiveType: "2g" } })).toBe(
      "card",
    )
  })

  test("3G は軽いモデル", () => {
    expect(pickGachaQuality({ connection: { effectiveType: "3g" } })).toBe(
      "lite",
    )
  })

  test("downlink で決める", () => {
    expect(
      pickGachaQuality({ connection: { effectiveType: "4g", downlink: 10 } }),
    ).toBe("full")
    expect(
      pickGachaQuality({ connection: { effectiveType: "4g", downlink: 2 } }),
    ).toBe("lite")
    expect(
      pickGachaQuality({ connection: { effectiveType: "4g", downlink: 0.5 } }),
    ).toBe("card")
  })

  test("connection がない（iPhone）ときは読み込んだファイルから", () => {
    expect(pickGachaQuality({ samples: [sample(1_000_000, 500)] })).toBe("full")
    expect(pickGachaQuality({ samples: [sample(1_000_000, 4000)] })).toBe(
      "lite",
    )
    expect(pickGachaQuality({ samples: [sample(1_000_000, 20_000)] })).toBe(
      "card",
    )
  })

  test("何もわからなければふつうの演出", () => {
    expect(pickGachaQuality({})).toBe("full")
  })
})
