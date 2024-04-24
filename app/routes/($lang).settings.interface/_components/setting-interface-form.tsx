import { Checkbox } from "@/_components/ui/checkbox"

export const SettingInterfaceForm = () => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <label
          htmlFor="1"
          className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {"サムネイルにいいねボタンを表示"}
        </label>
        <Checkbox id="terms" />
      </div>
    </div>
  )
}
