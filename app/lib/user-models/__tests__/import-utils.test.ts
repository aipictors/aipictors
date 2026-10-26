import { describe, expect, test } from "bun:test"
import {
  extractDroppedUrl,
  importPercent,
  importPollDelayMs,
  isImportableModelUrl,
  licenseNoteText,
  parseStoredImportJobs,
  unsupportedBaseNoteText,
} from "~/lib/user-models/import-utils"

describe("isImportableModelUrl", () => {
  test("Civitai のモデルページ・ダウンロード URL は取り込める", () => {
    expect(isImportableModelUrl("https://civitai.com/models/12345")).toBe(true)
    expect(
      isImportableModelUrl(
        "https://civitai.com/models/12345/cute-style?modelVersionId=678",
      ),
    ).toBe(true)
    expect(isImportableModelUrl("civitai.com/models/12345")).toBe(true)
    expect(
      isImportableModelUrl("https://civitai.com/api/download/models/678"),
    ).toBe(true)
    expect(isImportableModelUrl("https://civitai.green/models/1")).toBe(true)
  })

  test("それ以外は取り込めない", () => {
    expect(isImportableModelUrl("")).toBe(false)
    expect(isImportableModelUrl("https://civitai.com/images/1")).toBe(false)
    expect(isImportableModelUrl("https://huggingface.co/a/b")).toBe(false)
    expect(
      isImportableModelUrl("https://evil.example/civitai.com/models/1"),
    ).toBe(false)
    expect(isImportableModelUrl("not a url")).toBe(false)
  })
})

describe("extractDroppedUrl", () => {
  const transfer = (data: Record<string, string>) => ({
    types: Object.keys(data),
    getData: (type: string) => data[type] ?? "",
  })

  test("text/uri-list のコメント行を飛ばして最初の URL を使う", () => {
    expect(
      extractDroppedUrl(
        transfer({
          "text/uri-list": "# comment\r\nhttps://civitai.com/models/1\r\n",
        }),
      ),
    ).toBe("https://civitai.com/models/1")
  })

  test("text/plain だけでも取り出せる。何もなければ null", () => {
    expect(
      extractDroppedUrl(
        transfer({ "text/plain": " https://civitai.com/models/2 " }),
      ),
    ).toBe("https://civitai.com/models/2")
    expect(extractDroppedUrl(transfer({}))).toBeNull()
  })
})

describe("注意書き", () => {
  test("他サービスでの利用が許可されていないときだけライセンスの注意を出す", () => {
    expect(licenseNoteText(false)).toBe(
      "作者のライセンスでは他サービスでの利用が許可されていません",
    )
    expect(licenseNoteText(true)).toBeNull()
    expect(licenseNoteText(null)).toBeNull()
    expect(licenseNoteText(undefined)).toBeNull()
  })

  test("OTHER の系統は元の系統名を入れて注意を出す", () => {
    expect(unsupportedBaseNoteText("OTHER", "Anima")).toBe(
      "この系統（Anima）は今の生成サーバーでは生成できない場合があります",
    )
    expect(unsupportedBaseNoteText("OTHER", null)).toBeNull()
    expect(unsupportedBaseNoteText("ILLUSTRIOUS", "Illustrious")).toBeNull()
  })
})

describe("進み具合", () => {
  test("パート数から割合を出す。READY は 100、転送前は 0", () => {
    expect(
      importPercent({ status: "TRANSFERRING", partsDone: 1, partsTotal: 4 }),
    ).toBe(25)
    expect(
      importPercent({ status: "QUEUED", partsDone: 0, partsTotal: null }),
    ).toBe(0)
    expect(
      importPercent({ status: "READY", partsDone: 0, partsTotal: null }),
    ).toBe(100)
    expect(
      importPercent({ status: "TRANSFERRING", partsDone: 9, partsTotal: 4 }),
    ).toBe(100)
  })

  test("確認の間隔は長く続くほど広がり、15 秒を超えない", () => {
    expect(importPollDelayMs({ status: "TRANSFERRING", attempt: 0 })).toBe(3000)
    expect(importPollDelayMs({ status: "QUEUED", attempt: 0 })).toBe(4000)
    expect(
      importPollDelayMs({ status: "TRANSFERRING", attempt: 30 }),
    ).toBeGreaterThan(3000)
    expect(importPollDelayMs({ status: "TRANSFERRING", attempt: 1000 })).toBe(
      15000,
    )
  })
})

describe("parseStoredImportJobs", () => {
  const now = Date.parse("2026-10-27T12:00:00Z")
  const job = {
    modelId: "abc123def456",
    name: "かわいい LoRA",
    kind: "LORA",
    sizeBytes: 1000,
    startedAt: now - 1000,
  }

  test("正しい形のものだけを残し、3 日より古いものは捨てる", () => {
    const raw = JSON.stringify([
      job,
      { ...job, modelId: "BAD" },
      { ...job, kind: "VAE" },
      { ...job, modelId: "old123old456", startedAt: now - 4 * 86400 * 1000 },
      null,
    ])
    expect(parseStoredImportJobs(raw, now)).toEqual([job])
  })

  test("壊れた JSON や配列以外は空", () => {
    expect(parseStoredImportJobs(null, now)).toEqual([])
    expect(parseStoredImportJobs("{", now)).toEqual([])
    expect(parseStoredImportJobs('{"a":1}', now)).toEqual([])
  })
})
