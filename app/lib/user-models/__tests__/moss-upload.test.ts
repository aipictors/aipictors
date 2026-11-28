import { describe, expect, test } from "bun:test"
import {
  USER_MODEL_SUBSCRIBER_CHECKPOINT_MAX_BYTES,
  userModelBaseModelsFor,
  userModelMaxBytes,
} from "~/lib/user-models/constants"
import {
  isMossCheckpointKeys,
  parseSafetensorsHeader,
} from "~/lib/user-models/upload-engine"

const GB = 1024 ** 3

describe("チェックポイントの 1 ファイルの上限", () => {
  test("無料は 7.5GB、サブスクは 10GB", () => {
    expect(userModelMaxBytes("CHECKPOINT", "FREE")).toBe(7.5 * GB)
    expect(userModelMaxBytes("CHECKPOINT", null)).toBe(7.5 * GB)
    expect(userModelMaxBytes("CHECKPOINT", "LITE")).toBe(10 * GB)
    expect(userModelMaxBytes("CHECKPOINT", "PREMIUM")).toBe(
      USER_MODEL_SUBSCRIBER_CHECKPOINT_MAX_BYTES,
    )
    expect(userModelMaxBytes("LORA", "PREMIUM")).toBe(400 * 1024 * 1024)
  })
})

describe("MOSS Image", () => {
  const mossHeader = {
    __metadata__: {},
    "final_linear_video.weight": {},
    "layers.0.proj.o.weight": {},
    "shared_block_modulation.weight": {},
    "video_embedder.weight": {},
  }

  test("拡散モデルだけのファイルを MOSS Image のチェックポイントと判定する", () => {
    const info = parseSafetensorsHeader(mossHeader)
    expect(info.kind).toBe("CHECKPOINT")
    expect(info.baseModel).toBe("MOSS")
    expect(
      isMossCheckpointKeys([
        "model.diffusion_model.video_embedder.weight",
        "model.diffusion_model.final_linear_video.weight",
        "model.diffusion_model.shared_block_modulation.weight",
      ]),
    ).toBe(true)
    expect(
      isMossCheckpointKeys(["model.diffusion_model.input_blocks.0.0.weight"]),
    ).toBe(false)
  })

  test("ベースモデルの候補の MOSS Image はチェックポイントだけ", () => {
    const values = (kind: "LORA" | "CHECKPOINT") =>
      userModelBaseModelsFor(kind).map((item) => item.value)
    expect(values("CHECKPOINT")).toContain("MOSS")
    expect(values("LORA")).not.toContain("MOSS")
  })
})
