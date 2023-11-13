"use client"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export const SettingRequestForm: React.FC = () => {
  return (
    <div className="space-y-4">
      <p>
        {"支援リクエストを受けるには累計いいね数20必要です（現在：現在数）"}
      </p>
      <div className="flex">
        <div className="flex justify-between w-full">
          <Label>{"支援リクエストを許可する"}</Label>
          <Switch id="airplane-mode" />
        </div>
      </div>
    </div>
  )
}
