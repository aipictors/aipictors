import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import type { UserModelEditableFields } from "~/lib/user-models/types"
import { cn } from "~/lib/utils"

type Authorship = Pick<
  UserModelEditableFields,
  "isOriginal" | "sourceUrl" | "sourceCreator"
>

type Props = {
  value: Authorship
  onChange(value: Authorship): void
}

/**
 * 作者の申告が揃っているか（自分で作った、または元のモデルの URL と作者名）
 */
export const isAuthorshipComplete = (value: Authorship) =>
  value.isOriginal === true ||
  (value.isOriginal === false &&
    Boolean(value.sourceUrl?.trim()) &&
    Boolean(value.sourceCreator?.trim()))

const OPTIONS = [
  { value: true, label: "自分で作ったモデル" },
  { value: false, label: "他の人が作ったモデル" },
] as const

/**
 * 作者の申告（アップロード・編集で共通）。他の人のモデルは元のモデルの URL と作者名を出典として表示する
 */
export function UserModelAuthorshipFields(props: Props) {
  const { value } = props
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-2">
        <Label className="font-semibold text-sm">
          作者
          <span className="ml-0.5 text-rose-500">*</span>
        </Label>
        <span className="text-muted-foreground text-xs">
          モデルのページに表示されます
        </span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {OPTIONS.map((option) => (
          <button
            key={option.label}
            type="button"
            onClick={() =>
              props.onChange({ ...value, isOriginal: option.value })
            }
            className={cn(
              "rounded-xl border px-3 py-2.5 text-left text-sm transition-colors",
              value.isOriginal === option.value
                ? "border-primary bg-primary/5 font-semibold"
                : "hover:bg-muted",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
      {value.isOriginal === false && (
        <div className="space-y-2 rounded-xl border bg-muted/30 p-3">
          <div className="space-y-1">
            <Label htmlFor="user-model-source-url" className="text-xs">
              元のモデルの URL（Civitai など）
              <span className="ml-0.5 text-rose-500">*</span>
            </Label>
            <Input
              id="user-model-source-url"
              inputMode="url"
              placeholder="https://civitai.com/models/..."
              value={value.sourceUrl ?? ""}
              onChange={(event) =>
                props.onChange({ ...value, sourceUrl: event.target.value })
              }
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="user-model-source-creator" className="text-xs">
              作者名
              <span className="ml-0.5 text-rose-500">*</span>
            </Label>
            <Input
              id="user-model-source-creator"
              maxLength={100}
              value={value.sourceCreator ?? ""}
              onChange={(event) =>
                props.onChange({ ...value, sourceCreator: event.target.value })
              }
            />
          </div>
          <p className="text-muted-foreground text-xs leading-relaxed">
            作者のライセンスで再配布・他サービスでの利用が許可されているモデルだけ登録できます。説明欄に作者の文章をそのまま貼るのではなく、自分の言葉で紹介してください。Civitai
            に同じファイルがあるときは、作者・出典・ライセンスが自動で入ります
          </p>
        </div>
      )}
    </div>
  )
}
