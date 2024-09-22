import { Checkbox } from "~/components/ui/checkbox"
import { Card, CardContent } from "~/components/ui/card"
import { useEffect, useState } from "react"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  isTagEditableChecked?: boolean
  onTagEditableChange: (value: boolean) => void
  isCommentsEditableChecked?: boolean
  onCommentsEditableChange: (value: boolean) => void
}

/**
 * 許可設定
 */
export function PostFormPermissionSetting(props: Props) {
  const [isTagEditableChecked, setIsTagEditableChecked] = useState(
    props.isTagEditableChecked,
  )

  const [isCommentsEditableChecked, setIsCommentsEditableChecked] = useState(
    props.isCommentsEditableChecked,
  )

  const t = useTranslation()

  useEffect(() => {
    setIsTagEditableChecked(props.isTagEditableChecked)
    setIsCommentsEditableChecked(props.isCommentsEditableChecked)
  }, [props.isTagEditableChecked, props.isCommentsEditableChecked])

  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <p className="font-bold text-sm">
          {t("許可の設定", "Permission Settings")}
        </p>
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
            {t("タグの編集を許可しない", "Disallow tag editing")}
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
            {t("コメントを許可しない", "Disallow comments")}
          </label>
        </div>
      </CardContent>
    </Card>
  )
}
