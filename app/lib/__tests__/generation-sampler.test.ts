import { describe, expect, test } from "bun:test"
import {
  describeRecommendedSettings,
  toGenerationSamplerOptionValue,
  toGenerationSchedulerValue,
} from "~/lib/generation-sampler"

describe("toGenerationSamplerOptionValue", () => {
  test("昔の「〜 Karras」は同じ描き方の名前にする", () => {
    expect(toGenerationSamplerOptionValue("DPM++ 2M Karras")).toBe("DPM++ 2M")
    expect(toGenerationSamplerOptionValue("DPM++ 2M SDE Karras")).toBe("DPM++ 2M SDE")
    expect(toGenerationSamplerOptionValue("Euler a")).toBe("Euler a")
  })
  test("ER SDE・知らない値", () => {
    expect(toGenerationSamplerOptionValue("ER SDE")).toBe("ER SDE")
    expect(toGenerationSamplerOptionValue("hoge")).toBe("DPM++ 2M")
    expect(toGenerationSamplerOptionValue("")).toBe("DPM++ 2M")
  })
})

describe("toGenerationSchedulerValue", () => {
  test("決まった値だけ", () => {
    expect(toGenerationSchedulerValue("karras")).toBe("Karras")
    expect(toGenerationSchedulerValue("SGM Uniform")).toBe("SGM Uniform")
    expect(toGenerationSchedulerValue(null)).toBe(null)
    expect(toGenerationSchedulerValue("hoge")).toBe(null)
  })
})

test("describeRecommendedSettings", () => {
  expect(
    describeRecommendedSettings({
      sampler: "ER SDE",
      scheduler: "Simple",
      cfgScale: 1,
      steps: 8,
      clipSkip: null,
    }),
  ).toBe("ER SDE・Simple・CFG 1・Steps 8")
})
