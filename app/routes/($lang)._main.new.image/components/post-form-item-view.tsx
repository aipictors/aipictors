import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { Card, CardContent } from "~/components/ui/card"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  accessType: IntrospectionEnum<"AccessType">
  setAccessType: (value: IntrospectionEnum<"AccessType">) => void
}

/**
 * 公開モード入力
 */
export function PostFormItemView (props: Props) {
  const t = useTranslation()

  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <p className="font-bold text-sm">{t("公開モード", "Access Mode")}</p>
        <RadioGroup
          value={props.accessType}
          onValueChange={(value) => {
            props.setAccessType(value as IntrospectionEnum<"AccessType">)
          }}
          className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5"
        >
          {(
            [
              { value: "PUBLIC", id: "view-public", label: t("公開", "Public") },
              { value: "PRIVATE", id: "view-archive", label: t("非公開", "Private") },
              { value: "LIMITED", id: "view-limited", label: t("限定公開", "Limited") },
              { value: "SILENT", id: "view-silent", label: t("新着非公開", "Silent") },
              { value: "DRAFT", id: "view-draft", label: t("下書き", "Draft") },
            ] as const
          ).map((option) => (
            <label
              key={option.value}
              htmlFor={option.id}
              className="flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm transition-colors hover:bg-muted/60 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
            >
              <RadioGroupItem value={option.value} id={option.id} />
              {option.label}
            </label>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  )
}
