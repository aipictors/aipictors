import { Checkbox } from "@/_components/ui/checkbox"
import { Card, CardContent } from "@/_components/ui/card"
import { useEffect, useState } from "react"

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
  const [isTagEditableChecked, setIsTagEditableChecked] = useState(
    props.isTagEditableChecked,
  )

  const [isCommentsEditableChecked, setIsCommentsEditableChecked] = useState(
    props.isCommentsEditableChecked,
  )

  useEffect(() => {
    setIsTagEditableChecked(props.isTagEditableChecked)
    setIsCommentsEditableChecked(props.isCommentsEditableChecked)
  }, [props.isTagEditableChecked, props.isCommentsEditableChecked])

  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <p className="font-bold text-sm">{"許可の設定"}</p>
        <div className="flex items-center space-x-2">
          <Checkbox
            onCheckedChange={(value: boolean) => {
              setIsTagEditableChecked(!isTagEditableChecked)
              props.onTagEditableChange(!isCommentsEditableChecked)
            }}
            id="tag-editable"
            checked={!isTagEditableChecked}
          />
          <label className="text-sm" htmlFor="tag-editable">
            {"タグの編集を許可しない"}
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            onCheckedChange={(value: boolean) => {
              setIsCommentsEditableChecked(!isCommentsEditableChecked)
              props.onCommentsEditableChange(!isCommentsEditableChecked)
            }}
            id="comments-editable"
            checked={!isCommentsEditableChecked}
          />
          <label className="text-sm" htmlFor="comments-editable">
            {"コメントを許可しない"}
          </label>
        </div>
      </CardContent>
    </Card>
  )
}
