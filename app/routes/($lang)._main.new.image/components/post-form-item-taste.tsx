import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { Card, CardContent } from "~/components/ui/card"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  imageStyle: IntrospectionEnum<"ImageStyle">
  setImageStyle: (value: IntrospectionEnum<"ImageStyle">) => void
}

/**
 * テイスト入力
 */
export function PostFormItemTaste(props: Props) {
  const t = useTranslation()

  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <p className="font-bold text-sm">{t("テイスト", "Taste")}</p>
        <Select
          value={props.imageStyle}
          onValueChange={(value) => {
            props.setImageStyle(value as IntrospectionEnum<"ImageStyle">)
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="w-full">
            <SelectItem value={"ILLUSTRATION"}>
              {t("イラスト", "Illustration")}
            </SelectItem>
            <SelectItem value={"SEMI_REAL"}>
              {t("セミリアル", "Semi-real")}
            </SelectItem>
            <SelectItem value={"REAL"}>{t("リアル", "Real")}</SelectItem>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  )
}
