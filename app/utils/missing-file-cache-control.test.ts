import { describe, expect, test } from "bun:test"
import { missingFileCacheControl } from "~/utils/missing-file-cache-control"

describe("無いファイルへの 404 の保存", () => {
  test("/assets/ のスクリプトはデプロイの途中に無いことがあるので保存させない", () => {
    expect(missingFileCacheControl("/assets/route-YVTSFWe-.js")).toBe(
      "no-store",
    )
  })

  test("それ以外の無いファイルは 10 分保存する", () => {
    expect(missingFileCacheControl("/apple-touch-icon-precomposed.png")).toBe(
      "public, max-age=600",
    )
  })
})
