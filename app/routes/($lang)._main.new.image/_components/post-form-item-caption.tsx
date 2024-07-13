import { AutoResizeTextarea } from "@/_components/auto-resize-textarea"
import { Card, CardContent } from "@/_components/ui/card"

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
    <>
      <Card>
        <CardContent className="flex flex-col">
          <p className="mb-1 font-bold text-sm">
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
    </>
  )
}
