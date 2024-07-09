import { Input } from "@/_components/ui/input"
import {} from "@/_components/ui/select"

import {} from "@dnd-kit/core"
import {} from "@dnd-kit/sortable"

type Props = {
  label?: string
  onChange: (value: string) => void
  value?: string
}

/**
 * タイトル入力
 */
export const TitleInput = (props: Props) => {
  return (
    <>
      <div className="mt-2 mb-2 space-y-2 rounded-md bg-secondary pt-1 pr-2 pb-4 pl-2 dark:bg-zinc-900">
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
      </div>
    </>
  )
}
