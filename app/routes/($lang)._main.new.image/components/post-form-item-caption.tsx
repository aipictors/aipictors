import { AutoResizeTextarea } from "~/components/auto-resize-textarea"
import { Card, CardContent } from "~/components/ui/card"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  label?: string
  caption?: string
  setCaption: (value: string) => void
}

/**
 * キャプション入力
 */
export function PostFormItemCaption(props: Props) {
  const isFilled = props.caption && props.caption.trim() !== ""

  const t = useTranslation()

  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <p className="font-bold text-sm">
          {props.label
            ? props.label
            : t("キャプション（任意）", "Caption (Optional)")}
        </p>
        <AutoResizeTextarea
          onChange={(event) => {
            props.setCaption(event.target.value)
          }}
          value={props.caption}
          maxLength={3000}
          placeholder={props.label ? props.label : t("キャプション", "Caption")}
          className={`${isFilled ? "w-full border-green-500" : "w-full border-gray-300"}`}
        />
      </CardContent>
    </Card>
  )
}
