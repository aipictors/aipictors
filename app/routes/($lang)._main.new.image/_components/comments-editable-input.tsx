import { Checkbox } from "@/_components/ui/checkbox"
import {} from "@/_components/ui/radio-group"

type Props = {
  isChecked?: boolean
  onChange: (value: boolean) => void
}

/**
 * コメント編集許可入力
 */
export const CommentsEditableInput = (props: Props) => {
  return (
    <>
      <div className="mt-2 mb-2 space-y-2 rounded-md bg-white pt-1 pr-2 pb-4 pl-2 dark:bg-zinc-900">
        <div className="mt-2 flex flex-col">
          <p className="mt-1 mb-1 font-bold text-sm">コメント許可</p>
          <div className="flex items-center space-x-2">
            <Checkbox
              onCheckedChange={(value: boolean) => {
                props.onChange(value)
              }}
              id="comments-editable"
              checked={props.isChecked}
            />
            <label className="text-sm" htmlFor="comments-editable">
              {"コメントを許可しない"}
            </label>
          </div>
        </div>
      </div>
    </>
  )
}
