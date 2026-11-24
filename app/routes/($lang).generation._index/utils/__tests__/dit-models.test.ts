import { expect, test } from "bun:test"
import { findDitModelLabel } from "~/routes/($lang).generation._index/utils/dit-models"

test("DiT 系のモデルを名前で見分ける", () => {
  expect(findDitModelLabel("z_image_turbo.safetensors")).toBe("Z-Image Turbo")
  expect(findDitModelLabel("z_image_turbo.safetensors [abcdef1234]")).toBe(
    "Z-Image Turbo",
  )
  expect(findDitModelLabel("anima_turbo")).toBe("Anima")
  expect(findDitModelLabel("moss_image.safetensors")).toBe("MOSS Image")
  expect(findDitModelLabel("moss_jibmix_v3.safetensors")).toBe("Jib Mix Moss")
  expect(findDitModelLabel("animagineXL40_v4Opt.safetensors")).toBeNull()
  expect(
    findDitModelLabel("animaPencilXL_v310.safetensors [abcdef1234]"),
  ).toBeNull()
  expect(findDitModelLabel("z_image_turbo_lora_test.safetensors")).toBeNull()
  expect(findDitModelLabel(null)).toBeNull()
})
