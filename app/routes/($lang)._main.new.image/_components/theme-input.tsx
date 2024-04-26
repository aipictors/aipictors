import { Checkbox } from "@/_components/ui/checkbox"
import {} from "@/_components/ui/radio-group"
import { Loader2Icon } from "lucide-react"

type Props = {
  title: string
  isChecked?: boolean
  onChange: (value: boolean) => void
  isLoading?: boolean
}

/**
 * お題入力
 * @param props
 * @returns
 */
const ThemeInput = (props: Props) => {
  return (
    <>
      <div className="mt-2 mb-2 space-y-2 rounded-md bg-white pt-1 pr-2 pb-4 pl-2 dark:bg-zinc-900">
        <div className="mt-2 flex flex-col">
          <p className="mt-1 mb-1 font-bold text-sm">お題参加</p>
          {props.isLoading ? (
            <Loader2Icon className="h-4 w-4 animate-spin" />
          ) : (
            <div className="items-center space-x-2">
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
      </div>
    </>
  )
}

export default ThemeInput
