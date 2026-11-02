import { describe, expect, test } from "bun:test"
import { estimateGeminiCoinUse } from "~/routes/($lang).generation._index/utils/premium-coin-confirm"

describe("estimateGeminiCoinUse", () => {
  test("枠の中ならフリーコインだけ", () => {
    expect(
      estimateGeminiCoinUse({
        requestCoinCost: 50,
        freeBalance: 1000,
        premiumBalance: 0,
        allowanceRemaining: 200,
      }),
    ).toEqual({ freeUse: 50, premiumUse: 0, canGenerate: true })
  })

  test("枠が足りない分はプレミアムコイン", () => {
    expect(
      estimateGeminiCoinUse({
        requestCoinCost: 100,
        freeBalance: 1000,
        premiumBalance: 60,
        allowanceRemaining: 50,
      }),
    ).toEqual({ freeUse: 50, premiumUse: 50, canGenerate: true })
  })

  test("枠を使い切ってプレミアムコインも足りなければ作れない（フリーコインが残っていても）", () => {
    expect(
      estimateGeminiCoinUse({
        requestCoinCost: 50,
        freeBalance: 800,
        premiumBalance: 10,
        allowanceRemaining: 0,
      }),
    ).toEqual({ freeUse: 0, premiumUse: 50, canGenerate: false })
  })

  test("枠が残っていてもフリーコインがなければプレミアムコイン", () => {
    expect(
      estimateGeminiCoinUse({
        requestCoinCost: 50,
        freeBalance: 0,
        premiumBalance: 50,
        allowanceRemaining: 200,
      }),
    ).toEqual({ freeUse: 0, premiumUse: 50, canGenerate: true })
  })
})
