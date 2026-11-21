import { describe, expect, test } from "bun:test"
import {
  type GachaItem,
  type GachaRarity,
  hintOf,
  planGachaDirection,
} from "~/components/gacha/gacha-direction"

const items = (...rarities: GachaRarity[]): GachaItem[] =>
  rarities.map((rarity, i) => ({
    id: String(i),
    rarity,
    name: rarity,
    imageUrl: "",
  }))

/** 決まった値を順に返す */
const seq = (...values: number[]) => {
  let i = 0
  return () => values[i++ % values.length]
}

describe("planGachaDirection", () => {
  test("いちばん上のレア度で色を決める", () => {
    const direction = planGachaDirection(
      items("N", "R", "SR", "N"),
      seq(0.99, 0.99),
    )
    expect(direction.top).toBe("SR")
    expect(direction.hint).toBe("purple")
    expect(direction.promoteTo).toBeNull()
    expect(direction.cutIn).toBe(false)
  })

  test("昇格するときは 1 つ下の色から始めて本来の色になる", () => {
    const direction = planGachaDirection(items("UR"), seq(0, 0.99))
    expect(direction.hint).toBe("gold")
    expect(direction.promoteTo).toBe("rainbow")
  })

  test("UR は必ず確定カットイン", () => {
    for (const r of [0, 0.5, 0.999]) {
      const direction = planGachaDirection(items("N", "UR"), seq(0.99, r))
      expect(direction.cutIn).toBe(true)
      expect(direction.cutInLabel).toBe("UR 確定")
    }
  })

  test("N・R は昇格もカットインもしない", () => {
    const direction = planGachaDirection(items("N", "R"), seq(0, 0))
    expect(direction.hint).toBe("blue")
    expect(direction.promoteTo).toBeNull()
    expect(direction.cutIn).toBe(false)
  })

  test("予告の色は本来の色を超えない", () => {
    for (const rarity of ["N", "R", "SR", "SSR", "UR"] as const) {
      for (let i = 0; i < 50; i++) {
        const direction = planGachaDirection(items(rarity))
        const order = ["blue", "purple", "gold", "rainbow"]
        expect(order.indexOf(direction.hint)).toBeLessThanOrEqual(
          order.indexOf(hintOf(rarity)),
        )
        expect(
          direction.promoteTo === null ||
            direction.promoteTo === hintOf(rarity),
        ).toBe(true)
      }
    }
  })
})
