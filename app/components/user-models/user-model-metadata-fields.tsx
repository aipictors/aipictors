import { ImagePlusIcon, Loader2Icon, StarIcon, XIcon } from "lucide-react"
import { useRef, useState } from "react"
import { toast } from "sonner"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Slider } from "~/components/ui/slider"
import { Textarea } from "~/components/ui/textarea"
import { useModelImageUploader } from "~/components/user-models/use-image-uploader"
import {
  USER_MODEL_BASE_MODELS,
  USER_MODEL_RATINGS,
} from "~/lib/user-models/constants"
import type {
  UserModelBaseModel,
  UserModelEditableFields,
  UserModelKind,
  UserModelRating,
} from "~/lib/user-models/types"
import { cn } from "~/lib/utils"

const MAX_SAMPLE_IMAGES = 8
const MAX_TAGS = 10

type Props = {
  kind: UserModelKind
  value: UserModelEditableFields
  onChange(value: UserModelEditableFields): void
  /**
   * 画像アップロード中かどうかを親に伝える（送信ボタンの無効化用）
   */
  onUploadingChange?(isUploading: boolean): void
}

function FieldLabel(props: {
  htmlFor?: string
  children: React.ReactNode
  required?: boolean
  hint?: string
}) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <Label htmlFor={props.htmlFor} className="font-semibold text-sm">
        {props.children}
        {props.required && <span className="ml-0.5 text-rose-500">*</span>}
      </Label>
      {props.hint && (
        <span className="text-muted-foreground text-xs">{props.hint}</span>
      )}
    </div>
  )
}

/**
 * モデルの情報入力欄（アップロード・編集で共通）
 */
