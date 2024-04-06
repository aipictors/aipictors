"use client"

import { Label } from "@/_components/ui/label"
import { Switch } from "@/_components/ui/switch"

export const SettingRestrictionForm = () => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Label>{"R-18"}</Label>
        <Switch />
      </div>
      <div className="flex justify-between">
        <Label>{"R-18G"}</Label>
        <Switch />
      </div>
      <div className="flex justify-between">
        <Label>{"性的描写（軽度な描写も含む）"}</Label>
        <Switch />
      </div>
      <div className="flex justify-between">
        <Label>{"全年齢"}</Label>
        <Switch />
      </div>
      <div className="flex justify-between">
        <Label>
          {"宣伝など作品に関係のない可能性のあるキャプションは非表示"}
        </Label>
        <Switch />
      </div>
      <div className="flex justify-between">
        <Label>{"宣伝の可能性のある作品は非表示"}</Label>
        <Switch />
      </div>
      <div className="flex justify-between">
        <Label>{"センシティブなコンテンツを表示する（メンテナンス中）"}</Label>
        <Switch />
      </div>
    </div>
  )
}
