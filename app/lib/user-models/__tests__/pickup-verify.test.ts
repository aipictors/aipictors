import { expect, test } from "bun:test"
import {
  extractModelHashes,
  verifyPickupByGeneration,
  verifyPickupByPngInfo,
} from "~/lib/user-models/pickup-verify"

const sha256 = `abcdef0123${"4".repeat(54)}`
const addnetHash = `0f1e2d3c4b5a${"6".repeat(52)}`

const lora = {
  id: "abc123def456",
  kind: "LORA" as const,
  name: "テストLoRA",
  sha256,
  addnetHash,
}
const checkpoint = {
  ...lora,
  kind: "CHECKPOINT" as const,
  name: "テストモデル",
}

const a1111 = (extra: string) =>
  `parameters: 1girl, <lora:my_lora:0.8>\nNegative prompt: bad\nSteps: 28, Sampler: Euler a, CFG scale: 7, Seed: 1, Size: 832x1216, ${extra}, Version: v1.10.1`

test("A1111 の Model hash / Lora hashes / Hashes を読む", () => {
  const src = a1111(
    `Model hash: ABCDEF0123, Model: any_name, Lora hashes: "my_lora: 0f1e2d3c4b5a, other: 111111111111", Hashes: {"model": "abcdef0123", "lora:x": "9999999999"}`,
  )
  expect(extractModelHashes(src)).toEqual({
    modelHashes: ["abcdef0123"],
    loraHashes: ["0f1e2d3c4b5a", "111111111111", "9999999999"],
  })
})

test("短いハッシュ（旧方式の 8 文字）は照合に使わない", () => {
  expect(extractModelHashes("Model hash: abcdef01").modelHashes).toEqual([])
})

test("チェックポイント: Model hash が sha256 の先頭 10 文字と一致すれば参加できる（ファイル名は問わない）", () => {
  expect(
    verifyPickupByPngInfo(
      checkpoint,
      a1111("Model hash: abcdef0123, Model: renamed"),
    ),
  ).toEqual({ ok: true, via: "hash" })
  expect(
    verifyPickupByPngInfo(
      checkpoint,
      a1111("Model hash: 1234567890, Model: テストモデル"),
    ),
  ).toEqual({ ok: false, reason: "MISMATCH" })
})

test("LoRA: Lora hashes（AutoV3）か sha256 の先頭 10 文字で一致すれば参加できる", () => {
  expect(
    verifyPickupByPngInfo(lora, a1111('Lora hashes: "my_lora: 0f1e2d3c4b5a"')),
  ).toEqual({ ok: true, via: "hash" })
  expect(
    verifyPickupByPngInfo(
      lora,
      a1111('Hashes: {"lora:my_lora": "abcdef0123"}'),
    ),
  ).toEqual({ ok: true, via: "hash" })
  expect(
    verifyPickupByPngInfo(lora, a1111('Lora hashes: "my_lora: 999999999999"')),
  ).toEqual({ ok: false, reason: "MISMATCH" })
})

test("ハッシュが無い画像（ComfyUI・生成情報なし）は参加できない", () => {
  expect(verifyPickupByPngInfo(lora, null)).toEqual({
    ok: false,
    reason: "NO_INFO",
  })
  expect(
    verifyPickupByPngInfo(
      checkpoint,
      'prompt: {"3": {"class_type": "KSampler"}}',
    ),
  ).toEqual({ ok: false, reason: "NO_INFO" })
  expect(verifyPickupByPngInfo(lora, a1111("Model hash: abcdef0123"))).toEqual({
    ok: false,
    reason: "NO_INFO",
  })
})

test("Aipictors で生成した画像（user_ID / user/ID）は参加できる", () => {
  expect(
    verifyPickupByPngInfo(
      lora,
      "parameters: 1girl, <lora:user_abc123def456:0.8>",
    ),
  ).toEqual({ ok: true, via: "generation" })
  expect(
    verifyPickupByPngInfo(checkpoint, "Model: user/abc123def456.safetensors"),
  ).toEqual({ ok: true, via: "generation" })
})

test("生成履歴: LoRA はプロンプト、チェックポイントはモデル名", () => {
  expect(
    verifyPickupByGeneration(lora, {
      prompt: "a, <lora:user_abc123def456:0.7>",
    }),
  ).toBe(true)
  expect(verifyPickupByGeneration(lora, { prompt: "a" })).toBe(false)
  expect(
    verifyPickupByGeneration(checkpoint, { modelName: "テストモデル" }),
  ).toBe(true)
  expect(verifyPickupByGeneration(checkpoint, { modelName: "別" })).toBe(false)
})
