import { Checkbox } from "@/_components/ui/checkbox"

/**
 * 通知設定フォーム
 * @returns
 */
export const SettingNotificationForm = () => {
  return (
    <>
      <div className="space-y-4">
        <p>{"匿名いいね"}</p>
        <div className="flex justify-between">
          <label
            htmlFor="1"
            className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {"全年齢いいね"}
          </label>
          <Checkbox id="terms1" />
        </div>
        <div className="flex justify-between">
          <label
            htmlFor="2"
            className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {"R-18いいね"}
          </label>
          <Checkbox id="terms2" />
        </div>
      </div>
      <div className="space-y-4">
        <p>{"オフにすると次回以降の通知がされなくなります"}</p>
        <div className="flex justify-between">
          <label
            htmlFor="3"
            className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {"定期いいね通知"}
          </label>
          <Checkbox id="terms3" />
        </div>
        <div className="flex justify-between">
          <label
            htmlFor="4"
            className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {"リアルタイムいいね通知"}
          </label>
          <Checkbox id="terms4" />
        </div>
        <div className="flex justify-between">
          <label
            htmlFor="5"
            className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {"コメント"}
          </label>
          <Checkbox id="terms5" />
        </div>
      </div>
    </>
  )
}
