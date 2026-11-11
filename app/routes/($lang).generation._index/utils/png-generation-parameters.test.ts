import { describe, expect, test } from "bun:test"
import { deflateSync } from "node:zlib"
import {
  addPngParameters,
  toPngParametersText,
} from "./png-generation-parameters"

const crc32 = (bytes: Uint8Array) => {
  let crc = 0xffffffff
  for (const byte of bytes) {
    crc ^= byte
    for (let k = 0; k < 8; k++) {
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1
    }
  }
  return (crc ^ 0xffffffff) >>> 0
}

const chunk = (type: string, body: Uint8Array) => {
  const out = new Uint8Array(12 + body.length)
  const view = new DataView(out.buffer)
  view.setUint32(0, body.length)
  out.set(new TextEncoder().encode(type), 4)
  out.set(body, 8)
  view.setUint32(8 + body.length, crc32(out.subarray(4, 8 + body.length)))
  return out
}

const concat = (...parts: Uint8Array[]) => {
  const out = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0))
  let offset = 0
  for (const part of parts) {
    out.set(part, offset)
    offset += part.length
  }
  return out
}

// 1x1 の PNG（生成情報なし）
const ihdr = new Uint8Array([0, 0, 0, 1, 0, 0, 0, 1, 8, 0, 0, 0, 0])
const makePng = (...extra: Uint8Array[]) =>
  concat(
    new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    ...extra,
    chunk("IDAT", new Uint8Array(deflateSync(new Uint8Array([0, 0])))),
    chunk("IEND", new Uint8Array()),
  )

const readChunks = (data: Uint8Array) => {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength)
  const chunks: { type: string; body: Uint8Array; crcOk: boolean }[] = []
  let offset = 8
  while (offset < data.length) {
    const length = view.getUint32(offset)
    const type = new TextDecoder().decode(data.subarray(offset + 4, offset + 8))
    const body = data.subarray(offset + 8, offset + 8 + length)
    const crc = view.getUint32(offset + 8 + length)
    chunks.push({
      type,
      body,
      crcOk: crc === crc32(data.subarray(offset + 4, offset + 8 + length)),
    })
    offset += 12 + length
  }
  return chunks
}

const task = {
  prompt: "1girl, 猫耳",
  negativePrompt: "lowres",
  steps: 20,
  sampler: "euler",
  scale: 7,
  seed: 123456,
  width: 768,
  height: 1152,
  model: { name: "ChromaXL_v1b" },
}

describe("toPngParametersText", () => {
  test("投稿画面の読み取りと同じ形式にする", () => {
    const text = toPngParametersText(task)
    expect(text).toBe(
      "1girl, 猫耳\nNegative prompt: lowres\nSteps: 20, Sampler: euler, CFG scale: 7, Seed: 123456, Size: 768x1152, Model: ChromaXL_v1b",
    )
    // get-extract-info-from-png の読み取りの正規表現
    expect(text.match(/^(.*?)\s*Negative prompt:/s)?.[1]).toBe("1girl, 猫耳")
    expect(text.match(/Negative prompt:\s*([\s\S]*?)\s*Steps:/s)?.[1]).toBe(
      "lowres",
    )
    expect(text.match(/Seed:\s*(\d+),/)?.[1]).toBe("123456")
    expect(text.match(/Steps:\s*(\d+),/)?.[1]).toBe("20")
    expect(text.match(/CFG scale:\s*([^,]+)/)?.[1]).toBe("7")
    expect(text.match(/Model:\s*([^,]+)/)?.[1]).toBe("ChromaXL_v1b")
  })
})

describe("addPngParameters", () => {
  test("生成情報の無い PNG に parameters を IHDR の直後に書き込む", () => {
    const result = addPngParameters(makePng(), toPngParametersText(task))
    const chunks = readChunks(result)
    expect(chunks.map((c) => c.type)).toEqual(["IHDR", "tEXt", "IDAT", "IEND"])
    expect(chunks.every((c) => c.crcOk)).toBe(true)
    expect(new TextDecoder().decode(chunks[1].body)).toBe(
      `parameters\0${toPngParametersText(task)}`,
    )
  })

  test("生成情報がすでにある PNG はそのまま", () => {
    const png = makePng(
      chunk("tEXt", new TextEncoder().encode("parameters\0from sd")),
    )
    expect(addPngParameters(png, "x")).toBe(png)
  })

  test("PNG でないものはそのまま", () => {
    const webp = new TextEncoder().encode("RIFF0000WEBPVP8 ".padEnd(40, "0"))
    expect(addPngParameters(webp, "x")).toBe(webp)
  })
})
