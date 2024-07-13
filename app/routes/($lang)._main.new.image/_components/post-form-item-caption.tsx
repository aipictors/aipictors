import { AutoResizeTextarea } from "@/_components/auto-resize-textarea"
import { Card } from "@/_components/ui/card"
import {} from "@/_components/ui/select"

import {} from "@dnd-kit/core"
import {} from "@dnd-kit/sortable"

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
      <Card className="p-1">
        <div className="mt-2 flex flex-col">
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
        </div>
      </Card>
    </>
  )
}
