import { FileDownIcon, FileUpIcon } from "lucide-react"
import { useRef, useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { useTranslation } from "~/hooks/use-translation"
import { useApplyGenerationInfo } from "~/routes/($lang).generation._index/hooks/use-apply-generation-info"
import {
  type GenerationInfoEntry,
  type GenerationInfoSource,
  parseGenerationInfoFile,
  toGenerationInfoEntry,
  toGenerationInfoFileName,
  toGenerationInfoFileText,
} from "~/routes/($lang).generation._index/utils/generation-info-file"

const downloadText = (name: string, text: string) => {
  const url = URL.createObjectURL(
    new Blob([text], { type: "application/json" }),
  )
  const link = document.createElement("a")
  link.href = url
  link.download = name
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/**
 * 選んだ履歴の生成情報（プロンプトや設定、画像は含めない）を JSON でダウンロードする
 */
export function GenerationInfoDownloadButton(props: {
  selectedTaskIds: string[]
  items: (GenerationInfoSource & { nanoid?: string | null })[]
}) {
  const t = useTranslation()
  const onClick = () => {
    if (props.selectedTaskIds.length === 0) {
      toast(
        t("ダウンロードする履歴を選んでください", "Select history to download"),
      )
      return
    }
    const selected = new Set(props.selectedTaskIds)
    const entries = props.items
      .filter((item) => item.nanoid && selected.has(item.nanoid))
      .map(toGenerationInfoEntry)
      .filter((entry) => entry !== null)
    if (entries.length === 0) {
      toast.error(t("生成情報がありませんでした", "No generation info found"))
      return
    }
    downloadText(toGenerationInfoFileName(), toGenerationInfoFileText(entries))
    toast.success(
      t(
        `${entries.length}件の生成情報をダウンロードしました`,
        `Downloaded info for ${entries.length} items`,
      ),
    )
  }
  return (
    <Button
      title={t(
        "選んだ履歴の生成情報（プロンプト・設定）をダウンロード",
        "Download prompts and settings of the selected history",
      )}
      variant="ghost"
      size="icon"
      onClick={onClick}
    >
      <FileDownIcon className="w-4" />
    </Button>
  )
}

/**
 * ダウンロードした生成情報のファイルを読み込み、選んだ設定を生成画面に戻す
 */
export function GenerationInfoImportButton() {
  const t = useTranslation()
  const apply = useApplyGenerationInfo()
  const inputRef = useRef<HTMLInputElement>(null)
  const [entries, setEntries] = useState<GenerationInfoEntry[] | null>(null)

  const onFile = async (file: File | undefined) => {
    if (!file) return
    try {
      setEntries(parseGenerationInfoFile(await file.text()))
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("読み込めませんでした", "Could not read the file"),
      )
    } finally {
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <>
      <Button
        title={t(
          "ダウンロードした生成情報を読み込んで設定を戻す",
          "Load a downloaded generation info file",
        )}
        variant="ghost"
        size="icon"
        onClick={() => inputRef.current?.click()}
      >
        <FileUpIcon className="w-4" />
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(event) => void onFile(event.target.files?.[0])}
      />
      <Dialog
        open={entries !== null}
        onOpenChange={(open) => !open && setEntries(null)}
      >
        <DialogContent className="max-h-[80vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {t("生成情報を読み込む", "Load generation info")}
            </DialogTitle>
            <DialogDescription>
              {t(
                `${entries?.length ?? 0}件あります。使う設定を選ぶと、生成画面に戻します。`,
                `${entries?.length ?? 0} items. Pick one to restore its settings.`,
              )}
            </DialogDescription>
          </DialogHeader>
          <ul className="space-y-2">
            {entries?.map((entry, index) => (
              <li
                // 同じ内容が並ぶことがあるので位置も使う
                key={`${index}-${entry.createdAt}`}
                className="space-y-1 rounded-lg border p-2.5"
              >
                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                  <span className="truncate font-medium text-foreground">
                    {entry.model.name || entry.model.id}
                  </span>
                  {entry.createdAt && (
                    <span className="ml-auto shrink-0">
                      {new Date(entry.createdAt).toLocaleString(
                        t.isEnglish ? "en-US" : "ja-JP",
                        { timeZone: "Asia/Tokyo" },
                      )}
                    </span>
                  )}
                </div>
                <p className="line-clamp-3 break-all text-xs">
                  {entry.prompt || t("（プロンプトなし）", "(no prompt)")}
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-7 text-xs"
                  onClick={() => {
                    apply(entry)
                    setEntries(null)
                  }}
                >
                  {t("この設定を使う", "Use these settings")}
                </Button>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  )
}
