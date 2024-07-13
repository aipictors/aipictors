import { Input } from "@/_components/ui/input"
import { Card } from "@/_components/ui/card"

type Props = {
  link: string | null
  onChange: (value: string) => void
}

/**
 * 関連リンク入力
 */
export const PostFormItemRelatedLink = (props: Props) => {
  return (
    <>
      <Card className="p-1">
        <div className="mt-2 flex flex-col">
          <p className="mb-1 font-bold text-sm">{"関連リンク"}</p>
          <Input
            onChange={(event) => {
              props.onChange(event.target.value)
            }}
            value={props.link ?? ""}
            minLength={1}
            maxLength={320}
            required
            type="text"
            placeholder={"https://"}
            className="w-full"
          />
        </div>
      </Card>
    </>
  )
}
