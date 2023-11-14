"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const SettingInterfaceForm = () => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Label>{"サムネイルにいいねボタンを表示"}</Label>
        <Input type="checkbox" />
      </div>
      <div className="flex justify-between">
        <Label>{"ポップアップ（作品ダイアログ）を表示"}</Label>
        <Input type="checkbox" />
      </div>
    </div>
  )
}
