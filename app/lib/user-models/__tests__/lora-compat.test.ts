import { describe, expect, test } from "bun:test"
import {
  isLoraUsableWith,
  officialCheckpointLoraFamily,
  officialLoraFamily,
  userModelLoraFamily,
} from "~/lib/user-models/lora-compat"

describe("lora-compat", () => {
  test("公式 LoRA は SD1.5 用が基本で、SDXL 用は一覧と名前で見分ける", () => {
    expect(officialLoraFamily("flat1")).toBe("SD1")
    expect(officialLoraFamily("eyecolle_tulip_v100")).toBe("SD1")
    expect(officialLoraFamily("hyperdetailer_v060.safetensors")).toBe("SD1")
    expect(officialLoraFamily("pictorchan_sd15")).toBe("SD1")
    expect(officialLoraFamily("pictorchan_ilxl20")).toBe("SDXL")
    expect(officialLoraFamily("deltamon_beta")).toBe("SDXL")
  })

  test("みんなのモデルはベースモデルで決まり、その他は分からない", () => {
    expect(userModelLoraFamily("SD1.5")).toBe("SD1")
    expect(userModelLoraFamily("ILLUSTRIOUS")).toBe("SDXL")
    expect(userModelLoraFamily("PONY")).toBe("SDXL")
    expect(userModelLoraFamily("OTHER")).toBeNull()
    expect(userModelLoraFamily(null)).toBeNull()
  })

  test("Gemini・FLUX・Z-Image は LoRA を使えない", () => {
    expect(officialCheckpointLoraFamily({ type: "SD1", isDit: false })).toBe(
      "SD1",
    )
    expect(officialCheckpointLoraFamily({ type: "SDXL", isDit: false })).toBe(
      "SDXL",
    )
    expect(officialCheckpointLoraFamily({ type: "SDXL", isDit: true })).toBe(
      "NONE",
    )
    expect(officialCheckpointLoraFamily({ type: "GEMINI", isDit: false })).toBe(
      "NONE",
    )
  })

  test("同じ系統だけ効く。分からないときは null", () => {
    expect(isLoraUsableWith("SD1", "SD1")).toBe(true)
    expect(isLoraUsableWith("SD1", "SDXL")).toBe(false)
    expect(isLoraUsableWith("SDXL", "NONE")).toBe(false)
    expect(isLoraUsableWith(null, "SDXL")).toBeNull()
    expect(isLoraUsableWith("SDXL", null)).toBeNull()
  })
})
