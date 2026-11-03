import { Input } from "~/components/ui/input"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"

const GENRES = [
  { value: "CHARACTER", ja: "人物", en: "Character" },
  { value: "ANIMAL", ja: "動物", en: "Animal" },
  { value: "MACHINE", ja: "機械", en: "Machine" },
  { value: "BACKGROUND", ja: "背景", en: "Background" },
  { value: "OBJECT", ja: "物", en: "Object" },
]

/** 値はそのまま API に送る */
const TAGS = [
  { value: "楽しい", ja: "楽しい", en: "Fun" },
  { value: "嬉しい", ja: "嬉しい", en: "Happy" },
  { value: "お祝い", ja: "お祝い", en: "Celebration" },
  { value: "悲しい", ja: "悲しい", en: "Sad" },
  { value: "その他", ja: "その他", en: "Other" },
]

type Props = {
  title: string
  genre: string
  tag: string
  onChangeTitle(value: string): void
  onChangeGenre(value: string): void
  onChangeTag(value: string): void
  className?: string
}

/**
 * スタンプを公開するときに決める項目（タイトル、ジャンル、タグ）
 */
export function StickerPublishFields(props: Props) {
  const t = useTranslation()

  return (
    <div className={cn("space-y-3", props.className)}>
      <div className="space-y-1.5">
        <p className="font-medium text-sm">{t("タイトル", "Title")}</p>
        <Input
          value={props.title}
          onChange={(event) => props.onChangeTitle(event.target.value)}
          placeholder={t("例: ありがとう", "e.g. Thank you")}
        />
      </div>
      <StickerChoiceChips
        label={t("ジャンル", "Genre")}
        choices={GENRES}
        value={props.genre}
        onChange={props.onChangeGenre}
      />
      <StickerChoiceChips
        label={t("タグ", "Tag")}
        choices={TAGS}
        value={props.tag}
        onChange={props.onChangeTag}
      />
    </div>
  )
}

function StickerChoiceChips(props: {
  label: string
  choices: { value: string; ja: string; en: string }[]
  value: string
  onChange(value: string): void
}) {
  const t = useTranslation()

  return (
    <div className="space-y-1.5">
      <p className="font-medium text-sm">{props.label}</p>
      <div className="flex flex-wrap gap-1.5">
        {props.choices.map((choice) => (
          <button
            key={choice.value}
            type="button"
            aria-pressed={props.value === choice.value}
            onClick={() => props.onChange(choice.value)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm transition-colors",
              props.value === choice.value
                ? "border-foreground bg-foreground text-background"
                : "hover:bg-muted",
            )}
          >
            {t(choice.ja, choice.en)}
          </button>
        ))}
      </div>
    </div>
  )
}
