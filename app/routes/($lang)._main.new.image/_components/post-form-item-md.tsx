import { Card, CardContent } from "@/_components/ui/card"
import TextEditor from "@/_components/text-editor"

type Props = {
  label?: string
  onChange: (value: string) => void
  value?: string
}

/**
 * タイトル入力
 */
export const PostFormItemMd = (props: Props) => {
  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <p className="font-bold text-sm">
          {props.label ? props.label : "本文"}
        </p>
        <TextEditor
          value={props.value ?? ""}
          onChange={(value) => props.onChange(value)}
        />
      </CardContent>
    </Card>
  )
}
