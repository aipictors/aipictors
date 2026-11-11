import { BookOpenIcon, NewspaperIcon } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { cn } from "~/lib/utils"

type Props = {
  type: IntrospectionEnum<"WorkType">
  setType: (value: IntrospectionEnum<"WorkType">) => void
}

/**
 * 種別（小説・コラム）。押しやすい 2 択のボタンにする
 */
export function PostFormItemType(props: Props) {
  const t = useTranslation()
  // 大文字に変換
  const type = props.type.toUpperCase() as IntrospectionEnum<"WorkType">

  const options = [
    {
      value: "NOVEL" as const,
      label: t("小説", "Novel"),
      icon: BookOpenIcon,
    },
    {
      value: "COLUMN" as const,
      label: t("コラム", "Column"),
      icon: NewspaperIcon,
    },
  ]

  return (
    <fieldset className="grid grid-cols-2 gap-1 rounded-full border-0 bg-muted p-1">
      <legend className="sr-only">{t("種類", "Type")}</legend>
      {options.map((option) => {
        const isSelected = type === option.value
        const Icon = option.icon
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isSelected}
            onClick={() => props.setType(option.value)}
            className={cn(
              "flex h-9 items-center justify-center gap-1.5 rounded-full font-medium text-sm transition-colors",
              isSelected
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {option.label}
          </button>
        )
      })}
    </fieldset>
  )
}
