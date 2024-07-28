import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2Icon } from "lucide-react"

type Props = {
  title: string | null
  isChecked?: boolean
  onChange: (value: boolean) => void
  isLoading?: boolean
}

/**
 * お題入力
 */
export const PostFormItemTheme = (props: Props) => {
  if (!props.title) {
    return null
  }

  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <p className="font-bold text-sm">お題参加</p>
        {props.isLoading ? (
          <Loader2Icon className="h-4 w-4 animate-spin" />
        ) : (
          <div className="flex items-center space-x-2">
            <Checkbox
              onCheckedChange={(value: boolean) => {
                props.onChange(value)
              }}
              id="theme"
              checked={props.isChecked}
            />
            <label className="text-sm" htmlFor="theme">
              {`お題「${props.title}」に参加する`}
            </label>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
