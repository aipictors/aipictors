import { Checkbox } from "@/_components/ui/checkbox"
import {} from "@/_components/ui/radio-group"

type Props = {
  isChecked?: boolean
  onChange: (value: boolean) => void
}

/**
 * 宣伝作品かどうか入力
 * @param props
 * @returns
 */
const AdWorkInput = (props: Props) => {
  return (
    <>
      <div className="mt-2 mb-2 space-y-2 rounded-md bg-white pt-1 pr-2 pb-4 pl-2 dark:bg-zinc-900">
        <div className="mt-2 flex flex-col">
          <p className="mt-1 mb-1 font-bold text-sm">宣伝作品</p>
          <div className="mb-1 items-center text-sm opacity-65">
            <p>広告枠を使って自身のサービスやプランを宣伝できます。</p>
            <p>スタンダード、プレミアムプランの場合、1週間に1作品可能です。</p>
            <p>広告枠以外の宣伝は規約違反となります。</p>
            <p>一度設定した広告枠は取り消せません。</p>
          </div>
          <div className="items-center space-x-2">
            <Checkbox
              onCheckedChange={(value: boolean) => {
                props.onChange(value)
              }}
              id="ad-editable"
              checked={props.isChecked}
            />
            <label className="text-sm" htmlFor="ad-editable">
              {"宣伝作品かどうか"}
            </label>
          </div>
        </div>
      </div>
    </>
  )
}

export default AdWorkInput
