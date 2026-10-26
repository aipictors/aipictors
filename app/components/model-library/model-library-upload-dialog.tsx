import { Link } from "@remix-run/react"
import { useQueryClient } from "@tanstack/react-query"
import { FileBoxIcon, Loader2Icon, WandSparklesIcon } from "lucide-react"
import { useEffect, useState } from "react"
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
import { userModelsQueryKeys } from "~/components/user-models/use-user-models"
import {
  kindLabel,
  USER_MODEL_BASE_MODELS,
  USER_MODEL_KINDS,
  USER_MODEL_MAX_BYTES,
  USER_MODEL_RATINGS,
} from "~/lib/user-models/constants"
import { formatBytes } from "~/lib/user-models/generation"
import type {
  UserModelBaseModel,
  UserModelEditableFields,
  UserModelKind,
  UserModelRating,
} from "~/lib/user-models/types"
import {
  readSafetensorsInfo,
  type SafetensorsInfo,
} from "~/lib/user-models/upload-engine"
import { enqueueUserModelUpload } from "~/lib/user-models/upload-queue"
import { cn } from "~/lib/utils"

type Props = {
  /**
   * 情報を入力するファイル（null で閉じる）
   */
  file: File | null
  /**
   * 残りのファイル数（複数ドロップしたとき）
   */
  remainingCount: number
  onDone(): void
  onUploaded?(): void
}

type Draft = {
  kind: UserModelKind
  name: string
  baseModel: UserModelBaseModel
  rating: UserModelRating
  triggerWords: string
}

/**
 * ドロップしたファイルの情報を入れてアップロードを始める（詳しい説明やサンプル画像はあとから編集）
 */
