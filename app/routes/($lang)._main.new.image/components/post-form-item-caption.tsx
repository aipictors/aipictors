import { AutoResizeTextarea } from "~/components/auto-resize-textarea"
import { Card, CardContent } from "~/components/ui/card"

type Props = {
  label?: string
  caption?: string
  setCaption: (value: string) => void
}

/**
 * キャプション入力
 */
export const PostFormItemCaption = (props: Props) => {
  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <p className="font-bold text-sm">
          {props.label ? props.label : "キャプション（任意）"}
        </p>
        <AutoResizeTextarea
          onChange={(event) => {
            props.setCaption(event.target.value)
          }}
          value={props.caption}
          maxLength={3000}
          placeholder={props.label ? props.label : "キャプション"}
          className="w-full"
        />
      </CardContent>
    </Card>
  )
}
