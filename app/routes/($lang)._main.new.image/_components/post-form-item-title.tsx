import { Input } from "@/_components/ui/input"
import { Card, CardContent } from "@/_components/ui/card"

type Props = {
  label?: string
  onChange: (value: string) => void
  value?: string
}

/**
 * タイトル入力
 */
export const PostFormItemTitle = (props: Props) => {
  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <p className="font-bold text-sm">
          {props.label ? props.label : "タイトル（必須）"}
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
          placeholder={props.label ? props.label : "タイトル"}
          className="w-full"
        />
      </CardContent>
    </Card>
  )
}
