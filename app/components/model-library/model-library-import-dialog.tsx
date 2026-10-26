import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  ExternalLinkIcon,
  ImageIcon,
  Loader2Icon,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import {
  previewUserModelImport,
  UserModelsApiError,
} from "~/lib/user-models/client"
import {
  baseModelLabel,
  kindLabel,
  USER_MODEL_RATINGS,
} from "~/lib/user-models/constants"
import { formatBytes } from "~/lib/user-models/generation"
import {
  isImportableModelUrl,
  licenseNoteText,
  unsupportedBaseNoteText,
} from "~/lib/user-models/import-utils"
import type {
  UserModelImportPreview,
  UserModelRating,
} from "~/lib/user-models/types"
import { enqueueUserModelImport } from "~/lib/user-models/upload-queue"
import { cn } from "~/lib/utils"

type Props = {
  isOpen: boolean
  onOpenChange(isOpen: boolean): void
  /**
   * 開いたときに入れておく URL（ドロップした URL など）。正しい URL ならすぐに確認する
   */
  initialUrl?: string | null
  /**
   * 取り込みを始めたとき
   */
  onStarted?(): void
  /**
   * 取り込みが終わったとき
   */
  onImported?(): void
  /**
   * リンクを別タブで開く（生成画面のダイアログ内など）
   */
  linkTarget?: string
}

/**
 * URL（Civitai）からモデルを取り込む。URL を貼る →「確認」→ 内容を見て「取り込む」
 */
