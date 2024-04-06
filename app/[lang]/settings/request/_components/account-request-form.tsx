"use client"

import { Label } from "@/_components/ui/label"
import { Switch } from "@/_components/ui/switch"

export const SettingRequestForm = () => {
  return (
    <div className="space-y-4">
      <p>
        {"支援リクエストを受けるには累計いいね数20必要です（現在：現在数）"}
      </p>
      <div className="flex">
        <div className="flex w-full justify-between">
          <Label>{"支援リクエストを許可する"}</Label>
          <Switch id="airplane-mode" />
        </div>
      </div>
    </div>
  )
}
