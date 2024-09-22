import { Input } from "~/components/ui/input"
import { Card, CardContent } from "~/components/ui/card"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  label?: string
  onChange: (value: string) => void
  value?: string
}

/**
 * タイトル入力
 */
export function PostFormItemTitle(props: Props) {
  const isFilled = props.value && props.value.trim() !== ""

  const t = useTranslation()

  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <p className="font-bold text-sm">
          {props.label
            ? props.label
            : t("タイトル（必須）", "Title (Required)")}
        </p>
        <Input
          onChange={(event) => {
            props.onChange(event.target.value)
          }}
          value={props.value}
          minLength={1}
          maxLength={120}
          required
          type="text"
          name="title"
          placeholder={props.label ? props.label : t("タイトル", "Title")}
          className={`${isFilled ? "w-full border-green-500" : "w-full border-gray-300"}`}
        />
      </CardContent>
    </Card>
  )
}
