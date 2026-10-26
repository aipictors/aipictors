import { describe, expect, test } from "bun:test"
import { createHash } from "node:crypto"
import {
  normalizeLoraWeight,
  parseUserLoraName,
  splitTriggerWords,
  toGenerationModelType,
  toUserCheckpointModelName,
  toUserLoraName,
} from "~/lib/user-models/generation"
import {
  computeFileSha256,
  MultipartUploader,
  parseSafetensorsHeader,
  planParts,
  readSafetensorsInfo,
  TransferSpeedMeter,
} from "~/lib/user-models/upload-engine"

describe("planParts", () => {
  test("最終パート以外は同じサイズ", () => {
    const parts = planParts(250, 100)
    expect(parts).toEqual([
      { partNumber: 1, start: 0, end: 100 },
      { partNumber: 2, start: 100, end: 200 },
      { partNumber: 3, start: 200, end: 250 },
    ])
  })

  test("空ファイルはパートなし", () => {
    expect(planParts(0, 100)).toEqual([])
  })
})

describe("computeFileSha256", () => {
  test("Node の sha256 と一致する", async () => {
    const bytes = new Uint8Array(20 * 1024 * 1024 + 123)
    for (let i = 0; i < bytes.length; i += 4096) bytes[i] = i % 251
    const progress: number[] = []
    const hash = await computeFileSha256(new Blob([bytes]), {
      onProgress: (value) => progress.push(value),
    })
    expect(hash).toBe(createHash("sha256").update(bytes).digest("hex"))
    expect(progress[progress.length - 1]).toBe(bytes.length)
  })
})

describe("TransferSpeedMeter", () => {
  test("速度と残り時間", () => {
    const meter = new TransferSpeedMeter(10_000)
    meter.push(0, 0)
    meter.push(1000, 1000)
    meter.push(3000, 2000)
    expect(meter.bytesPerSecond).toBe(1500)
    expect(meter.etaSeconds(3000)).toBe(2)
  })
})

describe("MultipartUploader", () => {
  test("送信済みパートを飛ばし、失敗はリトライする", async () => {
    const file = new Blob([new Uint8Array(350)])
    const sent: number[] = []
    let failedOnce = false
    const uploader = new MultipartUploader({
      file,
      partSize: 100,
      concurrency: 2,
      maxRetries: 2,
      uploadedParts: [{ partNumber: 1, etag: "e1" }],
      sendPart: async ({ partNumber, blob, onProgress }) => {
        if (partNumber === 3 && !failedOnce) {
          failedOnce = true
          throw new Error("network")
        }
        onProgress(blob.size)
        sent.push(partNumber)
        return { partNumber, etag: `e${partNumber}` }
      },
    })
    // リトライ待ちを短縮
    const originalSetTimeout = globalThis.setTimeout
    globalThis.setTimeout = ((fn: () => void) =>
      originalSetTimeout(fn, 0)) as typeof setTimeout
    try {
      const parts = await uploader.start()
      expect(parts.map((part) => part.partNumber)).toEqual([1, 2, 3, 4])
      expect(sent.sort()).toEqual([2, 3, 4])
      expect(uploader.isComplete).toBe(true)
      expect(uploader.progress.uploadedBytes).toBe(350)
    } finally {
      globalThis.setTimeout = originalSetTimeout
    }
  })

  test("pause で中断し、start で続きから再開できる", async () => {
    const file = new Blob([new Uint8Array(300)])
    let uploader: MultipartUploader | null = null
    const sent: number[] = []
    let paused = false
    uploader = new MultipartUploader({
      file,
      partSize: 100,
      concurrency: 1,
      sendPart: ({ partNumber, signal }) =>
        new Promise((resolve, reject) => {
          if (partNumber === 2 && !paused) {
            paused = true
            uploader?.pause()
            reject(new DOMException("Aborted", "AbortError"))
            return
          }
          if (signal.aborted) {
            reject(new DOMException("Aborted", "AbortError"))
            return
          }
          sent.push(partNumber)
          resolve({ partNumber, etag: `e${partNumber}` })
        }),
    })
    await expect(uploader.start()).rejects.toThrow()
    expect(uploader.uploadedParts.length).toBe(1)
    const parts = await uploader.start()
    expect(parts.length).toBe(3)
    expect(sent).toEqual([1, 2, 3])
  })
})

describe("safetensors", () => {
  test("LoRA と SDXL を判定し、トリガーワード候補を出す", () => {
    const info = parseSafetensorsHeader({
      __metadata__: {
        ss_network_module: "networks.lora",
        ss_base_model_version: "sdxl_base_v1-0",
        ss_tag_frequency: JSON.stringify({
          "10_mychar": { mychar: 40, "1girl": 30, smile: 2 },
        }),
        ss_output_name: "mychar_v1",
      },
      "lora_unet_down_blocks_0.lora_down.weight": {},
    })
    expect(info.kind).toBe("LORA")
    expect(info.baseModel).toBe("SDXL")
    expect(info.triggerWords).toEqual(["mychar", "1girl", "smile"])
    expect(info.title).toBe("mychar_v1")
  })

  test("チェックポイントを判定する", () => {
    const info = parseSafetensorsHeader({
      "model.diffusion_model.input_blocks.0.0.weight": {},
      "cond_stage_model.transformer.text_model.embeddings": {},
    })
    expect(info.kind).toBe("CHECKPOINT")
    expect(info.baseModel).toBe("SD1.5")
  })

  test("ファイル先頭からヘッダーを読む", async () => {
    const header = new TextEncoder().encode(
      JSON.stringify({ "lora_te_text_model.lora_up.weight": {} }),
    )
    const length = new Uint8Array(8)
    new DataView(length.buffer).setBigUint64(0, BigInt(header.length), true)
    const file = new Blob([length, header, new Uint8Array(16)])
    const info = await readSafetensorsInfo(file)
    expect(info?.kind).toBe("LORA")
    expect(await readSafetensorsInfo(new Blob([new Uint8Array(64)]))).toBeNull()
  })
})

describe("generation helpers", () => {
  test("生成リクエストの名前", () => {
    expect(toUserCheckpointModelName("abc123")).toBe("user/abc123.safetensors")
    expect(toUserLoraName("abc123")).toBe("user_abc123")
    expect(parseUserLoraName("user_abc123")).toBe("abc123")
    expect(parseUserLoraName("flat2")).toBeNull()
  })

  test("モデル種別とウェイト", () => {
    expect(toGenerationModelType("SD1.5")).toBe("SD1")
    expect(toGenerationModelType("ILLUSTRIOUS")).toBe("SDXL")
    expect(normalizeLoraWeight(undefined)).toBe(0.8)
    expect(normalizeLoraWeight(5)).toBe(1)
    expect(splitTriggerWords("a, b、c\n")).toEqual(["a", "b", "c"])
  })
})