export function ModelLibraryUploadDialog(props: Props) {
  const queryClient = useQueryClient()
  const [info, setInfo] = useState<SafetensorsInfo | null | "loading">(
    "loading",
  )
  const [draft, setDraft] = useState<Draft>({
    kind: "LORA",
    name: "",
    baseModel: "SDXL",
    rating: "G",
    triggerWords: "",
  })

  useEffect(() => {
    const file = props.file
    if (!file) return
    let isCanceled = false
    setInfo("loading")
    readSafetensorsInfo(file).then((result) => {
      if (isCanceled) return
      setInfo(result)
      const kind =
        result?.kind ?? (file.size > 1024 ** 3 ? "CHECKPOINT" : "LORA")
      setDraft({
        kind,
        name: (result?.title ?? file.name.replace(/\.safetensors$/i, "")).slice(
          0,
          80,
        ),
        baseModel: result?.baseModel ?? "SDXL",
        rating: "G",
        triggerWords:
          kind === "LORA" ? (result?.triggerWords ?? []).join(", ") : "",
      })
    })
    return () => {
      isCanceled = true
    }
  }, [props.file])

  const file = props.file
  const maxBytes = USER_MODEL_MAX_BYTES[draft.kind]
  const isTooLarge = file !== null && file.size > maxBytes
  const isUnreadable = info === null
  const isLoading = info === "loading"

  const onSubmit = () => {
    if (!file) return
    if (draft.name.trim() === "") {
      toast("名前を入力してください")
      return
    }
    const fields: UserModelEditableFields = {
      name: draft.name.trim(),
      description: "",
      triggerWords: draft.kind === "LORA" ? draft.triggerWords : "",
      recommendedWeight: 0.8,
      baseModel: draft.baseModel,
      rating: draft.rating,
      tags: [],
      thumbnailUrl: null,
      sampleImageUrls: [],
    }
    enqueueUserModelUpload({
      file,
      kind: draft.kind,
      fields,
      onComplete: (job) => {
        queryClient.invalidateQueries({ queryKey: userModelsQueryKeys.all })
        toast(
          job.deduplicated
            ? `「${job.name}」は登録済みのファイルでした`
            : `「${job.name}」をアップロードしました`,
        )
        props.onUploaded?.()
      },
    })
    props.onDone()
  }

  return (
    <Dialog
      open={file !== null}
      onOpenChange={(isOpen) => {
        if (!isOpen) props.onDone()
      }}
    >
      <DialogContent className="max-w-md gap-5">
        <DialogHeader>
          <DialogTitle>モデルをアップロード</DialogTitle>
          <DialogDescription>
            説明やサンプル画像はアップロード後に「編集」から追加できます
          </DialogDescription>
        </DialogHeader>

        {file && (
          <div className="flex items-center gap-3 rounded-lg border bg-muted/40 px-3 py-2.5">
            <FileBoxIcon className="size-8 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-sm">{file.name}</p>
              <p className="text-muted-foreground text-xs">
                {formatBytes(file.size)}
                {props.remainingCount > 0 &&
                  `・ほかに ${props.remainingCount} 件`}
              </p>
            </div>
            {isLoading && (
              <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
            )}
          </div>
        )}

        {isUnreadable ? (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-destructive text-sm">
            safetensors
            として読み込めませんでした。ファイルが壊れていないか確認してください
          </p>
        ) : (
          <div className={cn("grid gap-4", isLoading && "opacity-60")}>
            <div className="grid gap-1.5">
              <Label className="flex items-center justify-between">
                <span>種類</span>
                {info !== "loading" && info?.kind && (
                  <span className="flex items-center gap-1 font-normal text-muted-foreground text-xs">
                    <WandSparklesIcon className="size-3" />
                    ファイルから判定
                  </span>
                )}
              </Label>
              <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
                {USER_MODEL_KINDS.map((kind) => (
                  <button
                    key={kind.value}
                    type="button"
                    onClick={() =>
                      setDraft((current) => ({ ...current, kind: kind.value }))
                    }
                    className={cn(
                      "rounded-md px-3 py-1.5 font-medium text-sm transition-colors",
                      draft.kind === kind.value
                        ? "bg-background shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {kind.value === "LORA" ? "LoRA" : "チェックポイント"}
                  </button>
                ))}
              </div>
              {isTooLarge && (
                <p className="text-destructive text-xs">
                  {kindLabel(draft.kind)} は {formatBytes(maxBytes)} までです
                </p>
              )}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="library-upload-name">名前</Label>
              <Input
                id="library-upload-name"
                value={draft.name}
                maxLength={80}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>ベースモデル</Label>
                <Select
                  value={draft.baseModel}
                  onValueChange={(value) =>
                    setDraft((current) => ({
                      ...current,
                      baseModel: value as UserModelBaseModel,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {USER_MODEL_BASE_MODELS.map((base) => (
                      <SelectItem key={base.value} value={base.value}>
                        {base.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>年齢区分</Label>
                <Select
                  value={draft.rating}
                  onValueChange={(value) =>
                    setDraft((current) => ({
                      ...current,
                      rating: value as UserModelRating,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {USER_MODEL_RATINGS.map((rating) => (
                      <SelectItem key={rating.value} value={rating.value}>
                        {rating.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {draft.kind === "LORA" && (
              <div className="grid gap-1.5">
                <Label htmlFor="library-upload-trigger">
                  トリガーワード
                  <span className="ml-1.5 font-normal text-muted-foreground text-xs">
                    任意・カンマ区切り
                  </span>
                </Label>
                <Input
                  id="library-upload-trigger"
                  value={draft.triggerWords}
                  placeholder="例: watercolor, soft lighting"
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      triggerWords: event.target.value,
                    }))
                  }
                />
              </div>
            )}

            <p className="text-muted-foreground text-xs leading-relaxed">
              自分が権利を持っている（再配布できる）モデルだけをアップロードしてください。実在の人物を再現するモデルは使えません。
              <Link to="/terms" target="_blank" className="ml-1 underline">
                利用規約
              </Link>
            </p>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={props.onDone}>
            {props.remainingCount > 0 ? "このファイルはやめる" : "キャンセル"}
          </Button>
          <Button
            onClick={onSubmit}
            disabled={
              isLoading || isUnreadable || isTooLarge || !draft.name.trim()
            }
          >
            アップロード
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
