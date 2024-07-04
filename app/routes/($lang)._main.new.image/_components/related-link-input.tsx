import { Input } from "@/_components/ui/input"
import {} from "@/_components/ui/radio-group"

type Props = {
  link: string
  onChange: (value: string) => void
}

/**
 * 関連リンク入力
 */
export const RelatedLinkInput = (props: Props) => {
  return (
    <>
      <div className="mt-2 mb-2 space-y-2 rounded-md bg-background pt-1 pr-2 pb-4 pl-2 dark:bg-zinc-900">
        <div className="mt-2 flex flex-col">
          <p className="mb-1 font-bold text-sm">{"関連リンク"}</p>
          <Input
            onChange={(event) => {
              props.onChange(event.target.value)
            }}
            value={props.link}
            minLength={1}
            maxLength={320}
            required
            type="text"
            placeholder={"https://"}
            className="w-full"
          />
        </div>
      </div>
    </>
  )
}
