import { describe, expect, test } from "bun:test"
import {
  parseGenerationInfoFile,
  toGenerationInfoEntry,
  toGenerationInfoFileName,
  toGenerationInfoFileText,
} from "./generation-info-file"

const source = {
  completedAt: 1794880000,
  model: { id: "12", name: "kiwimixXL v1", type: "SDXL" },
  prompt: "1girl, smile",
  negativePrompt: "lowres",
  seed: 123,
  steps: 25,
  scale: 6.5,
  sampler: "DPM++ 2M",
  scheduler: "Karras",
  clipSkip: 2,
  vae: null,
  sizeType: "SDXL_832_1216",
  width: 832,
  height: 1216,
  generationType: "TEXT_TO_IMAGE",
}

describe("generation info file", () => {
  test("書き出して読み込むと同じ内容に戻る", () => {
    const entry = toGenerationInfoEntry(source)
    if (entry === null) throw new Error("entry is null")
    const text = toGenerationInfoFileText(
      [entry],
      new Date("2026-11-17T05:00:00Z"),
    )
    // 人が読めるように改行と字下げを入れる
    expect(text).toContain('\n  "items": [')
    expect(text).toContain('"prompt": "1girl, smile"')
    expect(parseGenerationInfoFile(text)).toEqual([entry])
  })

  test("モデルのない履歴は書き出さない", () => {
    expect(toGenerationInfoEntry({ ...source, model: null })).toBeNull()
  })

  test("形の違う項目は飛ばし、読めるものがなければエラー", () => {
    const text = JSON.stringify({
      items: [
        { prompt: "no model" },
        { model: { id: "3" }, prompt: "ok", seed: "x" },
      ],
    })
    const entries = parseGenerationInfoFile(text)
    expect(entries).toHaveLength(1)
    expect(entries[0].prompt).toBe("ok")
    expect(entries[0].seed).toBe(-1)
    expect(() => parseGenerationInfoFile("{}")).toThrow()
    expect(() => parseGenerationInfoFile("not json")).toThrow()
  })

  test("ファイル名は日本時間", () => {
    expect(toGenerationInfoFileName(new Date("2026-11-17T05:09:00Z"))).toBe(
      "aipictors-generation-info-20261117-1409.json",
    )
  })
})
