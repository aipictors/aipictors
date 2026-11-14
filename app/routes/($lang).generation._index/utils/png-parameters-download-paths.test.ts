import { describe, expect, test } from "bun:test"
import { readFileSync } from "node:fs"

describe("生成画面のダウンロードで生成情報を書き込む", () => {
  const paths = [
    "app/routes/($lang).generation._index/components/generation-task-download-button.tsx",
    "app/routes/($lang).generation._index/components/generation-task-sheet-view.tsx",
  ]

  for (const path of paths) {
    test(`${path} は生成情報を渡す`, () => {
      const source = readFileSync(path, "utf8")

      // 渡さないと、生成情報の無い PNG のまま保存され、投稿画面で生成情報が空欄になる
      expect(source).toContain(
        "pngParameters: imageElement?.dataset.generationParameters",
      )
    })
  }
})
