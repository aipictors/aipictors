import { AutoResizeTextarea } from "@/_components/auto-resize-textarea"
import {} from "@/_components/ui/select"

import {} from "@dnd-kit/core"
import {} from "@dnd-kit/sortable"

type Props = {
  label?: string
  setCaption: (value: string) => void
}

/**
 * キャプション入力
 * @param props
 * @returns
 */
const CaptionInput = (props: Props) => {
  return (
    <>
      <div className="mt-2 mb-2 space-y-2 rounded-md bg-white pt-1 pr-2 pb-4 pl-2 dark:bg-zinc-900">
        <div className="mt-2 flex flex-col">
          <p className="mb-1 font-bold text-sm">
            {props.label ? props.label : "キャプション"}
          </p>
          <AutoResizeTextarea
            onChange={(event) => {
              props.setCaption(event.target.value)
            }}
            maxLength={3000}
            placeholder={props.label ? props.label : "キャプション"}
            className="w-full"
          />
        </div>
      </div>
    </>
  )
}

export default CaptionInput
