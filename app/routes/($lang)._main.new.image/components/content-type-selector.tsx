import { Label } from "~/components/ui/label"
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
import { useTranslation } from "~/hooks/use-translation"

type ContentType = "STORY" | "CHARACTER" | "STANDARD"

type Props = {
  value: ContentType
  onChange: (value: ContentType) => void
}

/**
 * コンテンツ生成タイプ選択コンポーネント
 */
export function ContentTypeSelector (props: Props) {
  const t = useTranslation()

  const contentTypes: Array<{
    value: ContentType
    label: string
    description: string
  }> = [
    {
      value: "STORY",
      label: t("ストーリー仕立て", "Story Style"),
      description: t(
        "物語調の説明文を生成（デフォルト）",
        "Generate narrative-style descriptions (Default)",
      ),
    },
    {
      value: "CHARACTER",
      label: t("キャラクターセリフ風", "Character Voice"),
      description: t(
        "キャラクターが話すような口調で生成",
        "Generate in character voice style",
      ),
    },
    {
      value: "STANDARD",
      label: t("標準的な説明文", "Standard"),
      description: t(
        "客観的で標準的な説明文を生成",
        "Generate objective and standard descriptions",
      ),
    },
  ]

  return (
    <div className="space-y-3">
      <Label className="font-medium text-sm">
        {t("生成スタイル", "Generation Style")}
      </Label>
      <RadioGroup
        value={props.value}
        onValueChange={(value) => props.onChange(value as ContentType)}
        className="space-y-2"
      >
        {contentTypes.map((type) => (
          <div key={type.value} className="flex items-start space-x-3">
            <RadioGroupItem
              value={type.value}
              id={type.value}
              className="mt-1"
            />
            <div className="space-y-1">
              <Label
                htmlFor={type.value}
                className="cursor-pointer font-medium text-sm"
              >
                {type.label}
              </Label>
              <p className="text-muted-foreground text-xs">
                {type.description}
              </p>
            </div>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}
