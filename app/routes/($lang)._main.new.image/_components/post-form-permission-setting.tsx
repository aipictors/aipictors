import { Checkbox } from "@/_components/ui/checkbox"
import { Card, CardContent } from "@/_components/ui/card"

type Props = {
  isTagEditableChecked?: boolean
  onTagEditableChange: (value: boolean) => void
  isCommentsEditableChecked?: boolean
  onCommentsEditableChange: (value: boolean) => void
}

/**
 * 許可設定
 */
export const PostFormPermissionSetting = (props: Props) => {
  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <p className="font-bold text-sm">{"許可の設定"}</p>
        <div className="flex items-center space-x-2">
          <Checkbox
            onCheckedChange={(value: boolean) => {
              props.onTagEditableChange(value)
            }}
            id="tag-editable"
            checked={!props.isTagEditableChecked}
          />
          <label className="text-sm" htmlFor="tag-editable">
            {"タグの編集を許可しない"}
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            onCheckedChange={(value: boolean) => {
              props.onCommentsEditableChange(value)
            }}
            id="comments-editable"
            checked={!props.isCommentsEditableChecked}
          />
          <label className="text-sm" htmlFor="comments-editable">
            {"コメントを許可しない"}
          </label>
        </div>
      </CardContent>
    </Card>
  )
}