export function ModelLibraryImportDialog(props: Props) {
  const [url, setUrl] = useState("")
  const [preview, setPreview] = useState<UserModelImportPreview | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLimitExceeded, setIsLimitExceeded] = useState(false)
  const [name, setName] = useState("")
  const [rating, setRating] = useState<UserModelRating>("G")
  const requestRef = useRef(0)

  const reset = () => {
    requestRef.current += 1
    setPreview(null)
    setError(null)
    setIsLimitExceeded(false)
    setIsChecking(false)
  }

  const check = async (value: string) => {
    const target = value.trim()
    if (!target) {
      setError("URL を入力してください")
      return
    }
    if (!isImportableModelUrl(target)) {
      setError(
        "今は Civitai のモデルページの URL（civitai.com/models/…）だけ取り込めます",
      )
      return
    }
    const requestId = requestRef.current + 1
    requestRef.current = requestId
    setIsChecking(true)
    setError(null)
    setIsLimitExceeded(false)
    try {
      const result = await previewUserModelImport(target)
      if (requestRef.current !== requestId) return
      setPreview(result)
      setName(result.name.slice(0, 100))
      setRating(result.rating)
    } catch (e) {
      if (requestRef.current !== requestId) return
      setError(
        e instanceof Error && e.message
          ? e.message
          : "モデルの情報を取得できませんでした",
      )
      setIsLimitExceeded(e instanceof UserModelsApiError && e.status === 403)
    } finally {
      if (requestRef.current === requestId) setIsChecking(false)
    }
  }

  useEffect(() => {
    if (!props.isOpen) return
    reset()
    const initial = props.initialUrl?.trim() ?? ""
    setUrl(initial)
    if (initial && isImportableModelUrl(initial)) {
      check(initial)
    }
  }, [props.isOpen, props.initialUrl])

  const onSubmit = () => {
    if (!preview) return
    const trimmed = name.trim()
    if (!trimmed) {
      toast("名前を入力してください")
      return
    }
    enqueueUserModelImport({
      url: preview.sourceUrl,
      name: trimmed,
      rating,
      kind: preview.kind,
      sizeBytes: preview.sizeBytes,
      fileName: preview.filename,
      onComplete: (job) => {
        toast(`「${job.name}」を取り込みました。マイモデルから使えます`)
        props.onImported?.()
      },
    })
    if (!preview.alreadyStored) {
      toast("取り込みを始めました。進み具合は右下に表示されます")
    }
    props.onStarted?.()
    props.onOpenChange(false)
  }

  const licenseNote = preview
    ? licenseNoteText(preview.licenseAllowsOtherServices)
    : null
  const baseNote = preview
    ? unsupportedBaseNoteText(preview.baseModel, preview.sourceBaseModel)
    : null

  return (
    <Dialog open={props.isOpen} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-md gap-5 overflow-y-auto">
        <DialogHeader>
          <DialogTitle>URL からモデルを追加</DialogTitle>
          <DialogDescription>
            Civitai のモデルページの URL
            を貼り付けると、ファイルを自分で用意しなくても取り込めます
          </DialogDescription>
        </DialogHeader>

        {preview === null ? (
          <form
            className="grid gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              check(url)
            }}
          >
            <Label htmlFor="library-import-url">モデルの URL</Label>
            <div className="flex gap-2">
              <Input
                id="library-import-url"
                type="url"
                inputMode="url"
                autoComplete="off"
                autoFocus
                value={url}
                placeholder="https://civitai.com/models/12345"
                onChange={(event) => {
                  setUrl(event.target.value)
                  setError(null)
                }}
                onPaste={(event) => {
                  const pasted = event.clipboardData.getData("text").trim()
                  if (isImportableModelUrl(pasted)) {
                    event.preventDefault()
                    setUrl(pasted)
                    check(pasted)
                  }
                }}
                disabled={isChecking}
              />
              <Button
                type="submit"
                disabled={isChecking || url.trim() === ""}
                className="shrink-0"
              >
                {isChecking ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  "確認"
                )}
              </Button>
            </div>
            {error ? (
              <p className="text-destructive text-xs leading-relaxed">
                {error}
                {isLimitExceeded && (
                  <a
                    href="/plus"
                    target={props.linkTarget}
                    className="ml-1 font-medium underline"
                  >
                    プランを見る
                  </a>
                )}
              </p>
            ) : (
              <p className="text-muted-foreground text-xs leading-relaxed">
                LoRA
                とチェックポイント（.safetensors）に対応しています。バージョンを選んだページの
                URL なら、そのバージョンを取り込みます
              </p>
            )}
          </form>
        ) : (
          <div className="grid gap-4">
            <div className="flex gap-3 rounded-xl border p-3">
              <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                {preview.thumbnailUrl ? (
                  <img
                    src={preview.thumbnailUrl}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="size-full object-cover"
                  />
                ) : (
                  <ImageIcon className="size-6 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="line-clamp-2 font-semibold text-sm leading-snug">
                  {preview.name}
                </p>
                {preview.creator && (
                  <p className="truncate text-muted-foreground text-xs">
                    作者:{" "}
                    {preview.creatorUrl ? (
                      <a
                        href={preview.creatorUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {preview.creator}
                      </a>
                    ) : (
                      preview.creator
                    )}
                  </p>
                )}
                <div className="flex flex-wrap gap-1">
                  <Tag
                    className={
                      preview.kind === "LORA"
                        ? "bg-violet-500/10 text-violet-700 dark:text-violet-300"
                        : "bg-sky-500/10 text-sky-700 dark:text-sky-300"
                    }
                  >
                    {kindLabel(preview.kind)}
                  </Tag>
                  <Tag>
                    {preview.baseModel === "OTHER"
                      ? (preview.sourceBaseModel ?? "その他")
                      : baseModelLabel(preview.baseModel)}
                  </Tag>
                  {preview.sizeBytes > 0 && (
                    <Tag>{formatBytes(preview.sizeBytes)}</Tag>
                  )}
                </div>
                <a
                  href={preview.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary text-xs hover:underline"
                >
                  Civitai で見る
                  <ExternalLinkIcon className="size-3" />
                </a>
              </div>
            </div>

            {preview.tooLarge && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-destructive text-sm">
                {kindLabel(preview.kind)} は {formatBytes(preview.maxBytes)}{" "}
                までのため取り込めません
              </p>
            )}
            {preview.alreadyStored && !preview.tooLarge && (
              <p className="flex items-center gap-1.5 text-emerald-600 text-xs dark:text-emerald-400">
                <CheckCircle2Icon className="size-3.5 shrink-0" />
                同じファイルが保存済みなので、すぐに使えます
              </p>
            )}
            {(licenseNote || baseNote) && (
              <div className="space-y-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-amber-800 text-xs leading-relaxed dark:text-amber-300">
                {licenseNote && (
                  <p className="flex gap-1.5">
                    <AlertTriangleIcon className="mt-0.5 size-3.5 shrink-0" />
                    {licenseNote}
                  </p>
                )}
                {baseNote && (
                  <p className="flex gap-1.5">
                    <AlertTriangleIcon className="mt-0.5 size-3.5 shrink-0" />
                    {baseNote}
                  </p>
                )}
              </div>
            )}

            <div className="grid gap-1.5">
              <Label htmlFor="library-import-name">名前</Label>
              <Input
                id="library-import-name"
                value={name}
                maxLength={100}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>年齢区分</Label>
              <Select
                value={rating}
                onValueChange={(value) => setRating(value as UserModelRating)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {USER_MODEL_RATINGS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {preview.nsfw && (
                <p className="text-muted-foreground text-xs">
                  Civitai で成人向けとされているため R-18 にしています
                </p>
              )}
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              取り込んだモデルは「みんなのモデル」に公開され、元のモデルと作者が表示されます。説明やサンプル画像はあとから編集できます
            </p>
          </div>
        )}

        {preview !== null && (
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={reset}>
              別の URL
            </Button>
            <Button
              onClick={onSubmit}
              disabled={preview.tooLarge || name.trim() === ""}
            >
              取り込む
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

function Tag(props: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "rounded-full bg-muted px-2 py-0.5 font-medium text-[11px] text-muted-foreground",
        props.className,
      )}
    >
      {props.children}
    </span>
  )
}
