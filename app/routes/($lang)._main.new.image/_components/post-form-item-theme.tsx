import { Checkbox } from "@/_components/ui/checkbox"
import { Card } from "@/_components/ui/card"
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
  return (
    <>
      <Card className="p-1">
        <div className="mt-2 flex flex-col">
          <p className="mt-1 mb-1 font-bold text-sm">お題参加</p>
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
              <label
                className="text-sm"
                htmlFor="theme"
              >{`お題「${props.title}」に参加する`}</label>
            </div>
          )}
        </div>
      </Card>
    </>
  )
}
