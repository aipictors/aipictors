import { Checkbox } from "@/_components/ui/checkbox"
import {} from "@/_components/ui/radio-group"

type Props = {
  isChecked?: boolean
  onChange: (value: boolean) => void
}

/**
 * カテゴリ編集許可入力
 * @param props
 * @returns
 */
const CategoryEditableInput = (props: Props) => {
  return (
    <>
      <div className="mt-2 mb-2 space-y-2 rounded-md bg-white pt-1 pr-2 pb-4 pl-2 dark:bg-zinc-900">
        <div className="mt-2 flex flex-col">
          <p className="mt-1 mb-1 text-sm">タグの編集許可</p>
          <div className="items-center space-x-2">
            <Checkbox
              onCheckedChange={(value: boolean) => {
                props.onChange(value)
              }}
              id="tag-editable"
              checked={props.isChecked}
            />
            <label className="text-sm" htmlFor="tag-editable">
              {"タグの編集を許可しない"}
            </label>
          </div>
        </div>
      </div>
    </>
  )
}

export default CategoryEditableInput
