import { Input } from "@/_components/ui/input"
import {} from "@/_components/ui/select"

import {} from "@dnd-kit/core"
import {} from "@dnd-kit/sortable"

type Props = {
  label?: string
  setTitle: (value: string) => void
}

/**
 * タイトル入力
 * @param props
 * @returns
 */
const TitleInput = (props: Props) => {
  return (
    <>
      <div className="mt-2 mb-2 space-y-2 rounded-md bg-white pt-1 pr-2 pb-4 pl-2 dark:bg-zinc-900">
        <div className="flex flex-col">
          <p className="mb-1 text-sm">
            {props.label ? props.label : "タイトル"}
          </p>
          <Input
            id="title_input"
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

export default TitleInput
