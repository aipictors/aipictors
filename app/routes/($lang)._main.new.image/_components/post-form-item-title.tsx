import { Input } from "@/_components/ui/input"
import { Card } from "@/_components/ui/card"

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
    <>
      <Card className="p-1">
        <div className="flex flex-col">
          <p className="mb-1 font-bold text-sm">
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
        </div>
      </Card>
    </>
  )
}
