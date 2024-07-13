import { Checkbox } from "@/_components/ui/checkbox"
import { Card, CardContent } from "@/_components/ui/card"

type Props = {
  isChecked?: boolean
  onChange: (value: boolean) => void
}

/**
 * カテゴリ編集許可入力
 */
export const PostFormCategoryEditable = (props: Props) => {
  return (
    <>
      <Card>
        <CardContent className="flex flex-col">
          <p className="mt-1 mb-1 font-bold text-sm">タグの編集許可</p>
          <div className="flex items-center space-x-2">
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
        </CardContent>
      </Card>
    </>
  )
}
