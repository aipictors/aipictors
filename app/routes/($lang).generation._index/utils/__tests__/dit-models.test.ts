import { expect, test } from "bun:test"
import {
  findDitModelLabel,
  toDitCheckModelName,
} from "~/routes/($lang).generation._index/utils/dit-models"

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

test("みんなのモデルの MOSS Image は公式の MOSS Image と同じく DiT として見る", () => {
  expect(
    findDitModelLabel(
      toDitCheckModelName({
        officialModelName: "meltis_vpredV1.safetensors",
        userCheckpointBaseModel: "MOSS",
      }),
    ),
  ).toBe("MOSS Image")
  expect(
    findDitModelLabel(
      toDitCheckModelName({
        officialModelName: "meltis_vpredV1.safetensors",
        userCheckpointBaseModel: "ILLUSTRIOUS",
      }),
    ),
  ).toBe(null)
})