export function UserModelMetadataFields(props: Props) {
  const { value } = props
  const uploader = useModelImageUploader()
  const [uploadingCount, setUploadingCount] = useState(0)
  const [tagText, setTagText] = useState("")
  const thumbnailInputRef = useRef<HTMLInputElement>(null)
  const sampleInputRef = useRef<HTMLInputElement>(null)
  // 画像アップロード完了時に最新の入力内容へ反映するため
  const valueRef = useRef(value)
  valueRef.current = value

  const update = (patch: Partial<UserModelEditableFields>) => {
    props.onChange({ ...value, ...patch })
  }

  const changeUploading = (delta: number) => {
    setUploadingCount((current) => {
      const next = Math.max(0, current + delta)
      props.onUploadingChange?.(next > 0)
      return next
    })
  }

  const uploadImages = async (files: File[]): Promise<string[]> => {
    changeUploading(files.length)
    const urls: string[] = []
    for (const file of files) {
      try {
        urls.push(await uploader.upload(file))
      } catch (error) {
        toast(
          error instanceof Error
            ? error.message
            : "画像のアップロードに失敗しました",
        )
      } finally {
        changeUploading(-1)
      }
    }
    return urls
  }

  const onSelectThumbnail = async (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return
    const [url] = await uploadImages([file])
    if (url) props.onChange({ ...valueRef.current, thumbnailUrl: url })
  }

  const onSelectSamples = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const room = MAX_SAMPLE_IMAGES - value.sampleImageUrls.length
    const selected = Array.from(files).slice(0, Math.max(0, room))
    if (selected.length < files.length) {
      toast(`サンプル画像は ${MAX_SAMPLE_IMAGES} 枚までです`)
    }
    const urls = await uploadImages(selected)
    if (urls.length > 0) {
      const latest = valueRef.current
      props.onChange({
        ...latest,
        sampleImageUrls: [...latest.sampleImageUrls, ...urls],
        thumbnailUrl: latest.thumbnailUrl ?? urls[0],
      })
    }
  }

  const addTags = (text: string) => {
    const tags = text
      .split(/[,、\s]+/)
      .map((tag) => tag.replace(/^#/, "").trim())
      .filter((tag) => tag.length > 0 && tag.length <= 30)
    if (tags.length === 0) return
    const merged = Array.from(new Set([...value.tags, ...tags])).slice(
      0,
      MAX_TAGS,
    )
    update({ tags: merged })
    setTagText("")
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <FieldLabel
          htmlFor="user-model-name"
          required
          hint={`${value.name.length}/80`}
        >
          名前
        </FieldLabel>
        <Input
          id="user-model-name"
          value={value.name}
          maxLength={80}
          placeholder="例: ふんわり水彩 LoRA"
          onChange={(event) => update({ name: event.target.value })}
        />
      </div>

      <div className="space-y-2">
        <FieldLabel
          htmlFor="user-model-description"
          hint={`${value.description.length}/3000`}
        >
          説明
        </FieldLabel>
        <Textarea
          id="user-model-description"
          value={value.description}
          maxLength={3000}
          rows={5}
          placeholder="どんな絵柄になるか、おすすめの使い方、学習元の権利についてなど"
          onChange={(event) => update({ description: event.target.value })}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel required>ベースモデル</FieldLabel>
          <Select
            value={value.baseModel}
            onValueChange={(next) =>
              update({ baseModel: next as UserModelBaseModel })
            }
          >
            <SelectTrigger aria-label="ベースモデル">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {USER_MODEL_BASE_MODELS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <FieldLabel required>年齢区分</FieldLabel>
          <div className="grid grid-cols-4 gap-1 rounded-lg bg-muted p-1">
            {USER_MODEL_RATINGS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() =>
                  update({ rating: item.value as UserModelRating })
                }
                aria-pressed={value.rating === item.value}
                className={cn(
                  "h-8 rounded-md font-medium text-xs transition-colors",
                  value.rating === item.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <FieldLabel htmlFor="user-model-trigger" hint="カンマ区切り">
          トリガーワード
        </FieldLabel>
        <Input
          id="user-model-trigger"
          value={value.triggerWords}
          maxLength={500}
          placeholder="例: watercolor, soft lighting"
          onChange={(event) => update({ triggerWords: event.target.value })}
        />
        <p className="text-muted-foreground text-xs">
          生成画面でこのモデルを選ぶと、プロンプトに自動で追加されます
        </p>
      </div>

      {props.kind === "LORA" && (
        <div className="space-y-3">
          <FieldLabel hint={value.recommendedWeight.toFixed(2)}>
            推奨ウェイト
          </FieldLabel>
          <Slider
            value={[value.recommendedWeight]}
            min={-1}
            max={1}
            step={0.05}
            onValueChange={(next) => update({ recommendedWeight: next[0] })}
            aria-label="推奨ウェイト"
          />
          <div className="flex justify-between text-muted-foreground text-xs">
            <span>-1</span>
            <span>0</span>
            <span>1</span>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <FieldLabel
          htmlFor="user-model-tags"
          hint={`${value.tags.length}/${MAX_TAGS}`}
        >
          タグ
        </FieldLabel>
        <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-md border bg-background px-2 py-1.5 focus-within:ring-2 focus-within:ring-ring">
          {value.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs"
            >
              #{tag}
              <button
                type="button"
                aria-label={`${tag} を削除`}
                onClick={() =>
                  update({ tags: value.tags.filter((item) => item !== tag) })
                }
                className="text-muted-foreground hover:text-foreground"
              >
                <XIcon className="size-3" />
              </button>
            </span>
          ))}
          <input
            id="user-model-tags"
            value={tagText}
            onChange={(event) => setTagText(event.target.value)}
            onKeyDown={(event) => {
              if (event.nativeEvent.isComposing) return
              if (event.key === "Enter" || event.key === ",") {
                event.preventDefault()
                addTags(tagText)
              }
              if (
                event.key === "Backspace" &&
                tagText === "" &&
                value.tags.length > 0
              ) {
                update({ tags: value.tags.slice(0, -1) })
              }
            }}
            onBlur={() => addTags(tagText)}
            placeholder={
              value.tags.length === 0 ? "Enter で追加（例: 水彩, 背景）" : ""
            }
            className="min-w-24 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            disabled={value.tags.length >= MAX_TAGS}
          />
        </div>
      </div>

      <div className="space-y-2">
        <FieldLabel
          hint={`${value.sampleImageUrls.length}/${MAX_SAMPLE_IMAGES}`}
        >
          サムネイル・サンプル画像
        </FieldLabel>
        <p className="text-muted-foreground text-xs">
          このモデルで生成した画像を載せると、使ってもらいやすくなります。★
          を押した画像がサムネイルになります。
        </p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
          {value.thumbnailUrl &&
            !value.sampleImageUrls.includes(value.thumbnailUrl) && (
              <div className="relative aspect-[3/4] overflow-hidden rounded-lg border-2 border-primary">
                <img
                  src={value.thumbnailUrl}
                  alt="サムネイル"
                  className="size-full object-cover"
                />
                <span className="absolute top-1 left-1 rounded bg-primary px-1.5 py-0.5 font-bold text-[10px] text-primary-foreground">
                  サムネイル
                </span>
                <button
                  type="button"
                  aria-label="サムネイルを削除"
                  onClick={() => update({ thumbnailUrl: null })}
                  className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white"
                >
                  <XIcon className="size-3" />
                </button>
              </div>
            )}
          {value.sampleImageUrls.map((url) => {
            const isThumbnail = value.thumbnailUrl === url
            return (
              <div
                key={url}
                className={cn(
                  "relative aspect-[3/4] overflow-hidden rounded-lg border-2",
                  isThumbnail ? "border-primary" : "border-transparent",
                )}
              >
                <img
                  src={url}
                  alt="サンプル"
                  className="size-full object-cover"
                />
                <button
                  type="button"
                  aria-label="サムネイルにする"
                  onClick={() => update({ thumbnailUrl: url })}
                  className={cn(
                    "absolute top-1 left-1 rounded-full p-1",
                    isThumbnail
                      ? "bg-primary text-primary-foreground"
                      : "bg-black/60 text-white",
                  )}
                >
                  <StarIcon
                    className={cn("size-3", isThumbnail && "fill-current")}
                  />
                </button>
                <button
                  type="button"
                  aria-label="画像を削除"
                  onClick={() =>
                    props.onChange({
                      ...value,
                      sampleImageUrls: value.sampleImageUrls.filter(
                        (item) => item !== url,
                      ),
                      thumbnailUrl: isThumbnail ? null : value.thumbnailUrl,
                    })
                  }
                  className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white"
                >
                  <XIcon className="size-3" />
                </button>
              </div>
            )
          })}
          {value.sampleImageUrls.length < MAX_SAMPLE_IMAGES && (
            <button
              type="button"
              onClick={() => sampleInputRef.current?.click()}
              disabled={!uploader.isReady}
              className="flex aspect-[3/4] flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground disabled:opacity-50"
            >
              {uploadingCount > 0 ? (
                <Loader2Icon className="size-6 animate-spin" />
              ) : (
                <ImagePlusIcon className="size-6" />
              )}
              <span className="text-xs">画像を追加</span>
            </button>
          )}
        </div>
        {!value.thumbnailUrl && value.sampleImageUrls.length === 0 && (
          <button
            type="button"
            className="text-primary text-xs underline-offset-2 hover:underline"
            onClick={() => thumbnailInputRef.current?.click()}
          >
            サムネイルだけを設定する
          </button>
        )}
        <input
          ref={sampleInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          hidden
          onChange={(event) => {
            onSelectSamples(event.target.files)
            event.target.value = ""
          }}
        />
        <input
          ref={thumbnailInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          hidden
          onChange={(event) => {
            onSelectThumbnail(event.target.files)
            event.target.value = ""
          }}
        />
      </div>
    </div>
  )
}
